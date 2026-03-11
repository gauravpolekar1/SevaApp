const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseDays(value = '') {
  return value
    .split(',')
    .map((day) => day.trim())
    .filter(Boolean);
}

function DayPicker({ value, onChange, label = 'Days', required = false }) {
  const selectedDays = parseDays(value);

  const setDays = (days) => {
    onChange(DAYS.filter((day) => days.includes(day)).join(','));
  };

  const toggleDay = (day) => {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day];

    setDays(nextDays);
  };

  const pickAll = () => setDays(DAYS);
  const pickWeekdays = () => setDays(DAYS.slice(0, 5));
  const pickWeekend = () => setDays(DAYS.slice(5));

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const selected = selectedDays.includes(day);

          return (
            <button
              key={day}
              className={`rounded-full border px-3 py-1 text-sm transition ${selected ? 'border-orange-600 bg-orange-100 text-orange-700' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'}`}
              onClick={() => toggleDay(day)}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button className="rounded border px-2 py-1 text-slate-600" onClick={pickAll} type="button">Every day</button>
        <button className="rounded border px-2 py-1 text-slate-600" onClick={pickWeekdays} type="button">Weekdays</button>
        <button className="rounded border px-2 py-1 text-slate-600" onClick={pickWeekend} type="button">Weekend</button>
      </div>
      {required && selectedDays.length === 0 && (
        <p className="text-xs text-red-600">Select at least one day.</p>
      )}
      <input name="days" required={required} type="text" value={selectedDays.join(',')} readOnly className="sr-only" />
    </fieldset>
  );
}

export default DayPicker;
