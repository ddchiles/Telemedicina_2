const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, role, phone, birthDate, specialty, licenseNumber, cv } = req.body;
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña, nombre completo y rol son obligatorios'
      });
    }
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Debe ser: patient, doctor o admin'
      });
    }
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }
    if (!authData.user) {
      return res.status(400).json({
        success: false,
        message: 'Error al crear el usuario'
      });
    }
    const profileData = {
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
      phone: phone || null,
      birth_date: birthDate || null,
      specialty: specialty || null,
      license_number: licenseNumber || null,
      cv: cv || null,
    };
    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);
    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({
        success: false,
        message: 'Error al crear el perfil: ' + profileError.message
      });
    }
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña y tipo de usuario son obligatorios'
      });
    }
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de usuario no encontrado'
      });
    }
    if (profile.role !== role) {
      await supabase.auth.signOut();
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder como ' + role
      });
    }
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});
app.post('/api/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});


// Endpoint para recuperar contraseña: busca en la tabla "profiles" y envía la contraseña por correo
const nodemailer = require('nodemailer');

app.post('/api/recover', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    // Buscar perfil por email (asume que hay una columna "email" y "password" en "profiles")
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, password')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'No se encontró una cuenta con ese correo' });
    }

    const plainPassword = data.password;
    const fullName = data.full_name || email;

    // Configurar nodemailer con variables de entorno EMAIL_USER y EMAIL_PASS
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña - Sistema Médico',
      text: `Hola ${fullName},\n\nHas solicitado recuperar tu contraseña. Tu contraseña es:\n\n${plainPassword}\n\nPor seguridad, considera cambiarla después de iniciar sesión.`
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Correo de recuperación enviado' });
  } catch (err) {
    console.error('Error en /api/recover:', err);
    return res.status(500).json({ success: false, message: 'Error interno al enviar correo' });
  }
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
