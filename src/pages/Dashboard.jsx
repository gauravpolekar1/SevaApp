import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { getSchedule } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

const DISPLAY_TIME_FORMAT = 'HH:mm';
const ALL_SEVAS_FILTER = 'all';

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
  const [selectedSevaId, setSelectedSevaId] = useState(ALL_SEVAS_FILTER);

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

  const upcomingSevaOptions = useMemo(() => {
    const seen = new Set();
    return upcomingWeek
      .filter((item) => {
        const key = `${item.seva_id}:${item.seva_name}`;
        if (!item.seva_id || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item) => ({ seva_id: item.seva_id, seva_name: item.seva_name }))
      .sort((a, b) => a.seva_name.localeCompare(b.seva_name));
  }, [upcomingWeek]);

  useEffect(() => {
    if (selectedSevaId === ALL_SEVAS_FILTER) return;
    const isValidSelection = upcomingSevaOptions.some((option) => option.seva_id === selectedSevaId);
    if (!isValidSelection) {
      setSelectedSevaId(ALL_SEVAS_FILTER);
    }
  }, [selectedSevaId, upcomingSevaOptions]);

  const filteredUpcomingWeek = useMemo(() => {
    if (selectedSevaId === ALL_SEVAS_FILTER) return upcomingWeek;
    return upcomingWeek.filter((item) => item.seva_id === selectedSevaId);
  }, [selectedSevaId, upcomingWeek]);

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Upcoming 7 Days</h2>
          <label className="flex items-center gap-2 text-sm text-slate-600" htmlFor="upcoming-seva-filter">
            <span>Filter by Seva:</span>
            <select
              id="upcoming-seva-filter"
              className="rounded border p-1.5"
              value={selectedSevaId}
              onChange={(event) => setSelectedSevaId(event.target.value)}
            >
              <option value={ALL_SEVAS_FILTER}>All Sevas</option>
              {upcomingSevaOptions.map((seva) => (
                <option key={seva.seva_id} value={seva.seva_id}>{seva.seva_name}</option>
              ))}
            </select>
          </label>
        </div>
        {filteredUpcomingWeek.length === 0 ? <p className="pt-2 text-sm text-slate-500">No upcoming sevas for selected filter.</p> : (
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
