import React, { useState } from 'react';
import axios from 'axios';

const BudgetComponent = () => {
    const [calculationResult, setCalculationResult] = useState(null);
    const [error, setError] = useState('');
    const id = 1; // Replace with the appropriate ID (e.g., manager ID, department ID, or budget config ID)

    const calculateNewSalaries = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/calculate-new-salaries/${id}`);
            setCalculationResult(response.data);
            setError('');
        } catch (err) {
            setError('Error calculating new salaries.');
            console.error(err);
        }
    };

    return (
        <div>
            <button onClick={calculateNewSalaries}>
                Calculate New Salaries
            </button>

            {calculationResult && (
                <div>
                    <h3>Calculation Details</h3>
                    <p><strong>Original Total Budget:</strong> ${calculationResult.originalTotalBudget.toFixed(2)}</p>
                    <p><strong>Total Increment Deducted:</strong> ${calculationResult.totalIncrementDeducted.toFixed(2)}</p>
                    <p><strong>Remaining Budget:</strong> ${calculationResult.remainingBudget.toFixed(2)}</p>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default BudgetComponent;
