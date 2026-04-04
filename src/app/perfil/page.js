"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar, BookOpen, CheckCircle, LogOut, Award, Edit3, Save, X, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Estados para el formulario
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [previewPfp, setPreviewPfp] = useState(null);
  const [filePfp, setFilePfp] = useState(null);

  const fetchDatos = async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) { router.push('/login'); return; }

    try {
      const res = await fetch(`/api/perfil?id=${usuarioId}`);
      const data = await res.json();
      setDatos(data);
      setNuevoNombre(data.usuario.nombre);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFilePfp(file);
      setPreviewPfp(URL.createObjectURL(file));
    }
  };

  const uploadPfp = async (file, userId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
    const filePath = fileName; // Se guarda en la raíz del bucket

    const { error: uploadError } = await supabase.storage
      .from('pfps') 
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('pfps').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!nuevoNombre.trim()) return alert("El nombre no puede estar vacío");
    
    setSaving(true);
    const userId = localStorage.getItem('usuario_id');
    
    try {
      let pfpUrl = datos.usuario.pfp; // Por defecto mantenemos la actual

      if (filePfp) {
        pfpUrl = await uploadPfp(filePfp, userId);
      }

      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          nombre: nuevoNombre,
          pfp: pfpUrl
        }),
      });

      if (res.ok) {
        setEditMode(false);
        setFilePfp(null);
        await fetchDatos(); // Recargar datos frescos de la DB
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
    router.refresh();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!datos || !datos.usuario) return <div className="p-20 text-center">Usuario no encontrado</div>;

  const { usuario, stats } = datos;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-32 relative">

      {/* Header de Perfil */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        
        {/* Avatar con lógica de edición */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 overflow-hidden border-4 border-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
            {previewPfp || usuario.pfp ? (
              <img 
                src={previewPfp || usuario.pfp} 
                /* CAMBIO: Se añadió scale-125 para que la imagen sea más grande y cubra los bordes al rotar */
                className="w-full h-full object-cover scale-110 -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500" 
                alt="Avatar" 
              />
            ) : (
              <User size={60} className="-rotate-3 group-hover:rotate-0 transition-transform duration-500" />
            )}
          </div>
          
          {/* El label de edición también necesita el scale o un tamaño que cubra todo */}
          {editMode && (
            <label className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-white rounded-3xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="text-center md:text-left flex-grow z-10">
          {editMode ? (
            <input 
              className="text-4xl font-black text-slate-900 tracking-tight bg-slate-50 border-b-2 border-blue-500 outline-none w-full max-w-md px-2"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              autoFocus
            />
          ) : (
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{usuario.nombre}</h1>
          )}
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-blue-100">
              {usuario.nombre_rol}
            </span>
            <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
              <Calendar size={16} /> Miembro desde {new Date(usuario.fecha_creacion).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Botones de Control de Edición */}
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              </button>
              <button 
                onClick={() => { setEditMode(false); setPreviewPfp(null); setNuevoNombre(usuario.nombre); }} 
                className="bg-slate-100 text-slate-500 p-4 rounded-2xl hover:bg-slate-200 transition-all"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setEditMode(true)}
              className="bg-white text-blue-600 border border-blue-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2 font-black text-xs uppercase tracking-widest"
            >
              <Edit3 size={18} /> Editar Perfil
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        <div className="w-full lg:w-[60%] space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
              <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl"><BookOpen size={28} /></div>
              <div>
                <p className="text-3xl font-black text-slate-900 leading-none">{stats.total_inscritos}</p>
                <p className="text-slate-400 text-xs font-black uppercase mt-1">Cursos Asignados</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl"><CheckCircle size={28} /></div>
              <div>
                <p className="text-3xl font-black text-slate-900 leading-none">{stats.total_completados}</p>
                <p className="text-slate-400 text-xs font-black uppercase mt-1">Finalizado(s)</p>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA */}
        <aside className="w-full lg:w-[40%] space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4 italic">
                Datos de la Cuenta
            </h2>
            
            <div className="space-y-8">
              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Correo Electrónico</p>
                <p className="text-slate-900 font-bold flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <Mail size={16} className="text-blue-500" /> {usuario.email}
                </p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">ID en la plataforma</p>
                <p className="text-slate-900 font-mono font-black text-lg">
                  #ID-{usuario.usuario_id.toString()}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <button 
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 font-black py-5 rounded-2xl flex items-center justify-center gap-3 border border-red-100 active:scale-95 transition-all shadow-sm shadow-red-100"
              >
                <LogOut size={20} />
                Cerrar Sesión
              </button>
          </div>
        </aside>

      </div>
    </div>
  );
}