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
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  TextField,
  Grid,
  DialogContentText,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  RemoveCircleOutline as RemoveIcon
} from '@mui/icons-material';
import api from '../api';
import OrderDetailsDialog from '../components/OrderDetailsDialog';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Focus Objects
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Checkout Form State
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not download transaction logs or master records.');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrdersAndProducts = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Failed to sync state:', err);
    }
  };

  const handleOpenCreate = () => {
    setOrderCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setFormErrors({});
    setApiError(null);
    setCreateOpen(true);
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    detailsOpen || setDetailsOpen(true);
  };

  const handleOpenDelete = (order, e) => {
    e.stopPropagation(); // Avoid triggering open detail
    setSelectedOrder(order);
    setApiError(null);
    setDeleteOpen(true);
  };

  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    const updated = orderItems.filter((_, idx) => idx !== index);
    setOrderItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = orderItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setOrderItems(updated);
  };

  // Calculate live total price on frontend
  const calculateLiveTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        return sum + product.price * (parseInt(item.quantity, 10) || 0);
      }
      return sum;
    }, 0);
  };

  const validateOrderForm = () => {
    const errors = {};
    if (!orderCustomer) {
      errors.customer = 'Please select a customer';
    }

    const itemErrors = [];
    orderItems.forEach((item, idx) => {
      const errs = {};
      if (!item.product_id) {
        errs.product = 'Select a product';
      } else {
        const product = products.find(p => p.id === item.product_id);
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          errs.quantity = 'Must be greater than 0';
        } else if (product && qty > product.quantity) {
          errs.quantity = `Max stock is ${product.quantity}`;
        }
      }
      itemErrors[idx] = errs;
    });

    const hasItemErrors = itemErrors.some(err => Object.keys(err).length > 0);
    if (hasItemErrors) {
      errors.items = itemErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateOrderForm()) return;

    const payload = {
      customer_id: orderCustomer,
      items: orderItems.map(item => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity, 10)
      }))
    };

    try {
      const res = await api.post('/orders', payload);
      // Prepend the new order, then refresh states to sync quantities
      setOrders([res.data, ...orders]);
      setSuccessMessage('Order placed successfully!');
      setCreateOpen(false);
      refreshOrdersAndProducts();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'An error occurred checking out this order.';
      setApiError(msg);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await api.delete(`/orders/${selectedOrder.id}`);
      setOrders(orders.filter(o => o.id !== selectedOrder.id));
      setSuccessMessage('Order deleted and stock restored.');
      setDeleteOpen(false);
      refreshOrdersAndProducts();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to cancel the order transaction.';
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
            Orders Log
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Record checkout logs, verify stock transactions, and cancel order requests.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 600 }}
        >
          Create Order
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress size={45} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : orders.length === 0 ? (
        <Paper className="glass-panel" sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            No purchase records found.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
            Initialize transaction processing by writing an order.
          </Typography>
          <Button variant="outlined" onClick={handleOpenCreate}>
            Create First Order
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Order ID</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Customer Name</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Total Items</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Total Amount</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Checkout Date</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((row) => {
                const totalItemsCount = row.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <TableRow 
                    key={row.id}
                    onClick={() => handleOpenDetails(row)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' }
                    }}
                  >
                    <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>#{row.id}</TableCell>
                    <TableCell component="th" scope="row" sx={{ color: '#fff', fontWeight: 600 }}>
                      {row.customer_name}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#fff' }}>{totalItemsCount}</TableCell>
                    <TableCell align="right" sx={{ color: 'primary.light', fontWeight: 700 }}>
                      ${row.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(row);
                        }} 
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={(e) => handleOpenDelete(row, e)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Order Stepper Dialog */}
      <Dialog 
        open={createOpen} 
        onClose={() => setCreateOpen(false)}
        maxWidth="md"
        fullWidth
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
          Create Purchase Order
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {apiError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{apiError}</Alert>}
          
          {/* Select Customer */}
          <Box sx={{ mb: 4, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, fontWeight: 600 }}>
              Select Purchasing Customer
            </Typography>
            {customers.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Please create a Customer profile first before submitting an order.
              </Alert>
            ) : (
              <TextField
                select
                label="Customer Name"
                value={orderCustomer}
                onChange={(e) => {
                  setOrderCustomer(e.target.value);
                  if (formErrors.customer) setFormErrors({ ...formErrors, customer: '' });
                }}
                error={!!formErrors.customer}
                helperText={formErrors.customer}
                fullWidth
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />

          {/* Cart Items List */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                Products checkout list
              </Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddItemRow} 
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1.5 }}
              >
                Add Item Row
              </Button>
            </Box>

            {products.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Please configure catalog Products before checkout.
              </Alert>
            ) : (
              orderItems.map((item, index) => {
                const itemErr = formErrors.items?.[index] || {};
                const selectedProdDetails = products.find(p => p.id === item.product_id);
                return (
                  <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2.5 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Choose Product"
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        error={!!itemErr.product}
                        helperText={itemErr.product}
                        fullWidth
                      >
                        {products.map((p) => (
                          <MenuItem key={p.id} value={p.id} disabled={p.quantity <= 0}>
                            {p.name} — ${p.price.toFixed(2)} ({p.quantity} left)
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        error={!!itemErr.quantity}
                        helperText={itemErr.quantity}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={4} sm={2} sx={{ pl: { sm: 1 } }}>
                      {selectedProdDetails && (
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                            Subtotal
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>
                            ${(selectedProdDetails.price * (parseInt(item.quantity, 10) || 0)).toFixed(2)}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={2} sm={1} align="center">
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveItemRow(index)}
                        disabled={orderItems.length <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })
            )}
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 3 }} />

          {/* Cart Live Total Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              Calculated Total Price:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.light', fontFamily: "'Outfit', sans-serif" }}>
              ${calculateLiveTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitOrder} 
            variant="contained" 
            disabled={customers.length === 0 || products.length === 0}
          >
            Checkout Order
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
          Cancel Purchase Transaction?
        </DialogTitle>
        <DialogContent>
          {apiError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{apiError}</Alert>}
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to cancel and delete Order <strong>#{selectedOrder?.id}</strong>?
            <br />
            <span style={{ color: '#34d399', display: 'block', marginTop: '10px', fontWeight: 600 }}>
              🔄 Note: Stock quantities allocated for this order will be automatically restored.
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">
            Go Back
          </Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />

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
