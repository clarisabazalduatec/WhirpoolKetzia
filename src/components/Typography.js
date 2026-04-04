// @/components/Typography.js
import { ShieldCheck } from 'lucide-react';

// Títulos de secciones (ej. Catálogo Global, Estadísticas)
export const Title = ({ children, className = "" }) => (
  <h2 className={`text-xl font-black text-slate-800 flex items-center gap-2 ${className}`}>
    {children}
  </h2>
);

// Texto estándar (ej. descripciones, creadores)
export const Text = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "text-sm font-bold text-slate-600",
    muted: "text-[10px] text-slate-400 font-medium uppercase tracking-tight",
    description: "text-sm font-bold text-slate-600 line-clamp-1"
  };
  return <p className={`${variants[variant]} ${className}`}>{children}</p>;
};

// Header Principal de la página
export const PageHeader = ({ title, subtitle, icon: Icon = ShieldCheck }) => (
  <div className="mb-10">
    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
      {title}
    </h1>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={16} className="text-blue-600" />
      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
        {subtitle}
      </p>
    </div>
  </div>
);