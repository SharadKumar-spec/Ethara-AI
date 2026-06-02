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
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog Open States
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Form State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products. Check if the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setFormData({ name: '', sku: '', price: '', quantity: '' });
    setFormErrors({});
    setApiError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setFormErrors({});
    setApiError(null);
    setFormOpen(true);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
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
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU code is required';
    if (formData.sku.trim().length < 3) errors.sku = 'SKU must be at least 3 characters';
    
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum)) errors.price = 'Valid price is required';
    else if (priceNum <= 0) errors.price = 'Price must be greater than 0';

    const qtyNum = parseInt(formData.quantity, 10);
    if (isNaN(qtyNum)) errors.quantity = 'Valid quantity is required';
    else if (qtyNum < 0) errors.quantity = 'Quantity cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10)
    };

    try {
      if (selectedProduct) {
        // Edit Mode
        const res = await api.put(`/products/${selectedProduct.id}`, payload);
        setProducts(products.map(p => p.id === selectedProduct.id ? res.data : p));
        setSuccessMessage('Product updated successfully!');
      } else {
        // Add Mode
        const res = await api.post('/products', payload);
        setProducts([res.data, ...products]);
        setSuccessMessage('Product created successfully!');
      }
      setFormOpen(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'An error occurred while saving the product.';
      setApiError(msg);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setSuccessMessage('Product deleted successfully!');
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to delete the product. It might be associated with existing orders.';
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
              color: 'var(--color-text-primary)',
              mb: 1
            }}
          >
            Product Catalog
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
            Manage stock list items, SKU definitions, catalog pricing, and quantity allocations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 600 }}
        >
          Add Product
        </Button>
      </Box>

      {/* Main catalog layout */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress size={45} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
          <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 1 }}>
            No products found in inventory.
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 3 }}>
            Get started by adding your first product definition.
          </Typography>
          <Button variant="outlined" onClick={handleOpenAdd}>
            Add First Product
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Product Name</TableCell>
                <TableCell align="right" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Unit Price</TableCell>
                <TableCell align="right" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>In Stock</TableCell>
                <TableCell align="right" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((row) => (
                <TableRow 
                  key={row.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                  }}
                >
                  <TableCell sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{row.sku}</TableCell>
                  <TableCell component="th" scope="row" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {row.name}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'var(--color-text-primary)' }}>${row.price.toFixed(2)}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      color: row.quantity < 10 ? '#f87171' : '#34d399', 
                      fontWeight: 600 
                    }}
                  >
                    {row.quantity}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(row)} sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
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

      {/* Add / Edit Dialog */}
      <Dialog 
        open={formOpen} 
        onClose={() => setFormOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--color-bg)',
            backgroundImage: 'none',
            borderRadius: 3,
            border: '1px solid var(--color-border)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          {selectedProduct ? 'Update Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {apiError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{apiError}</Alert>}
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: { xs: 280, sm: 400 }, mt: 1 }}>
            <TextField
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="SKU Code"
              name="sku"
              value={formData.sku}
              onChange={handleFormChange}
              error={!!formErrors.sku}
              helperText={formErrors.sku}
              variant="outlined"
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
                variant="outlined"
                fullWidth
              />
              <TextField
                label="Stock Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleFormChange}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                variant="outlined"
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--color-bg)',
            backgroundImage: 'none',
            borderRadius: 3,
            border: '1px solid var(--color-border)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          Delete Product?
        </DialogTitle>
        <DialogContent>
          {apiError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{apiError}</Alert>}
          <DialogContentText sx={{ color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete product <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Delete
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
