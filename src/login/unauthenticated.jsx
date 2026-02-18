import React from 'react';

import Button from 'react-bootstrap/Button';
import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
    const [userName, setUserName] = React.useState(props.userName);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);

    async function loginUser() {
        localStorage.setItem('userName', userName);
        props.onLogin(userName);
    }

    async function createUser() {
        localStorage.setItem('userName', userName);
        props.onLogin(userName);
    }

    return (
        <>
        <form method="get" action="schedule.html">
            <div className="input-group mb-3">
                <span >@</span>
                <input className='form-control'  type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="input-group mb-3">
                <span >🔒</span>
                <input className='form-control' type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password" />
            </div>
            <Button variant='primary' onClick={() => loginUser()} disabled={!userName || !password}>
            Login
            </Button>
            <Button variant='secondary' onClick={() => createUser()} disabled={!userName || !password}>
            Create
            </Button>
        </form>

        <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
        </>
    );
}