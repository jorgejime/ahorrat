import React from 'react';
import { Clock, Calendar, List, Brain, CheckCircle, Target, ArrowRight, Award, BarChart, BadgeCheck } from 'lucide-react';

interface AcercaDeProps {
  onClose: () => void;
}

const AcercaDe: React.FC<AcercaDeProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img 
                src="https://usm.edu.co/assets/Publico/images/Logo.png" 
                alt="Logo AhorraT" 
                className="h-16 mr-4 bg-white p-1 rounded-lg" 
              />
              <h1 className="text-2xl md:text-3xl font-bold">AhorraT</h1>
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 text-base"
            >
              Volver a la aplicación
            </button>
          </div>
          <p className="text-xl font-medium">Sistema de Gestión Efectiva del Tiempo</p>
        </div>
        
        <div className="p-6 md:p-8">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">¿Qué es AhorraT?</h2>
            <p className="mb-4 text-base text-gray-700">
              AhorraT es una aplicación desarrollada por el departamento de IA liderado por Jorge Jiménez Calvano, 
              diseñada para ayudarte a gestionar tu tiempo de manera eficiente y productiva. 
              Basada en la metodología de los roles, objetivos y prioridades, 
              te permite organizar tus actividades semanales de forma estructurada.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded-md">
              <p className="text-base font-medium text-blue-800">
                Importante: AhorraT se enfoca exclusivamente en la planificación semanal
              </p>
              <p className="text-base text-gray-700 mt-2">
                Nuestra aplicación se centra únicamente en la organización del trabajo semanal, 
                permitiéndote visualizar y estructurar tus actividades en un período de 7 días. 
                Este enfoque semanal te ayuda a mantener una visión clara y manejable de tus 
                compromisos inmediatos, facilitando la toma de decisiones sobre el uso de tu tiempo.
              </p>
            </div>
            <p className="mb-4 text-base text-gray-700">
              Esta herramienta está diseñada para cualquier persona que desee mejorar su productividad, 
              desde estudiantes hasta profesionales, permitiéndoles definir claramente sus metas en diferentes 
              áreas de la vida y programar actividades específicas para lograrlas.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-base font-medium">Ahorra Tiempo</span>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-base font-medium">Enfócate en Metas</span>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <BarChart className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-base font-medium">Mejora Productividad</span>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <BadgeCheck className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-base font-medium">Logra Resultados</span>
              </div>
            </div>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">¿Cómo funciona?</h2>
            <p className="mb-6 text-base text-gray-700">
              AhorraT se basa en un enfoque estructurado de tres niveles para la gestión del tiempo:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border rounded-xl p-5 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <List className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">1. Roles</h3>
                </div>
                <p className="text-base text-gray-600">
                  Define los diferentes papeles que desempeñas en tu vida: estudiante, profesional, 
                  padre/madre, amigo, etc. Estos roles representan las áreas en las que quieres 
                  distribuir tu tiempo.
                </p>
              </div>
              
              <div className="border rounded-xl p-5 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">2. Objetivos</h3>
                </div>
                <p className="text-base text-gray-600">
                  Para cada rol, establece objetivos específicos que quieres lograr. Asigna 
                  prioridades a cada objetivo según su importancia (Alta, Media, Baja).
                </p>
              </div>
              
              <div className="border rounded-xl p-5 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">3. Actividades</h3>
                </div>
                <p className="text-base text-gray-600">
                  Programa actividades específicas para cada objetivo, asignándoles un día 
                  y hora determinados. Estas actividades formarán tu planificación semanal.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Proceso paso a paso:</h3>
              <ol className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 mt-0.5 text-base">1</div>
                  <div>
                    <p className="text-base text-gray-700"><strong>Define tus roles.</strong> Ejemplos: Estudiante, Profesional, Padre/Madre, etc.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 mt-0.5 text-base">2</div>
                  <div>
                    <p className="text-base text-gray-700"><strong>Establece objetivos para cada rol y asígnales prioridades.</strong> Por ejemplo, para el rol "Estudiante", un objetivo podría ser "Aprobar el examen de matemáticas" con prioridad alta.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 mt-0.5 text-base">3</div>
                  <div>
                    <p className="text-base text-gray-700"><strong>Programa actividades específicas</strong> para cada objetivo, asignándoles un día y hora en tu semana.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 mt-0.5 text-base">4</div>
                  <div>
                    <p className="text-base text-gray-700"><strong>Consulta tu planificación semanal</strong> para ver todas tus actividades organizadas por día.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 mt-0.5 text-base">5</div>
                  <div>
                    <p className="text-base text-gray-700"><strong>Marca las actividades como completadas</strong> a medida que las realizas.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Beneficios de la Planificación Semanal</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
              <p className="text-base font-medium text-yellow-800 mb-2">
                ¿Por qué nos enfocamos solo en la planificación semanal?
              </p>
              <p className="text-base text-gray-700">
                El ciclo semanal es el período óptimo para organizar actividades: es lo suficientemente 
                corto para planificar con precisión y lo suficientemente largo para lograr objetivos significativos. 
                Nuestra experiencia muestra que las personas mantienen mejor control de sus compromisos 
                cuando se enfocan en un horizonte de 7 días.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Mayor Productividad</h3>
                  <p className="text-base text-gray-600">
                    Al planificar tus actividades según roles y prioridades, lograrás dedicar más tiempo a lo verdaderamente importante, aumentando tu eficiencia.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Equilibrio en tu Vida</h3>
                  <p className="text-base text-gray-600">
                    El enfoque basado en roles te permite asegurar que estás dedicando tiempo a todas las áreas importantes de tu vida, no solo al trabajo o estudios.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Reducción del Estrés</h3>
                  <p className="text-base text-gray-600">
                    Tener claridad sobre qué hacer y cuándo hacerlo reduce la ansiedad y el estrés asociados con la sensación de estar abrumado.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Cumplimiento de Metas</h3>
                  <p className="text-base text-gray-600">
                    Al desglosar tus objetivos en actividades concretas semanales, aumentas significativamente la probabilidad de alcanzarlos.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-gray-50 border rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-lg">Resultados que puedes esperar:</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-base text-gray-700">Mejor organización y claridad en tus prioridades diarias</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-base text-gray-700">Incremento en la cantidad de tareas completadas</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-base text-gray-700">Mayor enfoque en actividades alineadas con tus objetivos importantes</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-base text-gray-700">Sensación de mayor control sobre tu tiempo</span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-base text-gray-700">Avance constante hacia tus metas en diferentes áreas de la vida</span>
                </li>
              </ul>
            </div>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Funciones Principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 hover:bg-blue-50 transition-colors">
                <h3 className="font-semibold text-blue-700 mb-2 text-lg">Gestión de Roles</h3>
                <p className="text-base text-gray-600">
                  Crea, edita y organiza los diferentes roles que desempeñas en tu vida, 
                  estableciendo una base para tu sistema de gestión del tiempo.
                </p>
              </div>
              
              <div className="border rounded-xl p-4 hover:bg-blue-50 transition-colors">
                <h3 className="font-semibold text-blue-700 mb-2 text-lg">Definición de Objetivos</h3>
                <p className="text-base text-gray-600">
                  Establece objetivos claros para cada rol con niveles de prioridad 
                  que te ayudarán a enfocar tus esfuerzos donde realmente importa.
                </p>
              </div>
              
              <div className="border rounded-xl p-4 hover:bg-blue-50 transition-colors">
                <h3 className="font-semibold text-blue-700 mb-2 text-lg">Planificación de Actividades</h3>
                <p className="text-base text-gray-600">
                  Programa actividades específicas en días y horas determinadas, 
                  asociándolas a tus objetivos para mantener un enfoque coherente.
                </p>
              </div>
              
              <div className="border rounded-xl p-4 hover:bg-blue-50 transition-colors">
                <h3 className="font-semibold text-blue-700 mb-2 text-lg">Vista Semanal</h3>
                <p className="text-base text-gray-600">
                  Visualiza toda tu semana organizada por días, con actividades 
                  codificadas por colores según su prioridad para una rápida comprensión.
                </p>
              </div>
              
              <div className="border rounded-xl p-4 hover:bg-blue-50 transition-colors">
                <h3 className="font-semibold text-blue-700 mb-2 text-lg">Seguimiento de Progreso</h3>
                <p className="text-base text-gray-600">
                  Marca actividades como completadas y mantén un registro de tu 
                  avance hacia tus diferentes objetivos.
                </p>
              </div>
              
              <div className="border rounded-xl p-4 hover:bg-blue-50 transition-colors">
                <h3 className="font-semibold text-blue-700 mb-2 text-lg">Exportación a PDF</h3>
                <p className="text-base text-gray-600">
                  Descarga tu planificación semanal en formato PDF para consultarla 
                  sin conexión o compartirla con otras personas.
                </p>
              </div>
            </div>
          </section>
          
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-base">
              AhorraT © 2025 - Aplicación creada por el departamento de IA liderado por Jorge Jiménez Calvano
            </p>
            <p className="text-gray-500 text-base mt-1">
              Aplicación de uso público con el fin de ayudar a las personas a gestionar su tiempo eficientemente
            </p>
            <button 
              onClick={onClose}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Volver a la aplicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcercaDe;