import React, { useState, useEffect } from 'react';

const Budget = () => {
    const [budgetInfo, setBudgetInfo] = useState({});
    const [percentage, setPercentage] = useState(0);
    const [id, setId] = useState(1); // Assume the default ID is 1 for the first configuration

    useEffect(() => {
        // Fetch total salary and budget using the ID
        fetch(`http://localhost:5000/api/admin/total-budget/${id}`)
            .then((response) => response.json())
            .then((data) => setBudgetInfo(data))
            .catch((error) => console.error('Error fetching budget info:', error));
    }, [id]);

    const handlePercentageChange = (e) => {
        setPercentage(e.target.value);
    };

    const handleSavePercentage = () => {
        fetch(`http://localhost:5000/api/admin/budget-percentage/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ percentage }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
                alert('Budget percentage updated successfully!');
            })
            .catch((error) => console.error('Error updating budget percentage:', error));
    };

    return (
        <div>
            <h2>Total Salary and Budget</h2>
            <p>Total Salary: ${budgetInfo.totalSalary}</p>
            <p>Budget: ${budgetInfo.budget}</p>
            <p>Percentage: {budgetInfo.percentage}%</p>

            <h3>Update Budget Percentage</h3>
            <input
                type="number"
                value={percentage}
                onChange={handlePercentageChange}
                min="0"
                max="100"
                step="0.01"
            />
            <button onClick={handleSavePercentage}>Save Percentage</button>
        </div>
    );
};

export default Budget;
