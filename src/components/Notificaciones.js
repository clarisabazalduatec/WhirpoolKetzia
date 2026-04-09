"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageSquare, X, BookOpen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const uid = localStorage.getItem('usuario_id');
    if (uid) {
      setUsuarioId(uid);
      fetchNotificaciones(uid);
      const interval = setInterval(() => fetchNotificaciones(uid), 120000);
      
      const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
          setAbierto(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  const fetchNotificaciones = async (uid) => {
    try {
      const res = await fetch(`/api/notificaciones?usuario_id=${uid}`);
      const data = await res.json();
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const handleAbrir = async () => {
    setAbierto(!abierto);
    if (!abierto && noLeidas > 0 && usuarioId) {
      await fetch('/api/notificaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId }),
      });
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    }
  };

  const borrarNotificacion = async (e, id) => {
    e.stopPropagation(); 
    try {
      const res = await fetch(`/api/notificaciones?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotificaciones(prev => prev.filter(n => n.notificacion_id !== id));
      }
    } catch (e) {
      console.error("Error al borrar:", e);
    }
  };

  const handleNotificacionClick = (tipo) => {
    // CORRECCIÓN: Si es inscripción, no hace nada
    if (tipo === 'inscripcion') return;
    
    router.push('/comunidad');
    setAbierto(false);
  };

  const getIcono = (tipo) => {
    if (tipo?.includes('like')) return <Heart size={14} className="text-red-500" fill="currentColor" />;
    if (tipo === 'inscripcion') return <BookOpen size={14} className="text-emerald-500" />;
    return <MessageSquare size={14} className="text-blue-500" />;
  };

  const formatFecha = (fecha) => {
    const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
    if (diff < 1) return 'ahora';
    if (diff < 60) return `hace ${diff} min`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
    return `hace ${Math.floor(diff / 1440)}d`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleAbrir}
        className="relative flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all"
      >
        <Bell size={22} />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-in zoom-in">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="fixed bottom-20 left-16 lg:left-24 w-80 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm">Notificaciones</h3>
              {noLeidas > 0 && (
                <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {noLeidas} nuevas
                </span>
              )}
            </div>
            <button onClick={() => setAbierto(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-96">
            {notificaciones.length === 0 ? (
              <div className="p-10 text-center">
                <Bell size={28} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 text-xs font-bold">Sin notificaciones</p>
              </div>
            ) : (
              notificaciones.map((n) => (
                <div 
                  key={n.notificacion_id}
                  className={`group relative w-full p-4 border-b border-slate-50 flex gap-3 items-start transition-colors 
                    ${!n.leida ? 'bg-blue-50/30' : ''} 
                    ${n.tipo === 'inscripcion' ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'}`}
                  onClick={() => handleNotificacionClick(n.tipo)}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                    {getIcono(n.tipo)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">{n.mensaje}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{formatFecha(n.fecha)}</p>
                  </div>

                  <button
                    onClick={(e) => borrarNotificacion(e, n.notificacion_id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>

                  {!n.leida && (
                    <div className="group-hover:hidden absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}