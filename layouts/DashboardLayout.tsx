
import React, { useState } from 'react';
import LogoToonaSHOP from '../assets/images/toonashop.png';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Avatar,
  InputBase,
  alpha,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Search as SearchIcon,
  NotificationsNone as NotificationsIcon,
  HelpOutline as HelpIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.07),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
    minWidth: '400px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const DashboardLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => setOpen(!open);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Companies (Groups)', icon: <BusinessIcon />, path: '/groups' },
    { text: 'Payments & Subscriptions', icon: <PaymentIcon />, path: '/payments' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={toggleDrawer} edge="start" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Box component="img" src={LogoToonaSHOP} sx={{ height: 32, width: 'auto', mr: 1, borderRadius: 1 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 500, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
              ToonaSHOP
            </Typography>
          </Box>

          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Recherche..." />
          </Search>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="large">
              <NotificationsIcon />
            </IconButton>
            <IconButton size="large">
              <HelpIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, bgcolor: alpha('#000', 0.05), p: '4px 12px', borderRadius: 8 }}>
              <BusinessIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
                ToonaShop Global
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name.charAt(0)}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 72,
            boxSizing: 'border-box',
            transition: 'width 0.2s',
            overflowX: 'hidden',
            borderRight: 'none',
            bgcolor: 'transparent',
            pt: 8
          },
        }}
        open={open}
      >
        <List sx={{ px: 1.5 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 10,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    '&:hover': { bgcolor: 'primary.main' },
                    '& .MuiListItemIcon-root': { color: '#ffffff' },
                    '& .MuiListItemText-primary': { color: '#ffffff' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1, mx: 2 }} />
        <List sx={{ px: 1.5 }}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={handleLogout} sx={{ minHeight: 48, px: 2.5, borderRadius: 10 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, pt: 12, overflow: 'auto', bgcolor: '#f1f1f1' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
