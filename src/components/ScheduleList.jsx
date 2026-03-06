import dayjs from 'dayjs';

function EventCard({ item, compact = false }) {
  return (
    <article className={`rounded-lg border bg-white ${compact ? 'p-2' : 'p-3'}`}>
      <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-slate-900`}>
        {item.seva_name}
      </p>
      <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
        {item.start_time} - {item.end_time}
      </p>
      <p className="text-xs text-slate-500">Sevekari: {item.sevekari_name}</p>
    </article>
  );
}

function DailySchedule({ schedule, date }) {
  const filtered = schedule
    .filter((item) => item.date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  if (filtered.length === 0) {
    return <p className="rounded-lg border bg-white p-3 text-sm text-slate-500">No sevas for this day.</p>;
  }

  return (
    <div className="space-y-2">
      {filtered.map((item, index) => (
        <EventCard key={`${item.assignment_id}-${item.date}-${index}`} item={item} />
      ))}
    </div>
  );
}

function WeeklySchedule({ schedule, weekStart }) {
  const days = Array.from({ length: 7 }, (_, idx) => dayjs(weekStart).add(idx, 'day'));

  return (
    <div className="space-y-2">
      {days.map((day) => {
        const dayValue = day.format('YYYY-MM-DD');
        const dayEvents = schedule
          .filter((item) => item.date === dayValue)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));

        return (
          <section key={dayValue} className="rounded-lg border bg-slate-50 p-2">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">{day.format('ddd, DD MMM')}</h3>
            {dayEvents.length === 0 ? (
              <p className="text-xs text-slate-500">No sevas.</p>
            ) : (
              <div className="space-y-2">
                {dayEvents.map((item, index) => (
                  <EventCard key={`${item.assignment_id}-${item.date}-${index}`} item={item} compact />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function ScheduleList({ mode, schedule, selectedDate }) {
  if (mode === 'weekly') {
    const weekStart = dayjs(selectedDate).startOf('week');
    return <WeeklySchedule schedule={schedule} weekStart={weekStart} />;
  }

  return <DailySchedule schedule={schedule} date={selectedDate} />;
}

export default ScheduleList;
