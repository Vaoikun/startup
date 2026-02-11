import React from 'react';

export function Account() {
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
                        <button type="button" id="editAcctBtn">Edit</button>
                        <button type="button" id="delAcctBtn">Delete</button>
                    </div>
                </div>
                <div className="card" aria-labelledby="apptListTitle">
                    <h2 id="apptListTitle">Appointments</h2>
                    <div id="apptList">
                        <p>No upcoming appointments.</p>
                    </div>
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
                    <h3 style="margin-top: 1rem;">Add a car</h3>
                    <form id="addCarForm">
                        <div className="actions">
                        <input name="nickname" placeholder="Nickname (e.g., Daily)" required />
                        <input name="year" placeholder="Year" inputmode="numeric" required />
                        <input name="make" placeholder="Make" required />
                        <input name="model" placeholder="Model" required />
                        <input name="trim" placeholder="Trim (optional)" />
                        <input name="vinLast4" placeholder="VIN last 4" maxlength="4" />
                        <button type="submit">Add</button>
                        </div>
                    </form>
                    <p id="carsMsg" role="status" aria-live="polite"></p>
                </div>
            </section>
        </main>
  );
}