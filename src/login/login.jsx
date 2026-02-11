import React from 'react';

export function Login() {
  return (
        <main>
        <h2>Welcome to Kai Tuning</h2>
        <p>Welcome to the Kai Tuning project! This project is dedicated to providing resources and information about Kai Tuning.</p>
        <h2>About Kai Tuning</h2>
        <p>Kai Tuning is a method of optimizing performance and efficiency in various systems. It involves fine-tuning parameters to achieve the best possible results.</p>
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
        </main>
  );
}