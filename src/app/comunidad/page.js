"use client";
import { useState, useEffect } from 'react';
import { Send, User, MessageSquare, Book, Open } from 'lucide-react';

export default function ComunidadPage() {
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const res = await fetch('/api/comunidad');
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = localStorage.getItem('usuario_id');
    if (!contenido.trim() || !uid) return;

    const res = await fetch('/api/comunidad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        usuario_id: uid, 
        titulo: titulo || 'Sin título', 
        contenido: contenido 
      }),
    });

    if (res.ok) {
      setTitulo('');
      setContenido('');
      fetchPosts();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          <MessageSquare className="text-blue-600" size={36} /> Comunidad Whirlpool
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Comparte tus dudas y avances con el equipo.</p>
      </div>

      {/* Formulario de creación */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 mb-12">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título de tu publicación..."
          className="w-full mb-4 p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="¿Qué tienes en mente?"
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
        />
        <div className="flex justify-end mt-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            Publicar <Send size={18} />
          </button>
        </div>
      </form>

      {/* Feed de Publicaciones */}
      <div className="space-y-8">
        {loading ? (
           <div className="text-center p-10 text-slate-400">Cargando feed...</div>
        ) : (
          posts.map((post) => (
            <article key={post.publicacion_id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                  {post.nombre[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-none">{post.nombre}</h3>
                  <span className="text-xs text-slate-400 font-medium">{new Date(post.fecha_publicacion).toLocaleDateString()}</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{post.titulo}</h4>
              <p className="text-slate-600 leading-relaxed">{post.contenido}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}