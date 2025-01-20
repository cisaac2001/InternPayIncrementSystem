import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Container maxWidth="lg">
        <Routes>
          {/* <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/" element={<Dashboard />} />
          <Route
            path="*"
            element={<Navigate to="/" />} // Redirect to login if route not found
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
