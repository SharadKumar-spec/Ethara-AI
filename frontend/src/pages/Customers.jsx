import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  DialogContentText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog open state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form fields
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch customers from the system.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setFormData({ fullName: '', email: '', phone: '' });
    setFormErrors({});
    setApiError(null);
    setFormOpen(true);
  };

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer);
    setApiError(null);
    setDeleteOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) errors.email = 'Email address is required';
    else if (!emailRegex.test(formData.email.trim())) errors.email = 'Please enter a valid email address';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomer = async () => {
    if (!validateForm()) return;

    const payload = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null
    };

    try {
      const res = await api.post('/customers', payload);
      setCustomers([res.data, ...customers]);
      setSuccessMessage('Customer profile added successfully!');
      setFormOpen(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'An error occurred while creating the customer.';
      setApiError(msg);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await api.delete(`/customers/${selectedCustomer.id}`);
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setSuccessMessage('Customer profile removed.');
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to remove the customer record.';
      setApiError(msg);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              fontFamily: "'Outfit', sans-serif",
              color: '#f8fafc',
              mb: 1
            }}
          >
            Customers Directory
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Register new customers, view buyer information, or manage accounts details.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 600 }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Table grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress size={45} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : customers.length === 0 ? (
        <Paper className="glass-panel" sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            No registered customers found.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
            Add customers to start placing orders.
          </Typography>
          <Button variant="outlined" onClick={handleOpenAdd}>
            Add First Customer
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Full Name</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Email Address</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Phone Number</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Registration Date</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((row) => (
                <TableRow 
                  key={row.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' }
                  }}
                >
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)' }}>#{row.id}</TableCell>
                  <TableCell component="th" scope="row" sx={{ color: '#fff', fontWeight: 650 }}>
                    {row.full_name}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{row.email}</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>{row.phone || '—'}</TableCell>
                  <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleOpenDelete(row)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Dialog */}
      <Dialog 
        open={formOpen} 
        onClose={() => setFormOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            backgroundImage: 'none',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          Register Customer
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {apiError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{apiError}</Alert>}
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: { xs: 280, sm: 400 }, mt: 1 }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleFormChange}
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Phone Number (Optional)"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              variant="outlined"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveCustomer} variant="contained">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            backgroundImage: 'none',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          Delete Customer Record?
        </DialogTitle>
        <DialogContent>
          {apiError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{apiError}</Alert>}
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete the profile for <strong>{selectedCustomer?.full_name}</strong>?
            <br />
            <span style={{ color: '#f87171', display: 'block', marginTop: '10px', fontWeight: 600 }}>
              ⚠️ WARNING: This will also cascade delete all associated order history!
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteCustomer} color="error" variant="contained">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
