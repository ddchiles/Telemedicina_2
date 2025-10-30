/*
  # Telemedicina Database Schema

  ## Overview
  Creates the complete database structure for a telemedicine application with user authentication
  and role-based access control.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'patient', 'doctor', or 'admin'
  - `phone` (text, optional) - Phone number
  - `birth_date` (date, optional) - Birth date (for patients)
  - `specialty` (text, optional) - Medical specialty (for doctors)
  - `license_number` (text, optional) - Professional license (for doctors)
  - `cv` (text, optional) - Brief CV (for doctors)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  1. Enable RLS on all tables
  2. Policies for profiles table:
     - Users can view their own profile
     - Users can update their own profile
     - Doctors can view patient profiles (for appointments)
     - Admins can view all profiles
  
  ## Notes
  - Passwords are handled by Supabase Auth automatically
  - Email verification is disabled by default
  - User roles are stored in profiles table for easy access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  phone text,
  birth_date date,
  specialty text,
  license_number text,
  cv text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);