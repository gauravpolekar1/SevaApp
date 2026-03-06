function ViewToggle({ value, onChange }) {
  const views = ['daily', 'weekly', 'monthly'];

  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
      {views.map((view) => {
        const isActive = value === view;
        return (
          <button
            key={view}
            type="button"
            onClick={() => onChange(view)}
            className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              isActive ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            {view}
          </button>
        );
      })}
    </div>
  );
}

export default ViewToggle;
