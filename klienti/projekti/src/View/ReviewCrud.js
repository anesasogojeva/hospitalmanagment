import React, { useState, useEffect, Fragment } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReviewService from "../services/ReviewService"; // Import the service layer
import Pagination from "../components/Pagination";
import useDebouncedValue from "../hooks/useDebouncedValue";
import "../CSS/DataTableControls.css";
import "../App.css";

const ReviewCrud = () => {
  const [data, setData] = useState([]);
  const [patients, setPatients] = useState([]);  // State to store patients
  const [show, setShow] = useState(false);  // Modal for edit/add
  const [showAdd, setShowAdd] = useState(false); // Modal for adding new review

  // Form state variables
  const [id_P, setId_P] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("");
  const [pacienti, setPacienti] = useState({});

  // Edit form state
  const [editId_R, setEditId_R] = useState("");
  const [editId_P, setEditId_P] = useState("");
  const [editReviewText, setEditReviewText] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editPacienti, setEditPacienti] = useState({});

  // Search / filter / pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getPatients();  // Fetch patients when component mounts
  }, []);

  // Fetch all reviews (server-side search/filter/pagination)
  const getData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await ReviewService.search({ search: debouncedSearch, rating: ratingFilter, page, pageSize });
      setData(result.data.items);
      setTotalCount(result.data.totalCount);
      setTotalPages(result.data.totalPages);
    } catch (error) {
      setLoadError("Could not load reviews. Please try again.");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, ratingFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, ratingFilter]);

  // Fetch all patients
  const getPatients = async () => {
    try {
      const result = await ReviewService.getPatients();
      setPatients(result);  // Set the list of patients
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  // Find patient name by ID
  const getPatientName = (id_P) => {
    const patient = patients.find((p) => p.id_P === id_P);
    return patient ? patient.emri : "Unknown";  // Replace "Unknown" if patient not found
  };

  // Handlers for modals
  const handleClose = () => setShow(false);
  const handleCloseAdd = () => setShowAdd(false);
  const handleShowAdd = () => setShowAdd(true);

  // Handle delete
  const handleDelete = async (id_R) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await ReviewService.delete(id_R);
        toast.success("Review deleted successfully!");
        if (data.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          getData();
        }
      } catch (error) {
        toast.error("Error deleting review");
        console.error("Error deleting review:", error);
      }
    }
  };

  // Handle edit
  const handleEdit = async (id_R) => {
    try {
      setShow(true); // Open the edit modal
      const result = await ReviewService.getById(id_R);
      const { id_P, reviewText, rating, pacienti } = result.data;
      setEditId_P(id_P);
      setEditReviewText(reviewText);
      setEditRating(rating);
      setEditPacienti(pacienti);
      setEditId_R(id_R);
    } catch (error) {
      console.error("Error fetching review:", error);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editId_P || !editReviewText || !editRating) {
      toast.error("Please fill in all fields.");
      return;
    }

    const updatedData = {
      Id_R: editId_R,
      Id_P: editId_P,
      ReviewText: editReviewText,
      Rating: editRating,
      Pacienti: editPacienti,
    };

    try {
      await ReviewService.update(editId_R, updatedData);
      handleClose();
      getData();
      clear();
      toast.success("Review updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  // Handle save for new review
  const handleSave = async () => {
    if (!id_P || !reviewText || !rating) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newReview = {
      Id_P: id_P,
      ReviewText: reviewText,
      Rating: rating,
      Pacienti: pacienti,
    };

    try {
      await ReviewService.create(newReview);
      getData();
      clear();
      toast.success("Review added successfully!");
      handleCloseAdd(); // Close add modal
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };

  // Clear form fields
  const clear = () => {
    setId_P("");
    setReviewText("");
    setRating("");
    setPacienti({});
  };

  // Handle rating input for Add Review Modal
  const handleRatingChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 5) {
      setRating(value);
    } else {
      toast.error("Rating must be between 0 and 5.");
    }
  };

  // Handle rating input for Edit Review Modal
  const handleEditRatingChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 5) {
      setEditRating(value);
    } else {
      toast.error("Rating must be between 0 and 5.");
    }
  };

  return (
    <Fragment>
      <h1 style={{ textAlign: "center", color: "rgb(86, 168, 86)" }}>Reviews</h1>
      <ToastContainer />
      <Container className="mt-5 text-center">
        <Button variant="outline-success" onClick={handleShowAdd}>
          Add Review
        </Button>
      </Container>

      {/* Add Review Modal */}
      <Modal show={showAdd} onHide={handleCloseAdd}>
        <Modal.Header closeButton>
          <Modal.Title>Add Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <select
            className="form-control"
            value={id_P}
            onChange={(e) => setId_P(parseInt(e.target.value))}
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.id_P} value={patient.id_P}>
                {patient.emri}
              </option>
            ))}
          </select>
          <textarea
            className="form-control mt-3"
            placeholder="Enter Review Text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <input
            type="number"
            className="form-control mt-3"
            placeholder="Enter Rating (0-5)"
            value={rating}
            onChange={handleRatingChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>
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
              placeholder="Search by review text or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select dt-toolbar__filter"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading reviews...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch || ratingFilter ? "No reviews match your search." : "No reviews found."}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>Review Text</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id_R}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.pacienti?.emri || getPatientName(item.id_P)}</td>
                    <td>{item.reviewText}</td>
                    <td>{item.rating}</td>
                    <td>
                      <Button variant="success" onClick={() => handleEdit(item.id_R)}>
                        Edit
                      </Button>{" "}
                      &nbsp;
                      <Button
                        variant="outline-light"
                        onClick={() => handleDelete(item.id_R)}
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

      {/* Edit Review Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <select
            className="form-control"
            value={editId_P}
            onChange={(e) => setEditId_P(parseInt(e.target.value))}
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.id_P} value={patient.id_P}>
                {patient.emri}
              </option>
            ))}
          </select>
          <textarea
            className="form-control mt-3"
            placeholder="Enter Review Text"
            value={editReviewText}
            onChange={(e) => setEditReviewText(e.target.value)}
          />
          <input
            type="number"
            className="form-control mt-3"
            placeholder="Enter Rating (0-5)"
            value={editRating}
            onChange={handleEditRatingChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default ReviewCrud;
