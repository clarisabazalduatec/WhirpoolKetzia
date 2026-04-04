export const SectionCard = ({ title, count, action, children, className = "" }) => (
  <div className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    <div className="pl-10 pr-4 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
      <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
        {title}
        {count !== undefined && (
          <span className="text-xs font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full">{count}</span>
        )}
      </h2>
      {action}
    </div>
    <div className="p-2">{children}</div>
  </div>
);