const SHEET_NAME_SEVA = 'Seva_Master';
const SHEET_NAME_SEVEKARI = 'Sevekari_Master';
const SHEET_NAME_ASSIGNMENT = 'Seva_Assignment';
const SECRET_KEY = 'CHANGE_ME_SECRET';
const ALLOWED_ORIGIN = "https://gauravpolekar1.github.io";

function createResponse(data, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(data) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doOptions() {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doGet(e) {
  const action = e.parameter.action;
  const callback = (e.parameter && e.parameter.callback) || '';

  if (action === 'getSevas') return createResponse({ success: true, data: getRows(SHEET_NAME_SEVA) }, callback);
  if (action === 'getSevekari') return createResponse({ success: true, data: getRows(SHEET_NAME_SEVEKARI) }, callback);
  if (action === 'getAssignments') return createResponse({ success: true, data: getRows(SHEET_NAME_ASSIGNMENT) }, callback);
  if (action === 'getSchedule') return createResponse({ success: true, data: buildSchedule() }, callback);

  return createResponse({ success: false, message: 'Invalid action' }, callback);
}

function doPost(e) {
  const action = (e.parameter && e.parameter.action) || '';
  const payload = JSON.parse(e.postData.contents || '{}');

  if (payload.secretKey !== SECRET_KEY) {
    return createResponse({ success: false, message: 'Unauthorized' });
  }

  if (action === 'createSeva') return createResponse(createSeva(payload));
  if (action === 'createSevekari') return createResponse(createSevekari(payload));
  if (action === 'assignSeva') return createResponse(assignSeva(payload));

  return createResponse({ success: false, message: 'Invalid action' });
}

function createSeva(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_SEVA);
  const sevaId = 'SEVA-' + new Date().getTime();
  sheet.appendRow([
    sevaId,
    payload.seva_name,
    payload.description,
    payload.start_time,
    payload.end_time,
    payload.recurrence_type || 'weekly',
    payload.recurrence_days,
    true,
    new Date().toISOString()
  ]);
  return { success: true, data: { seva_id: sevaId } };
}

function createSevekari(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_SEVEKARI);
  const sevekariId = 'SEVEKARI-' + new Date().getTime();
  sheet.appendRow([
    sevekariId,
    payload.name,
    payload.phone,
    payload.email,
    payload.availability_days,
    payload.notes,
    true,
    new Date().toISOString()
  ]);
  return { success: true, data: { sevekari_id: sevekariId } };
}

function assignSeva(payload) {
  const schedule = buildSchedule();
  const sevas = mapById(getRows(SHEET_NAME_SEVA), 'seva_id');
  const selectedSeva = sevas[payload.seva_id];

  if (!selectedSeva) {
    return { success: false, message: 'Invalid seva_id' };
  }

  const expandedDates = expandDates(payload.start_date, payload.end_date, payload.recurrence_days);
  for (let i = 0; i < expandedDates.length; i++) {
    const currentDate = expandedDates[i];
    const conflict = schedule.some((event) => {
      if (event.sevekari_id !== payload.sevekari_id || event.date !== currentDate) return false;
      return timeOverlap(selectedSeva.start_time, selectedSeva.end_time, event.start_time, event.end_time);
    });

    if (conflict) {
      return { success: false, message: 'Time conflict detected' };
    }
  }

  const assignmentId = 'ASSIGN-' + new Date().getTime();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ASSIGNMENT).appendRow([
    assignmentId,
    payload.seva_id,
    payload.sevekari_id,
    payload.start_date,
    payload.end_date,
    payload.recurrence_type || 'weekly',
    payload.recurrence_days,
    new Date().toISOString()
  ]);

  return { success: true, data: { assignment_id: assignmentId } };
}

function buildSchedule() {
  const sevas = mapById(getRows(SHEET_NAME_SEVA), 'seva_id');
  const sevekari = mapById(getRows(SHEET_NAME_SEVEKARI), 'sevekari_id');
  const assignments = getRows(SHEET_NAME_ASSIGNMENT);

  const output = [];
  assignments.forEach((assignment) => {
    const seva = sevas[assignment.seva_id];
    const person = sevekari[assignment.sevekari_id];
    if (!seva || !person) return;

    const dates = expandDates(assignment.start_date, assignment.end_date, assignment.recurrence_days);
    dates.forEach((date) => {
      output.push({
        assignment_id: assignment.assignment_id,
        seva_id: assignment.seva_id,
        seva_name: seva.seva_name,
        sevekari_id: assignment.sevekari_id,
        sevekari_name: person.name,
        date,
        start_time: seva.start_time,
        end_time: seva.end_time,
      });
    });
  });

  return output;
}

function expandDates(startDate, endDate, recurrenceDays) {
  const wantedDays = recurrenceDays.split(',').map(function (d) { return d.trim(); });
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    if (wantedDays.indexOf(dayMap[cursor.getDay()]) > -1) {
      dates.push(Utilities.formatDate(cursor, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function timeOverlap(startA, endA, startB, endB) {
  const start1 = toMinutes(startA);
  const end1 = toMinutes(endA);
  const start2 = toMinutes(startB);
  const end2 = toMinutes(endB);
  return start1 < end2 && end1 > start2;
}

function toMinutes(timeText) {
  const parts = timeText.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function getRows(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];

  return values.slice(1).filter((row) => row.join('') !== '').map(function (row) {
    const item = {};
    headers.forEach(function (header, index) {
      item[header] = row[index];
    });
    return item;
  });
}

function mapById(rows, idField) {
  return rows.reduce(function (acc, row) {
    acc[row[idField]] = row;
    return acc;
  }, {});
}

//function jsonResponse(payload) {
  //return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
//}