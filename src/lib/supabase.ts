import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anonymous key is missing from environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Tipos para las tablas de la base de datos
export type Usuario = {
  id: string;
  email: string;
  nombre?: string;
  created_at: string;
}

export type Rol = {
  id: number;
  usuario_id: string;
  nombre: string;
  created_at: string;
}

export type Objetivo = {
  id: number;
  rol_id: number;
  descripcion: string;
  prioridad: number;
  created_at: string;
}

export type Actividad = {
  id: number;
  objetivo_id: number;
  descripcion: string;
  dia: string;
  hora: string;
  completada: boolean;
  created_at: string;
}