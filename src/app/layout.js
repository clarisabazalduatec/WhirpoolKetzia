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
  const mostrarHeader = !configRutas.isLogin && !configRutas.isVisor && !configRutas.isRegistro && !configRutas.isQuiz;
  const colapsarSidebar = configRutas.isComunidad || configRutas.isVisor || configRutas.isProfile || configRutas.isAdmin || configRutas.isQuiz;
  
  // 3. Clases dinámicas para el Sidebar y el Contenedor
  const anchoSidebar = configRutas.isVisor || configRutas.isComunidad || configRutas.isProfile || configRutas.isAdmin || configRutas.isQuiz ? 'lg:ml-20' : 'lg:ml-32';
  const margenMain = mostrarSidebar ? `${anchoSidebar} pb-2 lg:pb-0` : '';

  return (
    <html lang="es">
      <head>
        <title>{tituloActual}</title>
        <meta name="description" content="Sistema de capacitación interna" />
      </head>
      <body className="bg-slate-50 antialiased overflow-x-hidden"> 
        {mostrarSidebar && <Sidebar colapsado={colapsarSidebar} />}

        <div className={`min-h-screen flex flex-col transition-all duration-500 ease-in-out ${margenMain}`}>
          
          {mostrarHeader && <Header />}
          
          <main className={`flex-1 ${mostrarSidebar ? 'p-2' : ''}`}>
            {children}
          </main>

          <ChatBot/>

        </div>
      </body>
    </html>
  );
}