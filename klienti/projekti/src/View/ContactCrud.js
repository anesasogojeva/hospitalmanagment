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
import "../App.css";
import Pagination from "../components/Pagination";
import useDebouncedValue from "../hooks/useDebouncedValue";
import "../CSS/DataTableControls.css";
import {
  searchContacts,
  addContact,
  deleteContact,
} from "../services/ContactService";

const ContactCRUD = () => {
  const [data, setData] = useState([]);
  const [showSub, setShowSub] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Search / pagination (no status field exists on ContactModel, so no filter here)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchContacts = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await searchContacts({ search: debouncedSearch, page, pageSize });
      setData(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      setLoadError("Could not load contact requests. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSave = async () => {
    if (!name || !email) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newContact = { name, email, message };

    try {
      await addContact(newContact);
      setShowSub(false);
      clearFields();
      fetchContacts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
        if (data.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          fetchContacts();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const clearFields = () => {
    setName("");
    setEmail("");
    setMessage("");
  };

  // Check user role
  const userRole = localStorage.getItem("role");
  if (userRole !== "admin") {
    return <h2>Unauthorized: You do not have access to this page.</h2>;
  }

  return (
    <Fragment>
      <h1 style={{ textAlign: "center", color: "rgb(86, 168, 86)" }}>
        Contacts
      </h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row className="text-center">
          <Col>
            <Button variant="outline-success" onClick={() => setShowSub(true)}>
              Add Contact
            </Button>
          </Col>
        </Row>
      </Container>
      <Modal show={showSub} onHide={() => setShowSub(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Contact</Modal.Title>
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
            type="email"
            className="form-control mt-3"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            className="form-control mt-3"
            placeholder="Enter Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
      <Container className="text-center mt-3">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading contact requests...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch ? "No contact requests match your search." : "No contact requests found."}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.contactId}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.message}</td>
                    <td>
                      <Button
                        variant="outline-light"
                        onClick={() => handleDelete(item.contactId)}
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

export default ContactCRUD;
