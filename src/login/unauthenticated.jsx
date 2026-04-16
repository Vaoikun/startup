import React from 'react';
import Button from 'react-bootstrap/Button';
import { MessageDialog } from './messageDialog';

export function Unauthenticated({ userName: initialUserName, onLogin }) {
  const [userName, setUserName] = React.useState(initialUserName || '');
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);

  React.useEffect(() => {
    setUserName(initialUserName || '');
  }, [initialUserName]);

  async function loginUser() {
    await loginOrCreate('/api/auth/login');
  }

  async function createUser() {
    await loginOrCreate('/api/auth/create');
  }

  async function loginOrCreate(endpoint) {
    try {
      const trimmedUserName = userName.trim();

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: trimmedUserName,
          password,
        }),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });

      const body = await response.json().catch(() => ({}));

      if (response.ok) {
        localStorage.setItem('userName', trimmedUserName);
        onLogin(trimmedUserName);
      } else {
        setDisplayError(`⚠ Error: ${body.msg || 'Request failed.'}`);
      }
    } catch (err) {
      console.error(err);
      setDisplayError('⚠ Error: Could not reach the server.');
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loginUser();
        }}
      >
        <div className="input-group mb-3">
          <span>@</span>
          <input
            className="form-control"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div className="input-group mb-3">
          <span>🔒</span>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>

        <Button type="submit" variant="primary" disabled={!userName.trim() || !password}>
          Login
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={createUser}
          disabled={!userName.trim() || !password}
        >
          Create
        </Button>
      </form>

      <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
    </>
  );
}