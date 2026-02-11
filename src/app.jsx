import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (<div className="body bg-dark text-light">
    <header>
            <h1>Kai Tuning<sup>&reg;</sup></h1>
            <nav class="tabbar">
                <a class="tab active" href="index.html">
                    <span class="icon">
                        🏠
                    </span>
                    Home
                </a>
                <a class="tab" href="account.html">
                    <span class="icon">
                        👤
                    </span>
                    Account
                </a>
                <a class="tab" href="schedule.html">
                    <span class="icon">
                        📅
                    </span>
                    Schedule
                </a>
                <a class="tab" href="about.html">
                    <span class="icon">
                        ℹ️
                    </span>
                    About
                </a>
            </nav>
            <hr />
        </header>

        <main>App components go here</main>

        <footer class="bg-dark text-light mt-5 border-top border-primary">
        <div class="container py-4 text-center">
            <p class="mb-1">Author: <strong>Vance Williams</strong></p>
            <a 
            href="https://github.com/Vaoikun/startup" 
            class="link-light link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
            >
            GitHub Repository
            </a>
        </div>
        </footer>
  </div>);
}