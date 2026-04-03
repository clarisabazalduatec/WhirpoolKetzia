"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CursoCard from '@/components/CursoCard';

export default function Page() {
  const [cursos, setCursos] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) {
      router.push('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const resUser = await fetch(`/api/usuario?id=${usuarioId}`);
        if (resUser.ok) {
          const userData = await resUser.json();
          setNombreUsuario(userData.nombre.split(' ')[0]);
        }

        const resCursos = await fetch(`/api/cursos?usuario_id=${usuarioId}`);
        if (resCursos.ok) {
          const cursosData = await resCursos.json();
          setCursos(cursosData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [router]);

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Obteniendo lista de cursos...</p>
      </div>
    );
  }

  return (
    /* AÑADIDO: pb-32 en móvil y lg:pb-10 en PC para evitar que el menú tape el contenido */
    <div className="flex-1 flex flex-col items-start justify-start p-6 md:p-8 pb-32 lg:pb-10 w-full max-w-[1600px]">
      <header className="mb-6 md:mb-10 text-left w-full">        

        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight whitespace-nowrap">
          Tablero
        </h1>

        <p className="text-slate-500 mt-1 md:mt-2 text-xl md:text-xl font-medium">
          {obtenerSaludo()} {nombreUsuario || 'empleado'}, echa un vistazo a tus cursos.
        </p>
      </header>

      {cursos.length === 0 ? (
        /* ... (código de cursos vacíos) ... */
        <div className="w-full text-center p-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400 font-bold">
            No hay cursos disponibles
        </div>
      ) : (
        /* Grid responsivo */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 w-full justify-items-start">
          {cursos.map((curso) => (
            <CursoCard 
              key={curso.curso_id} 
              id={curso.curso_id} 
              completado={curso.porcentaje === 100} // Usamos el porcentaje calculado en la API
              {...curso} 
            />
          ))}
        </div>
      )}
    </div>
  );
}