
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
  styled,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Search as SearchIcon,
  HelpOutline as HelpIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon,
  People as PeopleIcon,
  MoneyOff as MoneyOffIcon,
  PersonOff as PersonOffIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  WarningAmber as WarningAmberIcon,
  Warehouse as WarehouseIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ExpandLess,
  ExpandMore,
  EventAvailable as EventAvailableIcon,
  AttachMoney as AttachMoneyIcon,
  History as HistoryIcon,
  BarChart as BarChartIcon,
  Inventory2 as Inventory2Icon,
  Group as GroupIcon,
  ShowChart as ShowChartIcon,
  ShoppingCart as ShoppingCartIcon,
  Handshake as HandshakeIcon,
  ReportProblem as ReportProblemIcon,
  Storefront as StorefrontIcon,
  AccountBalance as AccountBalanceIcon,
  ManageAccounts as ManageAccountsIcon,
  MarkEmailUnread as MarkEmailUnreadIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import NotificationDropdown from '../components/messages/NotificationDropdown';

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
  const [clientsOpen, setClientsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [imfOpen, setImfOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useMessages();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => setOpen(!open);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Companies (Groups)', icon: <BusinessIcon />, path: '/groups' },
    { text: 'Payments & Subscriptions', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Plans', icon: <CategoryIcon />, path: '/plans' },
    { text: 'Promo Codes', icon: <LocalOfferIcon />, path: '/promo-codes' },
    // { text: 'Produits', icon: <Inventory2Icon />, path: '/products' },
    // { text: 'Gestion Ventes', icon: <ShoppingCartIcon />, path: '/sales-management' },
    // { 
    //   text: 'Clients', 
    //   icon: <PeopleIcon />, 
    //   hasSubmenu: true,
    //   submenu: [
    //     { text: 'Tous les Clients', path: '/clients' },
    //     { text: 'Clients Débiteurs', icon: <MoneyOffIcon />, path: '/clients/debts' },
    //     { text: 'Clients Inactifs', icon: <PersonOffIcon />, path: '/clients/inactive' }
    //   ]
    // },
    // { text: 'Aperçu des Ventes', icon: <TrendingUpIcon />, path: '/sales' },
    // { text: 'Factures', icon: <ReceiptIcon />, path: '/invoices' },
    // { 
    //   text: 'Inventaire', 
    //   icon: <InventoryIcon />, 
    //   hasSubmenu: true,
    //   submenu: [
    //     { text: 'Alertes Stocks', icon: <WarningAmberIcon />, path: '/inventory/alerts' },
    //     { text: 'Alertes Péremption', icon: <WarningAmberIcon />, path: '/inventory/expirations' },
    //     { text: 'Stocks Entrepôts', icon: <WarehouseIcon />, path: '/inventory/warehouse' },
    //     { text: 'Stocks Points de Vente', icon: <StoreIcon />, path: '/inventory/pos' }
    //   ]
    // },
    // { 
    //   text: 'Opérations', 
    //   icon: <EventAvailableIcon />, 
    //   hasSubmenu: true,
    //   submenu: [
    //     { text: 'Clôtures Journalières', icon: <EventAvailableIcon />, path: '/operations/closures' },
    //     { text: 'Dépenses', icon: <AttachMoneyIcon />, path: '/operations/expenses' },
    //     { text: 'Historique Stocks', icon: <HistoryIcon />, path: '/operations/stock-history' }
    //   ]
    // },
    // { 
    //   text: 'Statistiques', 
    //   icon: <BarChartIcon />, 
    //   hasSubmenu: true,
    //   submenu: [
    //     { text: 'Top Produits', icon: <Inventory2Icon />, path: '/statistics/top-products' },
    //     { text: 'Top Clients', icon: <GroupIcon />, path: '/statistics/top-clients' },
    //     { text: 'Analyses Ventes', icon: <ShowChartIcon />, path: '/statistics/sales-analytics' }
    //   ]
    // },
    // { text: 'Partenariats', icon: <HandshakeIcon />, path: '/partnerships' },
    { text: 'Réclamations', icon: <ReportProblemIcon />, path: '/claims' },
    {
      text: 'Gestion IMF',
      icon: <AccountBalanceIcon />,
      hasSubmenu: true,
      submenu: [
        { text: 'IMF en Attente', path: '/imf/pending' },
        { text: 'IMF Approuvés', path: '/imf/approved' },
        { text: 'Valider IMF', path: '/imf/validate' }
      ]
    },
    { text: 'Utilisateurs', icon: <ManageAccountsIcon />, path: '/users' },
    { text: 'Messages Site Web', icon: <MarkEmailUnreadIcon />, path: '/messages', badge: true },
    // { text: 'Points de Vente', icon: <StorefrontIcon />, path: '/points-of-sale' },
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
            <NotificationDropdown />
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
            <React.Fragment key={item.text}>
              <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    if (item.hasSubmenu) {
                      if (item.text === 'Clients') {
                        setClientsOpen(!clientsOpen);
                      } else if (item.text === 'Inventaire') {
                        setInventoryOpen(!inventoryOpen);
                      } else if (item.text === 'Opérations') {
                        setOperationsOpen(!operationsOpen);
                      } else if (item.text === 'Statistiques') {
                        setStatisticsOpen(!statisticsOpen);
                      } else if (item.text === 'Gestion IMF') {
                        setImfOpen(!imfOpen);
                      }
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  selected={!item.hasSubmenu && location.pathname === item.path}
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
                    <Badge
                      badgeContent={(item as any).badge ? unreadCount : 0}
                      color="error"
                      max={99}
                    >
                      {item.icon}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                  {item.hasSubmenu && open && (
                    item.text === 'Clients'
                      ? (clientsOpen ? <ExpandLess /> : <ExpandMore />)
                      : item.text === 'Inventaire'
                        ? (inventoryOpen ? <ExpandLess /> : <ExpandMore />)
                        : item.text === 'Opérations'
                          ? (operationsOpen ? <ExpandLess /> : <ExpandMore />)
                          : item.text === 'Gestion IMF'
                            ? (imfOpen ? <ExpandLess /> : <ExpandMore />)
                            : (statisticsOpen ? <ExpandLess /> : <ExpandMore />)
                  )}
                </ListItemButton>
              </ListItem>

              {/* Submenu items */}
              {item.hasSubmenu && item.submenu && (
                <Box
                  sx={{
                    maxHeight: (item.text === 'Clients' && clientsOpen) || (item.text === 'Inventaire' && inventoryOpen) || (item.text === 'Opérations' && operationsOpen) || (item.text === 'Statistiques' && statisticsOpen) || (item.text === 'Gestion IMF' && imfOpen) ? '500px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out',
                    opacity: open ? 1 : 0
                  }}
                >
                  {item.submenu.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => navigate(subItem.path)}
                        selected={location.pathname === subItem.path}
                        sx={{
                          minHeight: 44,
                          pl: 6,
                          pr: 2.5,
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
                        <ListItemText
                          primary={subItem.text}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 400 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </Box>
              )}
            </React.Fragment>
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
