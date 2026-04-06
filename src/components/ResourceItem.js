// components/ResourceItem.js
export const ResourceItem = ({ title, subtitle, icon: Icon, action, variant = 'blue' }) => {
  const colors = {
    blue: "text-blue-600 bg-white",
    yellow: "bg-amber-50/40 border-amber-100",
    orange: "text-orange-500 bg-orange-50 border-orange-100",
    emerald: "text-emerald-500 bg-emerald-50 border-emerald-100",
  };

  const theme = colors[variant] || colors.blue;

  return (
    <div className={`flex items-center justify-between p-3 md:p-6 border rounded-[1.2rem] md:rounded-[2rem] hover:shadow-md transition-all group gap-2 ${variant === 'blue' ? 'bg-white border-slate-100' : theme}`}>
      
      <div className="flex items-center gap-2 md:gap-5 overflow-hidden">
        {/* Icono: Súper compacto en móvil (p-2 y w-4) */}
        <div className={`p-2 md:p-4 rounded-lg md:rounded-2xl shadow-sm shrink-0 ${variant === 'blue' ? 'bg-blue-50 text-blue-600' : theme}`}>
          <Icon className="w-4 h-4 md:w-7 md:h-7" />
        </div>

        {/* Textos: Bajamos a text-xs (12px) y el subtítulo a 7px */}
        <div className="overflow-hidden">
          <p className="font-black text-slate-900 text-xs md:text-xl leading-tight line-clamp-2 md:line-clamp-none">
            {title}
          </p>
          <p className="text-[7px] md:text-[10px] text-slate-400 font-black uppercase tracking-tighter md:tracking-widest mt-0.5 truncate">
            {subtitle}
          </p>
        </div>
      </div>
        {action}
    </div>
  );
};