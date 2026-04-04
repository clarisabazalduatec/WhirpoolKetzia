"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, MessageSquare, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react';

// Importación de componentes reutilizables
import { Button } from '@/components/Button';
import { PageHeader, Title, Text } from '@/components/Typography';
import { SectionCard } from '@/components/SectionCard';

export default function ComunidadPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 5;

  // Semáforo para evitar peticiones duplicadas por scroll rápido
  const isFetching = useRef(false);

  // Estados de formulario y comentarios
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [comentandoId, setComentandoId] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [comentariosVisibles, setComentariosVisibles] = useState({});

  // Función principal de carga
  const fetchPosts = useCallback(async (isInitial = false) => {
    if (isFetching.current || (!isInitial && !hasMore)) return;
    
    isFetching.current = true;
    const currentOffset = isInitial ? 0 : offset;
    
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/comunidad?limit=${limit}&offset=${currentOffset}`);
      const newData = await res.json();
      
      if (newData.length < limit) setHasMore(false);

      if (isInitial) {
        setPosts(newData);
        setOffset(limit);
        setHasMore(newData.length === limit);
      } else {
        setPosts(prevPosts => {
          // FILTRO ANTIDUPLICADOS: Crucial para evitar el error de consola
          const existingIds = new Set(prevPosts.map(p => p.publicacion_id));
          const uniqueNewPosts = newData.filter(p => !existingIds.has(p.publicacion_id));
          return [...prevPosts, ...uniqueNewPosts];
        });
        setOffset(prev => prev + limit);
      }
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [offset, hasMore]);

  // Carga inicial
  useEffect(() => { fetchPosts(true); }, []);

  // Evento de Scroll Infinito
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300; 
      if (scrollPosition >= threshold) {
        fetchPosts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPosts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = localStorage.getItem('usuario_id');
    if (!contenido.trim() || !uid) return;
    setEnviando(true);
    const res = await fetch('/api/comunidad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: uid, titulo: titulo || 'Sin título', contenido: contenido }),
    });
    if (res.ok) {
      setTitulo(''); setContenido('');
      setHasMore(true);
      fetchPosts(true); // Reinicia el feed
    }
    setEnviando(false);
  };

  const handleCommentSubmit = async (e, publicId) => {
    e.preventDefault();
    const uid = localStorage.getItem('usuario_id');
    if (!nuevoComentario.trim() || !uid) return;

    const res = await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: uid, publicacion_id: publicId, contenido: nuevoComentario }),
    });

    if (res.ok) {
      setNuevoComentario('');
      setComentandoId(null);
      setComentariosVisibles({ ...comentariosVisibles, [publicId]: 1 });
      fetchPosts(true); // Recarga para mostrar el comentario nuevo arriba
    }
  };

  const toggleMasComentarios = (postId, total) => {
    const actual = comentariosVisibles[postId] || 1;
    if (actual >= total) setComentariosVisibles({ ...comentariosVisibles, [postId]: 1 });
    else setComentariosVisibles({ ...comentariosVisibles, [postId]: actual + 5 });
  };

  return (
    <div className="mx-auto p-6 lg:p-10 max-w-[1400px]">
      <PageHeader title="Comunidad Whirlpool" subtitle="Comparte tus dudas y avances con el equipo" icon={Users} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3 space-y-8">
          <Text variant="muted" className="ml-2 italic">Publicaciones recientes</Text>
          
          {loading ? (
            <div className="text-center p-20 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <Text variant="muted">Sincronizando feed...</Text>
            </div>
          ) : (
            <>
              {posts.map((post) => {
                const total = post.comentarios?.length || 0;
                const limite = comentariosVisibles[post.publicacion_id] || 1;
                const comentariosAMostrar = post.comentarios?.slice(0, limite) || [];

                return (
                  <SectionCard key={post.publicacion_id} title={
                    <div className="flex items-center gap-4 py-1">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold overflow-hidden border border-slate-100 shrink-0">
                        {post.pfp ? <img src={post.pfp} className="w-full h-full object-cover" alt="" /> : <span>{post.nombre?.[0]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 leading-tight">{post.nombre}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(post.fecha_publicacion).toLocaleDateString()}</span>
                      </div>
                    </div>
                  }>
                    <div className="p-4 pt-2">
                      <h4 className="text-xl font-black text-slate-900 mb-3">{post.titulo}</h4>
                      <p className="text-slate-600 leading-relaxed mb-6 font-medium">{post.contenido}</p>

                      <div className="border-t border-slate-50 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-500" />
                            <Text variant="muted" className="font-black">{total} Comentarios</Text>
                          </div>
                          <Button variant={comentandoId === post.publicacion_id ? "danger" : "pill"} className="h-auto" onClick={() => setComentandoId(comentandoId === post.publicacion_id ? null : post.publicacion_id)}>
                            {comentandoId === post.publicacion_id ? 'Cancelar' : 'Responder'}
                          </Button>
                        </div>

                        {comentandoId === post.publicacion_id && (
                          <form onSubmit={(e) => handleCommentSubmit(e, post.publicacion_id)} className="flex gap-2 mt-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <input className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Escribe una respuesta..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} autoFocus />
                            <Button className="px-4 py-2" icon={Send}>Enviar</Button>
                          </form>
                        )}

                        <div className="space-y-3">
                          {comentariosAMostrar.map((c) => (
                            <div key={c.comentario_id} className="flex gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 animate-in fade-in">
                              <div className="w-8 h-8 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-[10px]">
                                {c.pfp ? <img src={c.pfp} className="w-full h-full object-cover" alt="" /> : c.nombre[0]}
                              </div>
                              <div className="flex-1">
                                <Text className="text-xs">{c.nombre}</Text>
                                <p className="text-sm text-slate-500 leading-snug">{c.contenido}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {total > 1 && (
                          <Button variant="pill" className="w-full" onClick={() => toggleMasComentarios(post.publicacion_id, total)} icon={limite >= total ? ChevronUp : ChevronDown}>
                            {limite >= total ? "Mostrar menos" : `Cargar más comentarios`}
                          </Button>
                        )}
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
              {loadingMore && <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
              {!hasMore && <div className="py-10 text-center"><Text variant="muted">Fin de las noticias</Text></div>}
            </>
          )}
        </div>

        <aside className="w-full lg:w-1/3 lg:sticky lg:top-10">
          <SectionCard title="Nueva Publicación" className="shadow-xl shadow-slate-200/50">
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Text variant="muted" className="ml-1 mb-2">Título</Text>
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                </div>
                <div>
                  <Text variant="muted" className="ml-1 mb-2">Contenido</Text>
                  <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="Contenido..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none text-sm font-medium" />
                </div>
                <Button className="w-full py-4" icon={Send} loading={enviando}>Publicar Ahora</Button>
              </form>
            </div>
          </SectionCard>
          <div className="mt-6 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex gap-3">
            <div className="bg-white p-2 rounded-xl h-fit text-blue-500"><Users size={16} /></div>
            <Text className="text-blue-700 text-[11px] leading-relaxed font-black uppercase tracking-tight">Recuerda ser respetuoso. ¡La comunidad la hacemos todos!</Text>
          </div>
        </aside>
      </div>
    </div>
  );
}