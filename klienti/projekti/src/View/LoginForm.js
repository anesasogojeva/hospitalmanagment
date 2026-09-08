import React, { useState } from 'react';
import { login } from '../services/authService'; // Import login from service
import '../CSS/login.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!username || !password) {
      setError('Please fill in both fields');
      return;
    }

    try {
      const response = await login(username, password);

      if (response.success) {
        const role = response.role;

        // Redirect based on the role
        switch (role) {
          case 'admin':
            window.location.href = 'http://localhost:3000/AdminDashboard';
            break;
          case 'doktor':
            window.location.href = 'http://localhost:3000/Doktori';
            break;
          case 'patient':
            window.location.href = 'http://localhost:3000/PatientDashboard';
            break;
          default:
            window.location.href = 'http://localhost:3000/Home';
            break;
        }
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Network error or invalid credentials');
      console.error('Error during login:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">HMS</span>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to Hospital Management System</p>
        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary auth-submit">Login</button>
        </form>
        <p className="auth-footer">Don't have an account? <a href="/RegisterForm">Register now</a></p>
      </div>
    </div>
  );
};

export default LoginForm;
