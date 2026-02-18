import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login({ userName, authState, onAuthChange}) {
  return (
        <main classname='container-fluid bg-secondary text-center'>
          <div>
            {authState !== AuthState.Unknown && 
            <h2>Welcome to Kai Tuning</h2> &&
            <p>Welcome to the Kai Tuning project! This project is dedicated to providing resources and information about Kai Tuning.</p> &&
            <h2>About Kai Tuning</h2> &&
            <p>Kai Tuning is a method of optimizing performance and efficiency in various systems. It involves fine-tuning parameters to achieve the best possible results.</p> &&
            <p>Login or create a new accout to make an appointment!</p>
            }
          </div>
        </main>
  );
}