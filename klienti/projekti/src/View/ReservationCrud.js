import React, { useState, useEffect, Fragment } from "react";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { ToastContainer, toast } from 'react-toastify';
import ListGroup from 'react-bootstrap/ListGroup';
import ReservationService from '../services/ReservationService';
import doktoriService from '../services/doktoriService';
import Pagination from '../components/Pagination';
import useDebouncedValue from '../hooks/useDebouncedValue';
import '../CSS/DataTableControls.css';

const ReservationCrud = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showPaci, setShowPaci] = useState(false);  // Show patient modal
  const [showDoki, setShowDoki] = useState(false);  // Show doctor modal
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [editReservationId, setEditReservationId] = useState('');
  const [editReservationDate, setEditReservationDate] = useState('');
  const [editReservationTime, setEditReservationTime] = useState('');
  const [editPatient, setEditPatient] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [selectedPaci, setSelectedPaci] = useState(null); // Selected patient
  const [selectedDoki, setSelectedDoki] = useState(null); // Selected doctor

  // Search / filter / pagination
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Fetch appointments
  const getData = () => {
    setLoading(true);
    setLoadError('');
    ReservationService.searchReservations({
      search: debouncedSearch,
      doctorId: doctorFilter,
      dateFrom,
      dateTo,
      page,
      pageSize,
    })
      .then((response) => {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        setLoadError('Could not load appointments. Please try again.');
        console.error('Error fetching reservations:', error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, doctorFilter, dateFrom, dateTo, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, doctorFilter, dateFrom, dateTo]);

  useEffect(() => {
    doktoriService.getDoctors()
      .then((response) => setDoctorOptions(response.data))
      .catch((error) => console.error('Error fetching doctors for filter:', error));
  }, []);

  // Add a new reservation
  const handleSave = () => {
    if (!reservationDate || !reservationTime || !patient || !doctor) {
      toast.error('Please fill in all fields.');
      return;
    }

    const newReservation = {
      ReservationDate: reservationDate,
      ReservationTime: reservationTime,
      Patient: patient,
      Doctor: doctor
    };

    ReservationService.addReservation(newReservation)
      .then(() => {
        toast.success('Appointment added successfully!');
        getData();
        clearForm();
        setShowSub(false);
      })
      .catch((error) => {
        toast.error('Error adding appointment');
        console.error('Error:', error);
      });
  };

  // Edit reservation
  const handleEdit = (reservationId) => {
    setShow(true);

    ReservationService.getReservationById(reservationId)
      .then((response) => {
        const { reservationDate, reservationTime, patient, doctor } = response.data;
        setEditReservationId(reservationId);
        setEditReservationDate(reservationDate);
        setEditReservationTime(reservationTime);
        setEditPatient(patient);
        setEditDoctor(doctor);
      })
      .catch((error) => {
        console.error('Error fetching reservation details:', error);
      });
  };

  const handleUpdate = () => {
    if (!editReservationDate || !editReservationTime || !editPatient || !editDoctor) {
      toast.error('Please fill in all fields.');
      return;
    }

    const updatedReservation = {
      ReservationId: editReservationId,
      ReservationDate: editReservationDate,
      ReservationTime: editReservationTime,
      Patient: editPatient,
      Doctor: editDoctor
    };

    ReservationService.updateReservation(editReservationId, updatedReservation)
      .then(() => {
        toast.success('Appointment updated successfully!');
        getData();
        clearForm();
        setShow(false);
      })
      .catch((error) => {
        toast.error('Error updating appointment');
        console.error('Error:', error);
      });
  };

  // Delete reservation
  const handleDelete = (reservationId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      ReservationService.deleteReservation(reservationId)
        .then(() => {
          toast.success('Appointment deleted successfully!');
          if (data.length === 1 && page > 1) {
            setPage((p) => p - 1);
          } else {
            getData();
          }
        })
        .catch((error) => {
          toast.error('Error deleting appointment');
          console.error('Error:', error);
        });
    }
  };

  // Change appointment status (admin-only control; backend also enforces the admin role)
  const handleStatusChange = (reservationId, newStatus) => {
    const previousData = data;
    setData((prev) =>
      prev.map((item) => (item.reservationId === reservationId ? { ...item, status: newStatus } : item))
    );

    ReservationService.updateReservationStatus(reservationId, newStatus)
      .then(() => {
        toast.success('Appointment status updated!');
      })
      .catch((error) => {
        setData(previousData);
        toast.error('Error updating appointment status');
        console.error('Error:', error);
      });
  };

  // Clear form fields
  const clearForm = () => {
    setReservationDate('');
    setReservationTime('');
    setPatient('');
    setDoctor('');
    setEditReservationId('');
    setEditReservationDate('');
    setEditReservationTime('');
    setEditPatient('');
    setEditDoctor('');
  };

  // Handle patient modal open and close
  const handleShowPaci = (patient) => {
    setSelectedPaci(patient);
    setShowPaci(true);
  };

  const handleClosePaci = () => setShowPaci(false);

  // Handle doctor modal open and close
  const handleShowDoki = (doctor) => {
    setSelectedDoki(doctor);
    setShowDoki(true);
  };

  const handleCloseDoki = () => setShowDoki(false);

  const userRole = localStorage.getItem('role');

  if (userRole !== 'admin') {
    return <h2>Unauthorized: You do not have access to this page.</h2>;
  }

  return (
    <Fragment>
      <h1 style={{ textAlign: 'center', color: ' rgb(86, 168, 86)' }}>Appointments</h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row className="text-center">
          <Col>
            <Button variant="outline-success" onClick={() => setShowSub(true)}>Add Appointment</Button>
          </Col>
        </Row>
      </Container>
      <Modal show={showSub} onHide={() => setShowSub(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type='date' className="form-control" placeholder="Enter Appointment Date" value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} />
          <input type='time' className="form-control mt-3" placeholder="Enter Appointment Time" value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} />
          <input type='number' className="form-control mt-3" placeholder="Enter Patient ID" value={patient} onChange={(e) => setPatient(parseInt(e.target.value))} />
          <input type='number' className="form-control mt-3" placeholder="Enter Doctor ID" value={doctor} onChange={(e) => setDoctor(parseInt(e.target.value))} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSub(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type='date' className="form-control" value={editReservationDate} onChange={(e) => setEditReservationDate(e.target.value)} />
          <input type='time' className="form-control mt-3" value={editReservationTime} onChange={(e) => setEditReservationTime(e.target.value)} />
          <input type='number' className="form-control mt-3" value={editPatient} onChange={(e) => setEditPatient(parseInt(e.target.value))} />
          <input type='number' className="form-control mt-3" value={editDoctor} onChange={(e) => setEditDoctor(parseInt(e.target.value))} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
          <Button variant="success" onClick={handleUpdate}>Update</Button>
        </Modal.Footer>
      </Modal>

      <br />
      <Container className="text-center">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by patient or doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select dt-toolbar__filter"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="">All doctors</option>
            {doctorOptions.map((d) => (
              <option key={d.id} value={d.id}>{d.emri}</option>
            ))}
          </select>
          <input
            type="date"
            className="form-control dt-toolbar__filter"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="From date"
            title="From date"
          />
          <input
            type="date"
            className="form-control dt-toolbar__filter"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="To date"
            title="To date"
          />
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading appointments...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch || doctorFilter || dateFrom || dateTo
              ? 'No appointments match your search.'
              : 'No appointments found.'}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Appointment Date</th>
                  <th>Appointment Time</th>
                  <th>Patient ID</th>
                  <th>Doctor ID</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.reservationId}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.reservationDate}</td>
                    <td>{item.reservationTime}</td>
                    <td><Button variant="outline-light" onClick={() => handleShowPaci(item.patientNavigation)}>{item.patientNavigation?.emri}</Button></td>
                    <td><Button variant="outline-light" onClick={() => handleShowDoki(item.doctorNavigation)}>{item.doctorNavigation?.emri}</Button></td>
                    <td>
                      <Form.Select
                        size="sm"
                        style={{ minWidth: '130px' }}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.reservationId, e.target.value)}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button variant="success" onClick={() => handleEdit(item.reservationId)}>Edit</Button> &nbsp;
                      <Button variant="outline-light" onClick={() => handleDelete(item.reservationId)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}

       {/* Pacienti Modal */}
       <Modal show={showPaci} onHide={handleClosePaci}>
         <Modal.Header closeButton>
           <Modal.Title>Patient Details</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           {selectedPaci && (
             <ListGroup>
               <ListGroup.Item>{selectedPaci.emri}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedPaci.mbiemri}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedPaci.dataELindjes}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedPaci.gjinia}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedPaci.numriTel}</ListGroup.Item><br/>
             </ListGroup>
           )}
         </Modal.Body>
       </Modal>

       {/* Doktori Modal */}
       <Modal show={showDoki} onHide={handleCloseDoki}>
         <Modal.Header closeButton>
           <Modal.Title>Doctor Details</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           {selectedDoki && (
             <ListGroup>
               <ListGroup.Item >{selectedDoki.emri}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedDoki.dataELindjes}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedDoki.email}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedDoki.specializimi}</ListGroup.Item><br/>
               <ListGroup.Item>{selectedDoki.photoFileName}</ListGroup.Item><br/>
             </ListGroup>
           )}
         </Modal.Body>
         </Modal>
      </Container>
    </Fragment>
  );
};

export default ReservationCrud;
