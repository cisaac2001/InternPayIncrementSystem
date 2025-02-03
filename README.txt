Total Salary and Budget (Budget.js)
Displays total salary as a summation of all converted local salaries to usd.
Displays budget as a percentage set by inputting a save percentage button.
Table: budget_config
 Columns:
 id int AI PK 
 totalBudget decimal(15,2) 
 percentage decimal(5,2)
Known Bugs: totalBudget does not reflect the value displayed on the site. Percentage is updated only after refreshing the page. 
Needs Work: BudgetComponent.js has some implementation to calculate the revised salaries and take away from the budget. There are still bugs with that process. May be need to be reworked completely with new tables.

Currency Code Conversion Rate (to USD) Actions (CurrencyTable.js)
Displays 4 different currencies with editable conversion rates. 
Table: conversion_rates
 Columns:
 CurrencyCode varchar(10) 
 ConversionRateUSD decimal(10,4) 
 LastUpdated date 
 id int AI PK
Known Bugs: 
Needs Work: More currencies may be needed. Adding a new currency feature. LastUpdated is meant to show the date the currency was edited but still needs implementation

Market Projections (MarketProjections.js)
Displays a list of Designations tied with Locations and Market Salary Benchmarks
Projections can be edited and deleted and added by inputting all of the fields below. 
Table: market_projections
 Columns:
 Designation varchar(100) 
 Location varchar(100) 
 SalaryCode varchar(10) 
 MarketSalaryBenchmark decimal(10,2) 
 id int AI PK
Known Bugs: Duplicate entries
Needs Work:

Dashboard (Dashboard.js)
Search employees feature to dynamically change the table to only show any search query
Choose File feature which will take an excel file (.xlsx), Clicking upload and refreshing will show the information (FileUpload.js)
Salaries can be converted using the button, but requires there to be salary codes
Columns can be toggled to be shown or hidden. 
Column Titles can be clicked to sort ascending and descending
Each row can be edited under the actions column
Table: employees
-Columns:
-EmployeeID varchar(100) PK 
-Entity varchar(100) 
-Name varchar(100) 
-DateOfJoining varchar(100) 
-EmploymentType varchar(100) 
-Designation varchar(100) 
-Location varchar(100) 
-Team varchar(100) 
-JobFunction varchar(100) 
-ManagerName varchar(100) 
-ManCom tinyint(1) 
-SalaryCode varchar(10) 
-CurrentSalaryLocal decimal(10,2) 
-CurrentSalaryUSD decimal(10,2) 
-KPIRating decimal(3,2) 
-ValuesRating decimal(3,2) 
-FinalRating decimal(3,2) 
-IncrementEligible varchar(100) 
-ReasonForIncrement varchar(100) 
-IncrementPercentage decimal(5,2) 
-NewRevisedBaseSalary decimal(10,2)
Known Bugs: Date of Joining does not convert the excel format of date. Reason for Increment does not have the correct field type to be edited and saved. Sorting in columns with numbers does not work. Converting all salaries without a salary code says it's successful.
Needs Work: There should be a way to dynamically change the information from the excel file. The current implementation only allows one upload with unique entries. Employees with the same ids will not be updated, the work around is to truncate the entire table in the database. There should also be a download feature as well. Salary Codes are not filled in the backend. There needs to be a way to read the excel formatting of salaries with their codes, the work around is to run a script based on location in the database. Editing should not be allowed for all fields, only the ones pertaining to salary and increments.

Fetch Increment Data (IncrementDataFetcher.js)
Clicking the button fills the Increment Percentage column with increment percentages based on location and final rating. The compa ratio matrix can be edited in the database. The default calculation for compa ratio is a preset number based on location (app.get('/api/increment-data' in server.js). Desginations and locations that match with an entry in market projections are used instead of the default calculation (current/benchmark). 
Table: compa_ratio_matrix
-Columns:
-id int AI PK 
-location varchar(100) 
-compa_ratio_range varchar(50) 
-rating_range_0_0_99 decimal(5,2) 
-rating_range_1_1_99 decimal(5,2) 
-rating_range_2_2_99 decimal(5,2) 
-rating_range_3_3_99 decimal(5,2) 
-rating_range_4_5 decimal(5,2) 
Known Bugs: 
Needs Work: The compa ratio matrix needs a designation field as well. Suggesting increment percentages can vary with different jobs and locations. There should be a way to configure this on the site or be inputted from excel. Instead of a default calculation there should be an alert to add an appropriate benchmark for the specific job.


Additional Notes:
AddCurrencyForm.js is not utilized and is just old code to reference. LoginPage.js is not utilized and needs to be implemented with basic authentication (admin vs manager vs employee). An admin view and manager view has some code that needs work in App.js. The function validateAndMapHeaders in server.js needs work on the validation part(just a basic check on the values). BudgetComponent.js is not utilized and needs work to calculate the new salaries based on the increments. The app functions are commented in server.js because of bugs. 

Manager Tables with the ability for managers to input their own increments overriding the suggested is the next step. Managers should not exceed the budget past like 1%. Whatever extra budget that they have for their own employees should be added up to their manager's budget. Everything should take away from the overall budget. Example excel table:  
E. ID.	Location	Salary		USD	Market Increase	Rating	Suggest IP	Increment Amount
1	Manila		100000	PHP	1700	7%			5%		85
2	Chennai		30000	INR	360	10%			
3	Poland		5000	USD	5000	3%			
4	SG		5000	SGD	3650	3%			
5	Manila		80000	PHP	1360	7%			
								
	5% Budget	603.5	Sum	12070				
	Manger Name							






 






