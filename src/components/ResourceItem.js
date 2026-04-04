export const ResourceItem = ({ title, subtitle, icon: Icon, action, variant = 'blue' }) => {
  const colors = {
    blue: "text-blue-600 bg-white",
    purple: "text-purple-600 bg-purple-50/30 border-purple-100"
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-2xl hover:shadow-md transition-all group ${variant === 'purple' ? colors.purple : 'bg-slate-50/50 border-slate-100'}`}>
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={`p-3 rounded-xl shadow-sm ${variant === 'purple' ? 'bg-white' : colors.blue}`}>
          <Icon size={20} />
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-slate-800 text-sm truncate">{title}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
};