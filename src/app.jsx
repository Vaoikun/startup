import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Login } from './login/login';
import { Account } from './account/account';
import { Schedule } from './schedule/schedule';
import { About } from './about/about';
import { AuthState } from './login/authState';

function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName
    ? AuthState.Authenticated
    : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);

  React.useEffect(() => {
    const u = localStorage.getItem('userName') || '';
    setUserName(u);
    setAuthState(u ? AuthState.Authenticated : AuthState.Unauthenticated);
  }, []);

  const tabClass = ({ isActive }) => `tab ${isActive ? 'active' : ''}`;

  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header>
          <h1>
            Kai Tuning<sup>&reg;</sup>
          </h1>

          <nav className="tabbar">
            <NavLink className={tabClass} to="/">
              <span className="icon">🏠</span>
              Home
            </NavLink>

            {authState === AuthState.Authenticated && (
              <NavLink className={tabClass} to="/account">
                <span className="icon">👤</span>
                Account
              </NavLink>
            )}

            {authState === AuthState.Authenticated && (
              <NavLink className={tabClass} to="/schedule">
                <span className="icon">📅</span>
                Schedule
              </NavLink>
            )}

            <NavLink className={tabClass} to="/about">
              <span className="icon">ℹ️</span>
              About
            </NavLink>
          </nav>

          <hr />
        </header>

        <div className="nfs-tagline">Need For Speed...</div>

        <Routes>
          <Route
            path="/"
            element={
              <Login
                userName={userName}
                authState={authState}
                onAuthChange={(newUserName, newAuthState) => {
                  setAuthState(newAuthState);
                  setUserName(newUserName);
                }}
              />
            }
          />

          <Route
            path="/account"
            element={
              authState === AuthState.Authenticated ? (
                <Account
                  userName={userName}
                  onAuthChange={(nextUserName, nextAuthState) => {
                    setAuthState(nextAuthState);
                    setUserName(nextUserName);
                  }}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/schedule"
            element={
              authState === AuthState.Authenticated ? (
                <Schedule userName={userName} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="bg-dark text-light mt-5 border-top border-primary">
          <div className="container py-4 text-center">
            <p className="mb-1">
              Author: <strong>Vance Williams</strong>
            </p>
            <a
              href="https://github.com/Vaoikun/startup"
              className="link-light link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
            >
              GitHub Repository
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}

export default App;