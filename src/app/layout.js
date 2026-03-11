"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login';

  return (
    <html lang="es">
      <body className="bg-slate-50 antialiased overflow-x-hidden"> 
        {/* Ocultamos Sidebar si es login O si es el visor */}
        {!isLoginPage && <Sidebar />}

        <div 
          className={`min-h-screen flex flex-col transition-all duration-300 ${
            // Si es visor o login, quitamos el margen del sidebar
            (!isLoginPage) ? 'lg:ml-32 pb-16 lg:pb-0' : ''
          }`}
        >
          {/* Ocultamos Header si es login */}
          {!isLoginPage && <Header />}
          
          {/* Si es el visor, quitamos el padding por completo para que pegue a los bordes */}
          <main className={`flex-1 ${(!isLoginPage) ? 'p-2 lg:p-2' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}