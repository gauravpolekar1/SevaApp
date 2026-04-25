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
  const [selectedSeva, setSelectedSeva] = useState('all');
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
    const todayDate = dayjs();
    const end = todayDate.add(7, 'day');

    return schedule
      .filter((item) => {
        const date = dayjs(item.date);
        return (date.isAfter(todayDate, 'day') || date.isSame(todayDate, 'day'))
          && (date.isBefore(end, 'day') || date.isSame(end, 'day'));
      })
      .sort((a, b) => {
        if (a.date === b.date) {
          return String(a.start_time || '').localeCompare(String(b.start_time || ''));
        }
        return String(a.date).localeCompare(String(b.date));
      });
  }, [schedule]);

  const upcomingSevaOptions = useMemo(
    () => Array.from(new Set(upcomingWeek.map((item) => item.seva_name))).sort((a, b) => a.localeCompare(b)),
    [upcomingWeek]
  );

  const filteredUpcomingWeek = useMemo(() => {
    if (selectedSeva === 'all') return upcomingWeek;
    return upcomingWeek.filter((item) => item.seva_name === selectedSeva);
  }, [upcomingWeek, selectedSeva]);

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Upcoming 7 Days</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span>Filter by Seva:</span>
            <select
              className="rounded border p-2"
              value={selectedSeva}
              onChange={(event) => setSelectedSeva(event.target.value)}
            >
              <option value="all">All Sevas</option>
              {upcomingSevaOptions.map((sevaName) => (
                <option key={sevaName} value={sevaName}>{sevaName}</option>
              ))}
            </select>
          </label>
        </div>

        {filteredUpcomingWeek.length === 0 ? <p className="pt-2 text-sm text-slate-500">No upcoming sevas.</p> : (
          <ul className="space-y-2 pt-2">
            {filteredUpcomingWeek.map((event) => (
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
