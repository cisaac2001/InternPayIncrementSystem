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
  multipleStatements: true,
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
        Location, Team, JobFunction, ManagerName, ManCom, SalaryCode,
        CurrentSalaryLocal, CurrentSalaryUSD, KPIRating, ValuesRating,
        FinalRating, IncrementEligible, ReasonForIncrement, IncrementPercentage, NewRevisedBaseSalary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      row.EmployeeID, row.Entity, row.Name, row.DateOfJoining, row.EmploymentType, row.Designation,
      row.Location, row.Team, row.JobFunction, row.ManagerName, row.ManCom, row.SalaryCode,
      row.CurrentSalaryLocal, row.CurrentSalaryUSD, row.KPIRating, row.ValuesRating,
      row.FinalRating, row.IncrementEligible, row.ReasonForIncrement, row.IncrementPercentage, row.NewRevisedBaseSalary
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
  'Current Monthly Base Salary (Payroll Currency)': 'SalaryCode',
  'Current Monthly Base Salary (Payroll Currency)': 'CurrentSalaryLocal',
  'Current Monthly Base Salary (USD)': 'CurrentSalaryUSD',
  'Rating (KPI/Goals)': 'KPIRating',
  'Rating (Values)': 'ValuesRating',
  'Final Rating': 'FinalRating',
  'Eligible (Y/N)': 'IncrementEligible',
  'Reason for Increment': 'ReasonForIncrement',
  'Salary Increment': 'IncrementPercentage',
  'New Revised Base Salary': 'NewRevisedBaseSalary',
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
    SalaryCode,
    CurrentSalaryLocal,
    CurrentSalaryUSD,
    KPIRating,
    ValuesRating,
    FinalRating,
    IncrementEligible,
    ReasonForIncrement,
    IncrementPercentage,
    NewRevisedBaseSalary
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
      SalaryCode = ?, 
      CurrentSalaryLocal = ?, 
      CurrentSalaryUSD = ?, 
      KPIRating = ?, 
      ValuesRating = ?, 
      FinalRating = ?, 
      IncrementEligible = ?, 
      ReasonForIncrement = ?
      IncrementPercentage = ?
      NewRevisedBaseSalary = ?
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
    SalaryCode, 
    CurrentSalaryLocal, 
    CurrentSalaryUSD, 
    KPIRating, 
    ValuesRating, 
    FinalRating, 
    IncrementEligible, 
    ReasonForIncrement,
    IncrementPercentage,
    NewRevisedBaseSalary, 
    id
  ], (err, result) => {
    if (err) {
      console.error('Error updating employee:', err);
      return res.status(500).send({ message: 'Error updating employee' });
    }

    res.status(200).send({ message: 'Employee updated successfully' });
  });
});

app.get('/api/projections', (req, res) => {
  console.log('Received request for projections');
  
  // Check if the connection is established
  if (!db) {
    console.error('Database connection not established');
    return res.status(500).send('Database connection not established');
  }

  const query = 'SELECT * FROM market_projections';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching projections:', err);
      return res.status(500).send('Error fetching projections');
    }

    // Log the results to see what is being returned
    console.log('Fetched projections:', results);

    // Check if results are empty
    if (results.length === 0) {
      console.warn('No projections found in the database');
      return res.status(404).send('No projections found');
    }

    res.json(results); // Send the results as JSON
  });
});

// Endpoint to update a conversion rate
app.put('/api/projections/:id', (req, res) => {
  const { id } = req.params; // Get the id from the URL parameter
  const { Designation, Location, SalaryCode, MarketSalaryBenchmark } = req.body;

  if (!id) {
    return res.status(400).send('Missing id in request');
  }

  // Check if 'id' is valid and exists
  console.log(`Updating projection with ID: ${id}`);

  const query = 'UPDATE market_projections SET Designation = ?, Location = ?, SalaryCode = ?, MarketSalaryBenchmark = ? WHERE id = ?';
  
  // If your database column name is not 'id', replace it with the correct column name
  db.query(query, [Designation, Location, SalaryCode, MarketSalaryBenchmark, id], (err, result) => {
    if (err) {
      console.error('Error updating market projection:', err);
      return res.status(500).send({ message: 'Error updating market projection' });
    }

    res.status(200).send({ message: 'Market projection updated successfully' });
  });
});

// Endpoint to add a new projection
app.post('/api/projections', (req, res) => {
  const { Designation, Location, SalaryCode, MarketSalaryBenchmark } = req.body;
  const query = 'INSERT INTO market_projections (Designation, Location, SalaryCode, MarketSalaryBenchmark) VALUES (?, ?, ?, ?)';
  db.query(query, [Designation, Location, SalaryCode, MarketSalaryBenchmark], (err, result) => {
    if (err) {
      console.error('Error adding projection:', err);
      return res.status(500).send('Error adding projection');
    }
    // Return the newly created projection (with an auto-generated ID)
    res.status(201).json({
      id: result.insertId,
      Designation,
      Location,
      SalaryCode,
      MarketSalaryBenchmark,
    });
  });
});

// Endpoint to delete a projection
app.delete('/api/projections/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM market_projections WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting projection:', err);
      return res.status(500).send('Error deleting projection');
    }

    // Check if any row was deleted
    if (result.affectedRows === 0) {
      return res.status(404).send('Projection not found');
    }

    res.status(200).send({ message: 'Projection deleted successfully' });
  });
});

// PUT endpoint to update salary for an individual employee based on ID
app.put('/api/employees/update-salary-usd/:id', (req, res) => {
  const { id } = req.params; // Get the ID from the URL parameter
  const updateQuery = `
    UPDATE employees e
    JOIN conversion_rates cr
    ON e.SalaryCode = cr.CurrencyCode
    SET e.CurrentSalaryUSD = e.CurrentSalaryLocal * cr.ConversionRateUSD
    WHERE e.EmployeeID = ?
  `;

  db.query(updateQuery, [id], (err, result) => {
    if (err) {
      console.error('Error updating salary for employee ID:', id, err);
      return res.status(500).send({ message: `Error updating salary for employee ID: ${id}` });
    }

    res.status(200).send({ message: `Salary updated successfully for employee ID: ${id}` });
  });
});

app.put('/api/admin/budget-percentage/:id', (req, res) => {
  const { id } = req.params; // The id parameter to identify the correct row
  const { percentage } = req.body; // The percentage sent by the admin

  if (!percentage || percentage <= 0 || percentage > 100) {
      return res.status(400).send('Invalid percentage value');
  }

  const query = 'UPDATE budget_config SET percentage = ? WHERE id = ?';

  db.query(query, [percentage, id], (err, result) => {
      if (err) {
          console.error('Error updating budget percentage:', err);
          return res.status(500).send({ message: 'Error updating budget percentage' });
      }

      res.status(200).send({ message: 'Budget percentage updated successfully' });
  });
});

app.get('/api/admin/total-budget/:id', (req, res) => {
  const { id } = req.params; // The id parameter to fetch the specific budget config

  // Step 1: Get the total salary of all employees
  const getTotalSalaryQuery = 'SELECT SUM(CurrentSalaryUSD) AS totalSalary FROM employees';

  db.query(getTotalSalaryQuery, (err, result) => {
      if (err) {
          console.error('Error fetching total salary:', err);
          return res.status(500).send({ message: 'Error fetching total salary' });
      }

      const totalSalary = result[0].totalSalary;

      // Step 2: Get the configured budget percentage by id
      const getPercentageQuery = 'SELECT percentage FROM budget_config WHERE id = ?';

      db.query(getPercentageQuery, [id], (err, result) => {
          if (err) {
              console.error('Error fetching budget percentage:', err);
              return res.status(500).send({ message: 'Error fetching budget percentage' });
          }

          if (result.length === 0) {
              return res.status(404).send({ message: 'Budget config not found' });
          }

          const percentage = result[0].percentage;
          const budget = (percentage / 100) * totalSalary; // Calculate the budget

          res.status(200).send({
              message: 'Total budget calculated successfully',
              totalSalary,
              budget,
              percentage
          });
      });
  });
});

app.get('/api/increment-data', (req, res) => {
  // Query to calculate increment data
  const query = `
  SELECT e.EmployeeID AS id,
         CASE 
             WHEN e.Location NOT IN ('India', 'Singapore', 'Philippines') OR e.Location IS NULL THEN 'USA' 
             ELSE e.Location 
         END AS Location,  
         e.CurrentSalaryLocal,  
         COALESCE(mp.MarketSalaryBenchmark, 
                  CASE 
                      WHEN e.Location = 'India' THEN 30000  
                      WHEN e.Location = 'Singapore' THEN 150000  
                      WHEN e.Location = 'Philippines' THEN 60000  
                      WHEN e.Location = 'USA' THEN 80000  
                      ELSE 80000  
                  END) AS MarketSalaryBenchmark,  
         e.FinalRating,
         (e.CurrentSalaryLocal / 
             COALESCE(mp.MarketSalaryBenchmark, 
                      CASE 
                          WHEN e.Location = 'India' THEN 30000
                          WHEN e.Location = 'Singapore' THEN 150000
                          WHEN e.Location = 'Philippines' THEN 60000
                          WHEN e.Location = 'USA' THEN 80000
                          ELSE 80000
                      END)
         ) AS CompaRatio,
         CASE
             WHEN (e.CurrentSalaryLocal / 
                   COALESCE(mp.MarketSalaryBenchmark, 
                            CASE 
                                WHEN e.Location = 'India' THEN 30000
                                WHEN e.Location = 'Singapore' THEN 150000
                                WHEN e.Location = 'Philippines' THEN 60000
                                WHEN e.Location = 'USA' THEN 80000
                                ELSE 80000
                            END)
                   ) > 1.2 THEN 
                 CASE 
                     WHEN e.FinalRating BETWEEN 0 AND 0.99 THEN 0
                     WHEN e.FinalRating BETWEEN 1 AND 1.99 THEN 0
                     WHEN e.FinalRating BETWEEN 2 AND 2.99 THEN 0
                     WHEN e.FinalRating BETWEEN 3 AND 3.99 THEN 5
                     WHEN e.FinalRating BETWEEN 4 AND 5 THEN 7
                 END
             WHEN (e.CurrentSalaryLocal / 
                   COALESCE(mp.MarketSalaryBenchmark, 
                            CASE 
                                WHEN e.Location = 'India' THEN 30000
                                WHEN e.Location = 'Singapore' THEN 150000
                                WHEN e.Location = 'Philippines' THEN 60000
                                WHEN e.Location = 'USA' THEN 80000
                                ELSE 80000
                            END)
                   ) BETWEEN 0.8 AND 1.2 THEN 
                 CASE 
                     WHEN e.FinalRating BETWEEN 0 AND 0.99 THEN 0
                     WHEN e.FinalRating BETWEEN 1 AND 1.99 THEN 0
                     WHEN e.FinalRating BETWEEN 2 AND 2.99 THEN 8
                     WHEN e.FinalRating BETWEEN 3 AND 3.99 THEN 9
                     WHEN e.FinalRating BETWEEN 4 AND 5 THEN 10
                 END
             WHEN (e.CurrentSalaryLocal / 
                   COALESCE(mp.MarketSalaryBenchmark, 
                            CASE 
                                WHEN e.Location = 'India' THEN 30000
                                WHEN e.Location = 'Singapore' THEN 150000
                                WHEN e.Location = 'Philippines' THEN 60000
                                WHEN e.Location = 'USA' THEN 80000
                                ELSE 80000
                            END)
                   ) < 0.8 THEN 
                 CASE 
                     WHEN e.FinalRating BETWEEN 0 AND 0.99 THEN 0
                     WHEN e.FinalRating BETWEEN 1 AND 1.99 THEN 0
                     WHEN e.FinalRating BETWEEN 2 AND 2.99 THEN 10
                     WHEN e.FinalRating BETWEEN 3 AND 3.99 THEN 12
                     WHEN e.FinalRating BETWEEN 4 AND 5 THEN 15
                 END
             ELSE 0
         END AS IncrementPercentage
  FROM employees e
  LEFT JOIN market_projections mp ON e.Designation = mp.Designation AND e.Location = mp.Location;
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching increment data:', err);
          return res.status(500).send({ message: 'Error fetching increment data' });
      }

      // Iterate over results to update the IncrementPercentage in the employees table
      const updatePromises = results.map((employee) => {
          const updateQuery = `
              UPDATE employees 
              SET IncrementPercentage = ? 
              WHERE EmployeeID = ?`;
          return new Promise((resolve, reject) => {
              db.query(updateQuery, [employee.IncrementPercentage, employee.id], (err) => {
                  if (err) {
                      console.error(`Error updating increment for EmployeeID ${employee.id}:`, err);
                      reject(err);
                  } else {
                      resolve();
                  }
              });
          });
      });

      // Wait for all updates to finish
      Promise.all(updatePromises)
          .then(() => {
              res.status(200).send({
                  message: 'Increment percentages updated successfully',
                  data: results,
              });
          })
          .catch((err) => {
              console.error('Error updating increment percentages:', err);
              res.status(500).send({ message: 'Error updating increment percentages' });
          });
  });
});

// app.post('/api/calculate-new-salaries/:id', async (req, res) => {
//   const { id } = req.params; // Get the ID from the request URL
//   try {
//       // Step 1: Fetch all employees and their increment percentages
//       const fetchQuery = `
//           SELECT EmployeeID, CurrentSalaryUSD, IncrementPercentage 
//           FROM employees
//       `;
//       const [employees] = await db.promise().query(fetchQuery);

//       if (employees.length === 0) {
//           return res.status(404).send({ message: 'No employees found.' });
//       }

//       // Step 2: Fetch the total budget for the provided id
//       const budgetQuery = 'SELECT totalBudget FROM budget_config WHERE id = ?';
//       const [budgetResult] = await db.promise().query(budgetQuery, [id]);

//       if (budgetResult.length === 0) {
//           return res.status(404).send({ message: 'Budget configuration not found.' });
//       }

//       const originalTotalBudget = budgetResult[0].totalBudget;
//       if (isNaN(originalTotalBudget)) {
//           return res.status(500).send({ message: 'Invalid total budget value.' });
//       }

//       let remainingBudget = originalTotalBudget;
//       let totalIncrementDeducted = 0; // Track total deduction

//       // Step 3: Calculate new salaries and deduct from budget
//       const updatePromises = employees.map(async (employee) => {
//           const { EmployeeID, CurrentSalaryUSD, IncrementPercentage } = employee;

//           // Log the values for debugging
//           console.log(`Processing EmployeeID: ${EmployeeID}, CurrentSalaryUSD: ${CurrentSalaryUSD}, IncrementPercentage: ${IncrementPercentage}`);

//           // Validate IncrementPercentage and CurrentSalaryUSD
//           if (IncrementPercentage === null || isNaN(IncrementPercentage) || IncrementPercentage < 0) {
//               console.warn(`Skipping employee ${EmployeeID} due to invalid increment percentage.`);
//               return; // Skip this employee if invalid
//           }

//           if (CurrentSalaryUSD === null || isNaN(CurrentSalaryUSD) || CurrentSalaryUSD <= 0) {
//               console.warn(`Skipping employee ${EmployeeID} due to invalid salary.`);
//               return; // Skip if the salary is invalid
//           }

//           // Convert to numbers to avoid any issues with non-number values
//           const currentSalary = Number(CurrentSalaryUSD);
//           const incrementPercentage = Number(IncrementPercentage);

//           // Calculate the increment
//           const incrementAmount = (currentSalary * incrementPercentage) / 100;
//           console.log(`Calculated IncrementAmount for EmployeeID ${EmployeeID}: ${incrementAmount}`);

//           // Ensure the new base salary is calculated correctly and rounded to 2 decimal places
//           let newRevisedBaseSalary = currentSalary + incrementAmount;

//           if (!isNaN(newRevisedBaseSalary)) {
//               newRevisedBaseSalary = parseFloat(newRevisedBaseSalary.toFixed(2)); // Round to 2 decimals
//               console.log(`Calculated NewRevisedBaseSalary for EmployeeID ${EmployeeID}: ${newRevisedBaseSalary}`);
//           } else {
//               console.warn(`Invalid calculation for employee ${EmployeeID}. Skipping.`);
//               return; // Skip if newRevisedBaseSalary is NaN
//           }

//           // Deduct increment amount from the remaining budget
//           remainingBudget -= incrementAmount;
//           totalIncrementDeducted += incrementAmount;

//           // Update the employee's NewRevisedBaseSalary in the database
//           const updateQuery = `
//               UPDATE employees
//               SET NewRevisedBaseSalary = ?
//               WHERE EmployeeID = ?
//           `;
//           await db.promise().query(updateQuery, [newRevisedBaseSalary, EmployeeID]);
//       });

//       // Wait for all updates to complete
//       await Promise.all(updatePromises);

//       // Step 4: Update the remaining budget for the provided id in budget_config
//       const updateBudgetQuery = `
//           UPDATE budget_config
//           SET totalBudget = ?
//           WHERE id = ?
//       `;
//       await db.promise().query(updateBudgetQuery, [remainingBudget, id]);

//       // Step 5: Return the calculation details
//       const calculationResult = {
//           originalTotalBudget: originalTotalBudget,
//           totalIncrementDeducted: totalIncrementDeducted,
//           remainingBudget: remainingBudget
//       };

//       // Ensure originalTotalBudget and remainingBudget are valid numbers before calling toFixed
//       if (!isNaN(calculationResult.originalTotalBudget)) {
//           calculationResult.originalTotalBudget = calculationResult.originalTotalBudget.toFixed(2);
//       }

//       if (!isNaN(calculationResult.remainingBudget)) {
//           calculationResult.remainingBudget = calculationResult.remainingBudget.toFixed(2);
//       }

//       res.status(200).send({
//           message: 'New revised base salaries calculated and budget updated.',
//           calculationResult
//       });
//   } catch (error) {
//       console.error('Error calculating new salaries:', error);
//       res.status(500).send({ message: 'Error calculating new salaries.' });
//   }
// });



