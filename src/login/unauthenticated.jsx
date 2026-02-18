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
        <form method="get" action="schedule.html">
            <div>
            <span>@</span>
            <input type="text" placeholder="your@email.com" />
            </div>
            <div>
            <span>🔒</span>
            <input type="password" placeholder="password" />
            </div>
            <button type="submit">Login</button>
            <button type="submit">Create</button>
        </form>
    );
}