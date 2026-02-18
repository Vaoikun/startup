import React from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

export function Account(props) {
    const navigate = useNavigate();

    function editAccount(){

    }

    function delAccout(){

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
                        <button type="submit">Add</button>
                        </div>
                    </form>
                    <p id="carsMsg" role="status" aria-live="polite"></p>
                </div>
            </section>
        </main>
  );
}