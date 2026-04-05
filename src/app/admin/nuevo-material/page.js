"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, Upload, Type, HelpCircle, Link as LinkIcon, AlignLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NuevoMaterial() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileObject, setFileObject] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); 
  const [fileError, setFileError] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    nombre_archivo: '',
    tipo_archivo: 'PDF',
    descripcion: '', 
    url_archivo: '',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (file) {
      // 1. Validar Peso (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileError("El archivo es demasiado pesado (Máx. 5MB)");
        setFileObject(null);
        e.target.value = ""; 
        return;
      }

      // 2. Extraer extensión y validar tipo
      const ext = file.name.split('.').pop().toUpperCase();
      
      if (ext === 'PDF' || ext === 'MP4') {
        setFileObject(file);
        // Sincronizar automáticamente el selector de formato con el archivo real
        setFormData(prev => ({ 
          ...prev, 
          tipo_archivo: ext,
          nombre_archivo: prev.nombre_archivo || file.name.split('.')[0] 
        }));
      } else {
        setFileError("Formato no soportado. Usa PDF o MP4.");
        e.target.value = "";
      }
    }
  };

  const uploadFileToSupabase = async (file) => {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage
      .from('material')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('material').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadMode === 'file' && !fileObject) return alert("Selecciona un archivo válido");
    if (uploadMode === 'link' && !formData.url_archivo) return alert("Ingresa un link");

    setLoading(true);
    try {
      let finalUrl = formData.url_archivo;
      let finalType = uploadMode === 'link' ? 'LINK' : formData.tipo_archivo;

      if (uploadMode === 'file') {
        finalUrl = await uploadFileToSupabase(fileObject);
      }

      const res = await fetch('/api/admin/archivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tipo_archivo: finalType, url_archivo: finalUrl }),
      });

      if (res.ok) router.push('/admin');
      else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al registrar el material");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen font-sans p-6 lg:p-10 bg-slate-50/30 text-slate-900">
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-10 pb-4 border-b border-slate-100">
        <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver al Panel
        </Link>
        <h1 className="text-2xl font-black text-slate-900">Subir Nuevo Material</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-6 order-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Nombre del Recurso</label>
              <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={formData.nombre_archivo} onChange={(e) => setFormData({...formData, nombre_archivo: e.target.value})} placeholder="Ej: Manual de Seguridad 2024" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Descripción del Contenido</label>
              <textarea rows="3" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm resize-none" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Describe brevemente de qué trata este material..." />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Método de Carga</label>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 max-w-sm">
                  <button type="button" onClick={() => { setUploadMode('file'); setFileObject(null); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${uploadMode === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><Upload size={14} /> Archivo</button>
                  <button type="button" onClick={() => setUploadMode('link')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${uploadMode === 'link' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}><LinkIcon size={14} /> Link</button>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 px-1 transition-colors ${(uploadMode === 'link' || fileObject) ? 'text-slate-200' : 'text-slate-400'}`}>Formato</label>
                <select 
                  // BLOQUEADO si es LINK o si YA HAY UN ARCHIVO (para evitar discordancia)
                  disabled={uploadMode === 'link' || !!fileObject}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  value={uploadMode === 'link' ? 'LINK' : formData.tipo_archivo}
                  onChange={(e) => setFormData({...formData, tipo_archivo: e.target.value})}
                >
                  <option value="PDF">Documento PDF</option>
                  <option value="MP4">Video MP4</option>
                  {uploadMode === 'link' && <option value="LINK">Link Externo</option>}
                </select>
                {fileObject && <p className="text-[9px] text-blue-500 font-bold mt-2 ml-1 uppercase italic">* Formato detectado automáticamente</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Guardar en Biblioteca
            </button>
          </div>
        </div>

        <div className="md:col-span-5 order-2">
          {uploadMode === 'file' ? (
            <div className={`bg-white p-8 rounded-[2.5rem] border shadow-sm h-full flex flex-col items-center justify-center text-center min-h-[400px] transition-all ${fileError ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
              <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-colors ${fileError ? 'bg-red-100 text-red-500' : fileObject ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                {fileError ? <AlertCircle size={40} /> : fileObject ? <FileText size={40} /> : <Upload size={40} />}
              </div>
              <h3 className={`font-black mb-2 ${fileError ? 'text-red-600' : 'text-slate-900'}`}>{fileError ? "Error de archivo" : fileObject ? "Archivo listo" : "Subir Archivo"}</h3>
              <p className={`text-xs font-medium mb-8 px-4 ${fileError ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{fileError || (fileObject ? fileObject.name : "Formatos aceptados: PDF y MP4. (Máximo 5MB)")}</p>
              <label className={`w-full py-4 rounded-2xl font-black text-sm cursor-pointer transition-all text-center ${fileError ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                {fileObject || fileError ? "Cambiar Archivo" : "Buscar en mi equipo"}
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.mp4" />
              </label>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col justify-center min-h-[400px] animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 mx-auto"><LinkIcon size={30} /></div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Dirección URL</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm" value={formData.url_archivo} onChange={(e) => setFormData({...formData, url_archivo: e.target.value})} placeholder="https://drive.google.com/..." />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}