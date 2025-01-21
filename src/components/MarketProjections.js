import React, { useState, useEffect } from 'react';

const MarketProjections = () => {
  const [projections, setProjections] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedProjection, setEditedProjection] = useState({});
  const [newProjection, setNewProjection] = useState({
    Designation: '',
    Location: '',
    SalaryCode: '',
    MarketSalaryBenchmark: '',
  });

  // Fetch projections from the backend
  useEffect(() => {
    fetch('http://localhost:5000/api/projections')
      .then((response) => response.json())
      .then((data) => setProjections(data))
      .catch((error) => console.error('Error fetching projections:', error));
  }, []);

  // Handle the editing of a row
  const handleEdit = (projection) => {
    setEditMode(projection.id);
    setEditedProjection({
      ...projection,
    });
  };

  // Handle the changes in the input fields
  const handleChange = (e) => {
    setEditedProjection({
      ...editedProjection,
      [e.target.name]: e.target.value,
    });
  };

  // Handle the changes for the new projection form
  const handleNewChange = (e) => {
    setNewProjection({
      ...newProjection,
      [e.target.name]: e.target.value,
    });
  };

  // Handle saving the edited projection
  const handleSave = (id) => {
    fetch(`http://localhost:5000/api/projections/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedProjection),
    })
      .then((response) => response.json())
      .then((data) => {
        setProjections((prevProjections) =>
          prevProjections.map((projection) =>
            projection.id === id ? { ...projection, ...editedProjection } : projection
          )
        );
        setEditMode(null);
      })
      .catch((error) => console.error('Error saving projection:', error));
  };

  // Handle canceling the edit
  const handleCancel = () => {
    setEditMode(null);
  };

  // Handle adding a new projection
  const handleAdd = () => {
    fetch('http://localhost:5000/api/projections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProjection),
    })
      .then((response) => response.json())
      .then((data) => {
        setProjections((prevProjections) => [...prevProjections, data]); // Add new projection to the state
        setNewProjection({
          Designation: '',
          Location: '',
          SalaryCode: '',
          MarketSalaryBenchmark: '',
        }); // Clear form
      })
      .catch((error) => console.error('Error adding projection:', error));
  };

  // Handle deleting a projection
  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/projections/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        setProjections((prevProjections) =>
          prevProjections.filter((projection) => projection.id !== id)
        );
      })
      .catch((error) => console.error('Error deleting projection:', error));
  };

  return (
    <div>
      <h3>Market Projections</h3>
      <table>
        <thead>
          <tr>
            <th>Designation</th>
            <th>Location</th>
            <th>Salary Code</th>
            <th>Market Salary Benchmark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projections.map((projection) => (
            <tr key={projection.id}>
              <td>
                {editMode === projection.id ? (
                  <input
                    type="text"
                    name="Designation"
                    value={editedProjection.Designation || projection.Designation}
                    onChange={handleChange}
                  />
                ) : (
                  projection.Designation
                )}
              </td>
              <td>
                {editMode === projection.id ? (
                  <input
                    type="text"
                    name="Location"
                    value={editedProjection.Location || projection.Location}
                    onChange={handleChange}
                  />
                ) : (
                  projection.Location
                )}
              </td>
              <td>
                {editMode === projection.id ? (
                  <input
                    type="text"
                    name="SalaryCode"
                    value={editedProjection.SalaryCode || projection.SalaryCode}
                    onChange={handleChange}
                  />
                ) : (
                  projection.SalaryCode
                )}
              </td>
              <td>
                {editMode === projection.id ? (
                  <input
                    type="text"
                    name="MarketSalaryBenchmark"
                    value={editedProjection.MarketSalaryBenchmark || projection.MarketSalaryBenchmark}
                    onChange={handleChange}
                  />
                ) : (
                  projection.MarketSalaryBenchmark
                )}
              </td>
              <td>
                {editMode === projection.id ? (
                  <>
                    <button onClick={() => handleSave(projection.id)}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(projection)}>Edit</button>
                    <button onClick={() => handleDelete(projection.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>Add New Projection</h4>
      <div>
        <input
          type="text"
          name="Designation"
          placeholder="Designation"
          value={newProjection.Designation}
          onChange={handleNewChange}
        />
        <input
          type="text"
          name="Location"
          placeholder="Location"
          value={newProjection.Location}
          onChange={handleNewChange}
        />
        <input
          type="text"
          name="SalaryCode"
          placeholder="Salary Code"
          value={newProjection.SalaryCode}
          onChange={handleNewChange}
        />
        <input
          type="text"
          name="MarketSalaryBenchmark"
          placeholder="Market Salary Benchmark"
          value={newProjection.MarketSalaryBenchmark}
          onChange={handleNewChange}
        />
        <button onClick={handleAdd}>Add Projection</button>
      </div>
    </div>
  );
};

export default MarketProjections;
