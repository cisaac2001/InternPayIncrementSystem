import React, { useState, useEffect } from 'react';

const CurrencyTable = () => {
  const [currencies, setCurrencies] = useState([]);
  const [editMode, setEditMode] = useState(null); // To track which row is being edited
  const [editedCurrency, setEditedCurrency] = useState({});

  // Fetch currencies from the backend
  useEffect(() => {
    fetch('http://localhost:5000/api/currencies')
      .then((response) => response.json())
      .then((data) => setCurrencies(data))
      .catch((error) => console.error('Error fetching currencies:', error));
  }, []);

  // Handle the editing of a row
  const handleEdit = (currency) => {
    setEditMode(currency.id); // Set the current row to be edited
    setEditedCurrency({
      ...currency,
    });
  };

  // Handle the changes in the input fields
  const handleChange = (e) => {
    setEditedCurrency({
      ...editedCurrency,
      [e.target.name]: e.target.value,
    });
  };

  // Handle saving the edited currency
  const handleSave = (id) => {
    fetch(`http://localhost:5000/api/currencies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedCurrency),
    })
      .then((response) => response.json())
      .then((data) => {
        setCurrencies((prevCurrencies) =>
          prevCurrencies.map((currency) =>
            currency.id === id ? { ...currency, ...editedCurrency } : currency
          )
        );
        setEditMode(null); // Exit edit mode
      })
      .catch((error) => console.error('Error saving currency:', error));
  };

  // Handle canceling the edit
  const handleCancel = () => {
    setEditMode(null); // Exit edit mode
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Currency Code</th>
            <th>Conversion Rate (to USD)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currencies.map((currency) => (
            <tr key={currency.id}>
              <td>
                {editMode === currency.id ? (
                  <input
                    type="text"
                    name="CurrencyCode"
                    value={editedCurrency.CurrencyCode || currency.CurrencyCode}
                    onChange={handleChange}
                  />
                ) : (
                  currency.CurrencyCode
                )}
              </td>
              <td>
                {editMode === currency.id ? (
                  <input
                    type="text"
                    name="ConversionRateUSD"
                    value={editedCurrency.ConversionRateUSD || currency.ConversionRateUSD}
                    onChange={handleChange}
                  />
                ) : (
                  currency.ConversionRateUSD
                )}
              </td>
              <td>
                {editMode === currency.id ? (
                  <>
                    <button onClick={() => handleSave(currency.id)}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(currency)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CurrencyTable;
