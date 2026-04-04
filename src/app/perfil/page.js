"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, BookOpen, CheckCircle, LogOut, Edit3, Save, X, Camera, Loader2, Gem, Plus, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [previewPfp, setPreviewPfp] = useState(null);
  const [filePfp, setFilePfp] = useState(null);
  const [gemas, setGemas] = useState([]);
  const [showGemaForm, setShowGemaForm] = useState(false);
  const [editandoGema, setEditandoGema] = useState(null);
  const [nuevaGema, setNuevaGema] = useState({ titulo: '', descripcion: '' });
  const [savingGema, setSavingGema] = useState(false);

  const fetchGemas = async (uid) => {
    const res = await fetch(`/api/gemas?usuario_id=${uid}`);
    const data = await res.json();
    setGemas(data);
  };

  const fetchDatos = async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) { router.push('/login'); return; }
    try {
      const res = await fetch(`/api/perfil?id=${usuarioId}`);
      const data = await res.json();
      setDatos(data);
      setNuevoNombre(data.usuario.alias || '');
      setLoading(false);
      fetchGemas(usuarioId);
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
    const { error: uploadError } = await supabase.storage.from('pfps').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('pfps').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    const userId = localStorage.getItem('usuario_id');
    try {
      let pfpUrl = datos.usuario.pfp;
      if (filePfp) pfpUrl = await uploadPfp(filePfp, userId);

      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: userId, alias: nuevoNombre, pfp: pfpUrl }),
      });

      if (res.ok) {
        setEditMode(false);
        setFilePfp(null);
        await fetchDatos();
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

  const handleCrearGema = async () => {
    if (!nuevaGema.titulo.trim() || !nuevaGema.descripcion.trim()) return;
    setSavingGema(true);
    const userId = localStorage.getItem('usuario_id');
    const res = await fetch('/api/gemas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: userId, ...nuevaGema }),
    });
    const data = await res.json();
    if (res.ok) {
      setNuevaGema({ titulo: '', descripcion: '' });
      setShowGemaForm(false);
      fetchGemas(userId);
    } else {
      alert(data.error);
    }
    setSavingGema(false);
  };

  const handleEditarGema = async () => {
    if (!editandoGema.titulo.trim() || !editandoGema.descripcion.trim()) return;
    setSavingGema(true);
    const userId = localStorage.getItem('usuario_id');
    const res = await fetch('/api/gemas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: userId, ...editandoGema }),
    });
    if (res.ok) {
      setEditandoGema(null);
      fetchGemas(userId);
    }
    setSavingGema(false);
  };

  const handleEliminarGema = async (gema_id) => {
    if (!window.confirm('¿Eliminar esta gema?')) return;
    const userId = localStorage.getItem('usuario_id');
    await fetch(`/api/gemas?gema_id=${gema_id}&usuario_id=${userId}`, { method: 'DELETE' });
    fetchGemas(userId);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!datos || !datos.usuario) return <div className="p-20 text-center">Usuario no encontrado</div>;

  const { usuario, stats } = datos;

  const colores = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600',
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-32 relative">

      {/* Header de Perfil */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 overflow-hidden border-4 border-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
            {previewPfp || usuario.pfp ? (
              <img src={previewPfp || usuario.pfp} className="w-full h-full object-cover scale-110 -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500" alt="Avatar" />
            ) : (
              <User size={60} className="-rotate-3 group-hover:rotate-0 transition-transform duration-500" />
            )}
          </div>
          {editMode && (
            <label className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-white rounded-3xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="text-center md:text-left flex-grow z-10">
          {editMode ? (
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{usuario.nombre}</h1>
              <input
                className="text-lg font-bold text-slate-500 bg-slate-50 border-b-2 border-blue-500 outline-none w-full max-w-md px-2 py-1"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Escribe tu alias..."
                autoFocus
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alias público</p>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {usuario.alias || usuario.nombre}
              </h1>
              {usuario.alias && (
                <p className="text-slate-400 text-sm font-medium mt-1">{usuario.nombre}</p>
              )}
            </div>
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

        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              </button>
              <button onClick={() => { setEditMode(false); setPreviewPfp(null); setNuevoNombre(usuario.alias || ''); }}
                className="bg-slate-100 text-slate-500 p-4 rounded-2xl hover:bg-slate-200 transition-all">
                <X size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)}
              className="bg-white text-blue-600 border border-blue-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2 font-black text-xs uppercase tracking-widest">
              <Edit3 size={18} /> Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Stats y datos */}
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

        <aside className="w-full lg:w-[40%] space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4 italic">Datos de la Cuenta</h2>
            <div className="space-y-8">
              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Correo Electrónico</p>
                <p className="text-slate-900 font-bold flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <Mail size={16} className="text-blue-500" /> {usuario.email}
                </p>
              </div>
              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">ID en la plataforma</p>
                <p className="text-slate-900 font-mono font-black text-lg">#ID-{usuario.usuario_id.toString()}</p>
              </div>
            </div>
          </div>
          <div className="lg:hidden">
            <button onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 font-black py-5 rounded-2xl flex items-center justify-center gap-3 border border-red-100 active:scale-95 transition-all shadow-sm shadow-red-100">
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </div>
        </aside>
      </div>

      {/* DIVISOR */}
      <div className="flex items-center gap-4 my-10">
        <div className="flex-1 h-px bg-slate-200"></div>
        <div className="flex items-center gap-2 text-slate-400">
          <Gem size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Mis Gemas</span>
        </div>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* SECCIÓN GEMAS */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Gem size={26} className="text-blue-600" /> Mis Gemas
              <span className="bg-blue-100 text-blue-600 text-xs font-black px-2 py-0.5 rounded-full">{gemas.length}/10</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Habilidades y logros que has desarrollado</p>
          </div>
          {gemas.length < 10 && !showGemaForm && (
            <button onClick={() => setShowGemaForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white text-xs font-black px-5 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              <Plus size={16} /> Nueva Gema
            </button>
          )}
        </div>

        {showGemaForm && (
          <div className="bg-white rounded-[2rem] p-6 border border-blue-100 shadow-sm mb-8 animate-in fade-in zoom-in-95 duration-200 max-w-2xl">
            <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">Nueva Gema</h3>
            <input
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              placeholder="Título de tu gema..."
              value={nuevaGema.titulo}
              onChange={(e) => setNuevaGema({ ...nuevaGema, titulo: e.target.value })}
              maxLength={100}
            />
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
              placeholder="Describe tu gema..."
              rows={3}
              value={nuevaGema.descripcion}
              onChange={(e) => setNuevaGema({ ...nuevaGema, descripcion: e.target.value })}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowGemaForm(false); setNuevaGema({ titulo: '', descripcion: '' }); }}
                className="px-4 py-2 text-slate-500 bg-slate-100 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">
                Cancelar
              </button>
              <button onClick={handleCrearGema} disabled={savingGema}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all disabled:opacity-50">
                {savingGema ? 'Guardando...' : 'Guardar Gema'}
              </button>
            </div>
          </div>
        )}

        {gemas.length === 0 && !showGemaForm ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200">
            <Gem size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">Aún no tienes gemas</p>
            <p className="text-slate-300 text-xs mt-1">¡Agrega tu primera gema!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gemas.map((gema, index) => {
              const color = colores[index % colores.length];
              return editandoGema?.gema_id === gema.gema_id ? (
                <div key={gema.gema_id} className="bg-white rounded-[2rem] p-5 border-2 border-blue-300 shadow-sm">
                  <input
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    value={editandoGema.titulo}
                    onChange={(e) => setEditandoGema({ ...editandoGema, titulo: e.target.value })}
                    maxLength={100}
                  />
                  <textarea
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
                    rows={3}
                    value={editandoGema.descripcion}
                    onChange={(e) => setEditandoGema({ ...editandoGema, descripcion: e.target.value })}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditandoGema(null)}
                      className="px-3 py-1.5 text-slate-500 bg-slate-100 rounded-xl text-xs font-black hover:bg-slate-200">
                      Cancelar
                    </button>
                    <button onClick={handleEditarGema} disabled={savingGema}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 disabled:opacity-50">
                      {savingGema ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={gema.gema_id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                  <div className={`bg-gradient-to-br ${color} p-6 flex items-center justify-between`}>
                    <Gem size={32} className="text-white opacity-90" />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditandoGema({ ...gema })}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleEliminarGema(gema.gema_id)}
                        className="p-1.5 bg-white/20 hover:bg-red-500 rounded-lg text-white transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-slate-900 text-sm mb-2">{gema.titulo}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{gema.descripcion}</p>
                    <p className="text-slate-300 text-[10px] font-bold mt-4">
                      {new Date(gema.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}