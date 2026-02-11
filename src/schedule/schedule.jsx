import React from 'react';

export function Schedule() {
  return (
    <main>
        <p className="note">Pick a date, choose a time slot, then submit.</p>

        <form id="apptForm">
            <div className="row">
            <label for="apptDate"><strong>Date:</strong></label><br />
            <input id="apptDate" name="date" type="date" required />
            </div>
            <div className="row">
            <strong>Time slot:</strong>
            <div className="slots" id="slots">
                <button className="slot" type="button" data-time="09:00">9:00 AM</button>
                <button className="slot" type="button" data-time="10:00">10:00 AM</button>
                <button className="slot" type="button" data-time="11:00">11:00 AM</button>
                <button className="slot" type="button" data-time="13:00">1:00 PM</button>
                <button className="slot" type="button" data-time="14:00">2:00 PM</button>
                <button className="slot" type="button" data-time="15:00">3:00 PM</button>
            </div>

            <input type="hidden" id="apptTime" name="time" required />
            </div>

            <div className="row">
            <label for="service"><strong>Service:</strong></label><br />
            <select id="service" name="service" required>
                <option value="">Choose one…</option>
                <option value="tune">Performance Tune</option>
                <option value="inspect">Full Inspection</option>
                <option value="diagnostic">ECU Diagnostic</option>
                <option value="consult">Consulting</option>
            </select>
            </div>

            <div className="actions">
            <button type="submit">Schedule appointment</button>
            <button type="reset">Clear</button>
            </div>
        </form>
        <p id="result" role="status" aria-live="polite"></p>
        </main>
  );
}