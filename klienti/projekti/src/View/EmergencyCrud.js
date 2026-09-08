import React, { useState, useEffect, Fragment } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { ToastContainer, toast } from "react-toastify";
import EmergencyService from "../services/EmergencyService";
import doktoriService from "../services/doktoriService";
import Pagination from "../components/Pagination";
import useDebouncedValue from "../hooks/useDebouncedValue";
import "../CSS/DataTableControls.css";

const EmergencyCrud = () => {
  const [data, setData] = useState([]);
  const [showSub, setShowSub] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");

  // Search / filter / pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [doctorFilter, setDoctorFilter] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const getData = () => {
    setLoading(true);
    setLoadError("");
    EmergencyService.searchEmergencies({ search: debouncedSearch, doctorId: doctorFilter, page, pageSize })
      .then((response) => {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        setLoadError("Could not load emergencies. Please try again.");
        console.error("Error fetching emergencies:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, doctorFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, doctorFilter]);

  useEffect(() => {
    doktoriService
      .getDoctors()
      .then((response) => setDoctorOptions(response.data))
      .catch((error) => console.error("Error fetching doctors for filter:", error));
  }, []);

  // Add a new emergency
  const handleSave = () => {
    if (!subject || !description || !contactNumber || !patient || !doctor) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newEmergency = {
      Subject: subject,
      Pershkrimi: description,
      NumriKontaktit: contactNumber,
      Patient: patient,
      Doctor: doctor,
    };

    EmergencyService.addEmergency(newEmergency)
      .then(() => {
        toast.success("Emergency added successfully!");
        getData();
        clearForm();
        setShowSub(false);
      })
      .catch((error) => {
        toast.error("Error adding emergency");
        console.error("Error:", error);
      });
  };

  // Delete emergency
  const handleDelete = (emergencyId) => {
    if (window.confirm("Are you sure you want to delete this emergency?")) {
      EmergencyService.deleteEmergency(emergencyId)
        .then(() => {
          toast.success("Emergency deleted successfully!");
          if (data.length === 1 && page > 1) {
            setPage((p) => p - 1);
          } else {
            getData();
          }
        })
        .catch((error) => {
          toast.error("Error deleting emergency");
          console.error("Error:", error);
        });
    }
  };

  // Clear form fields
  const clearForm = () => {
    setSubject("");
    setDescription("");
    setContactNumber("");
    setPatient("");
    setDoctor("");
  };

  const userRole = localStorage.getItem("role");

  if (userRole !== "admin") {
    return <h2>Unauthorized: You do not have access to this page.</h2>;
  }

  return (
    <Fragment>
      <h1 style={{ textAlign: "center", color: " rgb(86, 168, 86)" }}>
        Emergencies
      </h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row className="text-center">
          <Col>
            <Button variant="outline-success" onClick={() => setShowSub(true)}>
              Add Emergency
            </Button>
          </Col>
        </Row>
      </Container>
      <Modal show={showSub} onHide={() => setShowSub(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Emergency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="form-control mt-3"
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            className="form-control mt-3"
            placeholder="Enter Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
          <input
            type="number"
            className="form-control mt-3"
            placeholder="Enter Patient ID"
            value={patient}
            onChange={(e) => setPatient(parseInt(e.target.value))}
          />
          <input
            type="number"
            className="form-control mt-3"
            placeholder="Enter Doctor ID"
            value={doctor}
            onChange={(e) => setDoctor(parseInt(e.target.value))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSub(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <br />
      <Container className="text-center">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by subject, contact or patient..."
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
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading emergencies...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch || doctorFilter ? "No emergencies match your search." : "No emergencies found."}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Contact Number</th>
                  <th>Patient Name</th>
                  <th>Doctor Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id_E}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.subject}</td>
                    <td>{item.pershkrimi}</td>
                    <td>{item.numriKontaktit}</td>
                    <td>{item.patientNavigation?.emri || "Unknown"}</td>
                    <td>{item.doctorNavigation?.emri || "Unknown"}</td>
                    <td>
                      <Button
                        variant="outline-light"
                        onClick={() => handleDelete(item.id_E)}
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
    </Fragment>
  );
};

export default EmergencyCrud;
