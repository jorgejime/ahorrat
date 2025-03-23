/*
  # Schema inicial para MI UET - Uso Efectivo del Tiempo

  1. Tablas Nuevas
    - `roles` - Roles definidos por el usuario
    - `objetivos` - Objetivos vinculados a roles
    - `actividades` - Actividades específicas vinculadas a objetivos
  
  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para que los usuarios solo puedan acceder a sus propios datos
*/

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de objetivos
CREATE TABLE IF NOT EXISTS objetivos (
  id SERIAL PRIMARY KEY,
  rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  prioridad INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS actividades (
  id SERIAL PRIMARY KEY,
  objetivo_id INTEGER NOT NULL REFERENCES objetivos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  dia TEXT NOT NULL,
  hora TEXT NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para roles
CREATE POLICY "Los usuarios pueden ver sus propios roles"
  ON roles FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden insertar sus propios roles"
  ON roles FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios roles"
  ON roles FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios roles"
  ON roles FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas de seguridad para objetivos
CREATE POLICY "Los usuarios pueden ver sus propios objetivos"
  ON objetivos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE roles.id = objetivos.rol_id
      AND roles.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden insertar sus propios objetivos"
  ON objetivos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles
      WHERE roles.id = objetivos.rol_id
      AND roles.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden actualizar sus propios objetivos"
  ON objetivos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE roles.id = objetivos.rol_id
      AND roles.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden eliminar sus propios objetivos"
  ON objetivos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE roles.id = objetivos.rol_id
      AND roles.usuario_id = auth.uid()
    )
  );

-- Políticas de seguridad para actividades
CREATE POLICY "Los usuarios pueden ver sus propias actividades"
  ON actividades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM objetivos
      JOIN roles ON objetivos.rol_id = roles.id
      WHERE objetivos.id = actividades.objetivo_id
      AND roles.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden insertar sus propias actividades"
  ON actividades FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM objetivos
      JOIN roles ON objetivos.rol_id = roles.id
      WHERE objetivos.id = actividades.objetivo_id
      AND roles.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden actualizar sus propias actividades"
  ON actividades FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM objetivos
      JOIN roles ON objetivos.rol_id = roles.id
      WHERE objetivos.id = actividades.objetivo_id
      AND roles.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden eliminar sus propias actividades"
  ON actividades FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM objetivos
      JOIN roles ON objetivos.rol_id = roles.id
      WHERE objetivos.id = actividades.objetivo_id
      AND roles.usuario_id = auth.uid()
    )
  );