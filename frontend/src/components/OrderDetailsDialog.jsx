import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Divider,
  Grid
} from '@mui/material';

export default function OrderDetailsDialog({ order, open, onClose }) {
  if (!order) return null;

  const formattedDate = new Date(order.created_at).toLocaleString();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
      <DialogTitle sx={{ pb: 1, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
        Order Details
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Order ID: #{order.id} • placed {formattedDate}
        </Typography>
      </DialogTitle>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
      
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
              Customer Details
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#f8fafc' }}>
              {order.customer_name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Email Reference: {order.customer_email || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
              Total Purchase Amount
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.light', fontFamily: "'Outfit', sans-serif" }}>
              ${order.total_amount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#f8fafc' }}>
          Items Summary
        </Typography>

        <TableContainer 
          component={Paper} 
          sx={{ 
            bgcolor: 'rgba(15, 23, 42, 0.4)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: 'none'
          }}
        >
          <Table aria-label="order items table">
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Product Name</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>SKU</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Quantity</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Unit Price</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow 
                  key={item.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row" sx={{ color: '#fff', fontWeight: 500 }}>
                    {item.product_name}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {item.product_sku}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff' }}>
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff' }}>
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'primary.light', fontWeight: 600 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          sx={{ px: 4, borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
