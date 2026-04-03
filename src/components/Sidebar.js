"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, User, LogOut, MessageSquare, ShieldCheck } from 'lucide-react';

export default function Sidebar({ colapsado }) {
  const [isMounted, setIsMounted] = useState(false);
  const [rolId, setRolId] = useState(null); 
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedRole = localStorage.getItem('rol_id');
    if (savedRole !== null) {
      setRolId(Number(savedRole));
    }
  }, []);

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
    router.refresh();
  };

  if (!isMounted) return null;

  return (
    <aside 
      className={`fixed bottom-0 left-0 w-full h-16 bg-white/70 backdrop-blur-lg border-t border-slate-200/50 z-50 transition-all duration-500 ease-in-out
        lg:top-0 lg:left-0 lg:h-screen lg:bg-white lg:backdrop-blur-none lg:border-r lg:border-t-0 flex lg:flex-col items-center justify-around lg:justify-start lg:py-8
        ${colapsado ? 'lg:w-20' : 'lg:w-32'}`}
    >
      {/* LOGO PARA PC: Oculto en móvil, visible en escritorio */}
      <div className="hidden lg:flex items-center justify-center w-full mb-12 px-4">
        <Link href="/">
          <img 
            src="/whirpool.png" 
            alt="Whirlpool Logo" 
            className={`object-contain transition-all duration-300 ${colapsado ? 'h-6' : 'h-10'}`} 
          />
        </Link>
      </div>

      <nav className="flex lg:flex-col gap-2 lg:gap-10 items-center justify-center lg:flex-grow w-full">
        {/* Dashboard */}
        <Link href="/" className="relative flex items-center justify-center w-full group">
          <div className={`flex items-center justify-center transition-all duration-300 rounded-2xl
            ${colapsado ? 'w-10 h-10 lg:w-12 lg:h-12' : 'w-12 h-12 lg:w-16 lg:h-16'} 
            ${isActive('/') ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}>
            <LayoutGrid size={isActive('/') || !colapsado ? 24 : 22} className="lg:hidden" />
            <LayoutGrid size={colapsado ? 22 : 32} className="hidden lg:block" />
          </div>
          {isActive('/') && <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full" />}
        </Link>

        {/* Admin, Comunidad, Perfil se mantienen igual... */}
        {rolId === 1 && (
          <Link href="/admin" className="relative flex items-center justify-center w-full group">
            <div className={`flex items-center justify-center transition-all duration-300 rounded-2xl
              ${colapsado ? 'w-10 h-10 lg:w-12 lg:h-12' : 'w-12 h-12 lg:w-16 lg:h-16'} 
              ${isActive('/admin') ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-400 hover:bg-slate-100'}`}>
              <ShieldCheck size={isActive('/admin') || !colapsado ? 24 : 22} className="lg:hidden" />
              <ShieldCheck size={colapsado ? 22 : 32} className="hidden lg:block" />
            </div>
            {isActive('/admin') && <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-amber-500 rounded-r-full" />}
          </Link>
        )}

        <Link href="/comunidad" className="relative flex items-center justify-center w-full group">
          <div className={`flex items-center justify-center transition-all duration-300 rounded-2xl
            ${colapsado ? 'w-10 h-10 lg:w-12 lg:h-12' : 'w-12 h-12 lg:w-16 lg:h-16'} 
            ${isActive('/comunidad') ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}>
            <MessageSquare size={isActive('/comunidad') || !colapsado ? 24 : 22} className="lg:hidden" />
            <MessageSquare size={colapsado ? 22 : 32} className="hidden lg:block" />
          </div>
          {isActive('/comunidad') && <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full" />}
        </Link>

        <Link href="/perfil" className="relative flex items-center justify-center w-full group">
          <div className={`flex items-center justify-center transition-all duration-300 rounded-2xl
            ${colapsado ? 'w-10 h-10 lg:w-12 lg:h-12' : 'w-12 h-12 lg:w-16 lg:h-16'} 
            ${isActive('/perfil') ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}>
            <User size={isActive('/perfil') || !colapsado ? 24 : 22} className="lg:hidden" />
            <User size={colapsado ? 22 : 32} className="hidden lg:block" />
          </div>
          {isActive('/perfil') && <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full" />}
        </Link>
      </nav>

      <button 
        onClick={handleLogout} 
        className="hidden lg:flex text-slate-300 hover:text-red-500 transition-colors p-2 lg:p-3 lg:mt-auto"
      >
        <LogOut size={20} className="lg:w-6 lg:h-6" />
      </button>
    </aside>
  );
}