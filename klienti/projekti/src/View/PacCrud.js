import React, { useState, useEffect, Fragment } from "react";
import Table from "react-bootstrap/Table";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PacientiService from "../services/PacientiService";
import Pagination from "../components/Pagination";
import useDebouncedValue from "../hooks/useDebouncedValue";
import "../CSS/DataTableControls.css";
import "../App.css";

const PacCrud = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowSub = () => setShowSub(true);
  const handleCloseSub = () => setShowSub(false);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [date, setDate] = useState("");
  const [number, setNumber] = useState("");
  const [gjinia, setGjinia] = useState("");

  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editGjinia, setEditGjinia] = useState("");
  const [editUserId, setEditUserId] = useState("");

  // Search / filter / pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [genderFilter, setGenderFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadPatients = () => {
    setLoading(true);
    setLoadError("");
    PacientiService.searchPatients({ search: debouncedSearch, gender: genderFilter, page, pageSize })
      .then((response) => {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        setLoadError("Could not load patients. Please try again.");
        console.error(
          "Error fetching data:",
          error.response ? error.response.data : error.message
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, genderFilter, page, pageSize]);

  // Reset to page 1 whenever the search term or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilter]);

  const handleEdit = (id) => {
    PacientiService.getPatientById(id)
      .then((response) => {
        const pacienti = response.data;
        setEditId(pacienti.id_P);
        setEditName(pacienti.emri);
        setEditSurname(pacienti.mbiemri);
        setEditDate(pacienti.dataELindjes);
        setEditNumber(pacienti.numriTel);
        setEditGjinia(pacienti.gjinia);
        setEditEmail(pacienti.email);
        setEditUserId(pacienti.userId);
        handleShow();
      })
      .catch((error) => {
        toast.error("Error fetching patient details.");
        console.error(
          "Error fetching Pacienti:",
          error.response ? error.response.data : error.message
        );
      });
  };

  const handleUpdate = () => {
    const updatedPatient = {
      Id_P: editId,
      Emri: editName,
      Mbiemri: editSurname,
      DataELindjes: editDate,
      NumriTel: editNumber,
      Gjinia: editGjinia,
      UserId: (editUserId || "").trim() === "" ? null : editUserId,
    };

    PacientiService.updatePatient(editId, updatedPatient)
      .then(() => {
        loadPatients();
        handleClose();
        toast.success("Patient updated successfully!");
      })
      .catch((error) => {
        toast.error("Error updating patient");
        console.error(
          "Error updating Pacienti:",
          error.response ? error.response.data : error.message
        );
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      PacientiService.deletePatient(id)
        .then(() => {
          toast.success("Patient deleted successfully!");
          // If this was the last row on a page beyond the first, step back a page
          if (data.length === 1 && page > 1) {
            setPage((p) => p - 1);
          } else {
            loadPatients();
          }
        })
        .catch((error) => {
          toast.error("Error deleting patient");
          console.error(
            "Error deleting Pacienti:",
            error.response ? error.response.data : error.message
          );
        });
    }
  };

  // The backend returns { errors: [...] } for both model-validation failures (e.g. invalid
  // email) and account-creation failures (e.g. duplicate email).
  const extractErrors = (error) => {
    const data = error.response?.data;
    if (data && Array.isArray(data.errors) && data.errors.length > 0) return data.errors;
    if (data && Array.isArray(data.Errors) && data.Errors.length > 0) return data.Errors;
    return null;
  };

  const handleSave = () => {
    if (!email) {
      toast.error("Please enter an email for this patient.");
      return;
    }
    if (!password) {
      toast.error("Please set a password for this patient.");
      return;
    }

    const newPatient = {
      Emri: name,
      Mbiemri: surname,
      DataELindjes: date,
      Email: email,
      Password: password,
      NumriTel: number,
      Gjinia: gjinia,
    };

    PacientiService.addPatient(newPatient)
      .then(() => {
        handleCloseSub();
        loadPatients();
        toast.success("Patient added successfully! They can now log in with the email and password you set.");
        clear();
      })
      .catch((error) => {
        const errors = extractErrors(error);
        if (errors) {
          errors.forEach((message) => toast.error(message));
        } else {
          toast.error("Error adding patient");
        }
        console.error(
          "Error adding Pacienti:",
          error.response ? error.response.data : error.message
        );
      });
  };

  const clear = () => {
    setName("");
    setSurname("");
    setEmail("");
    setPassword("");
    setDate("");
    setNumber("");
    setGjinia("");
    setEditName("");
    setEditSurname("");
    setEditDate("");
    setEditNumber("");
    setEditGjinia("");
    setEditEmail("");
    setEditUserId("");
  };

  return (
    <Fragment>
      <h1 style={{ textAlign: "center", color: "rgb(86, 168, 86)" }}>
        Patients
      </h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row className="text-center">
          <Col>
            <Button variant="outline-success" onClick={handleShowSub}>
              Add Patient
            </Button>
          </Col>
        </Row>
      </Container>
      <Modal show={showSub} onHide={handleCloseSub}>
        <Modal.Header closeButton>
          <Modal.Title>Add Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className="form-control mt-3"
            placeholder="Enter Surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
          <input
            type="email"
            className="form-control mt-3"
            placeholder="Enter Email (used to log in)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="form-control mt-3"
            placeholder="Set a login password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="date"
            className="form-control mt-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="number"
            className="form-control mt-3"
            placeholder="Enter Number"
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value))}
          />
          <select
            className="form-control mt-3"
            value={gjinia}
            onChange={(e) => setGjinia(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Femer">Female</option>
            <option value="Mashkull">Male</option>
            <option value="Other">Other</option>
          </select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSub}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Container className="text-center">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select dt-toolbar__filter"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All genders</option>
            <option value="Femer">Female</option>
            <option value="Mashkull">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading patients...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch || genderFilter
              ? "No patients match your search."
              : "No patients found."}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name </th>
                  <th>Surname</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>UserId</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id_P}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.emri}</td>
                    <td>{item.mbiemri}</td>
                    <td>{item.email}</td>
                    <td>{item.dataELindjes}</td>
                    <td>{item.numriTel}</td>
                    <td>{item.gjinia}</td>
                    <td>{item.userId}</td>
                    <td>
                      <Button
                        variant="success"
                        onClick={() => handleEdit(item.id_P)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-light"
                        onClick={() => handleDelete(item.id_P)}
                      >
                        Delete
                      </Button>
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
          <Modal.Title>Edit Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              type="text"
              className="form-control mt-3"
              placeholder="Enter Surname"
              value={editSurname}
              onChange={(e) => setEditSurname(e.target.value)}
            />
            <input
              type="email"
              className="form-control mt-3"
              value={editEmail || ''}
              disabled
              readOnly
              title="Login email isn't editable here"
            />
            <input
              type="date"
              className="form-control mt-3"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <input
              type="number"
              className="form-control mt-3"
              placeholder="Enter Number"
              value={editNumber}
              onChange={(e) => setEditNumber(parseInt(e.target.value))}
            />
            <select
              className="form-control mt-3"
              value={editGjinia}
              onChange={(e) => setEditGjinia(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Femer">Female</option>
              <option value="Mashkull">Male</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              className="form-control mt-3"
              placeholder="Enter UserId (optional)"
              value={editUserId}
              onChange={(e) => setEditUserId(e.target.value)}
            />
          </Col>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default PacCrud;
