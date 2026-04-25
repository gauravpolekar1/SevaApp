import { useEffect, useMemo, useState } from 'react';
import AssignmentForm from '../components/AssignmentForm';
import CalendarView from '../components/CalendarView';
import {
  assignSeva,
  deleteAssignment,
  getAssignments,
  getSchedule,
  getSevas,
  getSevekari,
  updateAssignment,
} from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

function SchedulePage() {
  const [sevas, setSevas] = useState([]);
  const [sevekari, setSevekari] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sevaNameById = useMemo(
    () =>
      sevas.reduce((acc, seva) => {
        acc[seva.seva_id] = seva.seva_name;
        return acc;
      }, {}),
    [sevas]
  );

  const sevekariNameById = useMemo(
    () =>
      sevekari.reduce((acc, person) => {
        acc[person.sevekari_id] = person.name;
        return acc;
      }, {}),
    [sevekari]
  );

  const loadData = async () => {
    try {
      const [sevaRes, sevekariRes, assignmentRes, scheduleRes] = await Promise.all([
        getSevas(),
        getSevekari(),
        getAssignments(),
        getSchedule(),
      ]);
      setSevas(sevaRes.data.data || []);
      setSevekari(sevekariRes.data.data || []);
      setAssignments(assignmentRes.data.data || []);
      setSchedule(scheduleRes.data.data || []);
      setError('');
    } catch (loadError) {
      setSevas([]);
      setSevekari([]);
      setAssignments([]);
      setSchedule([]);
      setError(getErrorMessage(loadError, 'Unable to load scheduling data from backend.'));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const response = editingAssignment?.assignment_id
        ? await updateAssignment({ ...payload, assignment_id: editingAssignment.assignment_id })
        : await assignSeva(payload);

      if (!response.data.success) {
        setError(response.data.message || 'Unable to save assignment.');
        return;
      }
      setEditingAssignment(null);
      await loadData();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to save assignment.'));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (assignmentId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!shouldDelete) return;

    setLoading(true);
    setError('');
    try {
      const response = await deleteAssignment(assignmentId);
      if (!response.data.success) {
        setError(response.data.message || 'Unable to delete assignment.');
        return;
      }
      if (editingAssignment?.assignment_id === assignmentId) {
        setEditingAssignment(null);
      }
      await loadData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete assignment.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <AssignmentForm
        sevas={sevas}
        sevekari={sevekari}
        onSubmit={onSubmit}
        loading={loading}
        initialData={editingAssignment}
        onCancel={() => setEditingAssignment(null)}
      />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Assignment List</h2>
        <div className="space-y-2 pt-3">
          {assignments.map((assignment) => (
            <article className="rounded-lg bg-slate-50 p-3" key={assignment.assignment_id}>
              <p className="font-medium">
                {sevaNameById[assignment.seva_id] || assignment.seva_id} → {sevekariNameById[assignment.sevekari_id] || assignment.sevekari_id}
              </p>
              <p className="text-sm">{assignment.start_date} to {assignment.end_date}</p>
              <p className="text-xs text-slate-500">Days: {assignment.recurrence_days}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded border px-3 py-1 text-sm" disabled={loading} onClick={() => setEditingAssignment(assignment)} type="button">Edit</button>
                <button className="rounded border border-red-400 px-3 py-1 text-sm text-red-700" disabled={loading} onClick={() => onDelete(assignment.assignment_id)} type="button">Delete</button>
              </div>
            </article>
          ))}
          {assignments.length === 0 && <p className="text-sm text-slate-500">No assignments found.</p>}
        </div>
      </div>
      <CalendarView schedule={schedule} />
    </section>
  );
}

export default SchedulePage;
