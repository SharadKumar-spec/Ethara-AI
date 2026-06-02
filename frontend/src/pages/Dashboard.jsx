import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve dashboard metrics. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  }

  const cards = [
    {
      title: 'Total Products',
      value: stats.total_products,
      icon: <InventoryIcon sx={{ fontSize: 32 }} />,
      className: 'gradient-danger',
      description: 'Items in catalogue'
    },
    {
      title: 'Total Customers',
      value: stats.total_customers,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      className: 'gradient-danger',
      description: 'Registered buyers'
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: <ReceiptIcon sx={{ fontSize: 32 }} />,
      className: 'gradient-danger',
      description: 'Completed checkouts'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.low_stock_products.length,
      icon: <WarningIcon sx={{ fontSize: 32 }} />,
      className: stats.low_stock_products.length > 0 ? 'gradient-danger' : 'gradient-success',
      description: 'Stock quantity < 10'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--color-text-primary)',
            mb: 1
          }}
        >
          Operational Overview
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
          Real-time summary of catalog inventory, registered buyers, and purchase transactions.
        </Typography>
      </Box>

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {cards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card 
              className={card.className}
              sx={{ 
                border: 'none', 
                borderRadius: 3, 
                color: '#fff',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
                    {card.title}
                  </Typography>
                  <Box sx={{ opacity: 0.9 }}>{card.icon}</Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.85rem' }}>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Critical Stock Alert Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--color-text-primary)',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Critical Stock Monitoring
          {stats.low_stock_products.length > 0 && (
            <Chip 
              label="Action Required" 
              color="error" 
              size="small" 
              sx={{ fontWeight: 600, fontSize: '0.75rem' }} 
            />
          )}
        </Typography>
        
        {stats.low_stock_products.length === 0 ? (
          <Alert severity="success" sx={{ borderRadius: 2, bgcolor: 'rgba(6, 78, 59, 0.2)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            All catalog products are fully stocked above safety thresholds.
          </Alert>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableRow>
                  <TableCell sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Product Name</TableCell>
                  <TableCell sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>SKU Code</TableCell>
                  <TableCell align="right" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Current Stock</TableCell>
                  <TableCell align="center" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Urgency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.low_stock_products.map((row) => (
                  <TableRow 
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--color-text-secondary)' }}>{row.sku}</TableCell>
                    <TableCell align="right" sx={{ color: 'var(--color-text-primary)' }}>${row.price.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ color: '#f87171', fontWeight: 600 }}>{row.quantity}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={row.quantity === 0 ? 'Out of Stock' : 'Low Stock'} 
                        color={row.quantity === 0 ? 'error' : 'warning'} 
                        size="small" 
                        sx={{ fontWeight: 600, fontSize: '0.75rem', px: 1 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
