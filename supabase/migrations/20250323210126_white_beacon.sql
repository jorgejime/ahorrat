/*
  # Desactivar confirmación de email para usuarios

  1. Cambios
    - Actualiza a los usuarios existentes para marcar sus emails como confirmados
    - Permite que los usuarios puedan iniciar sesión sin necesidad de confirmar su email
*/

-- Configurar usuarios existentes para que sus emails aparezcan como confirmados
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Asegurar que los nuevos usuarios tengan email_confirmed_at establecido automáticamente
CREATE OR REPLACE FUNCTION auth.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si ya existe (para evitar errores al ejecutar la migración varias veces)
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;

-- Crear el trigger para confirmar automáticamente el email en nuevos registros
CREATE TRIGGER auto_confirm_email_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auth.auto_confirm_email();