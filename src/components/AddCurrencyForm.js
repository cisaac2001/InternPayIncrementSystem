import React, { useState } from 'react';

const AddCurrencyForm = ({ onCurrencyAdded }) => {
  const [CurrencyCode, setCurrencyType] = useState('');
  const [ConversionRateUSD, setConversionRate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!CurrencyCode || !ConversionRateUSD) {
      alert('Please fill in all fields');
      return;
    }

    const newCurrency = { CurrencyCode: CurrencyCode, ConversionRate: ConversionRateUSD };

    // Call the passed function (onCurrencyAdded) to update parent state
    onCurrencyAdded(newCurrency);

    // Reset the form
    setCurrencyType('');
    setConversionRate('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={CurrencyCode}
        onChange={(e) => setCurrencyType(e.target.value)}
        placeholder="Currency Code"
      />
      <input
        type="number"
        value={ConversionRateUSD}
        onChange={(e) => setConversionRate(e.target.value)}
        placeholder="Conversion Rate"
      />
      <button type="submit">Add Currency</button>
    </form>
  );
};

export default AddCurrencyForm;
