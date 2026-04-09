"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, BookOpen, ChevronRight, Loader2, ShieldCheck, 
  Trash2, Users, CheckCircle, BarChart3, TrendingUp, 
  UserCircle, FileText, ExternalLink, HelpCircle 
} from 'lucide-react';
import Link from 'next/link';

// Importación de tus componentes reutilizables
import { Button } from '@/components/Button';
import { SectionCard } from '@/components/SectionCard';
import { ResourceItem } from '@/components/ResourceItem';
import { PageHeader, Title, Text } from '@/components/Typography';

export default function AdminDashboard() {
  const [cursos, setCursos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState('global');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rolId, setRolId] = useState(null);
  const [stats, setStats] = useState({
    totalCursos: 0, totalAlumnos: 0, tasaCompletado: 0, promedioQuiz: 0
  });
  
  const router = useRouter();
  const alumnoActual = alumnos.find(a => String(a.value) === String(selectedAlumno));
  const nombreAlumno = alumnoActual ? alumnoActual.label : "Seleccionado";

  const cargarDatos = async (alumnoId = 'global', isInitial = false) => {
    if (!isInitial) setIsUpdating(true);
    try {
      if (isInitial) {
        const [resCursos, resMateriales, resAlumnos, resExamenes] = await Promise.all([
            fetch('/api/admin/dashboard'), fetch('/api/admin/archivos'),
            fetch('/api/admin/usuarios'), fetch('/api/admin/quizzes')
        ]);
        setCursos(await resCursos.json());
        setMateriales(await resMateriales.json());
        setAlumnos(await resAlumnos.json());
        setExamenes(await resExamenes.json());
      }
      const resStats = await fetch(alumnoId === 'global' ? '/api/admin/stats' : `/api/admin/stats?usuario_id=${alumnoId}`);
      if (resStats.ok) setStats(await resStats.json());
    } catch (err) { console.error(err); } 
    finally {
      if (isInitial) setLoading(false);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const rol = localStorage.getItem('rol_id');
    if (rol !== '1' && rol !== '30001') return router.push('/');
    setRolId(Number(rol));
    cargarDatos('global', true);
  }, [router]);

  // --- FUNCIONES DE ELIMINACIÓN ---
  
  const eliminarCurso = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar curso "${titulo}"? Esta acción borrará inscripciones relacionadas.`)) return;
    const res = await fetch(`/api/admin/cursos/${id}`, { method: 'DELETE' });
    if (res.ok) setCursos(cursos.filter(c => c.curso_id !== id));
  };

  const eliminarMaterial = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar material "${titulo}"? Se quitará de todos los cursos.`)) return;
    const res = await fetch(`/api/admin/archivos?id=${id}`, { method: 'DELETE' });
    if (res.ok) setMateriales(materiales.filter(m => m.archivo_id !== id));
  };

  const eliminarExamen = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar examen "${titulo}"? Se perderán las calificaciones de este quiz.`)) return;
    const res = await fetch(`/api/admin/quizzes?id=${id}`, { method: 'DELETE' });
    if (res.ok) setExamenes(examenes.filter(ex => ex.quiz_id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10 font-sans">
      <PageHeader title="Panel de Control" subtitle="Gestión de Capacitación Whirlpool" icon={ShieldCheck} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-8 space-y-10">
          
          {/* CURSOS */}
          <SectionCard 
            title="Catálogo Global" 
            count={cursos.length} 
            action={<Button href="/admin/nuevo-curso" icon={Plus}>Crear Curso</Button>}
          >
            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-center"><Text variant="muted">Curso</Text></th>
                    <th className="px-6 py-4 text-center"><Text variant="muted">Descripción</Text></th>
                    <th className="px-6 py-4 text-center"><Text variant="muted">Creador</Text></th>
                    <th className="px-6 py-4 text-center"><Text variant="muted">Acciones</Text></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cursos.map((curso) => (
                    <tr key={curso.curso_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img src={curso.imagenSrc || '/fallback.jpg'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="min-w-0">
                            <Text className="truncate">{curso.titulo}</Text>
                            <Text variant="muted">ID: #{curso.curso_id}</Text>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><Text variant="description">{curso.descripcion}</Text></td>
                      <td className="px-6 py-5"><Text>{curso.nombre_creador || 'Sistema'}</Text></td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rolId === 1 && (
                            <Button variant="danger" className="px-3 py-2.5 rounded-xl shadow-none" onClick={() => eliminarCurso(curso.curso_id, curso.titulo)} icon={Trash2} />
                          )}
                          <Button href={`/admin/gestionar/${curso.curso_id}`} variant="ghost">Gestionar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* MATERIALES */}
          <SectionCard 
            title="Biblioteca de Materiales" 
            count={materiales.length} 
            action={rolId === 1 ? <Button href="/admin/nuevo-material" variant="dark" icon={Plus}>Nuevo Material</Button> : null}
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {materiales.length > 0 ? materiales.map((m) => (
                <ResourceItem 
                  key={m.archivo_id}
                  title={m.nombre_archivo}
                  subtitle={m.tipo_archivo || 'Documento'}
                  icon={FileText}
                  action={
                    <div className="flex items-center gap-1">
                      {rolId === 1 && (
                        <button onClick={() => eliminarMaterial(m.archivo_id, m.nombre_archivo)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                      <a href={m.url_archivo} target="_blank" className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  }
                />
              )) : <div className="col-span-full py-10 text-center"><Text variant="muted">No hay materiales</Text></div>}
            </div>
          </SectionCard>

          {/* EXÁMENES */}
          <SectionCard title="Exámenes Disponibles" count={examenes.length} action={rolId === 1 ? <Button href="/admin/nuevo-examen" className="bg-purple-600 hover:bg-purple-700 shadow-purple-100" icon={Plus}>Crear Examen</Button> : null}>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {examenes.map((ex) => (
                <ResourceItem 
                  key={ex.quiz_id} 
                  variant="purple" 
                  title={ex.titulo} 
                  subtitle={`${ex.total_preguntas || 0} Preguntas`} 
                  icon={HelpCircle}
                  action={
                    <div className="flex items-center gap-1">
                      {rolId === 1 && (
                        <button onClick={() => eliminarExamen(ex.quiz_id, ex.titulo)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                      <Link href={`/admin/editar-examen/${ex.quiz_id}`} className="p-2 text-slate-300 hover:text-purple-600 transition-colors">
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  }
                />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* STATS ASIDE */}
        <aside className="xl:col-span-4 space-y-6 sticky top-10">
          <SectionCard title="Estadísticas">
            <div className={`p-6 space-y-8 ${isUpdating ? 'opacity-50 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                  <UserCircle size={14} className="text-blue-500" /> Seleccionar Alumno
                </label>
                <select value={selectedAlumno} onChange={(e) => { setSelectedAlumno(e.target.value); cargarDatos(e.target.value, false); }}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 cursor-pointer transition-all appearance-none"
                >
                  <option value="global">Vista Global (Todos)</option>
                  {alumnos.map(alumno => <option key={alumno.value} value={alumno.value}>{alumno.label}</option>)}
                </select>
              </div>

              <Title className="justify-between">
                {selectedAlumno === 'global' ? 'Rendimiento Global' : 'Rendimiento Individual'}
                <TrendingUp size={20} className="text-blue-600" />
              </Title>
              
              <div className="grid grid-cols-1 gap-4">
                <StatCard icon={<BookOpen size={20} className="text-blue-600"/>} label={selectedAlumno === 'global' ? "Cursos Totales" : "Cursos Inscritos"} value={selectedAlumno === 'global' ? cursos.length : stats.totalCursos} color="bg-blue-50" />
                <StatCard icon={<Users size={20} className="text-purple-600"/>} label="Alumnos" value={stats.totalAlumnos} color="bg-purple-50" />
                <StatCard icon={<CheckCircle size={20} className="text-green-600"/>} label="Finalización" value={`${stats.tasaCompletado}%`} color="bg-green-50" progress={stats.tasaCompletado} />
                <StatCard icon={<BarChart3 size={20} className="text-orange-600"/>} label="Promedio Quiz" value={`${stats.promedioQuiz} pts`} color="bg-orange-50" />
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}

// Sub-componente interno para las stats
function StatCard({ icon, label, value, color, progress }) {
  return (
    <div className="p-5 rounded-3xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>{icon}</div>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className="flex items-center justify-between">
        <Text variant="muted">{label}</Text>
        {progress !== undefined && <span className="text-[10px] font-black text-green-600">{progress}%</span>}
      </div>
      {progress !== undefined && (
        <div className="w-full bg-slate-200 h-1 mt-3 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}