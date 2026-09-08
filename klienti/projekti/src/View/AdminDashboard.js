import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  fetchSummary,
  fetchUpcomingAppointments,
  fetchAppointmentsByDoctor,
  fetchAppointmentsBySpecialty,
  fetchAppointmentTrends,
  fetchPatientDemographics,
} from '../services/analyticsService';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import '../CSS/DataTableControls.css';
import '../CSS/AdminDashboard.css';

const CHART_COLORS = ['#1c6ea4', '#0f8a7e', '#b3720b', '#c53737', '#2563a8', '#7f97ac', '#0e3a58'];

// Same palette as AppointmentStatusBadge's Bootstrap variants (primary / success / danger),
// so the pie chart and the status badges shown elsewhere in the app read as one system.
const STATUS_COLORS = { Scheduled: '#1c6ea4', Completed: '#1f8a4c', Cancelled: '#c53737' };

const formatShortDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [byDoctor, setByDoctor] = useState([]);
  const [bySpecialty, setBySpecialty] = useState([]);
  const [trends, setTrends] = useState([]);
  const [demographics, setDemographics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      fetchSummary(),
      fetchUpcomingAppointments(8),
      fetchAppointmentsByDoctor(),
      fetchAppointmentsBySpecialty(),
      fetchAppointmentTrends(30),
      fetchPatientDemographics(),
    ])
      .then(([summaryData, upcomingData, byDoctorData, bySpecialtyData, trendsData, demographicsData]) => {
        if (cancelled) return;
        setSummary(summaryData);
        setUpcoming(upcomingData);
        setByDoctor(byDoctorData);
        setBySpecialty(bySpecialtyData);
        setTrends(trendsData);
        setDemographics(demographicsData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError('Could not load dashboard data. Please try again.');
        console.error('Dashboard load error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') {
    return (
      <div className="text-center mt-5">
        <h2>Unauthorized: You do not have access to this page.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dash">
        <h1 className="admin-dash__title">Hospital Dashboard</h1>
        <div className="admin-dash__stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card stat-card--skeleton" />
          ))}
        </div>
        <div className="chart-card chart-card--wide chart-card--skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dash">
        <h1 className="admin-dash__title">Hospital Dashboard</h1>
        <div className="dt-state dt-state--error">{error}</div>
      </div>
    );
  }

  const hasTrendData = trends.some((t) => t.count > 0);

  return (
    <div className="admin-dash">
      <h1 className="admin-dash__title">Hospital Dashboard</h1>

      {/* Top: at-a-glance stats */}
      <div className="admin-dash__stats">
        <div className="stat-card">
          <span className="stat-card__label">Total Patients</span>
          <span className="stat-card__value">{summary.totalPatients}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total Doctors</span>
          <span className="stat-card__value">{summary.totalDoctors}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Today's Appointments</span>
          <span className="stat-card__value">{summary.todaysAppointments}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Upcoming Today</span>
          <span className="stat-card__value">{summary.todaysUpcoming}</span>
          <span className="stat-card__sublabel">{summary.todaysPast} already passed today</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total Appointments</span>
          <span className="stat-card__value">{summary.totalAppointments}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Cancellation Rate</span>
          <span className="stat-card__value">{summary.cancellationRate}%</span>
          <span className="stat-card__sublabel">{summary.cancelledCount} of {summary.totalAppointments} appointments</span>
        </div>
      </div>

      {/* Middle: trends */}
      <div className="chart-card chart-card--wide">
        <h2 className="chart-card__title">Appointment Trends (last 30 days)</h2>
        {!hasTrendData ? (
          <div className="dt-state">No appointments recorded in this period yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trends} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1c6ea4" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1c6ea4" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} minTickGap={28} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
              <Tooltip labelFormatter={formatShortDate} formatter={(v) => [v, 'Appointments']} />
              <Area type="monotone" dataKey="count" stroke="#1c6ea4" strokeWidth={2} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom: operational detail */}
      <div className="admin-dash__bottom-grid">
        <div className="chart-card">
          <h2 className="chart-card__title">Appointment Status Breakdown</h2>
          {summary.totalAppointments === 0 ? (
            <div className="dt-state">No appointment data yet.</div>
          ) : (
            <div className="status-breakdown">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Scheduled', value: summary.scheduledCount },
                      { name: 'Completed', value: summary.completedCount },
                      { name: 'Cancelled', value: summary.cancelledCount },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={65}
                  >
                    {['Scheduled', 'Completed', 'Cancelled'].map((name) => (
                      <Cell key={name} fill={STATUS_COLORS[name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="status-breakdown__list">
                <li><span className="status-breakdown__dot" style={{ backgroundColor: STATUS_COLORS.Scheduled }} />Scheduled: {summary.scheduledCount}</li>
                <li><span className="status-breakdown__dot" style={{ backgroundColor: STATUS_COLORS.Completed }} />Completed: {summary.completedCount}</li>
                <li><span className="status-breakdown__dot" style={{ backgroundColor: STATUS_COLORS.Cancelled }} />Cancelled: {summary.cancelledCount}</li>
              </ul>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h2 className="chart-card__title">Doctor Workload</h2>
          {byDoctor.length === 0 ? (
            <div className="dt-state">No appointment data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, byDoctor.length * 42)}>
              <BarChart data={byDoctor} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="doctorName" width={130} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [v, 'Appointments']} />
                <Bar dataKey="appointmentCount" fill="#1c6ea4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h2 className="chart-card__title">Most Requested Specialties</h2>
          {bySpecialty.length === 0 ? (
            <div className="dt-state">No appointment data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={bySpecialty}
                  dataKey="appointmentCount"
                  nameKey="specialization"
                  outerRadius={80}
                  label={(entry) => `${entry.specialization}: ${entry.appointmentCount}`}
                >
                  {bySpecialty.map((entry, index) => (
                    <Cell key={entry.specialization} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h2 className="chart-card__title">Upcoming Appointments</h2>
          {upcoming.length === 0 ? (
            <div className="dt-state">No upcoming appointments.</div>
          ) : (
            <ul className="upcoming-list">
              {upcoming.map((a) => (
                <li key={a.reservationId} className="upcoming-list__item">
                  <div className="upcoming-list__main">
                    <span className="upcoming-list__patient">{a.patientName || 'Unknown patient'}</span>
                    <span className="upcoming-list__doctor">
                      with {a.doctorName || 'Unknown doctor'}
                      {a.specialization ? ` · ${a.specialization}` : ''}
                    </span>
                  </div>
                  <div className="upcoming-list__when">
                    <span>{formatShortDate(a.reservationDate)}</span>
                    <span>{a.reservationTime}</span>
                    <AppointmentStatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <a href="/ReservationCrud" className="admin-dash__link">View all appointments →</a>
        </div>

        <div className="chart-card">
          <h2 className="chart-card__title">Patient Demographics</h2>
          {!demographics || demographics.genderBreakdown.length === 0 ? (
            <div className="dt-state">No patient data yet.</div>
          ) : (
            <div className="demographics">
              <div className="demographics__col">
                <span className="demographics__label">By Gender</span>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={demographics.genderBreakdown} dataKey="count" nameKey="gender" outerRadius={55}>
                      {demographics.genderBreakdown.map((entry, index) => (
                        <Cell key={entry.gender} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="demographics__col">
                <span className="demographics__label">By Age Group</span>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={demographics.ageBreakdown} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={24} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f8a7e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
