import React, { useState, useEffect } from 'react';
import CurrencyTable from '../src/components/CurrencyTable'; // Assuming these components exist
import MarketProjections from '../src/components/MarketProjections';
import Dashboard from '../src/components/Dashboard'; // For managers

const App = () => {
  const [userRole, setUserRole] = useState('admin'); // Assume default role is 'admin'

  // Function to simulate fetching role from an API or session
  useEffect(() => {
    // You can replace this with real authentication logic
    const fetchUserRole = async () => {
      // Here you might fetch the user role based on login/authentication system
      // For now, we'll use a hardcoded role
      setUserRole('admin'); // Change to 'admin' for admin view
    };
    
    fetchUserRole();
  }, []);

  return (
    <div>
      {userRole === 'admin' ? (
        <div>
          <h1>Admin Dashboard</h1>
          <CurrencyTable />
          <MarketProjections />
          <Dashboard />
        </div>
      ) : userRole === 'manager' ? (
        <div>
          <h1>Employee Dashboard</h1>
          <Dashboard />
        </div>
      ) : (
        <div>
          <h1>Unauthorized</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      )}
    </div>
  );
};

export default App;
