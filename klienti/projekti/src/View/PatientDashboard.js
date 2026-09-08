import React, { useState, useEffect } from 'react';
import { fetchReservations, fetchRecords, fetchDoctorProfiles, fetchDoctorAvailability, createReservation,  createReview } from '../services/dashboardService';
import { createEmergency, fetchEmergency } from '../services/dashboardService';
import '../CSS/AppointmentWizard.css';
import Table from 'react-bootstrap/Table';
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
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';
import '../CSS/PortalDashboard.css';
import '../CSS/DataTableControls.css';
const PatientDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [reservationsPage, setReservationsPage] = useState(1);
  const [reservationsTotalCount, setReservationsTotalCount] = useState(0);
  const [reservationsTotalPages, setReservationsTotalPages] = useState(0);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState('');
  const PAGE_SIZE = 5;

  const [records, setRecords] = useState([]);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsTotalCount, setRecordsTotalCount] = useState(0);
  const [recordsTotalPages, setRecordsTotalPages] = useState(0);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState('');
  const [doctors, setDoctors] = useState({});
  const [doctorProfiles, setDoctorProfiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    reservationDate: '',
    reservationTime: '',
    doctorId: '',
  });
  const [availability, setAvailability] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [reviewData, setReviewData] = useState({
    reviewText: '',
    rating: 5,
  });
  const [activeTab, setActiveTab] = useState('makeReservation');
  const [emergencies, setEmergencies] = useState([]);
  const [emergenciesPage, setEmergenciesPage] = useState(1);
  const [emergenciesTotalCount, setEmergenciesTotalCount] = useState(0);
  const [emergenciesTotalPages, setEmergenciesTotalPages] = useState(0);
  const [emergenciesLoading, setEmergenciesLoading] = useState(true);
  const [emergenciesError, setEmergenciesError] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState({
    subject: '',
    description: '',
    contactNumber: '',
    doctorId: '',
  });
  
  const handleSelectTab = (tab) => {
    if (tab === 'contactUs') {
      window.location.href = '/about#contactUs';
    } else {
      setActiveTab(tab);
    }
  };

  const handleSelectDoctor = (doctorId) => {
    // Changing doctor clears any previously chosen date/time since availability depends on the doctor
    setReservationData({ reservationDate: '', reservationTime: '', doctorId: String(doctorId) });
    setAvailability([]);
  };

  const handleSelectDate = (e) => {
    // Changing date clears the previously chosen time and triggers a fresh availability lookup
    setReservationData((prevData) => ({ ...prevData, reservationDate: e.target.value, reservationTime: '' }));
  };

  const handleSelectTime = (slot) => {
    if (!slot.available) return;
    setReservationData((prevData) => ({ ...prevData, reservationTime: slot.time }));
  };

  const resetReservationForm = () => {
    setReservationData({ reservationDate: '', reservationTime: '', doctorId: '' });
    setAvailability([]);
  };

  useEffect(() => {
    if (!showReservationModal || !reservationData.doctorId || !reservationData.reservationDate) {
      return;
    }

    let isCancelled = false;
    setIsLoadingAvailability(true);

    fetchDoctorAvailability(reservationData.doctorId, reservationData.reservationDate)
      .then((slots) => {
        if (!isCancelled) setAvailability(slots);
      })
      .catch((error) => {
        if (!isCancelled) {
          toast.error(`Error loading availability: ${error.message}`);
          setAvailability([]);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingAvailability(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [showReservationModal, reservationData.doctorId, reservationData.reservationDate]);

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleEmergencyInputChange = (e) => {
    const { name, value } = e.target;
    setEmergencyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleEmergencySubmit = async () => {
    try {
      await createEmergency(emergencyData);
      toast.success('Emergency submitted successfully');
      setTimeout(() => {
        window.location.reload();
      }, 500);
      setShowEmergencyModal(false);
    } catch (error) {
      toast.error(`Error submitting emergency: ${error.message}`);
    }
  };
  const loadEmergencies = async (page = emergenciesPage) => {
    setEmergenciesLoading(true);
    setEmergenciesError('');
    try {
      const result = await fetchEmergency(page, PAGE_SIZE);
      setEmergencies(result.items);
      setEmergenciesTotalCount(result.totalCount);
      setEmergenciesTotalPages(result.totalPages);
    } catch (error) {
      setEmergenciesError('Could not load emergencies. Please try again.');
      toast.error(`Error fetching emergencies: ${error.message}`);
    } finally {
      setEmergenciesLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies(emergenciesPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergenciesPage]);


  const handleReservationSubmit = async () => {
    setIsBookingAppointment(true);
    try {
      await createReservation(reservationData);
      // New appointments sort to the top (upcoming-first), so jump back to page 1 to show it
      setReservationsPage(1);
      await loadReservations(1);
      toast.success('Appointment booked successfully');
      setShowReservationModal(false);
      resetReservationForm();
      setActiveTab('myReservations');
    } catch (error) {
      toast.error(error.message || 'Error booking appointment');
      // The slot may have just been taken by someone else - refresh availability so the user can pick another time
      if (reservationData.doctorId && reservationData.reservationDate) {
        setIsLoadingAvailability(true);
        try {
          const slots = await fetchDoctorAvailability(reservationData.doctorId, reservationData.reservationDate);
          setAvailability(slots);
        } catch (refreshError) {
          // Ignore secondary failure - the original error toast already informed the user
        } finally {
          setIsLoadingAvailability(false);
        }
        setReservationData((prevData) => ({ ...prevData, reservationTime: '' }));
      }
    } finally {
      setIsBookingAppointment(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await createReview(reviewData);
      toast.success('Review submitted successfully');
      setTimeout(() => {
        window.location.reload();
      }, 500);
      setShowReviewModal(false);
    } catch (error) {
      toast.error(`Error submitting review: ${error.message}`);
    }
  };

  const loadReservations = async (page = reservationsPage) => {
    setReservationsLoading(true);
    setReservationsError('');
    try {
      const result = await fetchReservations(page, PAGE_SIZE);
      setReservations(result.items);
      setReservationsTotalCount(result.totalCount);
      setReservationsTotalPages(result.totalPages);
    } catch (error) {
      setReservationsError('Could not load appointments. Please try again.');
      toast.error(`Error fetching data: ${error.message}`);
    } finally {
      setReservationsLoading(false);
    }
  };

  const loadRecords = async (page = recordsPage) => {
    setRecordsLoading(true);
    setRecordsError('');
    try {
      const result = await fetchRecords(page, PAGE_SIZE);
      setRecords(result.items);
      setRecordsTotalCount(result.totalCount);
      setRecordsTotalPages(result.totalPages);
    } catch (error) {
      setRecordsError('Could not load records. Please try again.');
      toast.error(`Error fetching data: ${error.message}`);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations(reservationsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationsPage]);

  useEffect(() => {
    loadRecords(recordsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordsPage]);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const fetchedDoctorProfiles = await fetchDoctorProfiles();
        setDoctorProfiles(fetchedDoctorProfiles);
        setDoctors(
          fetchedDoctorProfiles.reduce((acc, doctor) => {
            acc[doctor.id] = doctor.emri;
            return acc;
          }, {})
        );
      } catch (error) {
        toast.error(`Error fetching doctors: ${error.message}`);
      }
    };

    fetchDoctorData();
  }, []);

  const userRole = localStorage.getItem('role');
  if (userRole !== 'patient') {
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
        <div className="portal-sidebar">
          <Nav className="flex-column">
            <Nav.Link
              href="#makeReservation"
              className={activeTab === 'makeReservation' ? 'portal-sidebar__link--active' : ''}
              onClick={() => setActiveTab('makeReservation')}
            >

              Make Appointment
            </Nav.Link>
            <Nav.Link
              href="#myReservations"
              className={activeTab === 'myReservations' ? 'portal-sidebar__link--active' : ''}
              onClick={() => setActiveTab('myReservations')}
            >
              My Appointments
            </Nav.Link>
            <Nav.Link
              href="#myRecords"
              className={activeTab === 'myRecords' ? 'portal-sidebar__link--active' : ''}
              onClick={() => setActiveTab('myRecords')}
            >
              My Records
            </Nav.Link>
            <Nav.Link
              href="#myReviews"
              className={activeTab === 'myReviews' ? 'portal-sidebar__link--active' : ''}
              onClick={() => setActiveTab('myReviews')}
            >
              Make Reviews
            </Nav.Link>
            <Nav.Link href="/About#contactUs" className={activeTab === 'contactUs' ? 'portal-sidebar__link--active' : ''}>
              Contact Us
            </Nav.Link>

            <Nav.Link
             href="#addEmergency"
             className={activeTab === 'addEmergency' ? 'portal-sidebar__link--active' : ''}
             onClick={() => {
             setActiveTab('addEmergency');
             setShowEmergencyModal(true); // Open the modal
               }}
              >
              Add Emergency
            </Nav.Link>

              <Nav.Link
                href="#myEmergencies"
                 className={activeTab === 'myEmergencies' ? 'portal-sidebar__link--active' : ''}
                onClick={() => setActiveTab('myEmergencies')}
                  >
              My Emergencies
            </Nav.Link>
          </Nav>
        </div>

        <div className="portal-content">
          <Container className="mt-5">
            <Row>
              <Col>
                <Tab.Container activeKey={activeTab}>
                  <Tab.Content><Tab.Pane eventKey="myEmergencies">
  <Card className="shadow-sm mb-4">
    <Card.Header>
      <h2>My Emergencies</h2>
    </Card.Header>
    <Card.Body>
      {emergenciesError ? (
        <div className="dt-state dt-state--error">{emergenciesError}</div>
      ) : emergenciesLoading ? (
        <div className="dt-state">Loading emergencies...</div>
      ) : emergencies.length === 0 ? (
        <div className="dt-state">No emergencies found.</div>
      ) : (
        <>
          <Table striped bordered hover variant="light">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Description</th>
                <th>Contact Number</th>
                <th>Doctor</th>
              </tr>
            </thead>
            <tbody>
              {emergencies.map((emergency, index) => (
                <tr key={emergency.id_E}>
                  <td>{(emergenciesPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td>{emergency.subject}</td>
                  <td>{emergency.pershkrimi}</td>
                  <td>{emergency.numriKontaktit}</td>
                  <td>{doctors[emergency.doctor] || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={emergenciesPage}
            totalPages={emergenciesTotalPages}
            totalCount={emergenciesTotalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setEmergenciesPage}
          />
        </>
      )}
    </Card.Body>
  </Card>
</Tab.Pane>

                    <Tab.Pane eventKey="makeReservation">
                      <Card className="shadow-sm mb-4">
                        <Card.Header>
                          <h2>Make Appointment</h2>
                        </Card.Header>
                        <Card.Body>
                          <Button variant="primary" onClick={() => setShowReservationModal(true)}>
                            Click here
                          </Button>
                        </Card.Body>
                      </Card>
                    </Tab.Pane>

                    <Tab.Pane eventKey="myReservations">
                      <Card className="shadow-sm mb-4">
                        <Card.Header>
                          <h2>My Appointments</h2>
                        </Card.Header>
                        <Card.Body>
                          {reservationsError ? (
                            <div className="dt-state dt-state--error">{reservationsError}</div>
                          ) : reservationsLoading ? (
                            <div className="dt-state">Loading appointments...</div>
                          ) : reservations.length === 0 ? (
                            <div className="dt-state">No appointments found.</div>
                          ) : (
                            <>
                              <Table striped bordered hover variant="light">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Appointment ID</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reservations.map((reservation, index) => (
                                    <tr key={reservation.reservationId}>
                                      <td>{(reservationsPage - 1) * PAGE_SIZE + index + 1}</td>
                                      <td>{reservation.reservationId}</td>
                                      <td>{reservation.reservationDate}</td>
                                      <td>{reservation.reservationTime}</td>
                                      <td>{doctors[reservation.doctor] || 'Unknown'}</td>
                                      <td><AppointmentStatusBadge status={reservation.status} /></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                              <Pagination
                                page={reservationsPage}
                                totalPages={reservationsTotalPages}
                                totalCount={reservationsTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setReservationsPage}
                              />
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </Tab.Pane>

                    <Tab.Pane eventKey="myRecords">
                      <Card className="shadow-sm mb-4">
                        <Card.Header>
                          <h2>My Records</h2>
                        </Card.Header>
                        <Card.Body>
                          {recordsError ? (
                            <div className="dt-state dt-state--error">{recordsError}</div>
                          ) : recordsLoading ? (
                            <div className="dt-state">Loading records...</div>
                          ) : records.length === 0 ? (
                            <div className="dt-state">No records found.</div>
                          ) : (
                            <>
                              <Table striped bordered hover variant="light">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>ID Record</th>
                                    <th>Diagnosis</th>
                                    <th>Prescription</th>
                                    <th>Results</th>
                                    <th>Doctor</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {records.map((record, index) => (
                                    <tr key={record.id_Rek}>
                                      <td>{(recordsPage - 1) * PAGE_SIZE + index + 1}</td>
                                      <td>{record.id_Rek}</td>
                                      <td>{record.diagnoza}</td>
                                      <td>{record.receta}</td>
                                      <td>{record.rezultatet}</td>
                                      <td>{doctors[record.doctorId] || 'Unknown'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                              <Pagination
                                page={recordsPage}
                                totalPages={recordsTotalPages}
                                totalCount={recordsTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setRecordsPage}
                              />
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </Tab.Pane>

                    <Tab.Pane eventKey="myReviews">
                      <Card className="shadow-sm mb-4">
                        <Card.Header>
                          <h2>My Reviews</h2>
                        </Card.Header>
                        <Card.Body>
                          <Button variant="primary" onClick={() => setShowReviewModal(true)}>
                            Write a Review
                          </Button>   
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

      {/* Appointment Modal */}
      <Modal
        show={showReservationModal}
        onHide={() => {
          if (isBookingAppointment) return;
          setShowReservationModal(false);
          resetReservationForm();
        }}
        size="lg"
      >
        <Modal.Header closeButton={!isBookingAppointment}>
          <Modal.Title>Make Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(() => {
            const selectedDoctor = doctorProfiles.find(
              (doctor) => String(doctor.id) === String(reservationData.doctorId)
            );
            const today = new Date().toISOString().split('T')[0];

            return (
              <>
                <div className="appointment-wizard__step">
                  <div className="appointment-wizard__step-label">
                    <span className="appointment-wizard__step-number">1</span>
                    Select Doctor
                  </div>
                  {doctorProfiles.length > 0 ? (
                    <div className="appointment-wizard__doctor-grid">
                      {doctorProfiles.map((doctor) => (
                        <div
                          key={doctor.id}
                          className={`appointment-wizard__doctor-card ${
                            String(reservationData.doctorId) === String(doctor.id)
                              ? 'appointment-wizard__doctor-card--selected'
                              : ''
                          }`}
                          onClick={() => handleSelectDoctor(doctor.id)}
                        >
                          <img
                            src={doctor.photoFileName || 'https://via.placeholder.com/56'}
                            alt={doctor.emri}
                            className="appointment-wizard__doctor-avatar"
                          />
                          <span className="appointment-wizard__doctor-name">{doctor.emri}</span>
                          <span className="appointment-wizard__doctor-specialization">
                            {doctor.specializimi}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="appointment-wizard__hint">Loading doctors...</span>
                  )}
                </div>

                <div
                  className={`appointment-wizard__step ${
                    !reservationData.doctorId ? 'appointment-wizard__step--disabled' : ''
                  }`}
                >
                  <div className="appointment-wizard__step-label">
                    <span className="appointment-wizard__step-number">2</span>
                    Select Date
                  </div>
                  <Form.Control
                    type="date"
                    name="reservationDate"
                    min={today}
                    value={reservationData.reservationDate}
                    onChange={handleSelectDate}
                    disabled={!reservationData.doctorId}
                    style={{ maxWidth: 220 }}
                  />
                </div>

                <div
                  className={`appointment-wizard__step ${
                    !reservationData.doctorId || !reservationData.reservationDate
                      ? 'appointment-wizard__step--disabled'
                      : ''
                  }`}
                >
                  <div className="appointment-wizard__step-label">
                    <span className="appointment-wizard__step-number">3</span>
                    Select Available Time
                  </div>
                  {isLoadingAvailability ? (
                    <span className="appointment-wizard__hint">
                      <span className="spinner-border spinner-border-sm" style={{ marginRight: 8 }}></span>
                      Loading availability...
                    </span>
                  ) : reservationData.doctorId && reservationData.reservationDate ? (
                    availability.length > 0 ? (
                      <div className="appointment-wizard__slots">
                        {availability.map((slot) => (
                          <button
                            type="button"
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => handleSelectTime(slot)}
                            className={`appointment-wizard__slot ${
                              reservationData.reservationTime === slot.time
                                ? 'appointment-wizard__slot--selected'
                                : ''
                            } ${!slot.available ? 'appointment-wizard__slot--unavailable' : ''}`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="appointment-wizard__hint">No time slots for this date.</span>
                    )
                  ) : (
                    <span className="appointment-wizard__hint">
                      Select a doctor and date to see available times.
                    </span>
                  )}
                </div>

                <div className="appointment-wizard__step">
                  <div className="appointment-wizard__step-label">
                    <span className="appointment-wizard__step-number">4</span>
                    Confirm Appointment
                  </div>
                  {selectedDoctor && reservationData.reservationDate && reservationData.reservationTime ? (
                    <div className="appointment-wizard__summary">
                      <span>
                        Doctor: <strong>{selectedDoctor.emri}</strong> ({selectedDoctor.specializimi})
                      </span>
                      <span>
                        Date: <strong>{reservationData.reservationDate}</strong>
                      </span>
                      <span>
                        Time: <strong>{reservationData.reservationTime}</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="appointment-wizard__hint">
                      Complete the steps above to review your appointment.
                    </span>
                  )}
                </div>
              </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={isBookingAppointment}
            onClick={() => {
              setShowReservationModal(false);
              resetReservationForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReservationSubmit}
            disabled={
              isBookingAppointment ||
              !reservationData.doctorId ||
              !reservationData.reservationDate ||
              !reservationData.reservationTime
            }
          >
            {isBookingAppointment ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                  style={{ marginRight: 8 }}
                ></span>
                Booking...
              </>
            ) : (
              'Confirm Appointment'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formReviewText">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                name="reviewText"
                value={reviewData.reviewText}
                onChange={handleReviewInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formRating">
              <Form.Label>Rating</Form.Label>
              <Form.Control
                as="select"
                name="rating"
                value={reviewData.rating}
                onChange={handleReviewInputChange}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleReviewSubmit}>
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEmergencyModal} onHide={() => setShowEmergencyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create an Emergency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formDoctorId">
              <Form.Label>Doctor</Form.Label>
              <Form.Control
                as="select"
                name="doctorId"
                value={emergencyData.doctorId}
                onChange={handleEmergencyInputChange}
              >
                <option value="">Select a Doctor</option>
                {Object.entries(doctors).map(([doctorId, doctorName]) => (
                  <option key={doctorId} value={doctorId}>
                    {doctorName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formSubject">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={emergencyData.subject}
                onChange={handleEmergencyInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={emergencyData.description}
                onChange={handleEmergencyInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formContactNumber">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                name="contactNumber"
                value={emergencyData.contactNumber}
                onChange={handleEmergencyInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmergencyModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEmergencySubmit}>
            Submit Emergency
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    
  );
};

export default PatientDashboard;
