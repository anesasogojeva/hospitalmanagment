// components/RekCrud.js
import React, { useState, useEffect, Fragment } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RekordService from "../services/RekordService"; // Import the service layer
import doktoriService from "../services/doktoriService";
import Pagination from "../components/Pagination";
import useDebouncedValue from "../hooks/useDebouncedValue";
import "../CSS/DataTableControls.css";
import "../App.css";

const RekCrud = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showPaci, setShowPaci] = useState(false);
  const [showDoki, setShowDoki] = useState(false);
  const [selectedPaci, setSelectedPaci] = useState(null);
  const [selectedDoki, setSelectedDoki] = useState(null);

  // Form state variables
  const [id_P, setId_P] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [diagnoza, setDiagnoza] = useState("");
  const [receta, setReceta] = useState("");
  const [rezultatet, setRezultatet] = useState("");
  const [doktori, setDoktori] = useState({});
  const [pacienti, setPacienti] = useState({});

  // Edit form state
  const [editId_Rek, setEditId_Rek] = useState("");
  const [editId_P, setEditId_P] = useState("");
  const [editDoctorId, setEditDoctorId] = useState("");
  const [editDiagnoza, setEditDiagnoza] = useState("");
  const [editReceta, setEditReceta] = useState("");
  const [editRezultatet, setEditRezultatet] = useState("");
  const [editDoktori, setEditDoktori] = useState({});
  const [editPacienti, setEditPacienti] = useState({});

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

  // Handlers for modals
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowSub = () => setShowSub(true);
  const handleCloseSub = () => setShowSub(false);
  const handleShowPaci = (pacienti) => {
    setSelectedPaci(pacienti);
    setShowPaci(true);
  };
  const handleShowDoki = (doktori) => {
    setSelectedDoki(doktori);
    setShowDoki(true);
  };
  const handleClosePaci = () => {
    setShowPaci(false);
    setSelectedPaci(null);
  };
  const handleCloseDoki = () => {
    setShowDoki(false);
    setSelectedDoki(null);
  };

  // Fetch records (server-side search/filter/pagination)
  const getData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await RekordService.search({
        search: debouncedSearch,
        doctorId: doctorFilter,
        page,
        pageSize,
      });
      setData(result.data.items);
      setTotalCount(result.data.totalCount);
      setTotalPages(result.data.totalPages);
    } catch (error) {
      setLoadError("Could not load records. Please try again.");
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
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

  // Handle delete
  const handleDelete = async (id_Rek) => {
    if (window.confirm("Are you sure you want to delete this rekord?")) {
      try {
        await RekordService.delete(id_Rek);
        toast.success("Rekord deleted successfully!");
        if (data.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          getData();
        }
      } catch (error) {
        toast.error("Error deleting Rekord");
        console.error("Error deleting Rekord:", error);
      }
    }
  };

  // Handle edit
  const handleEdit = async (id_Rek) => {
    try {
      handleShow();
      const result = await RekordService.getById(id_Rek);
      const { id_P, doctorId, diagnoza, receta, rezultatet, doktori, pacienti } = result.data;
      setEditId_P(id_P);
      setEditDoctorId(doctorId);
      setEditDiagnoza(diagnoza);
      setEditReceta(receta);
      setEditRezultatet(rezultatet);
      setEditDoktori(doktori);
      setEditPacienti(pacienti);
      setEditId_Rek(id_Rek);
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editId_P || !editDoctorId || !editDiagnoza || !editReceta || !editRezultatet) {
      toast.error("Please fill in all fields.");
      return;
    }

    const updatedData = {
      Id_Rek: editId_Rek,
      Id_P: editId_P,
      DoctorId: editDoctorId,
      Diagnoza: editDiagnoza,
      Receta: editReceta,
      Rezultatet: editRezultatet,
      Doktori: editDoktori,
      Pacienti: editPacienti,
    };

    try {
      await RekordService.update(editId_Rek, updatedData);
      handleClose();
      getData();
      clear();
      toast.success("Rekord updated successfully!");
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!id_P || !doctorId || !diagnoza || !receta || !rezultatet) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newData = {
      Id_P: id_P,
      DoctorId: doctorId,
      Diagnoza: diagnoza,
      Receta: receta,
      Rezultatet: rezultatet,
      Doktori: doktori,
      Pacienti: pacienti,
    };

    try {
      await RekordService.create(newData);
      handleCloseSub();
      getData();
      clear();
      toast.success("Rekord added successfully!");
    } catch (error) {
      toast.error("Error adding record");
      console.error("Error adding record:", error);
    }
  };

  const clear = () => {
    setId_P("");
    setDoctorId("");
    setDiagnoza("");
    setReceta("");
    setRezultatet("");
    setDoktori({});
    setPacienti({});
    setEditId_P("");
    setEditDoctorId("");
    setEditDiagnoza("");
    setEditReceta("");
    setEditRezultatet("");
    setEditDoktori({});
    setEditPacienti({});
  };

  const userRole = localStorage.getItem("role");
  if (userRole !== "admin") {
    return <h2>Unauthorized: You do not have access to this page.</h2>;
  }

  return (
    <Fragment>
      <h1 style={{ textAlign: 'center', color:' rgb(86, 168, 86)' }}>Records</h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row className="text-center">
          <Col>
            <Button variant="outline-success" onClick={handleShowSub}>Add Record</Button>
          </Col>
        </Row>
      </Container>
      <Modal show={showSub} onHide={handleCloseSub}>
        <Modal.Header closeButton>
          <Modal.Title>Add Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type='number' className="form-control" placeholder="Enter Patient ID" value={id_P} onChange={(e) => setId_P(parseInt(e.target.value))} />
          <input type='number' className="form-control mt-3" placeholder="Enter Doctor ID" value={doctorId} onChange={(e) => setDoctorId(parseInt(e.target.value))} />
          <input type='text' className="form-control mt-3" placeholder="Enter Diagnosis" value={diagnoza} onChange={(e) => setDiagnoza(e.target.value)} />
          <input type='text' className="form-control mt-3" placeholder="Enter Prescription" value={receta} onChange={(e) => setReceta((e.target.value))} />
          <input type='text' className="form-control mt-3" placeholder="Enter Results" value={rezultatet} onChange={(e) => setRezultatet(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSub}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
      <br></br>
      <Container className="text-center">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by diagnosis, patient or doctor..."
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
          <div className="dt-state">Loading records...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch || doctorFilter ? "No records match your search." : "No records found."}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient ID</th>
                  <th>Doctor ID</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                  <th>Test Results</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id_Rek}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td><Button variant="outline-light" onClick={() => handleShowPaci(item.pacienti)}>{item.pacienti?.emri}</Button></td>
                    <td><Button variant="outline-light" onClick={() => handleShowDoki(item.doktori)}>{item.doktori?.emri}</Button></td>
                    <td>{item.diagnoza}</td>
                    <td>{item.receta}</td>
                    <td>{item.rezultatet}</td>
                    <td>
                      <Button variant="success" onClick={() => handleEdit(item.id_Rek)}>Edit</Button> &nbsp;
                      <Button variant="outline-light" onClick={() => handleDelete(item.id_Rek)}>Delete</Button>
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
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modify/update Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col>
            <input type='number' className="form-control" placeholder="Enter Patient ID" value={editId_P} onChange={(e) => setEditId_P(parseInt(e.target.value))} />
          </Col><br />
          <Col>
            <input type='number' className="form-control" placeholder="Enter Doctor ID" value={editDoctorId} onChange={(e) => setEditDoctorId(parseInt(e.target.value))} />
          </Col><br />
          <Col>
            <input type='text' className="form-control" placeholder="Enter Diagnosis" value={editDiagnoza} onChange={(e) => setEditDiagnoza(e.target.value)} />
          </Col><br />
          <Col>
            <input type='text' className="form-control"placeholder="Enter Prescription" value={editReceta} onChange={(e) => setEditReceta(e.target.value)} />
          </Col><br />
          <Col>
            <input type='text' className="form-control" placeholder="Enter Results" value={editRezultatet} onChange={(e) => setEditRezultatet(e.target.value)} />
          </Col><br />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

    </Fragment>
  );
};

export default RekCrud;
