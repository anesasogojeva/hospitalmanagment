import React, { useState, useEffect, Fragment } from "react";
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import doktoriService from '../services/doktoriService'; // Import the service
import Pagination from '../components/Pagination';
import useDebouncedValue from '../hooks/useDebouncedValue';
import '../CSS/DataTableControls.css';
import '../App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Doktori = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowSub = () => setShowSub(true);
  const handleCloseSub = () => setShowSub(false);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specializimi, setSpecializimi] = useState('');
  const [pervoja, setPervoja] = useState('');
  const [foto, setFoto] = useState('');

  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSpecializimi, setEditSpecializimi] = useState('');
  const [editPervoja, setEditPervoja] = useState('');
  const [editFoto, setEditFoto] = useState('');

  // Search / filter / pagination
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDoctors = () => {
    setLoading(true);
    setLoadError('');
    doktoriService.searchDoctors({ search: debouncedSearch, specialization: specializationFilter, page, pageSize })
      .then((response) => {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        setLoadError('Could not load doctors. Please try again.');
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, specializationFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, specializationFilter]);

  useEffect(() => {
    doktoriService.getSpecializations()
      .then((response) => setSpecializationOptions(response.data))
      .catch((error) => console.error('Error fetching specializations:', error));
  }, []);

  const handleEdit = (id) => {
    doktoriService.getDoctorById(id)
      .then((response) => {
        const doctor = response.data;
        setEditId(doctor.id);
        setEditName(doctor.emri);
        setEditDate(doctor.dataELindjes);
        setEditEmail(doctor.email);
        setEditPhone(doctor.numriTel);
        setEditSpecializimi(doctor.specializimi);
        setEditPervoja(doctor.pervoja);
        setEditFoto(doctor.photoFileName);
        handleShow();
      })
      .catch((error) => {
        toast.error('Error fetching doctor details.');
        console.error('Error fetching doctor:', error.response ? error.response.data : error.message);
      });
  };

  const handleUpdate = () => {
    const updatedDoctor = {
      "ID": editId,
      "Emri": editName,
      "DataELindjes": editDate,
      "Email": editEmail,
      "NumriTel": editPhone,
      "Specializimi": editSpecializimi,
      "Pervoja": editPervoja,
      "PhotoFileName": editFoto
    };

    doktoriService.updateDoctor(editId, updatedDoctor)
      .then(() => {
        loadDoctors();
        handleClose();
        toast.success("Doctor updated successfully!");
      })
      .catch((error) => {
        toast.error('Error updating doctor');
        console.error('Error updating doctor:', error.response ? error.response.data : error.message);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      doktoriService.deleteDoctor(id)
        .then(() => {
          toast.success('Doctor deleted successfully!');
          if (data.length === 1 && page > 1) {
            setPage((p) => p - 1);
          } else {
            loadDoctors();
          }
        })
        .catch((error) => {
          toast.error('Error deleting doctor');
          console.error('Error deleting doctor:', error.response ? error.response.data : error.message);
        });
    }
  };

  // The backend returns { Errors: [...] } for both model-validation failures (e.g. invalid
  // email) and account-creation failures (e.g. duplicate email, weak password).
  const extractErrors = (error) => {
    const data = error.response?.data;
    if (data && Array.isArray(data.errors) && data.errors.length > 0) return data.errors;
    if (data && Array.isArray(data.Errors) && data.Errors.length > 0) return data.Errors;
    return null;
  };

  const handleSave = () => {
    if (!password) {
      toast.error('Please set a password for this doctor.');
      return;
    }

    const newDoctor = {
      "Emri": name,
      "DataELindjes": date,
      "Email": email,
      "Password": password,
      "NumriTel": phone,
      "Specializimi": specializimi,
      "Pervoja": pervoja,
      "PhotoFileName": foto
    };

    doktoriService.addDoctor(newDoctor)
      .then(() => {
        handleCloseSub();
        loadDoctors();
        toast.success('Doctor added successfully! They can now log in with the email and password you set.');
        clear();
      })
      .catch((error) => {
        const errors = extractErrors(error);
        if (errors) {
          errors.forEach((message) => toast.error(message));
        } else {
          toast.error('Error adding doctor');
        }
        console.error('Error adding doctor:', error.response ? error.response.data : error.message);
      });
  };

  const clear = () => {
    setName('');
    setDate('');
    setEmail('');
    setPassword('');
    setPhone('');
    setSpecializimi('');
    setPervoja('');
    setFoto('');
    setEditName('');
    setEditDate('');
    setEditEmail('');
    setEditPhone('');
    setEditSpecializimi('');
    setEditPervoja('');
    setEditFoto('');
  };

  return (
    <Fragment>
      <h1 style={{ textAlign: 'center', color: 'rgb(86, 168, 86)' }}>Doctors</h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row className="text-center">
          <Col>
            <Button variant="outline-success" onClick={handleShowSub}>Add Doctor</Button>
          </Col>
        </Row>
      </Container>
      <Modal show={showSub} onHide={handleCloseSub}>
        <Modal.Header closeButton>
          <Modal.Title>Add Doctor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="text" className="form-control" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="date" className="form-control mt-3" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="email" className="form-control mt-3" placeholder="Enter Email (used to log in)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="form-control mt-3" placeholder="Set a login password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="text" className="form-control mt-3" placeholder="Enter Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="text" className="form-control mt-3" placeholder="Enter Specialization" value={specializimi} onChange={(e) => setSpecializimi(e.target.value)} />
          <input type="number" className="form-control mt-3" placeholder="Enter Experience" value={pervoja} onChange={(e) => setPervoja(parseInt(e.target.value))} />
          <input type="text" className="form-control mt-3" placeholder="Enter Photo URL" value={foto} onChange={(e) => setFoto(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSub}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Container className="text-center">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select dt-toolbar__filter"
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
          >
            <option value="">All specializations</option>
            {specializationOptions.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading doctors...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch || specializationFilter ? 'No doctors match your search.' : 'No doctors found.'}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name and Surname</th>
                  <th>Date</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Photo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.emri}</td>
                    <td>{item.dataELindjes}</td>
                    <td>{item.email}</td>
                    <td>{item.numriTel}</td>
                    <td>{item.specializimi}</td>
                    <td>{item.pervoja}</td>
                    <td>
                      <img src={item.photoFileName} alt="Doctor" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                    </td>
                    <td>
                      <Button variant="success" onClick={() => handleEdit(item.id)}>Edit</Button>
                      <Button variant="outline-light" onClick={() => handleDelete(item.id)}>Delete</Button>
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
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modify/update Doctor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col>
            <input type="text" className="form-control" placeholder="Enter Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <input type="date" className="form-control mt-3" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            <input type="email" className="form-control mt-3" placeholder="Enter Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <input type="text" className="form-control mt-3" placeholder="Enter Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            <input type="text" className="form-control mt-3" placeholder="Enter Specialization" value={editSpecializimi} onChange={(e) => setEditSpecializimi(e.target.value)} />
            <input type="number" className="form-control mt-3" placeholder="Enter Experience" value={editPervoja} onChange={(e) => setEditPervoja(parseInt(e.target.value))} />
            <input type="text" className="form-control mt-3" placeholder="Enter Photo URL" value={editFoto} onChange={(e) => setEditFoto(e.target.value)} />
          </Col>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="success" onClick={handleUpdate}>Update</Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
}

export default Doktori;
