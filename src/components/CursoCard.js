import { PlayCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CursoCard({ id, titulo, descripcionCorta, imagenSrc, completado}) {
  return (
    /* Reducimos el p-5 a p-4 en móvil y los bordes para que se vea más compacta */
    <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-500 h-full group w-full max-w-sm lg:max-w-none">
      
      <div className="mb-3 md:mb-4">
        {/* Imagen más pequeña en móvil (h-32) y normal en PC (md:h-44) */}

        <div className="w-full h-32 md:h-44 mb-3 md:mb-5 overflow-hidden rounded-[1.5rem] md:rounded-[1.8rem] border border-slate-50 relative">
          <img 
            src={imagenSrc || '/fallback-image.jpg'} 
            alt={titulo} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
          />
        </div>

        <div className="px-1 text-left">
            {/* Texto un poco más pequeño en móvil */}
            <h3 className="font-extrabold text-slate-900 text-base md:text-xl leading-tight group-hover:text-blue-600 transition-colors mb-1 md:mb-2">
              {titulo}
            </h3>
            <p className="text-xs md:text-sm text-slate-400 line-clamp-2 font-medium leading-relaxed">
              {descripcionCorta}
            </p>
          </div>
        
        {completado && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
              <CheckCircle2 size={10} /> Completado
            </div>
          )}
          
      </div>
      
      <Link 
        href={`/cursos/${id}`} 
        /* Reducimos el py en móvil para que el botón no sea tan alto */
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
  );
}