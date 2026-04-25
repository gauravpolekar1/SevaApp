import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { getSchedule } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

const DISPLAY_TIME_FORMAT = 'HH:mm';

function formatScheduleTime(value) {
  if (!value && value !== 0) return '';

  const raw = String(value).trim();
  if (!raw) return '';

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    return raw.slice(0, 5);
  }

  const parsed = dayjs(raw);
  if (parsed.isValid()) {
    return parsed.format(DISPLAY_TIME_FORMAT);
  }

  return raw;
}

function Dashboard() {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getSchedule();
        setSchedule(response.data.data || []);
        setError('');
      } catch (loadError) {
        setSchedule([]);
        setError(getErrorMessage(loadError, 'Unable to load dashboard schedule from backend.'));
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
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Today's Sevas</h2>
        {todaySevas.length === 0 ? <p className="text-sm text-slate-500">No sevas scheduled today.</p> : (
          <ul className="space-y-2 pt-2">
            {todaySevas.map((event) => (
              <li className="rounded-lg bg-slate-50 p-3" key={`${event.assignment_id}-${event.date}`}>
                <p className="font-medium">{event.seva_name}</p>
                <p className="text-sm">{event.sevekari_name} · {formatScheduleTime(event.start_time)} - {formatScheduleTime(event.end_time)}</p>
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
                <p className="text-sm">{event.sevekari_name} · {formatScheduleTime(event.start_time)} - {formatScheduleTime(event.end_time)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
