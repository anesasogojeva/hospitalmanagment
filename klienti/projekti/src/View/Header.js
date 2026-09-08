import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faChartLine,
  faUserDoctor,
  faUserNurse,
  faCalendarDays,
  faCalendarCheck,
  faHospitalUser,
  faFileMedical,
  faBriefcaseMedical,
  faEnvelope,
  faStar,
  faTruckMedical,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import '../CSS/Navbar.css';

const navItems = [
  { to: '/Doki', label: 'Doctors', icon: faUserDoctor },
  { to: '/InfCrud', label: 'Nurses', icon: faUserNurse },
  { to: '/NurseSchedule', label: 'Nurse Schedule', icon: faCalendarDays },
  { to: '/ReservationCrud', label: 'Appointments', icon: faCalendarCheck },
  { to: '/PacCrud', label: 'Patients', icon: faHospitalUser },
  { to: '/RekCrud', label: 'Records', icon: faFileMedical },
  { to: '/ServCrud', label: 'Services', icon: faBriefcaseMedical },
  { to: '/ContactCrud', label: 'Contact Requests', icon: faEnvelope },
  { to: '/ReviewCrud', label: 'Reviews', icon: faStar },
  { to: '/EmergencyCrud', label: 'Emergencies', icon: faTruckMedical },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="admin-sidebar__mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin navigation"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {mobileOpen && (
        <div
          className="admin-sidebar__scrim"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <a href="/Home" className="admin-sidebar__brand-link">
            <span className="admin-sidebar__brand-mark">HMS</span>
            <span className="admin-sidebar__brand-text">Hospital Admin</span>
          </a>
          <button
            type="button"
            className="admin-sidebar__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin navigation"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <span className="admin-sidebar__section-label">Overview</span>
          <ul className="admin-sidebar__list">
            <li>
              <NavLink
                to="/AdminDashboard"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                }
              >
                <FontAwesomeIcon icon={faChartLine} className="admin-sidebar__icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>
          </ul>
          <span className="admin-sidebar__section-label">Management</span>
          <ul className="admin-sidebar__list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className="admin-sidebar__icon" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/Home" className="admin-sidebar__link admin-sidebar__link--muted">
            <FontAwesomeIcon icon={faHouse} className="admin-sidebar__icon" />
            <span>Back to Website</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default Header;
