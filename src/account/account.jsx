import React from 'react';
import './account.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../login/authState';
import { listAppointments, removeAppointment} from '../schedule/scheduleStorage';
import { addCar, listCars, removeCar, getProfile, setProfile} from './accountStorage';

export function Account({ userName: userNameProp, onAuthChange }) {
    const navigate = useNavigate();
    const userName = (userNameProp ?? localStorage.getItem('userName') ?? '').trim();
    const [profile, setProfileState] = React.useState({ userName, displayName: '' });
    const [editing, setEditing] = React.useState(false);
    const [displayNameDraft, setDisplayNameDraft] = React.useState('');
    const [appts, setAppts] = React.useState([]);
    const [cars, setCars] = React.useState([]);
    const [carsMsg, setCarsMsg] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [vin, setVin] = React.useState('');

    async function refreshAll() {
        try {
        setLoading(true);
        const [profileData, apptData, carData] = await Promise.all([
            getProfile(),
            listAppointments(),
            listCars(),
        ]);

        setProfileState(profileData);
        setDisplayNameDraft(profileData.displayName || '');
        setAppts(apptData);
        setCars(carData);
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    }

    React.useEffect(() => {
        if (!userName) return;
        refreshAll();
    }, [userName]);

    async function logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'DELETE',
                credentials: 'include',
            });
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('userName');
        if (onAuthChange) onAuthChange('', AuthState.Unauthenticated);
        navigate('/');
    }

    function editAccount(){
        setEditing(true);
        setDisplayNameDraft(profile.displayName || '');
    }

    async function saveEdit() {
        const res = await setProfile({
            ...profile,
            displayName: (displayNameDraft || '').trim(),
        });
        if (!res.ok) {
            return;
        }
        setProfileState(res.profile);
        setEditing(false);
    }

    function cancelEdit() {
        setEditing(false);
        setDisplayNameDraft(profile.displayName || '');
    }

    async function delAccount(){
        try {
            await fetch('/api/account', {
              method: 'DELETE',
              credentials: 'include',
            });
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('userName');
        if (onAuthChange) onAuthChange('', AuthState.Unauthenticated);
        navigate('/');
    }

    async function cancelAppt(apptId) {
        const res = await removeAppointment(apptId);
        if (!res.ok) return;
        setAppts(await listAppointments());
    }

    async function submitCar(e) {
        e.preventDefault();
        setCarsMsg('');

        const fd = new FormData(e.target);
        const car = {
            nickname: (fd.get('nickname') || '').toString().trim(),
            year: (fd.get('year') || '').toString().trim(),
            make: (fd.get('make') || '').toString().trim(),
            model: (fd.get('model') || '').toString().trim(),
            trim: (fd.get('trim') || '').toString().trim(),
            vinLast4: (fd.get('vinLast4') || '').toString().trim(),
            createdAt: new Date().toISOString(),
        };

        if (!car.year || !car.make || !car.model) {
        setCarsMsg('Please fill out Year, Make, and Model.');
        return;
        }
        if (car.vinLast4 && car.vinLast4.length !== 4) {
        setCarsMsg('VIN last 4 must be exactly 4 characters (or leave blank).');
        return;
        }

        const res = await addCar(car);
        if (!res.ok) {
        setCarsMsg(res.error || 'Could not add car.');
        return;
        }

        setCars(await listCars());
        e.target.reset();
        setCarsMsg('Car added!');
    }

    async function deleteCar(carId) {
        const res = await removeCar(carId);
        if (!res.ok) return;
        setCars(await listCars());
    }

    async function decodeVin() {
      setCarsMsg('');

      const cleanVin = vin.trim().toUpperCase();

      if (cleanVin.length !== 17) {
        setCarsMsg('VIN must be 17 characters.');
        return;
      }

      try {
        const res = await fetch(`/api/vehicle/decode-vin/${cleanVin}`, {
          credentials: 'include',
        });

        const body = await res.json();

        if (!res.ok) {
          setCarsMsg(body.msg || 'Could not decode VIN.');
          return;
        }

        // Auto-fill form fields
        const form = document.getElementById('addCarForm');
        if (form) {
          form.year.value = body.year || '';
          form.make.value = body.make || '';
          form.model.value = body.model || '';
          form.trim.value = body.trim || '';
          form.vinLast4.value = cleanVin.slice(-4);
        }

        setCarsMsg('VIN decoded successfully.');
        setVin('');
      } catch (err) {
        console.error(err);
        setCarsMsg('VIN lookup failed. Please check the VIN and try again.');
      }
    }

    function formatService(value) {
      return {
        tune: 'Performance Tune',
        inspect: 'Full Inspection',
        diagnostic: 'ECU Diagnostic',
        consult: 'Consulting',
      }[value] || value;
    }

    if (loading) {
        return <main className="accountPage"><p>Loading account...</p></main>;
    }

  return (
    <main className="accountPage">
      <h1>User Account</h1>
      <p>Welcome to your garage.</p>

      <section className="grid">
        <div className="card" aria-labelledby="acctInfoTitle">
          <h2 id="acctInfoTitle">Account Info</h2>
          <div className="kv" id="acctInfo">
            <div className="k">Username</div>
            <div className="v">{profile.userName || userName}</div>
          </div>

          <div className="kv-row">
            <div className="k">Display name</div>
            <div className="v">
              {editing ? (
                <input
                  className="inlineInput"
                  value={displayNameDraft}
                  onChange={(e) => setDisplayNameDraft(e.target.value)}
                  placeholder="Optional"
                />
              ) : (
                profile.displayName || <span className="muted">Not set</span>
              )}
            </div>
          </div>

          <div className="actions">
            {!editing ? (
              <Button variant="secondary" onClick={editAccount}>Edit</Button>
            ) : (
              <>
                <Button variant="primary" onClick={saveEdit}>Save</Button>
                <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
              </>
            )}
            <Button variant="outline-light" onClick={logout}>Log out</Button>
            <Button variant="danger" onClick={delAccount}>Delete Account</Button>
          </div>
        </div>

        <div className="card" aria-labelledby="apptListTitle">
          <h2 id="apptListTitle">Appointments</h2>
          {appts.length === 0 ? (
            <p className="muted">No upcoming appointments.</p>
          ) : (
            <ul className="list">
              {appts
                .slice()
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                .map((a) => (
                  <li key={a._id} className="item">
                    <div>
                      <div className="itemLine">
                        <strong>{a.date}</strong> at <strong>{a.time}</strong>
                      </div>
                      <div className="itemSub">{formatService(a.service)}</div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => cancelAppt(a._id)}
                    >
                      Cancel
                    </Button>
                  </li>
                ))}
            </ul>
          )}

          <Button variant="primary" onClick={() => navigate('/schedule')}>
            Make Appointments
          </Button>
        </div>

        <div className="card" aria-labelledby="vehListTitle">
          <h2 id="vehListTitle">Vehicles</h2>
          {cars.length === 0 ? (
            <p className="muted">No vehicles yet.</p>
          ) : (
            <div className="tableWrap">
              <table aria-label="Linked cars table" className="carsTable">
                <thead>
                  <tr>
                    <th>Nickname</th>
                    <th>Year</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Trim</th>
                    <th>VIN (last 4)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((c) => (
                    <tr key={c._id}>
                      <td>{c.nickname}</td>
                      <td>{c.year}</td>
                      <td>{c.make}</td>
                      <td>{c.model}</td>
                      <td>{c.trim || '-'}</td>
                      <td>{c.vinLast4 || '-'}</td>
                      <td className="right">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteCar(c._id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

            <h3 style={{ marginTop: '1rem' }}>Add a car</h3>

            <div className="actions" style={{ marginBottom: 10 }}>
              <input
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="Enter full VIN (17 characters)"
                maxLength={17}
              />
              <Button type="button" variant="secondary" onClick={decodeVin}>
                Decode VIN
              </Button>
            </div>

            <form id="addCarForm" onSubmit={submitCar}>
            <div className="actions">
              <input name="nickname" placeholder="Nickname (e.g., Daily)" required />
              <input name="year" placeholder="Year" inputMode="numeric" required />
              <input name="make" placeholder="Make" required />
              <input name="model" placeholder="Model" required />
              <input name="trim" placeholder="Trim (optional)" />
              <input name="vinLast4" placeholder="VIN last 4" maxLength={4} />
            </div>

            <div className="actions" style={{ marginTop: 10 }}>
              <Button type="submit" variant="primary">Add Car</Button>
            </div>
          </form>

          <p id="carsMsg" role="status" aria-live="polite" className="msg">{carsMsg}</p>
        </div>
      </section>
    </main>
  );
}

// export function CarPhotoUpload() {
//   const [file, setFile] = React.useState(null);
//   const [message, setMessage] = React.useState('');

//   async function handleUpload(e) {
//     e.preventDefault();

//     if (!file) {
//       setMessage('Please choose a file.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('photo', file);

//     const response = await fetch('/api/upload/car-photo', {
//       method: 'POST',
//       body: formData,
//       credentials: 'include',
//     });

//     const body = await response.json();
//     if (response.ok) {
//       setMessage(`Uploaded: ${body.fileName}`);
//     } else {
//       setMessage(body.msg || 'Upload failed');
//     }
//   }
//     return (
//     <form onSubmit={handleUpload}>
//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => setFile(e.target.files[0])}
//       />
//       <Button type="submit">Upload Car Photo</Button>
//       <p>{message}</p>
//     </form>
//   );
// }