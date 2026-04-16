import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './authenticated.css';

export function Authenticated({ userName, onLogout }) {
  const navigate = useNavigate();

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('userName');
      onLogout();
    }
  }

  return (
    <div>
      <div className="accountName">{userName}</div>
      <Button variant="primary" onClick={() => navigate('/account')}>
        Go to Account
      </Button>
      <Button variant="secondary" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}