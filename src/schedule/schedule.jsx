import React from 'react';
import './schedule.css';
import {
  listAppointments,
  addAppointment,
  removeAppointment,
} from './scheduleStorage';

const SERVICES = [
  { value: '', label: 'Choose one' },
  { value: 'tune', label: 'Performance Tune' },
  { value: 'inspect', label: 'Full Inspection' },
  { value: 'diagnostic', label: 'ECU Diagnostic' },
  { value: 'consult', label: 'Consulting' },
];

const SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
];

function newId() {
  return (globalThis.crypto?.randomUUID?.() ?? `appt_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

function formatService(value) {
  return SERVICES.find((s) => s.value === value)?.label ?? value;
}

export function Schedule({ userName }) {
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [service, setService] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [appts, setAppts] = React.useState(() => listAppointments(userName));

    // Continuous update
    React.useEffect(() => {
        setAppts(listAppointments(userName));
    }, [userName]);

    const onSelectSlot = (slotValue) => {
        setTime(slotValue);
        setMessage('');
    };

    const onClear = () => {
        setDate('');
        setTime('');
        setService('');
        setMessage('');
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        if (!userName) {
            setMessage('Authentication Error.');
            return;
        }
        if (!date) {
            setMessage('Pick a date.');
            return;
        }
        if (!time) {
            setMessage('Pick a time slot.');
            return;
        }
        if (!service) {
            setMessage('Choose a service.');
            return;
        }

        const appt = {
            id: newId(),
            userName,
            date,     // "YYYY-MM-DD"
            time,     // "HH:MM"
            service,
            createdAt: new Date().toISOString(),
        };

        const res = addAppointment(userName, appt);
            if (!res.ok) {
            setMessage(res.error || 'Could not schedule appointment.');
            return;
        }

        setAppts(listAppointments(userName));
        setMessage('Appointment scheduled!');
        setTime('');
    };

    const onCancel = (apptId) => {
        removeAppointment(userName, apptId);
        setAppts(listAppointments(userName));
        setMessage('Appointment cancelled.');
    };

    const bookedTimesForSelectedDate = React.useMemo(() => {
        if (!date) return new Set();
        return new Set(appts.filter((a) => a.date === date).map((a) => a.time));
    }, [appts, date]);

  return (
    <main className="schedule">
        <p className="note">Pick a date, choose a time slot, then submit.</p>

        {!userName && (
            <div className="banner" role="status">
            You are not logged in yet. Appointment will be saved once you log in.
            </div>
        )}

        <form id="apptForm" onSubmit={onSubmit} onReset={onClear}>
            <div className="row">
            <label htmlFor="apptDate"><strong>Date:</strong></label>
            <input
            id="apptDate"
            name="date"
            type="date"
            value={date}
            onChange={(e) => {setDate(e.target.value); setMessage('');}}
            required
            />
            </div>
            <div className="row">
            <strong>Time slot:</strong>
            <div className="slots" id="slots">
                {SLOTS.map((s) => {
                    const selected = time === s.value;
                    const booked = date && bookedTimesForSelectedDate.has(s.value);

                    return (
                        <button
                        key={s.value}
                        className={`slot ${selected ? 'selected' : ''}`}
                        type="button"
                        aria-pressed={selected}
                        disabled={booked}
                        title={booked ? 'Already booked for this account' : 'Select this time'}
                        onClick={() => {onSelectSlot(s.value);}}
                        >
                        {s.label}
                        </button>
                    );
                })}
            </div>

            <input type="hidden" id="apptTime" name="time" value={time} required />
                {time && <div className="picked">Selected: <strong>{time}</strong></div>}
            </div>

            <div className="row">
                <label htmlFor="service"><strong>Service:</strong></label>
                <select
                    id="service"
                    name="service"
                    value={service}
                    onChange={(e) => {setService(e.target.value); setMessage('');}}
                    required
                >
                    {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            <div className="actions">
            <button type="submit">Schedule appointment</button>
            <button type="reset">Clear</button>
            </div>
        </form>

        <p id="result" role="status" aria-live="polite">{message}</p>

        <section className="apptList" aria-labelledby="apptListTitle">
            <h2 id="apptListTitle">Your Appointments</h2>

            {userName && appts.length === 0 && (
            <p className="muted">No appointments yet.</p>
            )}

            {userName && appts.length > 0 && (
            <ul className="list">
                {appts
                .slice()
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                .map((a) => (
                    <li key={a.id} className="item">
                    <div className="itemMain">
                        <div className="itemLine">
                        <strong>{a.date}</strong> at <strong>{a.time}</strong>
                        </div>
                        <div className="itemSub">{formatService(a.service)}</div>
                    </div>
                    <button className="danger" type="button" onClick={() => onCancel(a.id)}>
                        Cancel
                    </button>
                    </li>
                ))}
            </ul>
            )}
        </section>

        </main>
  );
}