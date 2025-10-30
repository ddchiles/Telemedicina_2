// Simulación de citas programadas
const citas = [
  { paciente: "Juan Pérez", especialidad: "Cardiología", fecha: "2025-10-04", hora: "10:00" },
  { paciente: "María López", especialidad: "Dermatología", fecha: "2025-10-04", hora: "12:30" },
  { paciente: "Carlos Ramírez", especialidad: "Pediatría", fecha: "2025-10-05", hora: "09:00" }
];

// Pacientes simulados
const pacientes = [
  {
    nombre: "Juan Pérez",
    edad: 34,
    telefono: "555-1234",
    correo: "juan.perez@mail.com",
    historial: "Hipertensión, consulta en 2024-11-10"
  },
  {
    nombre: "María López",
    edad: 28,
    telefono: "555-5678",
    correo: "maria.lopez@mail.com",
    historial: "Alergia a penicilina, consulta en 2025-01-15"
  },
  {
    nombre: "Carlos Ramírez",
    edad: 42,
    telefono: "555-8765",
    correo: "carlos.ramirez@mail.com",
    historial: "Diabetes tipo 2, consulta en 2025-03-22"
  }
];

// Mostrar citas en el panel
function mostrarCitas() {
  const lista = document.getElementById("lista-citas");
  lista.innerHTML = "";
  if (citas.length === 0) {
    lista.innerHTML = "<p>No hay citas programadas para hoy.</p>";
    return;
  }
  citas.forEach(cita => {
    const card = document.createElement("div");
    card.className = "cita-card";
    card.innerHTML = `
      <h4>Paciente: ${cita.paciente}</h4>
      <p><strong>Especialidad:</strong> ${cita.especialidad}</p>
      <p><strong>Fecha:</strong> ${cita.fecha} <strong>Hora:</strong> ${cita.hora}</p>
      <button class="btn-primary" onclick="cancelarCita('${cita.paciente}')">Cancelar</button>
    `;
    lista.appendChild(card);
  });
}

// Cancelar cita (simulado)
function cancelarCita(paciente) {
  const idx = citas.findIndex(c => c.paciente === paciente);
  if (idx !== -1) {
    citas.splice(idx, 1);
    mostrarCitas();
    alert("Cita cancelada para " + paciente);
  }
}

// Mostrar pacientes en la tabla
function mostrarPacientes() {
  const tbody = document.querySelector("#tabla-pacientes tbody");
  tbody.innerHTML = "";
  pacientes.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.edad}</td>
      <td>${p.telefono}</td>
      <td><button class="btn-detalle" onclick="verDetallePaciente(${idx})">Ver Detalles</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Mostrar modal con detalles
function verDetallePaciente(idx) {
  const p = pacientes[idx];
  document.getElementById("detalle-paciente").innerHTML = `
    <strong>Nombre:</strong> ${p.nombre}<br>
    <strong>Edad:</strong> ${p.edad}<br>
    <strong>Teléfono:</strong> ${p.telefono}<br>
    <strong>Correo:</strong> ${p.correo}<br>
    <strong>Historial:</strong> ${p.historial}
  `;
  document.getElementById("modal-paciente").style.display = "block";
}

// Cerrar modal
function cerrarModalPaciente() {
  document.getElementById("modal-paciente").style.display = "none";
}

// CHATBOT
function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userText = input.value.trim();
  if (userText === "") return;

  // Mensaje del usuario
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.textContent = "👨‍⚕️ " + userText;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Respuesta del bot
  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.classList.add("message", "bot");
    botMsg.textContent = "🤖 Soporte IA: Su consulta ha sido registrada. ¿Desea información médica o ayuda técnica?";
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);

  input.value = "";
}

// Enviar con Enter
document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Recetas: botón "Ver PDF" (simulado)
document.querySelectorAll(".btn-receta").forEach(btn => {
  btn.addEventListener("click", function() {
    alert("Descargando receta en PDF...");
  });
});

// Crear nueva receta (simulado)
document.querySelector(".btn-primary").addEventListener("click", function() {
  alert("Función para crear nueva receta (simulada).");
});

// Inicializar citas y pacientes al cargar
window.onload = function() {
  mostrarCitas();
  mostrarPacientes();
}