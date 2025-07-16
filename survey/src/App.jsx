import React, { useState, useEffect } from 'react';
import './design.css';
import 'toastr/build/toastr.min.css';
import toastr from 'toastr';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [formData, setFormData] = useState({
    corner: '',
    long: '',
    lat: ''
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fetch data from server
  const fetchData = async () => {
    try {
      const resp = await fetch('http://localhost:3000/data/display_data');
      if (resp.ok) {
        const data = await resp.json();
        setCoordinates(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toastr.error('Failed to fetch data');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Your table submission logic here
  };

  // Handle modal form submission
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const { corner, long, lat } = formData;
    
    if (!long || !lat) {
      toastr.error('Please enter valid coordinates');
      return;
    }

    try {
      let resp;
      const data = { corner, long: parseFloat(long), lat: parseFloat(lat) };

      if (editId) {
        resp = await fetch(`http://localhost:3000/data/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        resp = await fetch('http://localhost:3000/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      if (resp.ok) {
        toastr.success(editId ? 'Data updated successfully!' : 'Data added successfully!');
        setModalVisible(false);
        setEditId(null);
        setFormData({ corner: '', long: '', lat: '' });
        fetchData();
      } else {
        throw new Error('Failed to save data');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toastr.error(err.message);
    }
  };

  // Handle edit button click
  const handleEdit = async (id) => {
    try {
      const resp = await fetch(`http://localhost:3000/data/${id}`);
      if (resp.ok) {
        const item = await resp.json();
        setFormData({
          corner: item.corner || '',
          long: item.long,
          lat: item.lat
        });
        setEditId(id);
        setModalVisible(true);
      } else {
        throw new Error('Failed to fetch data for update');
      }
    } catch (err) {
      console.error('Edit error:', err);
      toastr.error(err.message);
    }
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const resp = await fetch(`http://localhost:3000/data/${id}`, {
        method: 'DELETE',
      });

      if (resp.ok) {
        toastr.success('Data deleted successfully!');
        fetchData();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toastr.error(err.message);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setEditId(null);
    setFormData({ corner: '', long: '', lat: '' });
  };

  // Initialize toastr
  useEffect(() => {
    toastr.options = {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-bottom-right',
      timeOut: 4000,
      preventDuplicates: true,
    };

    fetchData();
  }, []);

  return (
    <>
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <a href="/test">
          <i className="bi bi-house-door-fill"></i>
          <span>Home</span>
        </a>
        <button className="sidebar-button" onClick={() => setModalVisible(true)}>
          <i className="bi bi-upload"></i>
          <span>Submit</span>
        </button>
        <a href="/map">
          <i className="bi bi-map"></i>
          <span>Map</span>
        </a>
        <a href="/settings">
          <i className="bi bi-gear-fill"></i>
          <span>Settings</span>
        </a>
      </div>

      <div className="topbar">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <h5 className="mb-0 fw-bold text-success">Coordinate Dashboard</h5>
      </div>

      <div className="content">
        <div className="row gy-4">
          <div className="col-12 col-md-5">
            <div className="form-container">
              <h4 className="text-success fw-bold mb-3">Submit Coordinates</h4>
              <form id="dataForm" onSubmit={handleSubmit}>
                <div className="table_div">
                  <table id="editableTable">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>UTM Coordinates</th>
                        <th>Lat/Long</th>
                        <th>Elevation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Add dynamic rows here */}
                    </tbody>
                  </table>
                </div>
                <br />
                <center>
                  <button
                    type="submit"
                    style={{ width: '20%' }}
                    id="submitBtn"
                    className="btn btn-success btn-sm"
                  >
                    Submit
                  </button>
                </center>
              </form>
            </div>
          </div>

          <div className="col-12 col-md-7">
            <div className="table-container">
              <h4 className="text-success fw-bold mb-3">Coordinates table</h4>
              <div className="d-flex justify-content-end">
                <input
                  type="text"
                  id="searchInput"
                  className="form-control me-5"
                  placeholder="Search"
                />
                <select
                  id="rowCount"
                  className="form-label"
                >
                  <option value="0">Row</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                </select>
              </div>
              <br />
              <div style={{ overflow: 'auto' }}>
                <div style={{ height: 293, overflow: 'auto', width: '100%' }}>
                  <table
                    id="myTable"
                    className="table table-bordered table-striped table-responsive"
                    style={{ textAlign: 'center', verticalAlign: 'middle' }}
                  >
                    <thead>
                      <tr>
                        <th className="text-center align-middle">Corner</th>
                        <th className="text-center align-middle">Longitude</th>
                        <th className="text-center align-middle">Latitude</th>
                        <th className="text-center align-middle">Action</th>
                      </tr>
                    </thead>
                    <tbody id="coordinatesTable">
                      {coordinates.length === 0 ? (
                        <tr>
                          <td className="text-center align-middle" colSpan="4">
                            No data
                          </td>
                        </tr>
                      ) : (
                        coordinates.map((coord) => (
                          <tr key={coord.id}>
                            <td className="text-center align-middle">{coord.corner || ''}</td>
                            <td className="text-center align-middle">{coord.long}</td>
                            <td className="text-center align-middle">{coord.lat}</td>
                            <td className="text-center align-middle">
                              <button 
                                className="btn btn-primary btn-sm update-btn me-2"
                                onClick={() => handleEdit(coord.id)}
                              >
                                <i className="bi bi-arrow-clockwise"></i> Update
                              </button>
                              <button 
                                className="btn btn-danger btn-sm delete-btn"
                                onClick={() => handleDelete(coord.id)}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className={`modal fade ${modalVisible ? 'show d-block' : ''}`}
        id="inputModal"
        tabIndex="-1"
        aria-labelledby="inputModalLabel"
        aria-hidden={!modalVisible}
        style={{ backgroundColor: modalVisible ? 'rgba(0,0,0,0.5)' : 'none' }}
      >
        <div className="modal-dialog">
          <form id="coordinatesForm" className="modal-content" onSubmit={handleModalSubmit}>
            <div className="modal-header">
              <h5 className="modal-title" id="inputModalLabel">
                {editId ? 'Update' : 'Add'} Coordinates
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="corner" className="form-label">
                  Corner
                </label>
                <input
                  type="text"
                  name="corner"
                  id="corner"
                  className="form-control"
                  placeholder="Corner (optional)"
                  value={formData.corner}
                  onChange={(e) => setFormData({...formData, corner: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="long" className="form-label">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="long"
                  id="long"
                  className="form-control"
                  placeholder="Longitude"
                  required
                  value={formData.long}
                  onChange={(e) => setFormData({...formData, long: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="lat" className="form-label">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  id="lat"
                  className="form-control"
                  placeholder="Latitude"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              
            </div>
          </form>
        </div>
      </div>
      <script src="script.js"></script>
    </>
  );
}