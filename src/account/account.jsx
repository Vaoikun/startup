import React from 'react';
import './account.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../login/authState';
import { listAppointments, removeAppointment, clearAppointments } from '../schedule/scheduleStorage';
import { addCar, listCars, removeCar, getProfile, setProfile, clearProfile, clearCars } from './accountStorage';

function newId() {
    return (globalThis.crypto?.randomUUID?.() ??
        `id_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

export function Account({ userName: userNameProp, onAuthChange }) {
    const navigate = useNavigate();
    const userName = (userNameProp ?? localStorage.getItem('userName') ?? '').trim();
    const [profile, setProfileState] = React.useState(() => getProfile(userName));
    const [editing, setEditing] = React.useState(false);
    const [displayNameDraft, setDisplayNameDraft] = React.useState(profile.displayName || '');
    const [appts, setAppts] = React.useState(() => listAppointments(userName));
    const [cars, setCars] = React.useState(() => listCars(userName));
    const [carsMsg, setCarsMsg] = React.useState('');

    React.useEffect(() => {
        setProfileState(getProfile(userName));
        setDisplayNameDraft(getProfile(userName).displayName || '');
        setAppts(listAppointments(userName));
        setCars(listCars(userName));
    }, [userName]);

    function logout() {
        localStorage.removeItem('userName');
        if (onAuthChange) onAuthChange('', AuthState.Unauthenticated);
        navigate('/');
    }

    function editAccount(){
        setEditing(true);
        setDisplayNameDraft(profile.displayName || '');
    }

    function saveEdit() {
        const next = { ...profile, displayName: (displayNameDraft || '').trim() };
        setProfile(userName, next);
        setProfileState(next);
        setEditing(false);
    }

    function cancelEdit() {
        setEditing(false);
        setDisplayNameDraft(profile.displayName || '');
    }

    function delAccout(){
        clearAppointments(userName);
        clearCars(userName);
        clearProfile(userName);

        localStorage.removeItem('userName');
        if (onAuthChange) onAuthChange('', AuthState.Unauthenticated);
        navigate('/');
    }

    function cancelAppt(apptId) {
        removeAppointment(userName, apptId);
        setAppts(listAppointments(userName));
    }

  return (
    <main>
            <h1>User Account</h1>
            <p>Welcome to your garage.</p>

            <section className="grid">
                 <div className="card" aria-labelledby="acctInfoTitle">
                    <h2 id="acctInfoTitle">Account Info</h2>
                    <div className="kv" id="acctInfo">
                    </div>

                    <div className="actions">
                        <Button variant='secondary' onClick={() => editAccount()}>
                            Edit
                        </Button>
                        <Button variant='secondary' onClick={() => delAccout()}>
                            Delete Account
                        </Button>
                    </div>
                </div>
                <div className="card" aria-labelledby="apptListTitle">
                    <h2 id="apptListTitle">Appointments</h2>
                    <div id="apptList">
                        <p>No upcoming appointments.</p>
                    </div>
                    <Button variant='primary' onClick={() => navigate('/schedule')}>
                        Make Appointments
                    </Button>
                </div>
                <div className="card" aria-labelledby="vehListTitle">
                    <h2 id="vehListTitle">Vehicles</h2>
                    <div id="vehList">
                    </div>
                    <table aria-label="Linked cars table">
                        <thead>
                        <tr>
                            <th>Nickname</th>
                            <th>Year</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Trim</th>
                            <th>VIN (last 4)</th>
                        </tr>
                        </thead>
                        <tbody id="carsTbody"></tbody>
                    </table>
                    <h3 style={{ marginTop: '1rem' }}>Add a car</h3>
                    <form id="addCarForm">
                        <div className="actions">
                        <input name="nickname" placeholder="Nickname (e.g., Daily)" required />
                        <input name="year" placeholder="Year" inputMode="numeric" required />
                        <input name="make" placeholder="Make" required />
                        <input name="model" placeholder="Model" required />
                        <input name="trim" placeholder="Trim (optional)" />
                        <input name="vinLast4" placeholder="VIN last 4" maxLength={4} />
                        </div>
                    </form>
                    <Button variant='primary' onClick={() => 0}>
                        Add a Car
                    </Button>
                    <p id="carsMsg" role="status" aria-live="polite"></p>
                </div>
            </section>
        </main>
  );
}