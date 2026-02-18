import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login({ userName, authState, onAuthChange}) {
  return (
        <main className='container-fluid bg-secondary'>
            <h2>Welcome to Kai Tuning</h2>
            <p>Welcome to the Kai Tuning project! This project is dedicated to providing resources and information about Kai Tuning.</p> 
            <h2>About Kai Tuning</h2> 
            <p>Kai Tuning is a method of optimizing performance and efficiency in various systems. It involves fine-tuning parameters to achieve the best possible results.</p>
          <div>
            {authState !== AuthState.Unknown && 
            <p>Login or create an account to make an appointment!</p>
            }
            {authState === AuthState.Authenticated && (
              <Authenticated userName={userName} onLogout={() => onAuthChange(userName, AuthState.Unauthenticated)}/>
            )}
            {authState === AuthState.Unauthenticated && (
              <Unauthenticated userName={userName} onLogin={(loginUserName) => {
                onAuthChange(loginUserName, AuthState.Authenticated);
              }}/>
            )}
          </div>
        </main>
  );
}