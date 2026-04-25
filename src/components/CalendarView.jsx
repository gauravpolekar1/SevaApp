import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const DISPLAY_TIME_FORMAT = 'HH:mm';
const EVENT_TIME_FORMAT = 'HH:mm:ss';

function normalizeTimeForEventDate(value) {
  if (!value && value !== 0) return '00:00:00';

  const raw = String(value).trim();
  if (!raw) return '00:00:00';

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    return raw.length === 5 ? `${raw}:00` : raw;
  }

  const parsed = dayjs(raw);
  if (parsed.isValid()) {
    return parsed.format(EVENT_TIME_FORMAT);
  }

  return '00:00:00';
}

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

function CalendarView({ schedule = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = useMemo(
    () =>
      schedule.map((entry) => ({
        id: entry.assignment_id,
        title: `${entry.seva_name} - ${entry.sevekari_name}`,
        start: `${entry.date}T${normalizeTimeForEventDate(entry.start_time)}`,
        end: `${entry.date}T${normalizeTimeForEventDate(entry.end_time)}`,
        extendedProps: entry,
      })),
    [schedule]
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
          height="auto"
        />
      </div>
      {selectedEvent && (
        <div className="rounded-xl border bg-white p-4 shadow">
          <h3 className="text-lg font-semibold">Event Details</h3>
          <p><strong>Seva:</strong> {selectedEvent.seva_name}</p>
          <p><strong>Sevekari:</strong> {selectedEvent.sevekari_name}</p>
          <p><strong>Date:</strong> {selectedEvent.date}</p>
          <p><strong>Time:</strong> {formatScheduleTime(selectedEvent.start_time)} - {formatScheduleTime(selectedEvent.end_time)}</p>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
