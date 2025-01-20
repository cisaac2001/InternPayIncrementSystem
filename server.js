const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the folder where files will be uploaded
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
  }
});

const upload = multer({ storage: storage });
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}


// Enable CORS for all requests (if you're making cross-origin requests from frontend)
app.use(cors());

app.use(express.json()); // Middleware for parsing application/json
app.use(express.urlencoded({ extended: true })); // Middleware for parsing application/x-www-form-urlencoded

// MySQL connection setup
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',  // Use your MySQL username
  password: 'asdfj3242lkjfsd234#%%kjfdsj@@kjf34',  // Use your MySQL password
  database: 'salaryincrementsystem',  // Your database name
});

module.exports = db;

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API route to get employee data
app.get('/api/employees', (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch employee data' });
    } else {
      res.json(results); // This will send all fields to the front-end
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Function to validate and map headers
function validateAndMapHeaders(data) {
  // Get the header keys from the Excel data (first row)
  const headers = Object.keys(data[0]);

  // Check if all required headers are present
  // for (let key in headerMapping) {
  //   if (!headers.includes(key)) {
  //     console.log(`Missing required header: ${key}`);
  //     return false;
  //   }
  // }

  // Create an array to store the mapped data
  const mappedData = data.map((row) => {
    const mappedRow = {};
    for (let excelHeader in row) {
      const dbField = headerMapping[excelHeader];
      if (dbField) {
        mappedRow[dbField] = row[excelHeader]; // Map the data
      }
    }
    return mappedRow;
  });

  return mappedData;
}

// Function to insert the mapped data into the database
function insertData(mappedData) {
  // Loop through each row of the mapped data
  mappedData.forEach((row) => {
    const query = `
      INSERT INTO employees (
        EmployeeID, Entity, Name, DateOfJoining, EmploymentType, Designation,
        Location, Team, JobFunction, ManagerName, ManCom,
        CurrentSalaryLocal, CurrentSalaryUSD, KPIRating, ValuesRating,
        FinalRating, IncrementEligible, Remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      row.EmployeeID, row.Entity, row.Name, row.DateOfJoining, row.EmploymentType, row.Designation,
      row.Location, row.Team, row.JobFunction, row.ManagerName, row.ManCom,
      row.CurrentSalaryLocal, row.CurrentSalaryUSD, row.KPIRating, row.ValuesRating,
      row.FinalRating, row.IncrementEligible, row.Remarks,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return;
      }
      console.log('Data inserted:', result);
    });
  });
}

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).send({ message: 'No file uploaded' });
    }

    // Read the uploaded Excel file
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);

    // Parse the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Validate and map the Excel headers
    const mappedData = validateAndMapHeaders(jsonData);
    if (!mappedData) {
      return res.status(400).send({ message: 'Missing required headers in the file' });
    }


    // Insert the mapped data into the database
    insertData(mappedData);

    // Send success response
    res.status(200).send({
      message: 'File uploaded and data inserted successfully',
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

const headerMapping = {
  'E.ID': 'EmployeeID',
  'Entity': 'Entity',
  'Employee Name': 'Name',
  'Date of Joining': 'DateOfJoining',
  'Employment Type': 'EmploymentType',
  'Designation': 'Designation',
  'Location': 'Location',
  'Team Name': 'Team',
  'Job function': 'JobFunction',
  'Reporting Manager Name': 'ManagerName',
  'ManCom': 'ManCom',
  'Current Monthly Base Salary (Payroll Currency)': 'CurrentSalaryLocal',
  'Current Monthly Base Salary (USD)': 'CurrentSalaryUSD',
  'Rating (KPI/Goals)': 'KPIRating',
  'Rating (Values)': 'ValuesRating',
  'Final Rating': 'FinalRating',
  'Eligible (Y/N)': 'IncrementEligible',
  'Reason for Increment': 'Remarks',
};

app.get('/api/currencies', (req, res) => {
  console.log('Received request for currencies');
  
  // Check if the connection is established
  if (!db) {
    console.error('Database connection not established');
    return res.status(500).send('Database connection not established');
  }

  const query = 'SELECT * FROM conversion_rates';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching currencies:', err);
      return res.status(500).send('Error fetching currencies');
    }

    // Log the results to see what is being returned
    console.log('Fetched currencies:', results);

    // Check if results are empty
    if (results.length === 0) {
      console.warn('No currencies found in the database');
      return res.status(404).send('No currencies found');
    }

    res.json(results); // Send the results as JSON
  });
});

// Endpoint to update a conversion rate
app.put('/api/currencies/:id', (req, res) => {
  const { id } = req.params;
  const { CurrencyCode, ConversionRateUSD } = req.body;

  const query = 'UPDATE conversion_rates SET CurrencyCode = ?, ConversionRateUSD = ? WHERE id = ?';
  db.query(query, [CurrencyCode, ConversionRateUSD, id], (err, result) => {
    if (err) {
      console.error('Error updating currency:', err);
      return res.status(500).send({ message: 'Error updating currency' });
    }

    res.status(200).send({ message: 'Currency updated successfully' });
  });
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;  // Get the employee ID from the URL parameter
  const {
    Name,
    Entity,
    DateOfJoining,
    EmploymentType,
    Designation,
    Location,
    Team,
    JobFunction,
    ManagerName,
    ManCom,
    CurrentSalaryLocal,
    CurrentSalaryUSD,
    KPIRating,
    ValuesRating,
    FinalRating,
    IncrementEligible,
    Remarks,
  } = req.body;  // Get the updated fields from the request body

  // Query to update the employee in the database
  const query = `
    UPDATE employees
    SET 
      Name = ?, 
      Entity = ?, 
      DateOfJoining = ?, 
      EmploymentType = ?, 
      Designation = ?, 
      Location = ?, 
      Team = ?, 
      JobFunction = ?, 
      ManagerName = ?, 
      ManCom = ?, 
      CurrentSalaryLocal = ?, 
      CurrentSalaryUSD = ?, 
      KPIRating = ?, 
      ValuesRating = ?, 
      FinalRating = ?, 
      IncrementEligible = ?, 
      Remarks = ?
    WHERE EmployeeID = ?`;

  // Execute the query
  db.query(query, [
    Name, 
    Entity, 
    DateOfJoining, 
    EmploymentType, 
    Designation, 
    Location, 
    Team, 
    JobFunction, 
    ManagerName, 
    ManCom, 
    CurrentSalaryLocal, 
    CurrentSalaryUSD, 
    KPIRating, 
    ValuesRating, 
    FinalRating, 
    IncrementEligible, 
    Remarks, 
    id
  ], (err, result) => {
    if (err) {
      console.error('Error updating employee:', err);
      return res.status(500).send({ message: 'Error updating employee' });
    }

    res.status(200).send({ message: 'Employee updated successfully' });
  });
});

