"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar, BookOpen, CheckCircle, ArrowLeft, Gem } from 'lucide-react';

export default function PerfilPublicoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const miId = typeof window !== 'undefined' ? localStorage.getItem('usuario_id') : null;
  const [gemas, setGemas] = useState([]);

  useEffect(() => {
    // Si es mi propio perfil, redirigir al perfil normal
    if (miId && id === miId) {
      router.push('/perfil');
      return;
    }
    fetch(`/api/perfil?id=${id}`)
      .then(res => res.json())
      .then(data => { setDatos(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(`/api/gemas?usuario_id=${id}`)
    .then(res => res.json())
    .then(data => setGemas(data));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!datos?.usuario) return (
    <div className="p-20 text-center text-slate-400 font-bold">Usuario no encontrado</div>
  );

  const { usuario, stats, cursos } = datos;
  const cursosActivos = cursos?.filter(c => !c.completado) || [];
  const cursosCompletados = cursos?.filter(c => c.completado) || [];

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 pb-32">

      {/* Botón regresar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Regresar
      </button>

      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-28 h-28 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 overflow-hidden border-4 border-white shrink-0">
          {usuario.pfp ? (
            <img src={usuario.pfp} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <User size={50} />
          )}
        </div>

        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {usuario.alias || usuario.nombre}
          </h1>
          {usuario.alias && (
            <p className="text-slate-400 text-sm font-medium mt-1">{usuario.nombre}</p>
          )}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
              {usuario.nombre_rol}
            </span>
            <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
              <Calendar size={14} /> Miembro desde {new Date(usuario.fecha_creacion).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl"><BookOpen size={24} /></div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.total_inscritos}</p>
            <p className="text-slate-400 text-xs font-black uppercase">Cursos Asignados</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl"><CheckCircle size={24} /></div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats.total_completados}</p>
            <p className="text-slate-400 text-xs font-black uppercase">Completados</p>
          </div>
        </div>
      </div>

      {/* Cursos en progreso */}
      {cursosActivos.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" /> En progreso
            <span className="bg-blue-100 text-blue-600 text-xs font-black px-2 py-0.5 rounded-full">{cursosActivos.length}</span>
          </h2>
          <div className="space-y-3">
            {cursosActivos.map(curso => (
              <div key={curso.curso_id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  <img src={curso.imagenSrc || '/fallback.jpg'} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm">{curso.titulo}</p>
                  <p className="text-slate-400 text-xs font-medium">{curso.descripcionCorta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cursos completados */}
      {cursosCompletados.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" /> Completados
            <span className="bg-emerald-100 text-emerald-600 text-xs font-black px-2 py-0.5 rounded-full">{cursosCompletados.length}</span>
          </h2>
          <div className="space-y-3">
            {cursosCompletados.map(curso => (
              <div key={curso.curso_id} className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  <img src={curso.imagenSrc || '/fallback.jpg'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-sm">{curso.titulo}</p>
                  <p className="text-slate-400 text-xs font-medium">{curso.descripcionCorta}</p>
                </div>
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {cursos?.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200">
          <BookOpen size={32} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-bold">Este usuario no tiene cursos asignados</p>
        </div>
      )}
      {/* DIVISOR */}
{gemas.length > 0 && (
  <>
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-slate-200"></div>
      <div className="flex items-center gap-2 text-slate-400">
        <Gem size={16} />
        <span className="text-xs font-black uppercase tracking-widest">Gemas</span>
      </div>
      <div className="flex-1 h-px bg-slate-200"></div>
    </div>

    <div>
      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-2">
        <Gem size={26} className="text-blue-600" /> Gemas
        <span className="bg-blue-100 text-blue-600 text-xs font-black px-2 py-0.5 rounded-full">{gemas.length}</span>
      </h2>
      <p className="text-slate-400 text-sm font-medium mb-8">Habilidades y logros desarrollados</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gemas.map((gema, index) => {
          const colores = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-emerald-500 to-emerald-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-cyan-500 to-cyan-600',
          ];
          const color = colores[index % colores.length];
          return (
            <div key={gema.gema_id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className={`bg-gradient-to-br ${color} p-6`}>
                <Gem size={32} className="text-white opacity-90" />
              </div>
              <div className="p-5">
                <h3 className="font-black text-slate-900 text-sm mb-2">{gema.titulo}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{gema.descripcion}</p>
                <p className="text-slate-300 text-[10px] font-bold mt-4">
                  {new Date(gema.fecha_creacion).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
)}
    </div>
  );
}
