"use client";

import { useEffect, useState } from 'react';
import { FileText, ArrowLeft, Play, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function CursoDetalle(props) {
  const params = use(props.params);
  const id = params.id;

  const [datos, setDatos] = useState({ curso: null, archivos: [], esCompletado: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      // 1. OBTENEMOS EL ID DEL LOCALSTORAGE
      const usuarioId = localStorage.getItem('usuario_id');
      
      if (!usuarioId) {
        window.location.href = '/login';
        return;
      }

      try {
        // 2. PEDIMOS LOS DATOS A UNA API (Necesitarás crear esta ruta)
        const res = await fetch(`/api/cursos/detalle?curso_id=${id}&usuario_id=${usuarioId}`);
        const data = await res.json();
        setDatos(data);
      } catch (error) {
        console.error("Error cargando curso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Cargando progreso personal...</div>;
  if (!datos.curso) return <div className="p-20 text-center">Curso no encontrado</div>;

  const { curso, archivos, esCompletado } = datos;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Banner de "Volver" */}
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors">
          <ArrowLeft size={20} /> Volver al Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <img src={curso.imagenSrc} className="w-full md:w-64 h-48 object-cover rounded-2xl" alt={curso.titulo} />
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-900 mb-2">{curso.titulo}</h1>
              <p className="text-slate-600 mb-6">{curso.descripcion}</p>
              <button className={`px-6 py-3 rounded-xl font-bold ${esCompletado ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                {esCompletado ? 'Curso Terminado ✓' : 'Continuar Aprendiendo'}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de archivos con Checks Personales */}
        <div className="grid gap-3">
          {archivos.map((archivo) => (
            <Link 
              key={archivo.archivo_id}
              href={`/cursos/${id}/visor/${archivo.archivo_id}`}
              className={`bg-white p-4 rounded-2xl border flex items-center justify-between group ${archivo.fue_visto ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className={archivo.fue_visto ? 'text-emerald-500' : 'text-slate-300'}>
                  {archivo.fue_visto ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <p className={`font-bold ${archivo.fue_visto ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                  {archivo.nombre_archivo}
                </p>
              </div>
              <Play size={18} className={archivo.fue_visto ? 'text-emerald-300' : 'text-slate-200'} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}