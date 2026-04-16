import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

import './authenticated.css';

export function Authenticated(props) {
    const navigate = useNavigate();

    function logout() {
        fetch(`/api/auth/logout`, {
        method: 'delete',
        })
        .catch(() => {
            // Logout failed.
        })
        .finally(() => {
            localStorage.removeItem('userName');
            props.onLogout();
        });
    }

    return (
        <div>
            <div className='accountName'>{props.userName}</div>
            <Button variant='primary' onClick={() => navigate('/account')}>
                Go to Account
            </Button>
            <Button variant='secondary' onClick={() => logout()}>
                Logout
            </Button>
        </div>
    );
}