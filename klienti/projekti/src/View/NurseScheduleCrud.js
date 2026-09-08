import React, { useState, useEffect, Fragment } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  fetchSchedule,
  createScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
} from '../services/nurseScheduleService';
import { fetchInfermjeriData } from '../services/infermjeriService';
import '../CSS/DataTableControls.css';
import '../CSS/NurseSchedule.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHIFTS = ['Morning', 'Night', 'Off'];

// Sensible starting point for each shift - Admin can still type any time they want.
const DEFAULT_TIMES = {
  Morning: { start: '07:00', end: '15:00' },
  Night: { start: '15:00', end: '23:00' },
  Off: { start: '', end: '' },
};

const emptyForm = { id: null, nurseId: '', dayOfWeek: 'Monday', shift: 'Morning', startTime: '07:00', endTime: '15:00' };

const NurseScheduleCrud = () => {
  const [schedule, setSchedule] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadSchedule = () => {
    setLoading(true);
    setLoadError('');
    fetchSchedule()
      .then((data) => setSchedule(data))
      .catch((error) => {
        setLoadError('Could not load the nurse schedule. Please try again.');
        console.error('Error loading nurse schedule:', error.response ? error.response.data : error.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSchedule();
    fetchInfermjeriData()
      .then(setNurses)
      .catch((error) => console.error('Error loading nurses:', error.message));
  }, []);

  const extractErrors = (error) => {
    const data = error.response?.data;
    if (data && Array.isArray(data.errors) && data.errors.length > 0) return data.errors;
    if (data && Array.isArray(data.Errors) && data.Errors.length > 0) return data.Errors;
    return null;
  };

  const openAddModal = (day, shift) => {
    const defaults = DEFAULT_TIMES[shift] || DEFAULT_TIMES.Morning;
    setForm({ id: null, nurseId: '', dayOfWeek: day, shift, startTime: defaults.start, endTime: defaults.end });
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setForm({
      id: entry.id,
      nurseId: String(entry.nurseId),
      dayOfWeek: entry.dayOfWeek,
      shift: entry.shift,
      startTime: entry.startTime ? entry.startTime.slice(0, 5) : '',
      endTime: entry.endTime ? entry.endTime.slice(0, 5) : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleShiftChange = (shift) => {
    const defaults = DEFAULT_TIMES[shift] || DEFAULT_TIMES.Morning;
    setForm((prev) => ({ ...prev, shift, startTime: defaults.start, endTime: defaults.end }));
  };

  const handleSave = () => {
    if (!form.nurseId) {
      toast.error('Please select a nurse.');
      return;
    }
    if (form.shift !== 'Off' && (!form.startTime || !form.endTime)) {
      toast.error('Please set a start and end time for a working shift.');
      return;
    }

    const payload = {
      NurseId: Number(form.nurseId),
      DayOfWeek: form.dayOfWeek,
      Shift: form.shift,
      StartTime: form.shift === 'Off' ? null : `${form.startTime}:00`,
      EndTime: form.shift === 'Off' ? null : `${form.endTime}:00`,
    };

    const request = form.id
      ? updateScheduleEntry(form.id, payload)
      : createScheduleEntry(payload);

    request
      .then(() => {
        toast.success(form.id ? 'Schedule entry updated!' : 'Schedule entry added!');
        closeModal();
        loadSchedule();
      })
      .catch((error) => {
        const errors = extractErrors(error);
        if (errors) {
          errors.forEach((message) => toast.error(message));
        } else {
          toast.error('Error saving schedule entry.');
        }
        console.error('Error saving schedule entry:', error.response ? error.response.data : error.message);
      });
  };

  const handleDelete = (entry) => {
    if (!window.confirm(`Remove ${entry.nurseName} from ${entry.dayOfWeek} ${entry.shift}?`)) {
      return;
    }
    deleteScheduleEntry(entry.id)
      .then(() => {
        toast.success('Schedule entry removed.');
        loadSchedule();
      })
      .catch((error) => {
        toast.error('Error removing schedule entry.');
        console.error('Error deleting schedule entry:', error.response ? error.response.data : error.message);
      });
  };

  const entriesFor = (day, shift) =>
    schedule.filter((entry) => entry.dayOfWeek === day && entry.shift === shift);

  const formatTime = (time) => (time ? time.slice(0, 5) : '');

  return (
    <Fragment>
      <h1 style={{ textAlign: 'center', color: 'rgb(86, 168, 86)' }}>Nurse Schedule</h1>
      <ToastContainer />

      {loadError ? (
        <Container className="mt-4">
          <div className="dt-state dt-state--error">{loadError}</div>
        </Container>
      ) : loading ? (
        <Container className="mt-4">
          <div className="dt-state">Loading schedule...</div>
        </Container>
      ) : (
        <Container className="mt-4">
          <Table striped bordered hover variant="dark" className="nurse-schedule-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Morning</th>
                <th>Night</th>
                <th>Off</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td className="nurse-schedule-table__day">{day}</td>
                  {SHIFTS.map((shift) => (
                    <td key={shift}>
                      <div className="nurse-schedule-cell">
                        {entriesFor(day, shift).map((entry) => (
                          <div key={entry.id} className="nurse-schedule-entry">
                            <div className="nurse-schedule-entry__info">
                              <span className="nurse-schedule-entry__name">{entry.nurseName}</span>
                              {shift !== 'Off' && (
                                <span className="nurse-schedule-entry__time">
                                  {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                </span>
                              )}
                            </div>
                            <div className="nurse-schedule-entry__actions">
                              <Button size="sm" variant="success" onClick={() => openEditModal(entry)}>Edit</Button>
                              <Button size="sm" variant="outline-light" onClick={() => handleDelete(entry)}>Delete</Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="nurse-schedule-cell__add"
                          onClick={() => openAddModal(day, shift)}
                        >
                          + Assign
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      )}

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{form.id ? 'Edit Schedule Entry' : 'Assign Nurse'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="form-label">Day</label>
          <select
            className="form-select mb-3"
            value={form.dayOfWeek}
            onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          <label className="form-label">Nurse</label>
          <select
            className="form-select mb-3"
            value={form.nurseId}
            onChange={(e) => setForm((prev) => ({ ...prev, nurseId: e.target.value }))}
          >
            <option value="">Select nurse</option>
            {nurses.map((nurse) => (
              <option key={nurse.id_i} value={nurse.id_i}>
                {nurse.emri} {nurse.mbiemri}{nurse.pozita ? ` — ${nurse.pozita}` : ''}
              </option>
            ))}
          </select>

          <label className="form-label">Shift</label>
          <select
            className="form-select mb-3"
            value={form.shift}
            onChange={(e) => handleShiftChange(e.target.value)}
          >
            {SHIFTS.map((shift) => (
              <option key={shift} value={shift}>{shift}</option>
            ))}
          </select>

          {form.shift !== 'Off' && (
            <>
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control mb-3"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />

              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-control mb-3"
                value={form.endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default NurseScheduleCrud;
