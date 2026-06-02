import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptIcon
} from '@mui/icons-material';

const drawerWidth = 260;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Products', icon: <InventoryIcon />, path: '/products' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Orders', icon: <ReceiptIcon />, path: '/orders' }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            mr: 1.5, 
            width: 38, 
            height: 38,
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
          }}
        >
          NX
        </Avatar>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            fontWeight: 800, 
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.5px',
            background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Nexora
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  bgcolor: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: active ? '#818cf8' : 'rgba(255,255,255,0.65)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#fff'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: active ? '#818cf8' : 'rgba(255,255,255,0.4)',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    fontWeight: active ? 600 : 500
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block' }}>
          StockFlow v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0b0f19' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(11, 15, 25, 0.7)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 700, 
              fontFamily: "'Outfit', sans-serif",
              color: '#f8fafc' 
            }}
          >
            {menuItems.find(item => item.path === location.pathname)?.text || 'StockFlow'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(255,255,255,0.06)'
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(255,255,255,0.06)'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 10, sm: 11 } // Adjust for AppBar height
        }}
      >
        <Box className="page-fade-in" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
