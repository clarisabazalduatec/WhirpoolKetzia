"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Loader2, Users, ChevronDown, ChevronUp, Plus, X, Send, Heart } from 'lucide-react';

import { Button } from '@/components/Button';
import { PageHeader, Title, Text } from '@/components/Typography';
import { SectionCard } from '@/components/SectionCard';
import PostForm from '@/components/PostForm';

export default function ComunidadPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const isFetching = useRef(false);

  // NUEVO: Estado para el ID del usuario para evitar errores de localStorage en servidor
  const [currentUserId, setCurrentUserId] = useState(null);

  const [showMobileForm, setShowMobileForm] = useState(false);
  const [comentandoId, setComentandoId] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentariosVisibles, setComentariosVisibles] = useState({});

  // 1. Efecto inicial para cargar el ID del usuario de forma segura
  useEffect(() => {
    const uid = localStorage.getItem('usuario_id');
    if (uid) setCurrentUserId(uid);
    fetchPosts(true, uid); // Pasamos el uid directamente para la primera carga
  }, []);

  const fetchPosts = useCallback(async (isInitial = false, uidOverride = null) => {
    if (isFetching.current || (!isInitial && !hasMore)) return;
    
    // Usamos el ID del estado o el override del useEffect inicial
    const uid = uidOverride || currentUserId;
    
    isFetching.current = true;
    const currentOffset = isInitial ? 0 : offset;

    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/comunidad?limit=${limit}&offset=${currentOffset}&myId=${uid || 0}`);
      const newData = await res.json();
      
      if (newData.length < limit) setHasMore(false);
      
      if (isInitial) {
        setPosts(newData);
        setOffset(limit);
        setHasMore(newData.length === limit);
      } else {
        setPosts(prev => {
          const ids = new Set(prev.map(p => p.publicacion_id));
          return [...prev, ...newData.filter(p => !ids.has(p.publicacion_id))];
        });
        setOffset(prev => prev + limit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [offset, hasMore, currentUserId]);

  // Manejador de Likes optimista
  const handleLike = async (id, tipo) => {
    if (!currentUserId) return;

    setPosts(prev => prev.map(post => {
      if (tipo === 'post' && post.publicacion_id === id) {
        return { ...post, iLiked: post.iLiked ? 0 : 1, totalLikes: post.iLiked ? post.totalLikes - 1 : post.totalLikes + 1 };
      }
      if (tipo === 'comment') {
        return { ...post, comentarios: post.comentarios.map(c => c.comentario_id === id ? { ...c, iLiked: c.iLiked ? 0 : 1, totalLikes: c.iLiked ? c.totalLikes - 1 : c.totalLikes + 1 } : c)};
      }
      return post;
    }));

    await fetch('/api/likes', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: currentUserId, id, tipo }) 
    });
  };

  const handleCommentSubmit = async (e, publicId) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !currentUserId) return;

    const uNombre = localStorage.getItem('nombre_usuario') || "Usuario";
    const uPfp = localStorage.getItem('usuario_pfp');

    const res = await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: currentUserId, publicacion_id: publicId, contenido: nuevoComentario }),
    });

    if (res.ok) {
      const data = await res.json();
      setNuevoComentario('');
      setComentandoId(null);
      setPosts(prev => prev.map(post => {
        if (post.publicacion_id === publicId) {
          const nuevo = { comentario_id: data.comentario_id, contenido: nuevoComentario, fecha_comentario: new Date().toISOString(), nombre: uNombre, pfp: uPfp, totalLikes: 0, iLiked: 0 };
          return { ...post, comentarios: [nuevo, ...(post.comentarios || [])] };
        }
        return post;
      }));
      setComentariosVisibles(prev => ({ ...prev, [publicId]: 1 }));
    }
  };

  const toggleMasComentarios = (postId, total) => {
    const actual = comentariosVisibles[postId] || 1;
    setComentariosVisibles({ ...comentariosVisibles, [postId]: actual >= total ? 1 : actual + 5 });
  };

  const comunidadFields = [
    { name: 'titulo', label: 'Título del tema', placeholder: 'Título...', required: false },
    { name: 'contenido', label: 'Contenido', placeholder: '¿Qué quieres compartir?', type: 'textarea', required: true }
  ];

  return (
    <div className="mx-auto p-6 lg:p-10 max-w-[1400px]">
      <PageHeader title="Comunidad Whirlpool" subtitle="Comparte tus dudas y avances con el equipo" icon={Users} />

      {/* FORMULARIO MÓVIL */}
      <div className="lg:hidden mb-8">
        {!showMobileForm ? (
          <Button variant="pill" className="w-full py-5 px-6 bg-white border border-slate-200" onClick={() => setShowMobileForm(true)} icon={Plus}>Nueva publicación</Button>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <SectionCard title="Nueva Publicación" action={<Button variant="pill" onClick={() => setShowMobileForm(false)} icon={X} className="p-0 h-8 w-8" />}>
              <PostForm 
                fields={comunidadFields} 
                apiUrl="/api/comunidad" 
                extraData={{ usuario_id: currentUserId }} // USAMOS EL ESTADO
                onSuccess={() => { setShowMobileForm(false); fetchPosts(true); }} 
              />
            </SectionCard>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3 space-y-8">
          {loading ? (
            <div className="text-center p-20"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>
          ) : (
            posts.map((post) => {
              const limite = comentariosVisibles[post.publicacion_id] || 1;
              const comentariosAMostrar = post.comentarios?.slice(0, limite) || [];
              return (
                <SectionCard key={post.publicacion_id} title={
                  <div className="flex items-center gap-4 py-1">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold overflow-hidden border border-slate-100 shrink-0">
                      {post.pfp ? <img src={post.pfp} className="w-full h-full object-cover" alt="" /> : <span>{post.nombre?.[0]}</span>}
                    </div>
                    <div className="flex flex-col">
                      <Link href={`/perfil/${post.usuario_id}`} className="text-sm font-black text-slate-900 hover:text-blue-600 transition-colors">
                        {post.nombre}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(post.fecha_publicacion).toLocaleDateString()}</span>
                    </div>
                  </div>
                }>
                  <div className="p-4 pt-2">
                    <h4 className="text-xl font-black text-slate-900 mb-3">{post.titulo}</h4>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">{post.contenido}</p>
                    <div className="border-t border-slate-50 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleLike(post.publicacion_id, 'post')} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${post.iLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                            <Heart size={18} fill={post.iLiked ? "currentColor" : "none"} /> {post.totalLikes}
                          </button>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><MessageSquare size={18} /> {post.comentarios?.length || 0}</div>
                        </div>
                        <Button variant={comentandoId === post.publicacion_id ? "danger" : "pill"} onClick={() => setComentandoId(comentandoId === post.publicacion_id ? null : post.publicacion_id)}>{comentandoId === post.publicacion_id ? 'Cancelar' : 'Responder'}</Button>
                      </div>
                      
                      {comentandoId === post.publicacion_id && (
                        <form onSubmit={(e) => handleCommentSubmit(e, post.publicacion_id)} className="flex gap-2 mt-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <input className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Responder..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} autoFocus />
                          <Button className="px-4" icon={Send}>Enviar</Button>
                        </form>
                      )}

                      <div className="space-y-3">
                        {comentariosAMostrar.map((c) => (
                          <div key={c.comentario_id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex gap-3 mb-2">
                              <div className="w-8 h-8 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-[10px]">
                                {c.pfp ? <img src={c.pfp} className="w-full h-full object-cover" alt="" /> : c.nombre?.[0]}
                              </div>
                              <div className="flex-1">
                                <Text className="text-xs">{c.nombre}</Text>
                                <p className="text-sm text-slate-500 leading-snug">{c.contenido}</p>
                              </div>
                            </div>
                            <button onClick={() => handleLike(c.comentario_id, 'comment')} className={`flex items-center gap-1 ml-11 text-[9px] font-black uppercase transition-colors ${c.iLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                              <Heart size={14} fill={c.iLiked ? "currentColor" : "none"} /> {c.totalLikes}
                            </button>
                          </div>
                        ))}
                      </div>
                      {post.comentarios?.length > 1 && (
                        <Button variant="pill" className="w-full" onClick={() => toggleMasComentarios(post.publicacion_id, post.comentarios.length)} icon={limite >= post.comentarios.length ? ChevronUp : ChevronDown}>
                          {limite >= post.comentarios.length ? "Mostrar menos" : `Cargar más`}
                        </Button>
                      )}
                    </div>
                  </div>
                </SectionCard>
              );
            })
          )}
          {loadingMore && <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
        </div>

        {/* FORMULARIO DESKTOP */}
        <aside className="hidden lg:block lg:w-1/3 lg:sticky lg:top-10 space-y-6">
          <SectionCard title="Nueva Publicación">
            <PostForm 
              fields={comunidadFields} 
              apiUrl="/api/comunidad" 
              extraData={{ usuario_id: currentUserId }} // USAMOS EL ESTADO
              onSuccess={() => fetchPosts(true)} 
            />
          </SectionCard>
          <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex gap-3">
            <div className="bg-white p-2 rounded-xl h-fit text-blue-500"><Users size={16} /></div>
            <Text className="text-blue-700 text-[11px] leading-relaxed font-black uppercase tracking-tight italic">Se respetuoso con tus compañeros ¡La comunidad la hacemos todos!</Text>
          </div>
        </aside>
      </div>
    </div>
  );
}