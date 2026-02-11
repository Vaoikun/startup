import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Account } from './account/account';
import { Schedule } from './schedule/schedule';
import { About } from './about/about';

export default function App() {
  return (
    <BrowserRouter>
  <div className="body bg-dark text-light">
    <header>
            <h1>Kai Tuning<sup>&reg;</sup></h1>
            <nav className="tabbar">
                <NavLink className="tab active" to="/">
                    <span className="icon">
                        🏠
                    </span>
                    Home
                </NavLink>
                <NavLink className="tab" to="/account">
                    <span className="icon">
                        👤
                    </span>
                    Account
                </NavLink>
                <NavLink className="tab" to="/schedule">
                    <span className="icon">
                        📅
                    </span>
                    Schedule
                </NavLink>
                <NavLink className="tab" to="/about">
                    <span className="icon">
                        ℹ️
                    </span>
                    About
                </NavLink>
            </nav>
            <hr />
        </header>

        <Routes>
            <Route path='/' element={<>
            <main className="nfs-tagline">Need For Speed...</main>
            <Login />
            </>} />
            <Route path='/account' element={<Account />} />
            <Route path='/schedule' element={<Schedule />} />
            <Route path='/about' element={<About />} />
            <Route path='*' element={<NotFound />} />
        </Routes>

        <footer className="bg-dark text-light mt-5 border-top border-primary">
        <div className="container py-4 text-center">
            <p className="mb-1">Author: <strong>Vance Williams</strong></p>
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
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}