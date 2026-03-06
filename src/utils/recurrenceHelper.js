import dayjs from 'dayjs';

const dayNameMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const parseDays = (days = '') =>
  days
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);

export const expandRecurringDates = ({ startDate, endDate, recurrenceDays }) => {
  const validDays = parseDays(recurrenceDays);
  const dates = [];
  let cursor = dayjs(startDate);
  const last = dayjs(endDate);

  while (cursor.isBefore(last) || cursor.isSame(last, 'day')) {
    if (validDays.includes(dayNameMap[cursor.day()])) {
      dates.push(cursor.format('YYYY-MM-DD'));
    }
    cursor = cursor.add(1, 'day');
  }

  return dates;
};

export const hasTimeConflict = (newEvent, existingEvents) => {
  const newStart = dayjs(`${newEvent.date} ${newEvent.start_time}`);
  const newEnd = dayjs(`${newEvent.date} ${newEvent.end_time}`);

  return existingEvents.some((event) => {
    if (event.sevekari_id !== newEvent.sevekari_id || event.date !== newEvent.date) {
      return false;
    }

    const existingStart = dayjs(`${event.date} ${event.start_time}`);
    const existingEnd = dayjs(`${event.date} ${event.end_time}`);

    return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
  });
};
