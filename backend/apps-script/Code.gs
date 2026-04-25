const SHEET_NAME_SEVA = 'Seva_Master';
const SHEET_NAME_SEVEKARI = 'Sevekari_Master';
const SHEET_NAME_ASSIGNMENT = 'Seva_Assignment';
const SECRET_KEY = 'CHANGE_ME_SECRET';

function createResponse(data, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(data) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action;
    const callback = params.callback || '';

    if (action === 'getSevas') return createResponse({ success: true, data: getRows(SHEET_NAME_SEVA) }, callback);
    if (action === 'getSevekari') return createResponse({ success: true, data: getRows(SHEET_NAME_SEVEKARI) }, callback);
    if (action === 'getAssignments') return createResponse({ success: true, data: getRows(SHEET_NAME_ASSIGNMENT) }, callback);
    if (action === 'getSchedule') return createResponse({ success: true, data: buildSchedule() }, callback);

    return createResponse({ success: false, message: 'Invalid action' }, callback);
  } catch (err) {
    return createResponse({ success: false, message: 'Internal server error: ' + (err.message || err.toString()) });
  }
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const rawBody = (e && e.postData && e.postData.contents) ? String(e.postData.contents) : '';
    let payload = {};
    try {
      // Support both JSON body and form-urlencoded (payload=JSON) for CORS compatibility
      if (rawBody.trim().startsWith('{')) {
        payload = JSON.parse(rawBody);
      } else {
        const formParams = parseFormUrlEncoded(rawBody);
        payload = formParams.payload ? JSON.parse(formParams.payload) : {};
      }
    } catch (parseErr) {
      return createResponse({ success: false, message: 'Invalid request body' });
    }

    if (payload.secretKey !== SECRET_KEY) {
      return createResponse({ success: false, message: 'Unauthorized' });
    }

    // Action can be in URL query (e.parameter) or in JSON body (payload.action) - POST often omits query in e.parameter
    const action = params.action || payload.action || '';

    if (action === 'createSeva') return createResponse(createSeva(payload));
    if (action === 'updateSeva') return createResponse(updateSeva(payload));
    if (action === 'deleteSeva') return createResponse(deleteSeva(payload));
    if (action === 'createSevekari') return createResponse(createSevekari(payload));
    if (action === 'updateSevekari') return createResponse(updateSevekari(payload));
    if (action === 'deleteSevekari') return createResponse(deleteSevekari(payload));
    if (action === 'assignSeva') return createResponse(assignSeva(payload));
    if (action === 'updateAssignment') return createResponse(updateAssignment(payload));
    if (action === 'deleteAssignment') return createResponse(deleteAssignment(payload));

    return createResponse({ success: false, message: 'Invalid action' });
  } catch (err) {
    return createResponse({ success: false, message: 'Internal server error: ' + (err.message || err.toString()) });
  }
}

function createSeva(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_SEVA);
  if (!sheet) return { success: false, message: 'Sheet not found: ' + SHEET_NAME_SEVA };
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

function updateSeva(payload) {
  const sevas = mapById(getRows(SHEET_NAME_SEVA), 'seva_id');
  const existingSeva = sevas[payload.seva_id];
  if (!existingSeva) return { success: false, message: 'seva_id not found' };

  const nextStartTime = payload.start_time || existingSeva.start_time;
  const nextEndTime = payload.end_time || existingSeva.end_time;
  const overlapValidation = validateSevaUpdateConflict(payload.seva_id, nextStartTime, nextEndTime);
  if (!overlapValidation.success) return overlapValidation;

  return updateRowById(
    SHEET_NAME_SEVA,
    'seva_id',
    payload.seva_id,
    {
      seva_name: payload.seva_name || existingSeva.seva_name,
      description: payload.description || existingSeva.description,
      start_time: nextStartTime,
      end_time: nextEndTime,
      recurrence_type: payload.recurrence_type || existingSeva.recurrence_type || 'weekly',
      recurrence_days: payload.recurrence_days || existingSeva.recurrence_days,
      updated_at: new Date().toISOString()
    }
  );
}

function deleteSeva(payload) {
  return deleteRowById(SHEET_NAME_SEVA, 'seva_id', payload.seva_id);
}

function createSevekari(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_SEVEKARI);
  if (!sheet) return { success: false, message: 'Sheet not found: ' + SHEET_NAME_SEVEKARI };
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

function updateSevekari(payload) {
  return updateRowById(
    SHEET_NAME_SEVEKARI,
    'sevekari_id',
    payload.sevekari_id,
    {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      availability_days: payload.availability_days,
      notes: payload.notes,
      updated_at: new Date().toISOString()
    }
  );
}

function deleteSevekari(payload) {
  return deleteRowById(SHEET_NAME_SEVEKARI, 'sevekari_id', payload.sevekari_id);
}

function assignSeva(payload) {
  const assignmentValidation = validateAssignmentConflict(payload);
  if (!assignmentValidation.success) return assignmentValidation;

  const assignmentId = 'ASSIGN-' + new Date().getTime();
  const assignmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ASSIGNMENT);
  if (!assignmentSheet) return { success: false, message: 'Sheet not found: ' + SHEET_NAME_ASSIGNMENT };
  assignmentSheet.appendRow([
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

function updateAssignment(payload) {
  const assignmentValidation = validateAssignmentConflict(payload, payload.assignment_id);
  if (!assignmentValidation.success) return assignmentValidation;

  return updateRowById(
    SHEET_NAME_ASSIGNMENT,
    'assignment_id',
    payload.assignment_id,
    {
      seva_id: payload.seva_id,
      sevekari_id: payload.sevekari_id,
      start_date: payload.start_date,
      end_date: payload.end_date,
      recurrence_type: payload.recurrence_type || 'weekly',
      recurrence_days: payload.recurrence_days,
      updated_at: new Date().toISOString()
    }
  );
}

function deleteAssignment(payload) {
  return deleteRowById(SHEET_NAME_ASSIGNMENT, 'assignment_id', payload.assignment_id);
}

function validateAssignmentConflict(payload, excludedAssignmentId) {
  const schedule = buildSchedule();
  const sevas = mapById(getRows(SHEET_NAME_SEVA), 'seva_id');
  const selectedSeva = sevas[payload.seva_id];

  if (!selectedSeva) {
    return { success: false, message: 'Invalid seva_id' };
  }

  const expandedDates = expandDates(payload.start_date, payload.end_date, payload.recurrence_days);
  for (let i = 0; i < expandedDates.length; i++) {
    const currentDate = expandedDates[i];
    const conflict = schedule.some(function (event) {
      if (excludedAssignmentId && event.assignment_id === excludedAssignmentId) return false;
      if (event.sevekari_id !== payload.sevekari_id || event.date !== currentDate) return false;
      return timeOverlap(selectedSeva.start_time, selectedSeva.end_time, event.start_time, event.end_time);
    });

    if (conflict) {
      return { success: false, message: 'Time conflict detected' };
    }
  }

  return { success: true };
}

function validateSevaUpdateConflict(sevaId, nextStartTime, nextEndTime) {
  const assignments = getRows(SHEET_NAME_ASSIGNMENT).filter(function (assignment) {
    return String(assignment.seva_id) === String(sevaId);
  });

  if (assignments.length === 0) return { success: true };

  const schedule = buildSchedule();

  for (let i = 0; i < assignments.length; i += 1) {
    const assignment = assignments[i];
    const expandedDates = expandDates(assignment.start_date, assignment.end_date, assignment.recurrence_days);

    for (let j = 0; j < expandedDates.length; j += 1) {
      const currentDate = expandedDates[j];
      const conflict = schedule.some(function (event) {
        if (event.assignment_id === assignment.assignment_id) return false;
        if (event.sevekari_id !== assignment.sevekari_id || event.date !== currentDate) return false;
        return timeOverlap(nextStartTime, nextEndTime, event.start_time, event.end_time);
      });

      if (conflict) {
        return {
          success: false,
          message: 'Time conflict detected for existing assignment(s). Update blocked.'
        };
      }
    }
  }

  return { success: true };
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
  if (!recurrenceDays || typeof recurrenceDays !== 'string') return [];
  const wantedDays = recurrenceDays.split(',').map(function (d) { return d.trim(); });
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);
  if (!start || !end) return [];

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

function parseDateValue(value) {
  if (!value && value !== 0) return null;

  if (Object.prototype.toString.call(value) === '[object Date]') {
    const normalized = new Date(value.getTime());
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  const text = String(value).trim();
  if (!text) return null;

  // Most common input format from Sheets/API: YYYY-MM-DD
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  // Fallback for locale/date-time text values that may come from Sheets.
  const parsed = new Date(text);
  if (isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
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
  if (!sheet) return [];
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

function updateRowById(sheetName, idField, idValue, updates) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: 'Sheet not found: ' + sheetName };

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { success: false, message: 'No records found.' };

  const headers = values[0];
  const idColumn = headers.indexOf(idField);
  if (idColumn === -1) return { success: false, message: 'Invalid id field: ' + idField };

  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    if (String(values[rowIndex][idColumn]) !== String(idValue)) continue;

    headers.forEach(function (header, index) {
      if (Object.prototype.hasOwnProperty.call(updates, header)) {
        values[rowIndex][index] = updates[header];
      }
    });

    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([values[rowIndex]]);
    return { success: true };
  }

  return { success: false, message: idField + ' not found' };
}

function deleteRowById(sheetName, idField, idValue) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: 'Sheet not found: ' + sheetName };

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { success: false, message: 'No records found.' };

  const headers = values[0];
  const idColumn = headers.indexOf(idField);
  if (idColumn === -1) return { success: false, message: 'Invalid id field: ' + idField };

  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    if (String(values[rowIndex][idColumn]) !== String(idValue)) continue;
    sheet.deleteRow(rowIndex + 1);
    return { success: true };
  }

  return { success: false, message: idField + ' not found' };
}

function parseFormUrlEncoded(str) {
  const out = {};
  if (!str) return out;
  str.split('&').forEach(function (pair) {
    const i = pair.indexOf('=');
    if (i === -1) return;
    const key = decodeURIComponent(pair.substring(0, i).replace(/\+/g, ' '));
    const val = decodeURIComponent(pair.substring(i + 1).replace(/\+/g, ' '));
    out[key] = val;
  });
  return out;
}

//function jsonResponse(payload) {
//return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
//}
