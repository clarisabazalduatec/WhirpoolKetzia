"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, ChevronRight, Loader2, Settings, ShieldCheck, Trash2, Users, CheckCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCursos: 0,
    totalAlumnos: 0,
    tasaCompletado: 0,
    promedioQuiz: 0
  });
  const router = useRouter();

  const cargarDatos = async () => {
    try {
      // 1. Cargar Cursos
      const resCursos = await fetch('/api/admin/dashboard');
      const dataCursos = await resCursos.json();
      setCursos(Array.isArray(dataCursos) ? dataCursos : []);

      // 2. Cargar Métricas (Asumiendo que crearás esta API)
      const resStats = await fetch('/api/admin/stats');
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rol = localStorage.getItem('rol_id');
    if (rol !== '1') {
      router.push('/');
      return;
    }
    cargarDatos();
  }, [router]);

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
    <div className="max-w-7xl mx-auto p-6 lg:p-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-blue-600" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Gestión de Capacitación Whirlpool</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
        </div>
        
        <Link 
          href="/admin/nuevo-curso" 
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus size={20} /> Crear Nuevo Curso
        </Link>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<BookOpen className="text-blue-600" />} 
          label="Cursos en Catálogo" 
          value={cursos.length} 
          color="bg-blue-50" 
        />
        <StatCard 
          icon={<Users className="text-purple-600" />} 
          label="Alumnos Registrados" 
          value={stats.totalAlumnos} 
          color="bg-purple-50" 
        />
        <StatCard 
          icon={<CheckCircle className="text-green-600" />} 
          label="Tasa de Finalización" 
          value={`${stats.tasaCompletado}%`} 
          color="bg-green-50" 
          progress={stats.tasaCompletado}
        />
        <StatCard 
          icon={<BarChart3 className="text-orange-600" />} 
          label="Promedio Exámenes" 
          value={`${stats.promedioQuiz} pts`} 
          color="bg-orange-50" 
        />
      </div>

      {/* Tabla de Cursos */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800">Catálogo Global</h2>
          <Settings className="text-slate-300" size={20} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Curso</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Creador</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cursos.map((curso) => (
                <tr key={curso.curso_id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        <img src={curso.imagenSrc || '/fallback.jpg'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none mb-1">{curso.titulo}</p>
                        <p className="text-[10px] text-slate-400 font-medium">ID: #{curso.curso_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-600">{curso.nombre_creador || 'Sistema'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => eliminarCurso(curso.curso_id, curso.titulo)} className="p-2 text-slate-300 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                      <Link href={`/admin/gestionar/${curso.curso_id}`} className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        Gestionar <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Subcomponente para las Tarjetas de Métricas
function StatCard({ icon, label, value, color, progress }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-6 mb-4">
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900">{value}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{label}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}