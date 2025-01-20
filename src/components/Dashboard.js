import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import FileUpload from './FileUpload';
import CurrencyTable from "./CurrencyTable";

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [editMode, setEditMode] = useState(null); // To track which row is being edited
  const [editedEmployee, setEditedEmployee] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Add sorting state

  useEffect(() => {
    fetch("http://localhost:5000/api/employees")
      .then((response) => response.json())
      .then((data) => {
        setEmployees(data); // Set the data to state
      })
      .catch((error) => console.error(error));
  }, []);

  const handleEdit = (employee) => {
    setEditMode(employee.EmployeeID); // Set the current row to be edited
    setEditedEmployee({ ...employee });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  const handleSave = (employeeId) => {
    const updatedEmployee = { ...editedEmployee };
  
    // Make PUT request to save the employee data
    fetch(`http://localhost:5000/api/employees/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEmployee),
    })
      .then((response) => response.json())
      .then(() => {
        // After saving, re-fetch the employee data from the server
        fetchEmployees(); // Fetch updated employee data
        setEditMode(null); // Exit edit mode after saving
      })
      .catch((error) => console.error('Error updating employee:', error));
  };
  
  // Function to fetch employee data from the server
  const fetchEmployees = () => {
    fetch("http://localhost:5000/api/employees")
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data); // Log the fetched data
        setEmployees(data); // Set the updated data to state
      })
      .catch((error) => console.error('Error fetching employees:', error));
  };
  

  const handleCancel = () => {
    setEditMode(null); // Exit edit mode without saving
  };

  const filteredEmployees = employees.filter((employee) =>
    Object.values(employee).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sorting function
  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedEmployees = [...employees].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setEmployees(sortedEmployees);
  };

  return (
    <div>
      <h1>Employee Dashboard</h1>
      <CurrencyTable />
      <input
        type="text"
        placeholder="Search employees..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <FileUpload />
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th onClick={() => sortData('EmployeeID')}>Employee ID</th>
            <th onClick={() => sortData('Entity')}>Entity</th>
            <th onClick={() => sortData('Name')}>Name</th>
            <th onClick={() => sortData('DateOfJoining')}>Date of Joining</th>
            <th onClick={() => sortData('EmploymentType')}>Employment Type</th>
            <th onClick={() => sortData('Designation')}>Designation</th>
            <th onClick={() => sortData('Location')}>Location</th>
            <th onClick={() => sortData('Team')}>Team</th>
            <th onClick={() => sortData('JobFunction')}>Job Function</th>
            <th onClick={() => sortData('ManagerName')}>Manager Name</th>
            <th onClick={() => sortData('ManCom')}>ManCom</th>
            <th onClick={() => sortData('CurrentSalaryLocal')}>Current Salary (Local)</th>
            <th onClick={() => sortData('CurrentSalaryUSD')}>Current Salary (USD)</th>
            <th onClick={() => sortData('KPIRating')}>KPI Rating</th>
            <th onClick={() => sortData('ValuesRating')}>Values Rating</th>
            <th onClick={() => sortData('FinalRating')}>Final Rating</th>
            <th onClick={() => sortData('IncrementEligible')}>Increment Eligible</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={`${employee.EmployeeID}-${employee.Name}`}>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="EmployeeID"
                    value={editedEmployee.EmployeeID || employee.EmployeeID || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.EmployeeID
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="Entity"
                    value={editedEmployee.Entity || employee.Entity || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.Entity
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="Name"
                    value={editedEmployee.Name || employee.Name || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.Name
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="DateOfJoining"
                    value={editedEmployee.DateOfJoining || employee.DateOfJoining || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.DateOfJoining
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="EmploymentType"
                    value={editedEmployee.EmploymentType || employee.EmploymentType || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.EmploymentType
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="Designation"
                    value={editedEmployee.Designation || employee.Designation || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.Designation
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="Location"
                    value={editedEmployee.Location || employee.Location || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.Location
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="Team"
                    value={editedEmployee.Team || employee.Team || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.Team
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="JobFunction"
                    value={editedEmployee.JobFunction || employee.JobFunction || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.JobFunction
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="ManagerName"
                    value={editedEmployee.ManagerName || employee.ManagerName || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.ManagerName
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="ManCom"
                    value={editedEmployee.ManCom || employee.ManCom || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.ManCom
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="CurrentSalaryLocal"
                    value={editedEmployee.CurrentSalaryLocal || employee.CurrentSalaryLocal || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.CurrentSalaryLocal
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="CurrentSalaryUSD"
                    value={editedEmployee.CurrentSalaryUSD || employee.CurrentSalaryUSD || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.CurrentSalaryUSD
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="KPIRating"
                    value={editedEmployee.KPIRating || employee.KPIRating || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.KPIRating
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="ValuesRating"
                    value={editedEmployee.ValuesRating || employee.ValuesRating || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.ValuesRating
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="FinalRating"
                    value={editedEmployee.FinalRating || employee.FinalRating || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.FinalRating
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="IncrementEligible"
                    value={editedEmployee.IncrementEligible || employee.IncrementEligible || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.IncrementEligible
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <input
                    type="text"
                    name="Remarks"
                    value={editedEmployee.Remarks || employee.Remarks || ""}
                    onChange={handleChange}
                  />
                ) : (
                  employee.Remarks
                )}
              </td>
              <td>
                {editMode === employee.EmployeeID ? (
                  <button onClick={() => handleSave(employee.EmployeeID)}>Save</button>
                ) : (
                  <button onClick={() => handleEdit(employee)}>Edit</button>
                )}
                {editMode === employee.EmployeeID && (
                  <button onClick={handleCancel}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
