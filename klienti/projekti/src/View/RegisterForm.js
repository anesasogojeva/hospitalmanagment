import React, { useState } from 'react';
import { register } from '../services/authService'; // Import register from service
import '../CSS/login.css';

const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const isPasswordValid = (pw) => PASSWORD_REQUIREMENTS.every((req) => req.test(pw));

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    if (!isPasswordValid(password)) {
      setErrors(['Password does not meet the requirements below.']);
      return;
    }

    try {
      const result = await register(username, email, password);

      if (result.success) {
        setSuccess('User registered successfully');
      } else {
        setErrors(result.errors);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setErrors(['Something went wrong. Please try again.']);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <span className="auth-brand-mark">HMS</span>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Register as a patient to book appointments</p>
        {errors.length > 0 && (
          <div className="alert alert-danger">
            {errors.length === 1 ? (
              errors[0]
            ) : (
              <ul className="alert-list">
                {errors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleRegister}>
          <div className="auth-field">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              className="form-control"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-control"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
            />
            {(passwordFocused || password.length > 0) && (
              <ul className="password-requirements">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const met = req.test(password);
                  return (
                    <li key={req.key} className={met ? 'requirement-met' : 'requirement-unmet'}>
                      <span className="requirement-icon">{met ? '✓' : '○'}</span>
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <button type="submit" className="btn btn-primary auth-submit">Register</button>
        </form>
        <p className="auth-footer">Already have an account? <a href="/LoginForm">Sign In</a></p>
      </div>
    </div>
  );
};

export default RegisterForm;
