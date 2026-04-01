import { PlayCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CursoCard({ id, titulo, descripcionCurso, imagenSrc, completado }) {
  return (
    /* Quitamos mx-auto para que se alinee a la izquierda en móvil */
    <div className="bg-white p-5 md:p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 h-full group w-full max-w-sm lg:max-w-none">
      
      <div className="mb-4">
        <div className="w-full h-44 mb-5 overflow-hidden rounded-[1.8rem] border border-slate-50 relative">
          <img 
            src={imagenSrc || '/fallback-image.jpg'} 
            alt={titulo} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
          />
          {completado && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
              <CheckCircle2 size={12} /> Completado
            </div>
          )}
        </div>

        <div className="px-1 text-left"> {/* Aseguramos texto a la izquierda */}
          <h3 className="font-extrabold text-slate-900 text-lg md:text-xl leading-tight group-hover:text-blue-600 transition-colors mb-2">
            {titulo}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2 font-medium leading-relaxed">
            {descripcionCurso}
          </p>
        </div>
      </div>
      
      <Link 
        href={`/cursos/${id}`} 
        className={`mt-auto flex items-center justify-center gap-2 w-full py-4 rounded-[1.2rem] font-black transition-all border-2 active:scale-95
          ${completado 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' 
            : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-lg shadow-blue-100'
          }`}
      >
        {completado ? (
          <>
            <CheckCircle2 size={20} />
            <span>Repasar Curso</span>
          </>
        ) : (
          <>
            <PlayCircle size={20} />
            <span>Continuar Curso</span>
          </>
        )}
      </Link>
    </div>
  );
}