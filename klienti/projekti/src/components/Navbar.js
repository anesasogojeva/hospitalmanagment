import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faSignInAlt, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "../components/Navbar.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Navbar() {
  const [nav, setNav] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('token') ? true : false);
  const [role, setRole] = useState(() => localStorage.getItem('role')); // Store the role from localStorage

  const openNav = () => {
    setNav(!nav);
  };

  const handleLogout = () => {
    // Clear user session data and token
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    setIsLoggedIn(false);
    toast.success('Logged out successfully');
    window.location.href = '/LoginForm';
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('token') ? true : false);
    setRole(localStorage.getItem('role')); // Update role when the component mounts
  }, []);

  // Function to determine the correct dashboard link
  const getDashboardLink = () => {
    if (role === 'patient') {
      return '/PatientDashboard';
    } else if (role === 'doktor') {
      return '/Doktori';
    } else if (role === 'admin') {
      return '/Doki';
    }
    return '#'; // Default in case no role is found
  };

  return (
    <div className="navbar-section">
      <h1 className="navbar-title">
        <Link to="">
          HMS <span className="navbar-sign">+</span>
        </Link>
      </h1>

      {/* Desktop */}
      <ul className="navbar-items">
        <li>
          <Link to="../Home" className="navbar-links">
            Home
          </Link>
        </li>
        <li>
          <Link to="../Services" className="navbar-links">
            Services
          </Link>
        </li>
        <li>
          <a href="./About" className="navbar-links">
            About
          </a>
        </li>
        <li>
          <a href="./Reviews" className="navbar-links">
            Reviews
          </a>
        </li>
        <li>
          {isLoggedIn && (
            <Link to={getDashboardLink()} className="navbar-links">
              Dashboard
            </Link>
          )}
        </li>
        <li>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="navbar-links sign-in-button">
              <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
            </button>
          ) : (
            <Link to="/LoginForm" className="navbar-links sign-in-button">
              <FontAwesomeIcon icon={faSignInAlt} /> Sign In
            </Link>
          )}
        </li>
      </ul>
      
      {/* Mobile */}
      <div className={`mobile-navbar ${nav ? "open-nav" : ""}`}>
        <div onClick={openNav} className="mobile-navbar-close">
          <FontAwesomeIcon icon={faXmark} className="hamb-icon" />
        </div>

        <ul className="mobile-navbar-links">
          <li>
            <Link onClick={openNav} to="../Home">
              Home
            </Link>
          </li>
          <li>
            <Link onClick={openNav} to="../Services">
              Services
            </Link>
          </li>
          <li>
            <a onClick={openNav} href="../About">
              About
            </a>
          </li>
          <li>
            <a onClick={openNav} href="#reviews">
              Reviews
            </a>
          </li>
          <li>
            {isLoggedIn && (
              <Link to={getDashboardLink()} onClick={openNav} className="navbar-links">
                Dashboard
              </Link>
            )}
          </li>
          <li>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="navbar-links sign-in-button">
                <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
              </button>
            ) : (
              <Link onClick={openNav} to="/LoginForm" className="navbar-links sign-in-button">
                <FontAwesomeIcon icon={faSignInAlt} /> Sign In
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Hamburger Icon */}
      <div className="mobile-nav">
        <FontAwesomeIcon
          icon={faBars}
          onClick={openNav}
          className="hamb-icon"
        />
      </div>
    </div>
  );
}

export default Navbar;
