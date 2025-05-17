import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL o clave anónima falta en las variables de entorno');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // Configuración para hacer las peticiones más robustas
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      // Establecer un tiempo de espera para evitar bloqueos indefinidos
      fetch: (url, options) => {
        return fetch(url, { 
          ...options, 
          // Establecer un timeout para evitar que las peticiones se queden colgadas
          signal: AbortSignal.timeout(30000) 
        });
      }
    }
  }
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