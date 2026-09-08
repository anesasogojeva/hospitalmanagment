import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Form from 'react-bootstrap/Form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar'; // Ensure correct path
import Pagination from '../components/Pagination';
import useDebouncedValue from '../hooks/useDebouncedValue';
import {
  fetchEmergency, fetchRecords, fetchNurses, addRecord, fetchDoctorProfile,
  searchDoctorReservations, searchDoctorPatients, updateAppointmentStatus,
} from '../services/DoktoriDashService'; // Service Layer
import '../CSS/PortalDashboard.css';
import '../CSS/DataTableControls.css';

const RESERVATIONS_PAGE_SIZE = 10;
const PATIENTS_PAGE_SIZE = 10;

const Doktori = () => {
  const [activeTab, setActiveTab] = useState('patients');
  const [records, setRecords] = useState([]);
  const [emergency, setEmergency] = useState([]);
  const [nurses, setNurses] = useState({});
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  // Unpaginated name/id list of this doctor's own patients - used only by the Add Record
  // dropdown below, never rendered as a bulk list anywhere.
  const [allMyPatients, setAllMyPatients] = useState([]);
  const [newRecord, setNewRecord] = useState({ diagnoza: '', receta: '', rezultatet: '', id_P: '' });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // --- My Appointments: server-side search + status/date filter + pagination ---
  const [reservations, setReservations] = useState([]);
  const [reservationsPage, setReservationsPage] = useState(1);
  const [reservationsTotalCount, setReservationsTotalCount] = useState(0);
  const [reservationsTotalPages, setReservationsTotalPages] = useState(0);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState('');
  const [reservationSearch, setReservationSearch] = useState('');
  const debouncedReservationSearch = useDebouncedValue(reservationSearch, 400);
  const [reservationStatus, setReservationStatus] = useState('');
  const [reservationDate, setReservationDate] = useState('');

  // --- My Patients: server-side search + pagination ---
  const [patients, setPatients] = useState([]);
  const [patientsPage, setPatientsPage] = useState(1);
  const [patientsTotalCount, setPatientsTotalCount] = useState(0);
  const [patientsTotalPages, setPatientsTotalPages] = useState(0);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const debouncedPatientSearch = useDebouncedValue(patientSearch, 400);

  const handleClose = () => setShowModal(false);
  const handleShow = (patient) => { setSelectedPatient(patient); setShowModal(true); };
  const handleAddRecordClose = () => setShowAddRecordModal(false);
  const handleAddRecordShow = () => setShowAddRecordModal(true);

  const handleSelectTab = (key) => setActiveTab(key);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await addRecord(newRecord, token);
      toast.success('Record added successfully');
      setShowAddRecordModal(false);
      setNewRecord({ diagnoza: '', receta: '', rezultatet: '', id_P: '' });

      const recordsResponse = await fetchRecords(token);
      setRecords(recordsResponse);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadReservations = async (page = reservationsPage) => {
    setReservationsLoading(true);
    setReservationsError('');
    try {
      const token = localStorage.getItem('token');
      const result = await searchDoctorReservations(token, {
        search: debouncedReservationSearch,
        status: reservationStatus,
        date: reservationDate,
        page,
        pageSize: RESERVATIONS_PAGE_SIZE,
      });
      setReservations(result.items);
      setReservationsTotalCount(result.totalCount);
      setReservationsTotalPages(result.totalPages);
    } catch (error) {
      setReservationsError(error.message || 'Could not load appointments. Please try again.');
    } finally {
      setReservationsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations(reservationsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationsPage]);

  useEffect(() => {
    setReservationsPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedReservationSearch, reservationStatus, reservationDate]);

  // Change the status of one of this doctor's own appointments (the backend re-checks
  // ownership independently of this UI - this control simply won't appear for an
  // appointment that isn't in `reservations`, which is already scoped to this doctor).
  const handleStatusChange = (reservationId, newStatus) => {
    const previousReservations = reservations;
    setReservations((prev) =>
      prev.map((item) => (item.reservationId === reservationId ? { ...item, status: newStatus } : item))
    );

    const token = localStorage.getItem('token');
    updateAppointmentStatus(token, reservationId, newStatus)
      .then(() => {
        toast.success('Appointment status updated!');
      })
      .catch((error) => {
        setReservations(previousReservations);
        toast.error(error.message || 'Error updating appointment status');
      });
  };

  const loadPatients = async (page = patientsPage) => {
    setPatientsLoading(true);
    setPatientsError('');
    try {
      const token = localStorage.getItem('token');
      const result = await searchDoctorPatients(token, {
        search: debouncedPatientSearch,
        page,
        pageSize: PATIENTS_PAGE_SIZE,
      });
      setPatients(result.items);
      setPatientsTotalCount(result.totalCount);
      setPatientsTotalPages(result.totalPages);
    } catch (error) {
      setPatientsError(error.message || 'Could not load patients. Please try again.');
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(patientsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientsPage]);

  useEffect(() => {
    setPatientsPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPatientSearch]);

  // The full (unpaginated) list of this doctor's own patients, for the Add Record dropdown -
  // still scoped to this doctor only, just not the paginated "My Patients" tab view.
  useEffect(() => {
    const token = localStorage.getItem('token');
    searchDoctorPatients(token, { page: 1, pageSize: 1000 })
      .then((result) => setAllMyPatients(result.items))
      .catch((error) => console.error('Error loading patient list for records form:', error.message));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetchRecords(token)
      .then(setRecords)
      .catch((error) => toast.error(error.message));

    fetchEmergency(token)
      .then(setEmergency)
      .catch((error) => toast.error(error.message));

    fetchNurses(token)
      .then(setNurses)
      .catch((error) => toast.error(error.message));

    setProfileLoading(true);
    fetchDoctorProfile(token)
      .then((data) => {
        setProfile(data);
        setProfileError('');
      })
      .catch((error) => setProfileError(error.message || 'Could not load your profile.'))
      .finally(() => setProfileLoading(false));
  }, []);

  const userRole = localStorage.getItem('role');
  if (userRole !== 'doktor') {
    return (
      <div className="text-center mt-5">
        <h2>Unauthorized: You do not have access to this page.</h2>
        <h3>
          Click <a href="./Home"> here </a>to go to our home page or <a href="./LoginForm"> here </a> to SignUp
        </h3>
      </div>
    );
  }

  return (
            <>
              <ToastContainer />
              <Navbar />
              <div className="portal-shell">
                {/* Sidebar */}
                <div className="portal-sidebar">
                  <Nav className="flex-column">
                    <Nav.Link
                      href="#profile"
                      className={activeTab === 'profile' ? 'portal-sidebar__link--active' : ''}
                      onClick={() => handleSelectTab('profile')}
                    >
                      My Profile
                    </Nav.Link>
                    <Nav.Link
                      href="#patients"
                      className={activeTab === 'patients' ? 'portal-sidebar__link--active' : ''}
                      onClick={() => handleSelectTab('patients')}
                    >
                      Patients
                    </Nav.Link>
                    <Nav.Link
                      href="#records"
                      className={activeTab === 'records' ? 'portal-sidebar__link--active' : ''}
                      onClick={() => handleSelectTab('records')}
                    >
                      Records
                    </Nav.Link>
                    <Nav.Link
                      href="#emergency"
                      className={activeTab === 'emergency' ? 'portal-sidebar__link--active' : ''}
                      onClick={() => handleSelectTab('emergency')}
                    >
                      Emergency
                    </Nav.Link>
                    <Nav.Link
                      href="#reservations"
                      className={activeTab === 'reservations' ? 'portal-sidebar__link--active' : ''}
                      onClick={() => handleSelectTab('reservations')}
                    >
                      Appointments
                    </Nav.Link>
                    <Nav.Link
                      href="#nurses"
                      className={activeTab === 'nurses' ? 'portal-sidebar__link--active' : ''}
                      onClick={() => handleSelectTab('nurses')}
                    >
                      Nurses
                    </Nav.Link>
                  </Nav>
                </div>

                <div className="portal-content">
                  <Container className="mt-5">
                    <Row>
                      <Col>
                        <Tab.Container activeKey={activeTab}>
                          <Tab.Content>
                            <Tab.Pane eventKey="profile">
                              <Card className="shadow-sm mb-4">
                                <Card.Header>
                                  <h2>My Profile</h2>
                                </Card.Header>
                                <Card.Body>
                                  {profileError ? (
                                    <div className="dt-state dt-state--error">{profileError}</div>
                                  ) : profileLoading ? (
                                    <div className="dt-state">Loading your profile...</div>
                                  ) : !profile ? (
                                    <div className="dt-state">No profile information available.</div>
                                  ) : (
                                    <div className="doctor-profile">
                                      {profile.photoFileName && (
                                        <img
                                          src={profile.photoFileName}
                                          alt={profile.emri}
                                          className="doctor-profile__photo"
                                        />
                                      )}
                                      <dl className="doctor-profile__details">
                                        <dt>Name</dt>
                                        <dd>{profile.emri || '—'}</dd>
                                        <dt>Email</dt>
                                        <dd>{profile.email || '—'}</dd>
                                        <dt>Specialization</dt>
                                        <dd>{profile.specializimi || '—'}</dd>
                                        <dt>Phone</dt>
                                        <dd>{profile.numriTel || '—'}</dd>
                                        <dt>Years of Experience</dt>
                                        <dd>{profile.pervoja ?? '—'}</dd>
                                      </dl>
                                    </div>
                                  )}
                                </Card.Body>
                              </Card>
                            </Tab.Pane>

                            <Tab.Pane eventKey="patients">
                              <Card className="shadow-sm mb-4">
                                <Card.Header>
                                  <h2>My Patients</h2>
                                </Card.Header>
                                <Card.Body>
                                  <div className="dt-toolbar text-start">
                                    <div className="dt-toolbar__search">
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search patients (name, email, phone)..."
                                        value={patientSearch}
                                        onChange={(e) => setPatientSearch(e.target.value)}
                                      />
                                    </div>
                                  </div>

                                  {patientsError ? (
                                    <div className="dt-state dt-state--error">{patientsError}</div>
                                  ) : patientsLoading ? (
                                    <div className="dt-state">Loading patients...</div>
                                  ) : patients.length === 0 ? (
                                    <div className="dt-state">
                                      {debouncedPatientSearch ? 'No patients match your search.' : 'No patients yet.'}
                                    </div>
                                  ) : (
                                    <>
                                      <Table striped bordered hover variant="light">
                                        <thead>
                                          <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Surname</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {patients.map((patient) => (
                                            <tr key={patient.id_P}>
                                              <td>{patient.id_P}</td>
                                              <td>{patient.emri}</td>
                                              <td>{patient.mbiemri}</td>
                                              <td>{patient.email || '—'}</td>
                                              <td>{patient.numriTel}</td>
                                              <td>
                                                <Button variant="info" onClick={() => handleShow(patient)}>Details</Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                      <Pagination
                                        page={patientsPage}
                                        totalPages={patientsTotalPages}
                                        totalCount={patientsTotalCount}
                                        pageSize={PATIENTS_PAGE_SIZE}
                                        onPageChange={setPatientsPage}
                                      />
                                    </>
                                  )}
                                </Card.Body>
                              </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="records">
                                     <Card className="shadow-sm mb-4">
                                    <Card.Header>
                                  <h2>Records</h2>
                                     {/* Add a container for button and table */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                       <div></div> {/* Empty div to push the button to the right */}
                               <Button variant="primary" onClick={handleAddRecordShow}>Add Record</Button>
                                           </div>
                                         </Card.Header>
                             <Card.Body>
                                      <Table striped bordered hover variant="light">
                              <thead>
                                <tr>
                                <th>#</th>
                                <th>Record ID</th>
                                <th>Diagnosis</th>
                                 <th>Prescription</th>
                                  <th>Results</th>
                                  <th>Patient</th>
                               </tr>
                               </thead>
                             <tbody>
                  {records.length > 0 ? records.map((record, index) => (
                    <tr key={record.id_Rek}>
                      <td>{index + 1}</td>
                      <td>{record.id_Rek}</td>
                      <td>{record.diagnoza}</td>
                      <td>{record.receta}</td>
                      <td>{record.rezultatet}</td>
                      <td>{record.pacienti?.emri || 'Unknown'}</td>
                    </tr>
                  )) : <tr><td colSpan="6">No records yet.</td></tr>}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab.Pane>


                            <Tab.Pane eventKey="reservations">
                              <Card className="shadow-sm mb-4">
                                <Card.Header>
                                  <h2>My Appointments</h2>
                                </Card.Header>
                                <Card.Body>
                                  <div className="dt-toolbar text-start">
                                    <div className="dt-toolbar__search">
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search patient..."
                                        value={reservationSearch}
                                        onChange={(e) => setReservationSearch(e.target.value)}
                                      />
                                    </div>
                                    <select
                                      className="form-select dt-toolbar__filter"
                                      value={reservationStatus}
                                      onChange={(e) => setReservationStatus(e.target.value)}
                                    >
                                      <option value="">All statuses</option>
                                      <option value="Scheduled">Scheduled</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <input
                                      type="date"
                                      className="form-control dt-toolbar__filter"
                                      value={reservationDate}
                                      onChange={(e) => setReservationDate(e.target.value)}
                                      aria-label="Filter by date"
                                      title="Filter by date"
                                    />
                                  </div>

                                  {reservationsError ? (
                                    <div className="dt-state dt-state--error">{reservationsError}</div>
                                  ) : reservationsLoading ? (
                                    <div className="dt-state">Loading appointments...</div>
                                  ) : reservations.length === 0 ? (
                                    <div className="dt-state">
                                      {debouncedReservationSearch || reservationStatus || reservationDate
                                        ? 'No appointments match your search.'
                                        : 'No appointments found.'}
                                    </div>
                                  ) : (
                                    <>
                                      <Table striped bordered hover variant="light">
                                        <thead>
                                          <tr>
                                            <th>#</th>
                                            <th>Appointment ID</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Patient</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {reservations.map((reservation, index) => (
                                            <tr key={reservation.reservationId}>
                                              <td>{(reservationsPage - 1) * RESERVATIONS_PAGE_SIZE + index + 1}</td>
                                              <td>{reservation.reservationId}</td>
                                              <td>{reservation.reservationDate}</td>
                                              <td>{reservation.reservationTime}</td>
                                              <td>{[reservation.patientName, reservation.patientSurname].filter(Boolean).join(' ') || 'Unknown'}</td>
                                              <td>{reservation.patientEmail || '—'}</td>
                                              <td>{reservation.patientPhone || '—'}</td>
                                              <td>
                                                <Form.Select
                                                  size="sm"
                                                  style={{ minWidth: '130px' }}
                                                  value={reservation.status}
                                                  onChange={(e) => handleStatusChange(reservation.reservationId, e.target.value)}
                                                >
                                                  <option value="Scheduled">Scheduled</option>
                                                  <option value="Completed">Completed</option>
                                                  <option value="Cancelled">Cancelled</option>
                                                </Form.Select>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                      <Pagination
                                        page={reservationsPage}
                                        totalPages={reservationsTotalPages}
                                        totalCount={reservationsTotalCount}
                                        pageSize={RESERVATIONS_PAGE_SIZE}
                                        onPageChange={setReservationsPage}
                                      />
                                    </>
                                  )}
                                </Card.Body>
                              </Card>
                            </Tab.Pane>

                            <Tab.Pane eventKey="emergency">
                              <Card className="shadow-sm mb-4">
                                <Card.Header>
                                  <h2>Emergency</h2>
                                </Card.Header>
                                <Card.Body>
                                  <Table striped bordered hover variant="light">
                                    <thead>
                                      <tr>
                                        <th>#</th>
                                        <th>Emergency ID</th>
                                        <th>Subject</th>
                                        <th>Description</th>
                                        <th>Contact Number</th>
                                        <th>Patient</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {emergency.length > 0 ? emergency.map((emergency, index) => (
                                        <tr key={emergency.emergencyid}>
                                          <td>{index + 1}</td>
                                          <td>{emergency.id_E}</td>
                                          <td>{emergency.subject}</td>
                                          <td>{emergency.pershkrimi}</td>
                                          <td>{emergency.numriKontaktit}</td>
                                          <td>{emergency.patientNavigation?.emri || 'Unknown'}</td>
                                        </tr>
                                      )) : <tr><td colSpan="5">No emergency requests yet.</td></tr>}
                                    </tbody>
                                  </Table>
                                </Card.Body>
                              </Card>
                            </Tab.Pane>

                            <Tab.Pane eventKey="nurses">
  <Card className="shadow-sm mb-4">
    <Card.Header>
      <h2>Nurses for the Week</h2>
    </Card.Header>
    <Card.Body>
      <Table striped bordered hover variant="light">
        <thead>
          <tr>
            <th>Day</th>
            <th>Morning</th>
            <th>Night</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(nurses).map(([day, dayEntries]) => {
            const formatShift = (shift) => {
              const inShift = (dayEntries || []).filter((e) => e.shift === shift);
              if (inShift.length === 0) return 'Unassigned';
              return inShift
                .map((e) => `${e.nurseName}${e.startTime ? ` (${e.startTime.slice(0, 5)}-${e.endTime.slice(0, 5)})` : ''}`)
                .join(', ');
            };
            return (
              <tr key={day}>
                <td>{day}</td>
                <td>{formatShift('Morning')}</td>
                <td>{formatShift('Night')}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
</Tab.Pane>


                          </Tab.Content>
                        </Tab.Container>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </div>
              {/* Patient Details Modal */}
              <Modal
                show={showModal}
                onHide={handleClose}
                dialogClassName="modal-dialog-centered"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>Patient Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedPatient ? (
                    <div>
                      <h4>Name: {selectedPatient.emri}</h4>
                      <p>Surname: {selectedPatient.mbiemri}</p>
                      <p>Email: {selectedPatient.email}</p>
                      <p>Phone: {selectedPatient.numriTel}</p>
                      <p>Date of Birth: {selectedPatient.dataELindjes}</p>
                      <p>Gender: {selectedPatient.gjinia}</p>
                      {/* Add more fields as needed */}
                    </div>
                  ) : (
                    <p>No patient selected</p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
              </Modal>

              {/* Add Record Modal */}
            {/* Add Record Modal */}
        <Modal
          show={showAddRecordModal}
          onHide={handleAddRecordClose}
          dialogClassName="modal-dialog-centered"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Record</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="id_P" className="form-label">Patient</label>
                <select
                  className="form-select"
                  id="id_P"
                  name="id_P"
                  value={newRecord.id_P}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select patient</option>
                  {allMyPatients.map((patient) => (
                    <option key={patient.id_P} value={patient.id_P}>
                      {patient.emri} {patient.mbiemri}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="diagnoza" className="form-label">Diagnosis</label>
                <input
                  type="text"
                  className="form-control"
                  id="diagnoza"
                  name="diagnoza"
                  value={newRecord.diagnoza}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="receta" className="form-label">Prescription</label>
                <input
                  type="text"
                  className="form-control"
                  id="receta"
                  name="receta"
                  value={newRecord.receta}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="rezultatet" className="form-label">Results</label>
                <input
                  type="text"
                  className="form-control"
                  id="rezultatet"
                  name="rezultatet"
                  value={newRecord.rezultatet}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" variant="primary">Add</Button>
            </form>
          </Modal.Body>
        </Modal>

            </>
          );
};

export default Doktori;
