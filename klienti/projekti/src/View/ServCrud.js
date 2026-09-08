import React, { useState, useEffect, Fragment } from "react";
import { Table, Button, Modal, Row, Col, Container } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SherbimiService from '../services/SherbimiService';
import Pagination from '../components/Pagination';
import useDebouncedValue from '../hooks/useDebouncedValue';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/DataTableControls.css';
import '../App.css';

const ServCrud = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);

  const [formData, setFormData] = useState({ name: '', pershkrimi: '', stafi: '' });
  const [editData, setEditData] = useState({ id: '', name: '', pershkrimi: '', stafi: '' });

  const userRole = localStorage.getItem('role');

  // Search / pagination (no category/status field exists on SherbimiModel, so no filter here)
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await SherbimiService.search({ search: debouncedSearch, page, pageSize });
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setLoadError('Could not load services. Please try again.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.pershkrimi || !formData.stafi) {
        toast.error('Please fill in all fields.');
        return;
      }

      await SherbimiService.create({
        Emri: formData.name,
        Pershkrimi: formData.pershkrimi,
        Stafi: formData.stafi
      });

      toast.success('Service added successfully!');
      setShowSub(false);
      fetchData();
      setFormData({ name: '', pershkrimi: '', stafi: '' });
    } catch (error) {
      toast.error('Error adding service.');
      console.error(error);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await SherbimiService.getById(id);
      const { emri, pershkrimi, stafi } = response.data;
      setEditData({ id, name: emri, pershkrimi, stafi });
      setShow(true);
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editData.name || !editData.pershkrimi || !editData.stafi) {
        toast.error('Please fill in all fields.');
        return;
      }

      await SherbimiService.update(editData.id, {
        id_S: editData.id,
        Emri: editData.name,
        Pershkrimi: editData.pershkrimi,
        Stafi: editData.stafi
      });

      toast.success('Service updated successfully!');
      setShow(false);
      fetchData();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await SherbimiService.delete(id);
        toast.success('Service deleted successfully!');
        if (data.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          fetchData();
        }
      } catch (error) {
        toast.error('Error deleting service.');
        console.error(error);
      }
    }
  };

  if (userRole !== 'admin') {
    return <h2>Unauthorized: You do not have access to this page.</h2>;
  }

  return (
    <Fragment>
      <h1 style={{ textAlign: 'center', color: 'rgb(86, 168, 86)' }}>Services</h1>
      <ToastContainer />
      <Container className="mt-5">
        <Row className="text-center">
          <Col>
            <Button variant="outline-success" onClick={() => setShowSub(true)}>Add Service</Button>
          </Col>
        </Row>
      </Container>

      <Container className="text-center">
        <div className="dt-toolbar text-start">
          <div className="dt-toolbar__search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by service name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loadError ? (
          <div className="dt-state dt-state--error">{loadError}</div>
        ) : loading ? (
          <div className="dt-state">Loading services...</div>
        ) : data.length === 0 ? (
          <div className="dt-state">
            {debouncedSearch ? 'No services match your search.' : 'No services found.'}
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark" className="mt-4">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id_S}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.emri}</td>
                    <td>{item.pershkrimi}</td>
                    <td><img src={item.stafi} alt="service" style={{ width: '100px', height: '100px' }} /></td>
                    <td>
                      <Button variant="success" onClick={() => handleEdit(item.id_S)}>Edit</Button>
                      <Button variant="outline-light" onClick={() => handleDelete(item.id_S)}>Delete</Button>
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

      {/* Add Modal */}
      <Modal show={showSub} onHide={() => setShowSub(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control mt-3"
            placeholder="Description"
            value={formData.pershkrimi}
            onChange={(e) => setFormData({ ...formData, pershkrimi: e.target.value })}
          />
          <input
            type="text"
            className="form-control mt-3"
            placeholder="Photo URL"
            value={formData.stafi}
            onChange={(e) => setFormData({ ...formData, stafi: e.target.value })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSub(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control mt-3"
            placeholder="Description"
            value={editData.pershkrimi}
            onChange={(e) => setEditData({ ...editData, pershkrimi: e.target.value })}
          />
          <input
            type="text"
            className="form-control mt-3"
            placeholder="Photo URL"
            value={editData.stafi}
            onChange={(e) => setEditData({ ...editData, stafi: e.target.value })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
          <Button variant="success" onClick={handleUpdate}>Update</Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default ServCrud;
