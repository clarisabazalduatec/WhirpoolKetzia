import { PlayCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CursoCard({ id, titulo, descripcionCorta, imagenSrc, completado}) {
  return (
    /* Eliminamos el padding (p-4 md:p-6) del contenedor principal */
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-500 h-full group w-full max-w-sm lg:max-w-none overflow-hidden">
      
      {/* Imagen: Ahora h-48 en móvil y h-56 en desktop para más impacto. Sin márgenes (mb-0) */}
      <div className="w-full h-48 md:h-56 overflow-hidden relative border-b border-slate-50">
        <img 
          src={imagenSrc || '/fallback-image.jpg'} 
          alt={titulo} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
        />
      </div>

      {/* Contenido: Aquí aplicamos el padding que quitamos del padre */}
      <div className="p-5 md:p-7 flex flex-col flex-grow">
        
        <div className="mb-4 md:mb-6">
          <div className="px-1 text-left">
            <h3 className="font-extrabold text-slate-900 text-base md:text-xl leading-tight group-hover:text-blue-600 transition-colors mb-1 md:mb-2">
              {titulo}
            </h3>
            <p className="text-xs md:text-sm text-slate-400 line-clamp-2 font-medium leading-relaxed">
              {descripcionCorta}
            </p>
          </div>
        </div>
        
        <Link 
          href={`/cursos/${id}`} 
          className={`mt-auto flex items-center justify-center gap-2 w-full py-3 md:py-4 rounded-[1rem] md:rounded-[1.2rem] font-black transition-all border-2 active:scale-95 text-sm md:text-base
            ${completado 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
            }`}
        >
          {completado ? (
            <>
              <CheckCircle2 size={18} />
              <span>Repasar</span>
            </>
          ) : (
            <>
              <PlayCircle size={18} />
              <span>Continuar</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}