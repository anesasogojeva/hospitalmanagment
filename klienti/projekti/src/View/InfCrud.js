import React, { useState, useEffect, Fragment } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import "../CSS/Navbar.css";
import Pagination from "../components/Pagination";
import useDebouncedValue from "../hooks/useDebouncedValue";
import "../CSS/DataTableControls.css";
import {
  searchInfermjeri,
  fetchDepartments,
  createInfermjeri,
  updateInfermjeri,
  deleteInfermjeri,
} from "../services/infermjeriService";

// Friendly English labels for the nurse form fields (the underlying keys stay
// unchanged since they're sent to the API as-is).
const FIELD_LABELS = {
  emri: "Name",
  mbiemri: "Surname",
  dataELindjes: "Date of Birth",
  email: "Email",
  numriTel: "Phone Number",
  departamenti: "Department",
  pozita: "Position",
  vitetPune: "Years of Experience",
  foto: "Photo URL",
};

const InfCrud = () => {
  const [infermjeri, setInfermjeri] = useState([]);
  const [showSub, setShowSub] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    emri: "",
    mbiemri: "",
    dataELindjes: "",
    email: "",
    numriTel: "",
    gjinia: "",
    departamenti: "",
    pozita: "",
    vitetPune: "",
    foto: "",
  });
  const [editData, setEditData] = useState(null);

  // Search / filter / pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await searchInfermjeri({ search: debouncedSearch, department: departmentFilter, page, pageSize });
      setInfermjeri(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      setLoadError("Could not load nurses. Please try again.");
      console.error("Error loading data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, departmentFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, departmentFilter]);

  useEffect(() => {
    fetchDepartments()
      .then(setDepartmentOptions)
      .catch((error) => console.error("Error fetching departments:", error.message));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCreate = async () => {
    try {
      await createInfermjeri(formData);
      toast.success("Infermjeri created successfully!");
      loadData();
      setShowSub(false);
      resetForm();
    } catch (error) {
      toast.error(`Error creating Infermjeri: ${error.message}`);
    }
  };
  const handleEdit = (data) => {
    setEditData(data);
    setShowEdit(true);
  };
  const handleUpdate = async () => {
    try {
      await updateInfermjeri(editData.id_i, editData);
      toast.success("Infermjeri updated successfully!");
      loadData();
      setShowEdit(false);
    } catch (error) {
      toast.error(`Error updating Infermjeri: ${error.message}`);
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteInfermjeri(id);
      toast.success("Infermjeri deleted successfully!");
      if (infermjeri.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadData();
      }
    } catch (error) {
      toast.error(`Error deleting Infermjeri: ${error.message}`);
    }
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  const resetForm = () => {
    setFormData({
      emri: "",
      mbiemri: "",
      dataELindjes: "",
      email: "",
      numriTel: "",
      gjinia: "",
      departamenti: "",
      pozita: "",
      vitetPune: "",
      foto: "",
    });
  };

  return (
    <Fragment>
      <h1 style={{ textAlign: "center", color: "rgb(86, 168, 86)" }}>
        Nurses
      </h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row>
          <Col xs={12} sm={6} md={4}>
            <Button
              variant="outline-success"
              onClick={() => setShowSub(true)}
              style={{ width: "150px" }}
            >
              Add Nurse
            </Button>
          </Col>
        </Row>
      </Container>
      {/* Add Modal */}
      <Modal show={showSub} onHide={() => setShowSub(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Nurse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.keys(formData).map((key) =>
            key === "gjinia" ? (
              <select
                key={key}
                className="form-control mt-3"
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Femer">Female</option>
                <option value="Mashkull">Male</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <input
                key={key}
                type={
                  key === "dataELindjes"
                    ? "date"
                    : key === "vitetPune"
                    ? "number"
                    : "text"
                }
                className="form-control mt-3"
                placeholder={`Enter ${FIELD_LABELS[key] || key}`}
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
              />
            )
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSub(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreate}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Table */}
      <Container className="text-center">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select dt-toolbar__filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All departments</option>
            {departmentOptions.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading nurses...</div>
        ) : infermjeri.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch || departmentFilter ? "No nurses match your search." : "No nurses found."}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Surname</th>
                  <th>Date</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Years of Experience</th>
                  <th>Photo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {infermjeri.map((item, index) => (
                  <tr key={item.id_i}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.emri}</td>
                    <td>{item.mbiemri}</td>
                    <td>{item.dataELindjes}</td>
                    <td>{item.email}</td>
                    <td>{item.numriTel}</td>
                    <td>{item.gjinia}</td>
                    <td>{item.departamenti}</td>
                    <td>{item.pozita}</td>
                    <td>{item.vitetPune}</td>
                    <td>
                      <img
                        src={item.photoFile}
                        alt="Nurse"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>
                      <Button variant="success" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>{" "}
                      &nbsp;
                      <Button
                        variant="outline-light"
                        onClick={() => handleDelete(item.id_i)}
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
      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modify/Update Nurse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editData &&
            Object.keys(editData).map((key) =>
              key === "gjinia" ? (
                <select
                  key={key}
                  className="form-control mt-3"
                  name={key}
                  value={editData[key]}
                  onChange={handleEditInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Femer">Female</option>
                  <option value="Mashkull">Male</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input
                  key={key}
                  type={
                    key === "dataELindjes"
                      ? "date"
                      : key === "vitetPune"
                      ? "number"
                      : "text"
                  }
                  className="form-control mt-3"
                  placeholder={`Enter ${FIELD_LABELS[key] || key}`}
                  name={key}
                  value={editData[key]}
                  onChange={handleEditInputChange}
                />
              )
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
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
export default InfCrud;
