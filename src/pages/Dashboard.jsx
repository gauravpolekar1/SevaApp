import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { getSchedule } from '../services/api';

function Dashboard() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getSchedule();
        setSchedule(response.data.data || []);
      } catch (error) {
        setSchedule([]);
      }
    };

    load();
  }, []);

  const today = dayjs().format('YYYY-MM-DD');
  const todaySevas = useMemo(() => schedule.filter((item) => item.date === today), [schedule, today]);
  const upcomingWeek = useMemo(() => {
    const end = dayjs().add(7, 'day');
    return schedule.filter((item) => {
      const date = dayjs(item.date);
      return (date.isAfter(dayjs(), 'day') || date.isSame(dayjs(), 'day')) && (date.isBefore(end, 'day') || date.isSame(end, 'day'));
    });
  }, [schedule]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Seva Dashboard</h1>
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Today's Sevas</h2>
        {todaySevas.length === 0 ? <p className="text-sm text-slate-500">No sevas scheduled today.</p> : (
          <ul className="space-y-2 pt-2">
            {todaySevas.map((event) => (
              <li className="rounded-lg bg-slate-50 p-3" key={`${event.assignment_id}-${event.date}`}>
                <p className="font-medium">{event.seva_name}</p>
                <p className="text-sm">{event.sevekari_name} · {event.start_time} - {event.end_time}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Upcoming 7 Days</h2>
        {upcomingWeek.length === 0 ? <p className="text-sm text-slate-500">No upcoming sevas.</p> : (
          <ul className="space-y-2 pt-2">
            {upcomingWeek.map((event) => (
              <li className="rounded-lg bg-slate-50 p-3" key={`${event.assignment_id}-${event.date}-upcoming`}>
                <p className="font-medium">{event.date}: {event.seva_name}</p>
                <p className="text-sm">{event.sevekari_name} · {event.start_time} - {event.end_time}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
