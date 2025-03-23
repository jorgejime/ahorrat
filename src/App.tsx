import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { PlusCircle, Calendar, User, AlignLeft, Clock, CheckCircle, Edit, Trash2, LogOut, Download, HelpCircle, Info, AlertCircle } from 'lucide-react';
import { supabase, Rol, Objetivo, Actividad } from './lib/supabase';
import Auth from './components/Auth';
import AcercaDe from './components/AcercaDe';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  // Estado de autenticación
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);
  
  // Estados para la aplicación
  const [activeTab, setActiveTab] = useState('planificacion');
  const [showAcercaDe, setShowAcercaDe] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  
  const [nuevoRol, setNuevoRol] = useState('');
  const [nuevoObjetivo, setNuevoObjetivo] = useState<{rolId: number | null, descripcion: string, prioridad: number}>({
    rolId: null,
    descripcion: '',
    prioridad: 1
  });
  const [nuevaActividad, setNuevaActividad] = useState<{objetivoId: number | null, descripcion: string, dia: string, hora: string}>({
    objetivoId: null,
    descripcion: '',
    dia: 'Lunes',
    hora: '08:00'
  });
  
  // Estados para la edición
  const [editRolId, setEditRolId] = useState<number | null>(null);
  const [editRolNombre, setEditRolNombre] = useState('');
  
  const [editObjetivoId, setEditObjetivoId] = useState<number | null>(null);
  const [editObjetivo, setEditObjetivo] = useState<{rolId: number | null, descripcion: string, prioridad: number}>({
    rolId: null,
    descripcion: '',
    prioridad: 1
  });
  
  const [editActividadId, setEditActividadId] = useState<number | null>(null);
  const [editActividad, setEditActividad] = useState<{objetivoId: number | null, descripcion: string, dia: string, hora: string}>({
    objetivoId: null,
    descripcion: '',
    dia: 'Lunes',
    hora: '08:00'
  });
  
  // Estado para mostrar el panel de ayuda rápida
  const [showHelp, setShowHelp] = useState(false);
  
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const horas = Array.from({ length: 17 }, (_, i) => `${i + 6}:00`);
  
  // Ref para el elemento de planificación que queremos exportar a PDF
  const planificacionRef = useRef<HTMLDivElement>(null);
  
  // Verificar sesión al cargar
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        // Comprobar si es un usuario invitado
        const isGuest = localStorage.getItem('isGuestUser') === 'true';
        setIsGuestUser(isGuest);
        
        // Configurar listener para cambios en la autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          
          // Si el evento es un inicio de sesión, comprobar si es invitado
          if (_event === 'SIGNED_IN') {
            const isGuest = localStorage.getItem('isGuestUser') === 'true';
            setIsGuestUser(isGuest);
          }
          
          // Si el evento es cierre de sesión, limpiar estado de invitado
          if (_event === 'SIGNED_OUT') {
            localStorage.removeItem('isGuestUser');
            setIsGuestUser(false);
          }
        });
        
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, []);
  
  // Cargar datos del usuario cuando está autenticado
  useEffect(() => {
    if (session) {
      if (isGuestUser) {
        // Para usuarios invitados, iniciamos con listas vacías (estado limpio)
        setRoles([]);
        setObjetivos([]);
        setActividades([]);
        setLoading(false);
      } else {
        // Para usuarios normales, cargamos sus datos de la base de datos
        fetchUserData();
      }
    }
  }, [session, isGuestUser]);
  
  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      // Limpiar datos locales primero
      setRoles([]);
      setObjetivos([]);
      setActividades([]);
      
      // Limpiar estado de invitado
      localStorage.removeItem('isGuestUser');
      setIsGuestUser(false);
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };
  
  // Función para cargar datos del usuario
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // No cargar datos para usuarios invitados
      if (isGuestUser) {
        setLoading(false);
        return;
      }
      
      // Cargar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (rolesError) throw rolesError;
      setRoles(rolesData || []);
      
      // Cargar objetivos
      const { data: objetivosData, error: objetivosError } = await supabase
        .from('objetivos')
        .select('*')
        .order('prioridad', { ascending: true });
      
      if (objetivosError) throw objetivosError;
      setObjetivos(objetivosData || []);
      
      // Cargar actividades
      const { data: actividadesData, error: actividadesError } = await supabase
        .from('actividades')
        .select('*')
        .order('hora', { ascending: true });
      
      if (actividadesError) throw actividadesError;
      setActividades(actividadesData || []);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar tus datos');
    } finally {
      setLoading(false);
    }
  };
  
  // MANEJO DE ROLES
  
  // Función para añadir un nuevo rol
  const agregarRol = async () => {
    if (nuevoRol.trim() === '') {
      toast.error('El nombre del rol no puede estar vacío');
      return;
    }
    
    try {
      if (isGuestUser) {
        // Para usuarios invitados, solo lo guardamos en el estado local
        const nuevoRolLocal: Rol = {
          id: Date.now(), // ID temporal para usuarios invitados
          usuario_id: session.user.id,
          nombre: nuevoRol,
          created_at: new Date().toISOString()
        };
        
        setRoles([...roles, nuevoRolLocal]);
        setNuevoRol('');
        toast.success('Rol añadido correctamente');
      } else {
        // Para usuarios normales, guardamos en la base de datos
        const { data, error } = await supabase
          .from('roles')
          .insert([{ 
            usuario_id: session.user.id,
            nombre: nuevoRol
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setRoles([...roles, data[0]]);
          setNuevoRol('');
          toast.success('Rol añadido correctamente');
        }
      }
    } catch (error) {
      console.error('Error al añadir rol:', error);
      toast.error('Error al añadir rol');
    }
  };
  
  // Función para iniciar la edición de un rol
  const iniciarEdicionRol = (rol: Rol) => {
    setEditRolId(rol.id);
    setEditRolNombre(rol.nombre);
  };
  
  // Función para cancelar la edición de un rol
  const cancelarEdicionRol = () => {
    setEditRolId(null);
    setEditRolNombre('');
  };
  
  // Función para guardar la edición de un rol
  const guardarEdicionRol = async () => {
    if (!editRolId) return;
    
    if (editRolNombre.trim() === '') {
      toast.error('El nombre del rol no puede estar vacío');
      return;
    }
    
    try {
      if (isGuestUser) {
        // Para usuarios invitados, actualizamos el estado local
        setRoles(roles.map(rol => 
          rol.id === editRolId ? { ...rol, nombre: editRolNombre } : rol
        ));
        
        cancelarEdicionRol();
        toast.success('Rol actualizado correctamente');
      } else {
        // Para usuarios normales, actualizamos en la base de datos
        const { error } = await supabase
          .from('roles')
          .update({ nombre: editRolNombre })
          .eq('id', editRolId);
        
        if (error) throw error;
        
        setRoles(roles.map(rol => 
          rol.id === editRolId ? { ...rol, nombre: editRolNombre } : rol
        ));
        
        cancelarEdicionRol();
        toast.success('Rol actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      toast.error('Error al actualizar rol');
    }
  };
  
  // Función para eliminar un rol
  const eliminarRol = async (id: number) => {
    try {
      if (isGuestUser) {
        // Para usuarios invitados, solo lo eliminamos del estado local
        setRoles(roles.filter(rol => rol.id !== id));
        
        // También eliminamos objetivos asociados
        const objetivosAEliminar = objetivos.filter(obj => obj.rol_id === id);
        setObjetivos(objetivos.filter(obj => obj.rol_id !== id));
        
        // Y las actividades asociadas a esos objetivos
        const objetivosIds = objetivosAEliminar.map(obj => obj.id);
        setActividades(actividades.filter(act => !objetivosIds.includes(act.objetivo_id)));
        
        toast.success('Rol eliminado correctamente');
      } else {
        // Para usuarios normales, eliminamos de la base de datos
        const { error } = await supabase
          .from('roles')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setRoles(roles.filter(rol => rol.id !== id));
        toast.success('Rol eliminado correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      toast.error('Error al eliminar rol');
    }
  };
  
  // MANEJO DE OBJETIVOS
  
  // Función para añadir un nuevo objetivo
  const agregarObjetivo = async () => {
    if (!nuevoObjetivo.rolId) {
      toast.error('Debes seleccionar un rol');
      return;
    }
    
    if (nuevoObjetivo.descripcion.trim() === '') {
      toast.error('La descripción del objetivo no puede estar vacía');
      return;
    }
    
    try {
      if (isGuestUser) {
        // Para usuarios invitados, solo lo guardamos en el estado local
        const nuevoObjetivoLocal: Objetivo = {
          id: Date.now(), // ID temporal para usuarios invitados
          rol_id: nuevoObjetivo.rolId,
          descripcion: nuevoObjetivo.descripcion,
          prioridad: nuevoObjetivo.prioridad,
          created_at: new Date().toISOString()
        };
        
        setObjetivos([...objetivos, nuevoObjetivoLocal]);
        setNuevoObjetivo({ rolId: null, descripcion: '', prioridad: 1 });
        toast.success('Objetivo añadido correctamente');
      } else {
        // Para usuarios normales, guardamos en la base de datos
        const { data, error } = await supabase
          .from('objetivos')
          .insert([{ 
            rol_id: nuevoObjetivo.rolId,
            descripcion: nuevoObjetivo.descripcion,
            prioridad: nuevoObjetivo.prioridad
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setObjetivos([...objetivos, data[0]]);
          setNuevoObjetivo({ rolId: null, descripcion: '', prioridad: 1 });
          toast.success('Objetivo añadido correctamente');
        }
      }
    } catch (error) {
      console.error('Error al añadir objetivo:', error);
      toast.error('Error al añadir objetivo');
    }
  };
  
  // Función para iniciar la edición de un objetivo
  const iniciarEdicionObjetivo = (objetivo: Objetivo) => {
    setEditObjetivoId(objetivo.id);
    setEditObjetivo({
      rolId: objetivo.rol_id,
      descripcion: objetivo.descripcion,
      prioridad: objetivo.prioridad
    });
  };
  
  // Función para cancelar la edición de un objetivo
  const cancelarEdicionObjetivo = () => {
    setEditObjetivoId(null);
    setEditObjetivo({ rolId: null, descripcion: '', prioridad: 1 });
  };
  
  // Función para guardar la edición de un objetivo
  const guardarEdicionObjetivo = async () => {
    if (!editObjetivoId) return;
    
    if (!editObjetivo.rolId) {
      toast.error('Debes seleccionar un rol');
      return;
    }
    
    if (editObjetivo.descripcion.trim() === '') {
      toast.error('La descripción del objetivo no puede estar vacía');
      return;
    }
    
    try {
      if (isGuestUser) {
        // Para usuarios invitados, actualizamos el estado local
        setObjetivos(objetivos.map(obj => 
          obj.id === editObjetivoId ? { 
            ...obj, 
            rol_id: editObjetivo.rolId || obj.rol_id,
            descripcion: editObjetivo.descripcion,
            prioridad: editObjetivo.prioridad
          } : obj
        ));
        
        cancelarEdicionObjetivo();
        toast.success('Objetivo actualizado correctamente');
      } else {
        // Para usuarios normales, actualizamos en la base de datos
        const { error } = await supabase
          .from('objetivos')
          .update({ 
            rol_id: editObjetivo.rolId,
            descripcion: editObjetivo.descripcion,
            prioridad: editObjetivo.prioridad
          })
          .eq('id', editObjetivoId);
        
        if (error) throw error;
        
        setObjetivos(objetivos.map(obj => 
          obj.id === editObjetivoId ? { 
            ...obj, 
            rol_id: editObjetivo.rolId || obj.rol_id,
            descripcion: editObjetivo.descripcion,
            prioridad: editObjetivo.prioridad
          } : obj
        ));
        
        cancelarEdicionObjetivo();
        toast.success('Objetivo actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar objetivo:', error);
      toast.error('Error al actualizar objetivo');
    }
  };
  
  // Función para eliminar un objetivo
  const eliminarObjetivo = async (id: number) => {
    try {
      if (isGuestUser) {
        // Para usuarios invitados, solo lo eliminamos del estado local
        setObjetivos(objetivos.filter(objetivo => objetivo.id !== id));
        
        // También eliminamos actividades asociadas
        setActividades(actividades.filter(act => act.objetivo_id !== id));
        
        toast.success('Objetivo eliminado correctamente');
      } else {
        // Para usuarios normales, eliminamos de la base de datos
        const { error } = await supabase
          .from('objetivos')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setObjetivos(objetivos.filter(objetivo => objetivo.id !== id));
        toast.success('Objetivo eliminado correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar objetivo:', error);
      toast.error('Error al eliminar objetivo');
    }
  };
  
  // MANEJO DE ACTIVIDADES
  
  // Función para añadir una nueva actividad
  const agregarActividad = async () => {
    if (!nuevaActividad.objetivoId) {
      toast.error('Debes seleccionar un objetivo');
      return;
    }
    
    if (nuevaActividad.descripcion.trim() === '') {
      toast.error('La descripción de la actividad no puede estar vacía');
      return;
    }
    
    try {
      if (isGuestUser) {
        // Para usuarios invitados, solo lo guardamos en el estado local
        const nuevaActividadLocal: Actividad = {
          id: Date.now(), // ID temporal para usuarios invitados
          objetivo_id: nuevaActividad.objetivoId,
          descripcion: nuevaActividad.descripcion,
          dia: nuevaActividad.dia,
          hora: nuevaActividad.hora,
          completada: false,
          created_at: new Date().toISOString()
        };
        
        setActividades([...actividades, nuevaActividadLocal]);
        setNuevaActividad({ objetivoId: null, descripcion: '', dia: 'Lunes', hora: '08:00' });
        toast.success('Actividad añadida correctamente');
      } else {
        // Para usuarios normales, guardamos en la base de datos
        const { data, error } = await supabase
          .from('actividades')
          .insert([{ 
            objetivo_id: nuevaActividad.objetivoId,
            descripcion: nuevaActividad.descripcion,
            dia: nuevaActividad.dia,
            hora: nuevaActividad.hora,
            completada: false
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActividades([...actividades, data[0]]);
          setNuevaActividad({ objetivoId: null, descripcion: '', dia: 'Lunes', hora: '08:00' });
          toast.success('Actividad añadida correctamente');
        }
      }
    } catch (error) {
      console.error('Error al añadir actividad:', error);
      toast.error('Error al añadir actividad');
    }
  };
  
  // Función para iniciar la edición de una actividad
  const iniciarEdicionActividad = (actividad: Actividad) => {
    setEditActividadId(actividad.id);
    setEditActividad({
      objetivoId: actividad.objetivo_id,
      descripcion: actividad.descripcion,
      dia: actividad.dia,
      hora: actividad.hora
    });
  };
  
  // Función para cancelar la edición de una actividad
  const cancelarEdicionActividad = () => {
    setEditActividadId(null);
    setEditActividad({ objetivoId: null, descripcion: '', dia: 'Lunes', hora: '08:00' });
  };
  
  // Función para guardar la edición de una actividad
  const guardarEdicionActividad = async () => {
    if (!editActividadId) return;
    
    if (!editActividad.objetivoId) {
      toast.error('Debes seleccionar un objetivo');
      return;
    }
    
    if (editActividad.descripcion.trim() === '') {
      toast.error('La descripción de la actividad no puede estar vacía');
      return;
    }
    
    try {
      if (isGuestUser) {
        // Para usuarios invitados, actualizamos el estado local
        setActividades(actividades.map(act => 
          act.id === editActividadId ? { 
            ...act, 
            objetivo_id: editActividad.objetivoId || act.objetivo_id,
            descripcion: editActividad.descripcion,
            dia: editActividad.dia,
            hora: editActividad.hora
          } : act
        ));
        
        cancelarEdicionActividad();
        toast.success('Actividad actualizada correctamente');
      } else {
        // Para usuarios normales, actualizamos en la base de datos
        const { error } = await supabase
          .from('actividades')
          .update({ 
            objetivo_id: editActividad.objetivoId,
            descripcion: editActividad.descripcion,
            dia: editActividad.dia,
            hora: editActividad.hora
          })
          .eq('id', editActividadId);
        
        if (error) throw error;
        
        setActividades(actividades.map(act => 
          act.id === editActividadId ? { 
            ...act, 
            objetivo_id: editActividad.objetivoId || act.objetivo_id,
            descripcion: editActividad.descripcion,
            dia: editActividad.dia,
            hora: editActividad.hora
          } : act
        ));
        
        cancelarEdicionActividad();
        toast.success('Actividad actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      toast.error('Error al actualizar actividad');
    }
  };
  
  // Función para marcar actividad como completada
  const toggleCompletada = async (id: number, completadaActual: boolean) => {
    try {
      if (isGuestUser) {
        // Para usuarios invitados, solo actualizamos el estado local
        setActividades(actividades.map(act => 
          act.id === id ? { ...act, completada: !completadaActual } : act
        ));
      } else {
        // Para usuarios normales, actualizamos en la base de datos
        const { error } = await supabase
          .from('actividades')
          .update({ completada: !completadaActual })
          .eq('id', id);
        
        if (error) throw error;
        
        setActividades(actividades.map(act => 
          act.id === id ? { ...act, completada: !completadaActual } : act
        ));
      }
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      toast.error('Error al actualizar actividad');
    }
  };
  
  // Función para eliminar una actividad
  const eliminarActividad = async (id: number) => {
    try {
      if (isGuestUser) {
        // Para usuarios invitados, solo eliminamos del estado local
        setActividades(actividades.filter(act => act.id !== id));
        toast.success('Actividad eliminada correctamente');
      } else {
        // Para usuarios normales, eliminamos de la base de datos
        const { error } = await supabase
          .from('actividades')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setActividades(actividades.filter(act => act.id !== id));
        toast.success('Actividad eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
      toast.error('Error al eliminar actividad');
    }
  };
  
  // FUNCIONES AUXILIARES
  
  // Obtener nombre del rol por ID
  const getNombreRol = (rolId: number) => {
    const rol = roles.find(r => r.id === rolId);
    return rol ? rol.nombre : '';
  };
  
  // Obtener descripción del objetivo por ID
  const getDescripcionObjetivo = (objetivoId: number) => {
    const objetivo = objetivos.find(o => o.id === objetivoId);
    return objetivo ? objetivo.descripcion : '';
  };
  
  // Obtener rol ID del objetivo por ID
  const getRolIdDeObjetivo = (objetivoId: number) => {
    const objetivo = objetivos.find(o => o.id === objetivoId);
    return objetivo ? objetivo.rol_id : null;
  };
  
  // Obtener prioridad del objetivo por ID
  const getPrioridadObjetivo = (objetivoId: number) => {
    const objetivo = objetivos.find(o => o.id === objetivoId);
    return objetivo ? objetivo.prioridad : 0;
  };
  
  // Filtrar actividades por día
  const getActividadesPorDia = (dia: string) => {
    return actividades
      .filter(a => a.dia === dia)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  };
  
  // Obtener roles sin objetivos
  const getRolesSinObjetivos = () => {
    return roles.filter(rol => !objetivos.some(obj => obj.rol_id === rol.id));
  };
  
  // Obtener objetivos sin actividades
  const getObjetivosSinActividades = () => {
    return objetivos.filter(obj => !actividades.some(act => act.objetivo_id === obj.id));
  };
  
  // Función para generar y descargar el PDF
  const descargarPDF = async () => {
    if (!planificacionRef.current) return;
    
    toast.loading('Generando PDF...');
    
    try {
      // Capturar el elemento planificación como imagen
      const canvas = await html2canvas(planificacionRef.current, {
        scale: 1, // Mejor calidad pero más pesado
        useCORS: true, // Para permitir imágenes de otros dominios
        logging: false,
        backgroundColor: '#f3f4f6' // Color de fondo para la imagen
      });
      
      // Proporciones del contenido
      const imgWidth = 210; // A4 ancho en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Crear nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Añadir título
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('AhorraT - Planificación Semanal', 105, 15, { align: 'center' });
      
      // Añadir fecha
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const fecha = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generado el ${fecha}`, 105, 22, { align: 'center' });
      
      // Añadir imagen de la planificación
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.7), // Calidad 70% para reducir tamaño
        'JPEG',
        0, // x
        30, // y
        imgWidth, // ancho
        imgHeight // alto
      );
      
      // Añadir número de página
      const totalPages = 1;
      pdf.setFontSize(8);
      pdf.text(`Página 1 de ${totalPages}`, 105, 290, { align: 'center' });
      
      // Guardar el PDF
      pdf.save('planificacion-semanal.pdf');
      
      toast.dismiss();
      toast.success('¡PDF generado correctamente!');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.dismiss();
      toast.error('Error al generar el PDF');
    }
  };
  
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }
  
  // Si se está mostrando la página "Acerca de"
  if (showAcercaDe) {
    return (
      <>
        <Toaster position="top-center" />
        <AcercaDe onClose={() => setShowAcercaDe(false)} />
      </>
    );
  }
  
  // Si no hay sesión, mostrar pantalla de login/registro
  if (!session) {
    return (
      <>
        <Toaster position="top-center" />
        <Auth onAuthenticated={fetchUserData} />
      </>
    );
  }
  
  // Mostrar mensaje especial para usuarios invitados
  const renderGuestBanner = () => {
    if (isGuestUser) {
      return (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base text-blue-800 font-medium">Sesión de Invitado</p>
              <p className="text-sm text-blue-700 mt-1">
                Estás usando una sesión temporal. Tus datos se guardarán solo en este dispositivo y se perderán al cerrar sesión.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Aplicación principal cuando el usuario está autenticado
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '16px',
            maxWidth: '500px',
            padding: '16px',
          },
        }}
      />
      
      {/* Cabecera */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center">
            <img 
              src="https://usm.edu.co/assets/Publico/images/Logo.png" 
              alt="Logo AhorraT" 
              className="h-12 md:h-14 mr-3 bg-white p-1 rounded" 
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">AhorraT</h1>
              <p className="text-sm md:text-base mt-1">Organiza tu tiempo eficientemente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-full text-base flex items-center"
              aria-label="Mostrar ayuda"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowAcercaDe(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded text-base hidden md:flex items-center"
            >
              <Info className="w-5 h-5 mr-1" /> Acerca de
            </button>
            <button 
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded text-base flex items-center"
            >
              <LogOut className="w-5 h-5 mr-1" /> Salir
            </button>
          </div>
        </div>
      </header>
      
      {/* Panel de ayuda */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Guía Rápida de AhorraT</h2>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <p className="text-lg font-semibold text-blue-600 mb-2">¿Cómo empezar?</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Comienza creando tus <span className="font-medium">Roles</span> (Estudiante, Profesional, etc.)</li>
                  <li>Define <span className="font-medium">Objetivos</span> para cada rol con su prioridad</li>
                  <li>Programa <span className="font-medium">Actividades</span> para alcanzar tus objetivos</li>
                  <li>¡Visualiza tu semana completa en la <span className="font-medium">Planificación</span>!</li>
                </ol>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg mb-4">
                <p className="text-blue-800 font-medium mb-2">Consejos:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Asigna prioridades según la importancia de cada objetivo</li>
                  <li>Marca las actividades como completadas al terminarlas</li>
                  <li>Puedes descargar tu planificación en PDF</li>
                  <li>Revisa "Acerca de" para más información sobre la app</li>
                </ul>
              </div>
              
              {isGuestUser && (
                <div className="p-3 bg-yellow-50 rounded-lg mb-4 border border-yellow-200">
                  <p className="text-yellow-800 font-medium mb-2">Modo Invitado:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Tus datos solo se guardan localmente</li>
                    <li>Se perderán al cerrar sesión o salir de la aplicación</li>
                    <li>Para guardar permanentemente, crea una cuenta</li>
                  </ul>
                </div>
              )}
              
              <button
                onClick={() => setShowHelp(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-base mt-2"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Navegación */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between">
            <div className="flex overflow-x-auto hide-scrollbar py-2 px-1 w-full">
              <button 
                onClick={() => setActiveTab('planificacion')} 
                className={`px-4 py-2 rounded-lg mr-2 text-base font-medium flex items-center whitespace-nowrap ${activeTab === 'planificacion' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Calendar className="w-5 h-5 mr-2" /> 
                Planificación
              </button>
              <button 
                onClick={() => setActiveTab('roles')} 
                className={`px-4 py-2 rounded-lg mr-2 text-base font-medium flex items-center whitespace-nowrap ${activeTab === 'roles' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <User className="w-5 h-5 mr-2" /> 
                Roles
              </button>
              <button 
                onClick={() => setActiveTab('objetivos')} 
                className={`px-4 py-2 rounded-lg mr-2 text-base font-medium flex items-center whitespace-nowrap ${activeTab === 'objetivos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <AlignLeft className="w-5 h-5 mr-2" /> 
                Objetivos
              </button>
              <button 
                onClick={() => setActiveTab('actividades')} 
                className={`px-4 py-2 rounded-lg mr-2 text-base font-medium flex items-center whitespace-nowrap ${activeTab === 'actividades' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Clock className="w-5 h-5 mr-2" /> 
                Actividades
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Contenido principal */}
      <main className="flex-grow p-4 md:p-6 max-w-6xl mx-auto w-full">
        {/* Banner para usuarios invitados */}
        {renderGuestBanner()}
        
        {/* Vista de Roles */}
        {activeTab === 'roles' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Roles</h2>
            
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Añadir nuevo rol</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input 
                  type="text" 
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  placeholder="Nombre del rol (ej: Estudiante, Profesional...)" 
                  className="flex-grow p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button 
                  onClick={agregarRol}
                  className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-base font-medium transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Añadir Rol
                </button>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Roles definidos</h3>
              
              {getRolesSinObjetivos().length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-base text-yellow-700 font-medium">Roles sin objetivos</p>
                      <ul className="mt-1 list-disc list-inside">
                        {getRolesSinObjetivos().map(rol => (
                          <li key={rol.id} className="text-yellow-700">{rol.nombre}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {roles.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {roles.map(rol => (
                    <li key={rol.id} className="py-4 flex justify-between items-center">
                      {editRolId === rol.id ? (
                        <div className="flex-grow flex items-center">
                          <input
                            type="text"
                            value={editRolNombre}
                            onChange={(e) => setEditRolNombre(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mr-2"
                          />
                          <div className="flex">
                            <button 
                              onClick={guardarEdicionRol}
                              className="text-green-600 p-2 hover:bg-green-50 rounded-full transition-colors"
                              aria-label="Guardar cambios"
                            >
                              <CheckCircle className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={cancelarEdicionRol}
                              className="text-gray-500 p-2 hover:bg-gray-50 rounded-full transition-colors"
                              aria-label="Cancelar edición"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-lg font-medium text-gray-700">{rol.nombre}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => iniciarEdicionRol(rol)}
                              className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                              aria-label="Editar rol"
                            >
                              <Edit className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={() => eliminarRol(rol.id)}
                              className="text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                              aria-label="Eliminar rol"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg mb-1">No hay roles definidos</p>
                  <p className="text-gray-400">Añade tu primer rol para comenzar</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Vista de Objetivos */}
        {activeTab === 'objetivos' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Objetivos</h2>
            
            {roles.length === 0 && (
              <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-6 w-6 text-yellow-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-base text-yellow-700 font-medium">No hay roles definidos</p>
                    <p className="text-sm text-yellow-700 mt-1">Debes crear al menos un rol antes de definir objetivos.</p>
                    <button 
                      onClick={() => setActiveTab('roles')}
                      className="mt-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
                    >
                      Ir a gestión de roles
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Añadir nuevo objetivo</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="rol-select" className="block text-gray-700 mb-1 text-base">Rol asociado</label>
                  <select 
                    id="rol-select"
                    value={nuevoObjetivo.rolId || ''}
                    onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, rolId: parseInt(e.target.value) || null})}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    disabled={roles.length === 0}
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map(rol => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="objetivo-descripcion" className="block text-gray-700 mb-1 text-base">Descripción</label>
                  <input 
                    id="objetivo-descripcion"
                    type="text" 
                    value={nuevoObjetivo.descripcion}
                    onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, descripcion: e.target.value})}
                    placeholder="¿Qué quieres lograr? (sé específico)" 
                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="objetivo-prioridad" className="block text-gray-700 mb-1 text-base">Prioridad</label>
                  <select 
                    id="objetivo-prioridad"
                    value={nuevoObjetivo.prioridad}
                    onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, prioridad: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="1">Prioridad 1 - Alta (urgente e importante)</option>
                    <option value="2">Prioridad 2 - Media (importante pero no urgente)</option>
                    <option value="3">Prioridad 3 - Baja (puede esperar)</option>
                  </select>
                </div>
                <button 
                  onClick={agregarObjetivo}
                  disabled={roles.length === 0}
                  className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-base font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Añadir Objetivo
                </button>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Objetivos definidos</h3>
              
              {getObjetivosSinActividades().length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-6 w-6 text-yellow-500 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-base text-yellow-700 font-medium">Objetivos sin actividades</p>
                      <p className="text-sm text-yellow-700 mt-1">Los siguientes objetivos no tienen actividades programadas:</p>
                      <ul className="mt-1 list-disc list-inside">
                        {getObjetivosSinActividades().map(obj => (
                          <li key={obj.id} className="text-yellow-700">{obj.descripcion} <span className="text-yellow-600 text-sm">({getNombreRol(obj.rol_id)})</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {objetivos.length > 0 ? (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500">Rol</th>
                        <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500">Objetivo</th>
                        <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500">Prioridad</th>
                        <th scope="col" className="px-6 py-3 text-right text-base font-medium text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {objetivos.map(objetivo => (
                        <tr key={objetivo.id} className="hover:bg-gray-50">
                          {editObjetivoId === objetivo.id ? (
                            <td colSpan={4} className="px-6 py-4">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-gray-700 mb-1 text-sm">Rol asociado</label>
                                  <select 
                                    value={editObjetivo.rolId || ''}
                                    onChange={(e) => setEditObjetivo({...editObjetivo, rolId: parseInt(e.target.value) || null})}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                  >
                                    <option value="">Selecciona un rol</option>
                                    {roles.map(rol => (
                                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-gray-700 mb-1 text-sm">Descripción</label>
                                  <input 
                                    type="text" 
                                    value={editObjetivo.descripcion}
                                    onChange={(e) => setEditObjetivo({...editObjetivo, descripcion: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-700 mb-1 text-sm">Prioridad</label>
                                  <select 
                                    value={editObjetivo.prioridad}
                                    onChange={(e) => setEditObjetivo({...editObjetivo, prioridad: parseInt(e.target.value)})}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                  >
                                    <option value="1">Prioridad 1 - Alta</option>
                                    <option value="2">Prioridad 2 - Media</option>
                                    <option value="3">Prioridad 3 - Baja</option>
                                  </select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={cancelarEdicionObjetivo}
                                    className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-sm"
                                  >
                                    Cancelar
                                  </button>
                                  <button 
                                    onClick={guardarEdicionObjetivo}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">{getNombreRol(objetivo.rol_id)}</td>
                              <td className="px-6 py-4 text-base text-gray-700">{objetivo.descripcion}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-base font-medium rounded-full ${
                                  objetivo.prioridad === 1 ? 'bg-red-100 text-red-800' : 
                                  objetivo.prioridad === 2 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {objetivo.prioridad === 1 ? 'Alta' : objetivo.prioridad === 2 ? 'Media' : 'Baja'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => iniciarEdicionObjetivo(objetivo)}
                                  className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                  aria-label="Editar objetivo"
                                >
                                  <Edit className="w-6 h-6" />
                                </button>
                                <button 
                                  onClick={() => eliminarObjetivo(objetivo.id)}
                                  className="text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors ml-2"
                                  aria-label="Eliminar objetivo"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <AlignLeft className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg mb-1">No hay objetivos definidos</p>
                  <p className="text-gray-400">Añade objetivos para cada rol</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Vista de Actividades */}
        {activeTab === 'actividades' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Actividades</h2>
            
            {objetivos.length === 0 && (
              <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-6 w-6 text-yellow-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-base text-yellow-700 font-medium">No hay objetivos definidos</p>
                    <p className="text-sm text-yellow-700 mt-1">Debes crear al menos un objetivo antes de programar actividades.</p>
                    <button 
                      onClick={() => setActiveTab('objetivos')}
                      className="mt-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
                    >
                      Ir a gestión de objetivos
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Añadir nueva actividad</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="objetivo-select" className="block text-gray-700 mb-1 text-base">Objetivo asociado</label>
                  <select 
                    id="objetivo-select"
                    value={nuevaActividad.objetivoId || ''}
                    onChange={(e) => setNuevaActividad({...nuevaActividad, objetivoId: parseInt(e.target.value) || null})}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    disabled={objetivos.length === 0}
                  >
                    <option value="">Selecciona un objetivo</option>
                    {objetivos.map(objetivo => (
                      <option key={objetivo.id} value={objetivo.id}>
                        {objetivo.descripcion} - {getNombreRol(objetivo.rol_id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="actividad-descripcion" className="block text-gray-700 mb-1 text-base">Descripción</label>
                  <input 
                    id="actividad-descripcion"
                    type="text" 
                    value={nuevaActividad.descripcion}
                    onChange={(e) => setNuevaActividad({...nuevaActividad, descripcion: e.target.value})}
                    placeholder="¿Qué actividad realizarás?" 
                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="actividad-dia" className="block text-gray-700 mb-1 text-base">Día</label>
                    <select 
                      id="actividad-dia"
                      value={nuevaActividad.dia}
                      onChange={(e) => setNuevaActividad({...nuevaActividad, dia: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      {diasSemana.map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="actividad-hora" className="block text-gray-700 mb-1 text-base">Hora</label>
                    <select 
                      id="actividad-hora"
                      value={nuevaActividad.hora}
                      onChange={(e) => setNuevaActividad({...nuevaActividad, hora: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      {horas.map(hora => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={agregarActividad}
                  disabled={objetivos.length === 0}
                  className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-base font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Añadir Actividad
                </button>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Actividades programadas</h3>
              {actividades.length > 0 ? (
                <div className="rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-base font-medium text-gray-500">Día</th>
                        <th scope="col" className="px-4 py-3 text-left text-base font-medium text-gray-500">Hora</th>
                        <th scope="col" className="px-4 py-3 text-left text-base font-medium text-gray-500">Actividad</th>
                        <th scope="col" className="px-4 py-3 text-left text-base font-medium text-gray-500 hidden md:table-cell">Objetivo</th>
                        <th scope="col" className="px-4 py-3 text-center text-base font-medium text-gray-500">Estado</th>
                        <th scope="col" className="px-4 py-3 text-right text-base font-medium text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {actividades.map(actividad => (
                        <tr key={actividad.id} className="hover:bg-gray-50">
                          {editActividadId === actividad.id ? (
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-gray-700 mb-1 text-sm">Objetivo asociado</label>
                                  <select 
                                    value={editActividad.objetivoId || ''}
                                    onChange={(e) => setEditActividad({...editActividad, objetivoId: parseInt(e.target.value) || null})}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                  >
                                    <option value="">Selecciona un objetivo</option>
                                    {objetivos.map(objetivo => (
                                      <option key={objetivo.id} value={objetivo.id}>
                                        {objetivo.descripcion} - {getNombreRol(objetivo.rol_id)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-gray-700 mb-1 text-sm">Descripción</label>
                                  <input 
                                    type="text" 
                                    value={editActividad.descripcion}
                                    onChange={(e) => setEditActividad({...editActividad, descripcion: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-gray-700 mb-1 text-sm">Día</label>
                                    <select 
                                      value={editActividad.dia}
                                      onChange={(e) => setEditActividad({...editActividad, dia: e.target.value})}
                                      className="w-full p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    >
                                      {diasSemana.map(dia => (
                                        <option key={dia} value={dia}>{dia}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-gray-700 mb-1 text-sm">Hora</label>
                                    <select 
                                      value={editActividad.hora}
                                      onChange={(e) => setEditActividad({...editActividad, hora: e.target.value})}
                                      className="w-full p-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    >
                                      {horas.map(hora => (
                                        <option key={hora} value={hora}>{hora}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={cancelarEdicionActividad}
                                    className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-sm"
                                  >
                                    Cancelar
                                  </button>
                                  <button 
                                    onClick={guardarEdicionActividad}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{actividad.dia}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{actividad.hora}</td>
                              <td className="px-4 py-3 text-base text-gray-700">{actividad.descripcion}</td>
                              <td className="px-4 py-3 text-base text-gray-700 hidden md:table-cell">
                                {getDescripcionObjetivo(actividad.objetivo_id)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <span className={`px-3 py-1 inline-flex text-base font-medium rounded-full ${
                                  actividad.completada ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {actividad.completada ? 'Completada' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => iniciarEdicionActividad(actividad)}
                                  className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                  aria-label="Editar actividad"
                                >
                                  <Edit className="w-6 h-6" />
                                </button>
                                <button 
                                  onClick={() => toggleCompletada(actividad.id, actividad.completada)}
                                  className={`p-2 rounded-full transition-colors ${actividad.completada ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                  aria-label={actividad.completada ? "Marcar como pendiente" : "Marcar como completada"}
                                >
                                  <CheckCircle className="w-6 h-6" />
                                </button>
                                <button 
                                  onClick={() => eliminarActividad(actividad.id)}
                                  className="text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                  aria-label="Eliminar actividad"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg mb-1">No hay actividades programadas</p>
                  <p className="text-gray-400">Programa actividades para cada objetivo</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Vista de Planificación */}
        {activeTab === 'planificacion' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
              <h2 className="text-2xl font-bold text-gray-800">Planificación Semanal</h2>
              <button 
                onClick={descargarPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base flex items-center font-medium transition-colors"
              >
                <Download className="w-5 h-5 mr-2" /> Descargar PDF
              </button>
            </div>
            
            {actividades.length === 0 && (
              <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-6 w-6 text-yellow-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-base text-yellow-700 font-medium">No hay actividades programadas</p>
                    <p className="text-sm text-yellow-700 mt-1">Tu planificación está vacía. Programa algunas actividades para visualizar tu semana.</p>
                    <button 
                      onClick={() => setActiveTab('actividades')}
                      className="mt-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
                    >
                      Ir a gestión de actividades
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={planificacionRef} className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {diasSemana.map(dia => (
                <div key={dia} className="bg-white rounded-lg shadow-sm">
                  <div className="bg-blue-600 text-white p-3 rounded-t-lg text-center font-medium text-lg">
                    {dia}
                  </div>
                  <div className="p-3 min-h-[250px] md:min-h-[500px] max-h-[500px] overflow-y-auto">
                    {getActividadesPorDia(dia).length > 0 ? (
                      getActividadesPorDia(dia).map(actividad => (
                        <div 
                          key={actividad.id} 
                          className={`p-3 mb-3 rounded-lg ${
                            getPrioridadObjetivo(actividad.objetivo_id) === 1 ? 'bg-red-50 border-l-4 border-red-500' : 
                            getPrioridadObjetivo(actividad.objetivo_id) === 2 ? 'bg-yellow-50 border-l-4 border-yellow-500' : 
                            'bg-green-50 border-l-4 border-green-500'
                          } ${actividad.completada ? 'opacity-70' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-base">{actividad.hora}</span>
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => iniciarEdicionActividad(actividad)}
                                className="text-blue-600 p-1 hover:bg-blue-50 rounded-full transition-colors"
                                aria-label="Editar actividad"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => toggleCompletada(actividad.id, actividad.completada)}
                                className={`p-1 rounded-full transition-colors ${actividad.completada ? 'text-green-600' : 'text-gray-400'}`}
                                aria-label={actividad.completada ? "Marcar como pendiente" : "Marcar como completada"}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className={`text-base ${actividad.completada ? 'line-through' : ''}`}>
                            {actividad.descripcion}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {getNombreRol(getRolIdDeObjetivo(actividad.objetivo_id) || 0)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-5">
                        No hay actividades
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Pie de página */}
      <footer className="bg-gray-800 text-white p-6 mt-auto">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2 text-base">AhorraT © 2025 - Desarrollado por el departamento de IA liderado por Jorge Jiménez Calvano</p>
          <p className="text-sm text-gray-300">Aplicación de uso público para ayudar a las personas a gestionar su tiempo eficientemente</p>
          <div className="mt-4">
            <button 
              onClick={() => setShowAcercaDe(true)}
              className="text-blue-300 hover:text-blue-200 text-sm md:hidden"
            >
              Acerca de AhorraT
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;