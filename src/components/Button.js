import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export const Button = ({ 
  children, 
  href, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  icon: Icon,
  className = "" 
}) => {
  const baseStyles = "px-6 py-3 rounded-[2.5rem] font-black flex items-center justify-center gap-2 transition-all active:scale-95 text-sm shadow-xl";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100",
    dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-100",
    danger: "bg-white text-red-500 border border-red-100 hover:bg-red-50 shadow-red-50",
    ghost: "bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white shadow-none"
  };

  const content = (
    <>
      {loading ? <Loader2 className="animate-spin" size={18} /> : Icon && <Icon size={18} />}
      {children}
    </>
  );

  if (href) return <Link href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>{content}</Link>;
  
  return (
    <button onClick={onClick} disabled={loading} className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50`}>
      {content}
    </button>
  );
};