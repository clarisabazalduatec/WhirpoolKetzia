"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Importamos Link para navegación rápida
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.clear();
        localStorage.setItem('usuario_id', data.user.id.toString());
        localStorage.setItem('rol_id', data.user.rol.toString());
        localStorage.setItem('nombre_usuario', data.user.nombre);

        router.push('/');
        router.refresh(); 
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Hubo un problema al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Whirlpool</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Learning Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">
              Correo Institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                placeholder="ejemplo@whirlpool.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-red-500 bg-red-50/50 p-4 rounded-2xl border border-red-100 text-xs font-bold animate-pulse">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Verificando...' : 'Entrar ahora'}
          </button>
        </form>

        {/* SECCIÓN DE REGISTRO */}
        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-xs font-medium">¿Aún no tienes una cuenta?</p>
          <Link 
            href="/registro" 
            className="mt-3 inline-flex items-center gap-2 text-blue-600 font-black text-sm hover:text-blue-700 transition-colors group"
          >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}