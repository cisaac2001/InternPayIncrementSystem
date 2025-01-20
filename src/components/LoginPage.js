import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';

function LoginPage() {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') setUsername(value);
    if (name === 'password') setPassword(value);
  };

  // Handle form submission
  const handleLogin = (e) => {
    e.preventDefault();
    // Add login logic here (validate username and password)
    console.log('Logging in with:', { username, password });
    // Redirect or handle successful login
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} textAlign="center">
        <Typography variant="h4" mb={2}>Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            name="username"
            value={username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth mt={2}>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default LoginPage;
