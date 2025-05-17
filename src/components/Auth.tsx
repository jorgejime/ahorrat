import React, { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import { Mail, Lock, UserPlus, LogIn, AlertCircle, Info, RefreshCw, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthProps {
  onAuthenticated: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [connectionActive, setConnectionActive] = useState(true);

  // Comprobar la conexión con Supabase al cargar el componente
  useEffect(() => {
    const checkConnection = async () => {
      setCheckingConnection(true);
      try {
        const isConnected = await testSupabaseConnection();
        setConnectionActive(isConnected);
        setConnectionError(!isConnected);
      } catch (error) {
        console.error('Error al verificar la conexión:', error);
        setConnectionActive(false);
        setConnectionError(true);
      } finally {
        setCheckingConnection(false);
      }
    };

    checkConnection();
  }, []);

  // Función para reintentar la conexión
  const retryConnection = async () => {
    setCheckingConnection(true);
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionActive(isConnected);
      setConnectionError(!isConnected);
      
      if (isConnected) {
        toast.success('¡Conexión restablecida!');
      } else {
        toast.error('No se pudo conectar con el servidor');
      }
    } catch (error) {
      console.error('Error al reintentar la conexión:', error);
      setConnectionActive(false);
      setConnectionError(true);
      toast.error('Error al intentar conectar con el servidor');
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, introduce tu email y contraseña');
      return;
    }
    
    // Verificar primero si hay conexión con Supabase
    if (!connectionActive) {
      toast.error('No hay conexión con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.');
      return;
    }
    
    try {
      setLoading(true);
      setConnectionError(false);
      
      if (isRegister) {
        // Registrar un nuevo usuario
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        // Intentamos iniciar sesión inmediatamente después del registro
        // Si la confirmación de email está desactivada, esto funcionará
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          // Si hay un error específico de email no confirmado
          if (signInError.message && signInError.message.includes('email_not_confirmed')) {
            setConfirmationPending(true);
            toast.success('Registro exitoso. Por favor, revisa tu email para confirmar tu cuenta.');
          } else {
            throw signInError;
          }
        } else {
          toast.success('¡Registro exitoso!');
          onAuthenticated();
        }
      } else {
        // Iniciar sesión
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Manejar error específico de email no confirmado
          if (error.message && error.message.includes('email_not_confirmed')) {
            setConfirmationPending(true);
            throw new Error('Tu email aún no ha sido confirmado. Por favor, revisa tu bandeja de entrada.');
          } else {
            throw error;
          }
        }
        
        toast.success('¡Bienvenido de vuelta!');
        onAuthenticated();
      }
    } catch (error) {
      if (error instanceof Error) {
        // Verificar si es un error de red o conectividad
        if (error.message === 'Failed to fetch' || error.message.includes('network') || error.message.includes('Network')) {
          setConnectionError(true);
          setConnectionActive(false);
          toast.error('Error de conexión. No se pudo conectar con el servidor.');
          console.error('Error de conexión con Supabase:', error);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Ha ocurrido un error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para reenviar el correo de confirmación
  const resendConfirmationEmail = async () => {
    if (!email) {
      toast.error('Por favor, introduce tu email');
      return;
    }
    
    // Verificar primero si hay conexión con Supabase
    if (!connectionActive) {
      toast.error('No hay conexión con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.');
      return;
    }
    
    try {
      setLoading(true);
      setConnectionError(false);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      
      toast.success('Email de confirmación reenviado');
    } catch (error) {
      if (error instanceof Error) {
        // Verificar si es un error de conexión
        if (error.message === 'Failed to fetch' || error.message.includes('network') || error.message.includes('Network')) {
          setConnectionError(true);
          setConnectionActive(false);
          toast.error('Error de conexión. No se pudo conectar con el servidor.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Error al reenviar el email de confirmación');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Función para iniciar sesión como invitado (sin confirmación)
  const handleGuestLogin = async () => {
    // Verificar primero si hay conexión con Supabase
    if (!connectionActive) {
      toast.error('No hay conexión con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.');
      return;
    }
    
    try {
      setLoading(true);
      setConnectionError(false);
      
      console.log('Intentando iniciar sesión como invitado...');
      
      // Usamos un usuario invitado fijo para evitar problemas
      const guestEmail = "invitado@ahorrat.app";
      const guestPassword = "AhorraT2025Guest!";
      
      // Primero verificamos si el usuario invitado ya existe
      try {
        // Intento de iniciar sesión directamente
        const { data, error } = await supabase.auth.signInWithPassword({
          email: guestEmail,
          password: guestPassword,
        });
        
        if (!error) {
          // Si no hay error, inicio de sesión exitoso
          console.log('Inicio de sesión como invitado exitoso');
          localStorage.setItem('isGuestUser', 'true');
          toast.success('Has iniciado sesión como invitado');
          onAuthenticated();
          return;
        }
        
        // Si hay error pero no es de credenciales inválidas, lanzamos el error
        if (!error.message.includes('Invalid login credentials')) {
          throw error;
        }
        
        // Si llegamos aquí, el usuario no existe, así que lo creamos
        console.log('El usuario invitado no existe, creándolo...');
        const { error: signUpError } = await supabase.auth.signUp({
          email: guestEmail,
          password: guestPassword,
          options: {
            data: {
              name: 'Usuario Invitado',
              isGuest: true
            }
          }
        });
        
        if (signUpError) {
          console.error('Error al crear usuario invitado:', signUpError.message);
          throw signUpError;
        }
        
        // Intentamos iniciar sesión después de crear el usuario
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: guestEmail,
          password: guestPassword,
        });
        
        if (loginError) {
          console.error('Error al iniciar sesión después de crear usuario invitado:', loginError.message);
          throw loginError;
        }
        
        localStorage.setItem('isGuestUser', 'true');
        toast.success('Has iniciado sesión como invitado');
        onAuthenticated();
      } catch (error) {
        console.error('Error durante el flujo de inicio de sesión como invitado:', error);
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        // Verificar si es un error de conexión
        if (error.message === 'Failed to fetch' || error.message.includes('network') || error.message.includes('Network')) {
          setConnectionError(true);
          setConnectionActive(false);
          toast.error('Error de conexión. No se pudo conectar con el servidor.');
          console.error('Error de conexión con Supabase:', error);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Ha ocurrido un error al iniciar sesión como invitado');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 py-8 px-6 flex flex-col items-center">
          <img 
            src="https://usm.edu.co/assets/Publico/images/Logo.png" 
            alt="Logo AhorraT" 
            className="h-20 mb-4 bg-white p-1 rounded-lg" 
          />
          <h2 className="text-3xl font-bold text-white text-center">
            AhorraT
          </h2>
          <p className="text-blue-100 text-center mt-2 text-lg">
            {isRegister ? 'Crea tu cuenta' : confirmationPending ? 'Confirmación pendiente' : 'Inicia sesión para continuar'}
          </p>
        </div>
        
        {/* Descripción de la aplicación */}
        <div className="bg-blue-50 p-5 border-b border-blue-100">
          <h3 className="text-blue-800 font-medium flex items-center mb-3 text-lg">
            <Info className="w-5 h-5 mr-2" /> ¿Qué es AhorraT?
          </h3>
          <p className="text-base text-gray-700 mb-3">
            AhorraT es una aplicación que te ayuda a gestionar tu tiempo de manera efectiva basándose en roles, objetivos y prioridades.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 rounded">
            <p className="text-sm font-medium text-yellow-800">
              Nos enfocamos exclusivamente en la planificación semanal para ayudarte a organizar mejor tu tiempo.
            </p>
          </div>
          <ul className="text-sm text-gray-600 list-disc pl-6 space-y-2">
            <li>Define tus <span className="font-medium">roles</span> en la vida (profesional, estudiante, familiar...)</li>
            <li>Establece <span className="font-medium">objetivos</span> claros para cada rol con prioridades</li>
            <li>Programa <span className="font-medium">actividades</span> concretas para cumplir tus objetivos</li>
            <li>Visualiza tu semana organizada y descarga tu planificación</li>
          </ul>
        </div>
        
        {/* Estado de conexión */}
        {(connectionError || !connectionActive) && (
          <div className="py-4 px-6 bg-red-50">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <WifiOff className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Problema de conexión detectado
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      No se pudo conectar con el servidor de Supabase. Esto puede deberse a:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Conexión a internet inestable o interrumpida</li>
                      <li>El servidor de Supabase podría estar temporalmente no disponible</li>
                      <li>Problemas con las credenciales de acceso</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={retryConnection}
                      disabled={checkingConnection}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {checkingConnection ? (
                        <>
                          <RefreshCw className="animate-spin -ml-0.5 mr-2 h-4 w-4" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="-ml-0.5 mr-2 h-4 w-4" />
                          Reintentar conexión
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {confirmationPending ? (
          <div className="py-8 px-6 space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-base text-yellow-700">
                    Tu cuenta requiere confirmación por email. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={resendConfirmationEmail}
              disabled={loading || !connectionActive}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Reenviar email de confirmación'}
            </button>
            
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setConfirmationPending(false);
                  setIsRegister(false);
                }}
                className="text-base text-blue-600 hover:text-blue-500 font-medium"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="py-8 px-6 space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-base"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-base"
                  placeholder="********"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading || !connectionActive}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : isRegister ? (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" /> Crear cuenta
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" /> Iniciar sesión
                  </>
                )}
              </button>
            </div>
            
            <div className="relative mt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 text-base">O</span>
              </div>
            </div>
            
            <div>
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading || !connectionActive}
                className="w-full flex justify-center py-3 px-4 border border-blue-300 rounded-lg shadow-sm text-base font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Continuar como invitado
              </button>
            </div>
          </form>
        )}
        
        {!confirmationPending && (
          <div className="bg-gray-50 py-4 px-6 border-t border-gray-200 rounded-b-xl">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-base text-blue-600 hover:text-blue-500 font-medium"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;