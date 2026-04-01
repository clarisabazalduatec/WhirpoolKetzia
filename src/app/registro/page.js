"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: 2 // Por defecto: Empleado
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || 'Error al registrar');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        
        {/* Decoración sutil */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-100">
              <UserPlus size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Registro</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Crea tu cuenta de Whirlpool</p>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-600 p-6 rounded-3xl border border-green-100 text-center animate-in zoom-in">
              <ShieldCheck size={48} className="mx-auto mb-3" />
              <p className="font-bold">¡Cuenta creada con éxito!</p>
              <p className="text-xs mt-1">Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre Completo */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Juan Pérez"
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Email Institucional</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="juan.perez@whirlpool.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-[11px] font-bold">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Crear Cuenta'} <ArrowRight size={18} />
              </button>

              <p className="text-center text-slate-400 text-xs mt-4">
                ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}