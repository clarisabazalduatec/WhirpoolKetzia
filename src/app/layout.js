"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // 1. Centro de mando de rutas
  const configRutas = {
    isLogin: pathname === '/login',
    isRegistro: pathname === '/registro',
    isVisor: pathname.includes('/visor/'),
    isQuiz: pathname.includes('/quiz/'),
    isComunidad: pathname === '/comunidad',
    isProfile: pathname === '/perfil',
    isAdmin: pathname.includes('/admin', '/admin/')
  };


  // Definimos los nombres según la ruta
  const nombresRutas = {
    '/': 'Whirlpool Learning',
    '/login': 'Iniciar Sesión',
    '/registro': 'Registro',
    '/comunidad': 'Comunidad',
    '/perfil': 'Mi Perfil',
    '/admin': 'Admin',
  };

  // Buscamos si la ruta actual existe en nuestro mapa, si no, usamos un genérico
  const tituloActual = nombresRutas[pathname] || 'Whirlpool Learning';

  // 2. Lógica de componentes
  const mostrarSidebar = !configRutas.isLogin && !configRutas.isRegistro; 
  const mostrarChatbot = !configRutas.isLogin && !configRutas.isRegistro; 
  const mostrarHeader = !configRutas.isLogin && !configRutas.isVisor && !configRutas.isRegistro && !configRutas.isQuiz;
  const colapsarSidebar = configRutas.isComunidad || configRutas.isVisor || configRutas.isProfile || configRutas.isAdmin || configRutas.isQuiz;
  
  // 3. Clases dinámicas para el Sidebar y el Contenedor
  const anchoSidebar = colapsarSidebar ? 'lg:pl-20' : 'lg:pl-32'; 
  
  // Si sientes que sigue habiendo mucho espacio, puedes probar con valores menores:
  // const anchoSidebar = colapsarSidebar ? 'lg:pl-24' : 'lg:pl-36';

  return (
    <html lang="es">
      <head>
        <title>{tituloActual}</title>
        <meta name="description" content="Sistema de capacitación interna" />
      </head>
      <body className="bg-slate-50 antialiased overflow-x-hidden"> 
        {mostrarSidebar && <Sidebar colapsado={colapsarSidebar} />}

        {/* Cambiamos el padding para que sea más ajustado al Sidebar real */}
        <div className={`min-h-screen flex flex-col transition-all duration-500 ease-in-out ${mostrarSidebar ? (colapsarSidebar ? 'lg:pl-20' : 'lg:pl-32') : ''}`}>
          
          {mostrarHeader && <Header />}
          
          <main className="flex-1">
            {children}
          </main>

          {mostrarChatbot && <ChatBot/>}
        </div>
      </body>
    </html>
  );
}