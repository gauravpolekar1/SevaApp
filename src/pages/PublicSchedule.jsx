import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ViewToggle from '../components/ViewToggle';
import ScheduleList from '../components/ScheduleList';
import { getSchedule } from '../services/api';

const CACHE_KEY = 'public-seva-schedule-cache-v1';
const CACHE_TTL_MS = 60 * 1000;

function PublicSchedule() {
  const [view, setView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadSchedule = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          setSchedule(parsed.data || []);
          if (!silent) setLoading(false);
          return;
        }
      }

      const response = await getSchedule();
      const data = response.data?.data || [];
      setSchedule(data);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        })
      );
    } catch (error) {
      setSchedule([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadSchedule();

    const intervalId = window.setInterval(() => {
      localStorage.removeItem(CACHE_KEY);
      loadSchedule({ silent: true });
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const monthEvents = useMemo(
    () =>
      schedule.map((item, index) => ({
        id: `${item.assignment_id || 'event'}-${index}`,
        title: `${item.seva_name} · ${item.sevekari_name}`,
        start: `${item.date}T${item.start_time}`,
        end: `${item.date}T${item.end_time}`,
        extendedProps: item,
      })),
    [schedule]
  );

  const shiftDate = (direction) => {
    const current = dayjs(selectedDate);
    const amount = view === 'monthly' ? 1 : view === 'weekly' ? 7 : 1;
    const unit = view === 'monthly' ? 'month' : 'day';
    setSelectedDate(current.add(direction * amount, unit).format('YYYY-MM-DD'));
  };

  return (
    <section className="mx-auto min-h-screen max-w-xl space-y-4 bg-white p-4">
      <header className="space-y-3">
        <h1 className="text-xl font-bold">Temple Seva Schedule</h1>
        <ViewToggle value={view} onChange={setView} />
        <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-2">
          <button type="button" onClick={() => shiftDate(-1)} className="rounded-lg bg-white px-4 py-2 text-sm">
            Prev
          </button>
          <p className="text-sm font-medium">
            {view === 'weekly'
              ? `${dayjs(selectedDate).startOf('week').format('DD MMM')} - ${dayjs(selectedDate)
                  .endOf('week')
                  .format('DD MMM')}`
              : dayjs(selectedDate).format('DD MMM YYYY')}
          </p>
          <button type="button" onClick={() => shiftDate(1)} className="rounded-lg bg-white px-4 py-2 text-sm">
            Next
          </button>
        </div>
      </header>

      {loading ? (
        <p className="rounded-lg border p-3 text-sm text-slate-500">Loading schedule...</p>
      ) : view === 'monthly' ? (
        <div className="rounded-xl border p-2">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={selectedDate}
            headerToolbar={false}
            fixedWeekCount={false}
            events={monthEvents}
            height="auto"
            eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
          />
        </div>
      ) : (
        <ScheduleList mode={view} schedule={schedule} selectedDate={selectedDate} />
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-20 flex items-end bg-black/40 p-3" onClick={() => setSelectedEvent(null)}>
          <div className="w-full rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold">Seva Details</h2>
            <p className="mt-2 text-sm"><strong>Seva:</strong> {selectedEvent.seva_name}</p>
            <p className="text-sm"><strong>Sevekari:</strong> {selectedEvent.sevekari_name}</p>
            <p className="text-sm"><strong>Date:</strong> {selectedEvent.date}</p>
            <p className="text-sm"><strong>Time:</strong> {selectedEvent.start_time} - {selectedEvent.end_time}</p>
            <button className="mt-3 w-full rounded-lg bg-orange-600 py-2 text-sm font-medium text-white" onClick={() => setSelectedEvent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default PublicSchedule;
