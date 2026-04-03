"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, ChevronRight, Loader2, ShieldCheck, Trash2, Users, CheckCircle, BarChart3, TrendingUp, UserCircle, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [cursos, setCursos] = useState([]);
  const [materiales, setMateriales] = useState([]); // Nuevo estado para materiales
  const [alumnos, setAlumnos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState('global');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState({
    totalCursos: 0,
    totalAlumnos: 0,
    tasaCompletado: 0,
    promedioQuiz: 0
  });
  
  const router = useRouter();
  const alumnoActual = alumnos.find(a => String(a.value) === String(selectedAlumno));
  const nombreAlumno = alumnoActual ? alumnoActual.label : "Seleccionado";

  const cargarDatos = async (alumnoId = 'global', isInitial = false) => {
    if (!isInitial) setIsUpdating(true);

    try {
      // 1. Cargar Cursos y Materiales (Solo en carga inicial)
      if (isInitial) {
        const [resCursos, resMateriales, resAlumnos] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/archivos'), // Asumiendo que esta es tu ruta de biblioteca
          fetch('/api/admin/usuarios')
        ]);

        const dataCursos = await resCursos.json();
        const dataMateriales = await resMateriales.json();
        const dataAlumnos = await resAlumnos.json();

        setCursos(Array.isArray(dataCursos) ? dataCursos : []);
        setMateriales(Array.isArray(dataMateriales) ? dataMateriales : []);
        setAlumnos(dataAlumnos);
      }

      // 2. Cargar Estadísticas (Siempre se actualizan)
      const urlStats = alumnoId === 'global' 
        ? '/api/admin/stats' 
        : `/api/admin/stats?usuario_id=${alumnoId}`;
      
      const resStats = await fetch(urlStats);
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }

    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      if (isInitial) setLoading(false);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const rol = localStorage.getItem('rol_id');
    if (rol !== '1') {
      router.push('/');
      return;
    }
    cargarDatos('global', true);
  }, [router]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedAlumno(value);
    cargarDatos(value, false); 
  };

  const eliminarCurso = async (id, titulo) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar "${titulo}"?`);
    if (!confirmar) return;
    try {
      const res = await fetch(`/api/admin/cursos/${id}`, { method: 'DELETE' });
      if (res.ok) setCursos(cursos.filter(c => c.curso_id !== id));
    } catch (err) {
      alert("Error de conexión");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10 font-sans">
      
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-blue-600" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Gestión de Capacitación Whirlpool</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: CONTENIDOS */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* SECCIÓN 1: CURSOS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 p-2">
                Catálogo Global
                <span className="text-xs font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full">{cursos.length}</span>
              </h2>
              <Link 
                href="/admin/nuevo-curso" 
                className="bg-blue-600 text-white px-6 py-3 rounded-[2.5rem] font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 text-sm"
              >
                <Plus size={18} /> Crear Curso
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creador</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cursos.map((curso) => (
                    <tr key={curso.curso_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img src={curso.imagenSrc || '/fallback.jpg'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 leading-none mb-1 truncate">{curso.titulo}</p>
                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">REGISTRADO: #{curso.curso_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600">{curso.nombre_creador || 'Sistema'}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => eliminarCurso(curso.curso_id, curso.titulo)} className="p-2.5 text-slate-300 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50">
                            <Trash2 size={18} />
                          </button>
                          <Link href={`/admin/gestionar/${curso.curso_id}`} className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            Gestionar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: BIBLIOTECA DE MATERIALES (APARTADO NUEVO) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 p-2">
                Biblioteca de Materiales
                <span className="text-xs font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full">{materiales.length}</span>
              </h2>
              <Link 
                href="/admin/nuevo-material" 
                className="bg-slate-900 text-white px-6 py-3 rounded-[2.5rem] font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-95 text-sm"
              >
                <Plus size={18} /> Nuevo Material
              </Link>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {materiales.length > 0 ? materiales.map((m) => (
                <div key={m.archivo_id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-white transition-all group">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 text-sm truncate">{m.nombre_archivo}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{m.tipo_archivo || 'Documento'}</p>
                    </div>
                  </div>
                  <a href={m.url_archivo} target="_blank" className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                    <ExternalLink size={18} />
                  </a>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center text-slate-400 font-medium italic">
                  No hay materiales disponibles en la biblioteca.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: STATS */}
        <aside className="xl:col-span-4 space-y-6 sticky top-10">
          <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-300 ${isUpdating ? 'opacity-50 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
            
            <div className="mb-8">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">
                <UserCircle size={14} className="text-blue-500" /> Seleccionar Alumno
              </label>
              <select 
                value={selectedAlumno}
                onChange={handleFilterChange}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 appearance-none cursor-pointer transition-all"
              >
                <option value="global">Vista Global (Todos)</option>
                {alumnos.map(alumno => (
                  <option key={alumno.value} value={alumno.value}>
                    {alumno.label}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              {selectedAlumno === 'global' ? 'Rendimiento Global' : 'Rendimiento Individual'}
              <TrendingUp size={20} className="text-blue-600" />
              {isUpdating && <Loader2 size={16} className="animate-spin text-blue-600 ml-auto" />}
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <StatCard 
                icon={<BookOpen className="text-blue-600" size={20} />} 
                label={selectedAlumno === 'global' ? "Cursos Totales" : "Cursos Inscritos"} 
                value={selectedAlumno === 'global' ? cursos.length : stats.totalCursos} 
                color="bg-blue-50" 
              />
              <StatCard 
                icon={<Users className="text-purple-600" size={20} />} 
                label="Alumnos" 
                value={stats.totalAlumnos} 
                color="bg-purple-50" 
              />
              <StatCard 
                icon={<CheckCircle className="text-green-600" size={20} />} 
                label="Finalización" 
                value={`${stats.tasaCompletado}%`} 
                color="bg-green-50" 
                progress={stats.tasaCompletado}
              />
              <StatCard 
                icon={<BarChart3 className="text-orange-600" size={20} />} 
                label="Promedio Quiz" 
                value={`${stats.promedioQuiz} pts`} 
                color="bg-orange-50" 
              />
            </div>
            
            <div className="mt-8 p-5 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-100">
              <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Nota de Instructor</p>
              <p className="text-xs font-bold italic">
                {selectedAlumno !== 'global' 
                  ? `Visualizando métricas específicas del empleado: ${nombreAlumno}.` 
                  : "Visualizando métricas de todos los alumnos inscritos a algún curso."
                }
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, progress }) {
  return (
    <div className="p-5 rounded-3xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
        {progress !== undefined && <span className="text-[10px] font-black text-green-600">{progress}%</span>}
      </div>
      {progress !== undefined && (
        <div className="w-full bg-slate-200 h-1 mt-3 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}