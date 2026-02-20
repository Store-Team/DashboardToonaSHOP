import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Badge,
    Avatar,
} from '@mui/material';
import {
    Search as SearchIcon,
    MarkEmailUnread as MarkEmailUnreadIcon,
    MarkEmailRead as MarkEmailReadIcon,
    WhatsApp as WhatsAppIcon,
    Refresh as RefreshIcon,
    Mail as MailIcon,
    Support as SupportIcon,
    Business as BusinessIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Close as CloseIcon,
    TrendingUp as SalesIcon,
    Work as WorkIcon,
    Public as PublicIcon,
    ShoppingCart as OrdersIcon,
    Storage as ERPIcon,
    AccountCircle as AccountIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    ContactMail as ContactMailIcon,
    HelpOutline as ReasonIcon,
    CalendarToday as DateIcon,
    SendOutlined as EmailSentIcon,
} from '@mui/icons-material';
import {
    getContacts,
    getContactStats,
    Contact,
    ContactType,
    ContactStats,
} from '../../services/contactService';
import { useMessages } from '../../context/MessagesContext';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { useSnackbar } from '../../context/SnackbarContext';
import StatCard from '../../components/StatCard';

// ─── Local "read" tracking (localStorage) ────────────────────────────────────
const READ_IDS_KEY = 'toona_read_message_ids';

const getReadIds = (): Set<number> => {
    try {
        const raw = localStorage.getItem(READ_IDS_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

const markIdRead = (id: number): void => {
    const ids = getReadIds();
    ids.add(id);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
};

// ─── Type badge config ────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ContactType, { label: string; color: string; bg: string }> = {
    sales: { label: 'Commercial', color: '#15803D', bg: '#DCFCE7' },
    support: { label: 'Support', color: '#C2410C', bg: '#FFEDD5' },
};

const MessagesPage: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [stats, setStats] = useState<ContactStats | null>(null);
    const [filter, setFilter] = useState<ContactType | 'all'>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [readIds, setReadIds] = useState<Set<number>>(getReadIds);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const { refreshUnread, markAllSeen } = useMessages();
    const { forwardMessage } = useWhatsApp();
    const { showError } = useSnackbar();

    // ── Data fetch ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [contactsData, statsData] = await Promise.all([
                getContacts(filter === 'all' ? undefined : filter),
                getContactStats(),
            ]);
            setContacts(contactsData);
            setStats(statsData);
        } catch {
            showError('Impossible de charger les messages du site web.');
            setContacts([]);
        } finally {
            setLoading(false);
        }
    }, [filter, showError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Derived: filtered + searched list ──────────────────────────────────────
    const filtered = contacts.filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            c.fullName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.company ?? '').toLowerCase().includes(q) ||
            (c.phone ?? '').includes(q)
        );
    });

    const paginated = filtered.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // ── Open detail modal ───────────────────────────────────────────────────────
    const openDetail = (contact: Contact) => {
        setSelectedContact(contact);
        if (!readIds.has(contact.id)) {
            markIdRead(contact.id);
            setReadIds(getReadIds());
            refreshUnread();
        }
    };

    const closeDetail = () => setSelectedContact(null);

    // ── Mark all read ────────────────────────────────────────────────────────────
    const handleMarkAllRead = () => {
        const allIds = contacts.map((c) => c.id);
        const ids = getReadIds();
        allIds.forEach((id) => ids.add(id));
        localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
        setReadIds(new Set(ids));
        markAllSeen();
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const unreadInView = filtered.filter((c) => !readIds.has(c.id)).length;

    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <Box>
            {/* ── Page Header ── */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Messages Site Web
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Messages de contact soumis depuis le site public ToonaSHOP
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {unreadInView > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MarkEmailReadIcon />}
                            onClick={handleMarkAllRead}
                        >
                            Tout marquer lu
                        </Button>
                    )}
                    <Tooltip title="Actualiser">
                        <IconButton onClick={fetchData} disabled={loading} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* ── KPI Cards ── */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    {loading ? (
                        <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
                    ) : (
                        <StatCard
                            title="Total Messages"
                            value={stats?.total ?? 0}
                            trend={0}
                            icon={<MailIcon />}
                            color="#6366F1"
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={4}>
                    {loading ? (
                        <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
                    ) : (
                        <StatCard
                            title="Commercial (Sales)"
                            value={stats?.byType?.sales ?? 0}
                            trend={0}
                            icon={<SalesIcon />}
                            color="#10B981"

                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={4}>
                    {loading ? (
                        <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
                    ) : (
                        <StatCard
                            title="Support"
                            value={stats?.byType?.support ?? 0}
                            trend={0}
                            icon={<SupportIcon />}
                            color="#F59E0B"
                        />
                    )}
                </Grid>
            </Grid>

            {/* ── Table Card ── */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 1px 8px 0 rgba(0,0,0,0.07)' }}>
                <CardContent sx={{ p: 3 }}>
                    {/* ── Filters Row ── */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                        <ToggleButtonGroup
                            value={filter}
                            exclusive
                            size="small"
                            onChange={(_, val) => { if (val) { setFilter(val); setPage(0); } }}
                        >
                            <ToggleButton value="all">Tous</ToggleButton>
                            <ToggleButton value="sales">Commercial</ToggleButton>
                            <ToggleButton value="support">Support</ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            placeholder="Rechercher par nom, email, entreprise…"
                            size="small"
                            variant="outlined"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            sx={{ minWidth: 280, flex: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {unreadInView > 0 && (
                            <Chip
                                icon={<MarkEmailUnreadIcon fontSize="small" />}
                                label={`${unreadInView} non lu${unreadInView > 1 ? 's' : ''}`}
                                color="primary"
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>

                    {/* ── Table ── */}
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, width: 8 }} />
                                    <TableCell sx={{ fontWeight: 700 }}>Nom / Entreprise</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Téléphone</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 7 }).map((__, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton height={24} />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary">
                                                Aucun message trouvé
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginated.map((contact) => {
                                        const isRead = readIds.has(contact.id);
                                        const typeCfg = TYPE_CONFIG[contact.type];
                                        return (
                                            <TableRow
                                                key={contact.id}
                                                hover
                                                onClick={() => openDetail(contact)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    bgcolor: isRead ? 'transparent' : 'primary.50',
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                }}
                                            >
                                                {/* Unread dot */}
                                                <TableCell sx={{ px: 1 }}>
                                                    {!isRead && (
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: 'primary.main',
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontWeight: isRead ? 400 : 700 }}
                                                    >
                                                        {contact.fullName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {contact.company}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{contact.email}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{contact.phone}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={typeCfg.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: typeCfg.bg,
                                                            color: typeCfg.color,
                                                            fontWeight: 700,
                                                            fontSize: 11,
                                                            height: 22,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(contact.createdAt)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={
                                                            isRead ? (
                                                                <MarkEmailReadIcon sx={{ fontSize: '14px !important' }} />
                                                            ) : (
                                                                <MarkEmailUnreadIcon
                                                                    sx={{ fontSize: '14px !important' }}
                                                                />
                                                            )
                                                        }
                                                        label={isRead ? 'Lu' : 'Non lu'}
                                                        size="small"
                                                        variant="outlined"
                                                        color={isRead ? 'default' : 'primary'}
                                                        sx={{ fontSize: 11 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Lignes par page :"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}–${to} sur ${count}`
                        }
                    />
                </CardContent>
            </Card>

            {/* ── Message Detail Modal ── */}
            <Dialog
                open={!!selectedContact}
                onClose={closeDetail}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedContact && (() => {
                    const cfg = TYPE_CONFIG[selectedContact.type];
                    const isSupport = selectedContact.type === 'support';
                    const s = selectedContact as any; // typed access to discriminated union fields
                    return (
                        <>
                            {/* ── Header ── */}
                            <DialogTitle sx={{ pb: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: cfg.bg, color: cfg.color, width: 52, height: 52, fontSize: 22, fontWeight: 700 }}>
                                            {selectedContact.fullName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                {selectedContact.fullName}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.7, flexWrap: 'wrap' }}>
                                                <Chip
                                                    label={cfg.label}
                                                    size="small"
                                                    sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11, height: 20 }}
                                                />
                                                <Chip
                                                    icon={<EmailSentIcon sx={{ fontSize: '13px !important' }} />}
                                                    label={selectedContact.emailSent ? 'Email envoyé' : 'Email non envoyé'}
                                                    size="small"
                                                    color={selectedContact.emailSent ? 'success' : 'default'}
                                                    variant="outlined"
                                                    sx={{ fontSize: 11, height: 20 }}
                                                />
                                                <Chip
                                                    icon={<WhatsAppIcon sx={{ fontSize: '13px !important', color: '#25D366 !important' }} />}
                                                    label={selectedContact.whatsappSent ? 'WhatsApp envoyé' : 'WhatsApp non envoyé'}
                                                    size="small"
                                                    color={selectedContact.whatsappSent ? 'success' : 'default'}
                                                    variant="outlined"
                                                    sx={{ fontSize: 11, height: 20 }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={closeDetail} size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </DialogTitle>

                            <Divider />

                            <DialogContent sx={{ pt: 2.5, pb: 2 }}>

                                {/* ── Section : Coordonnées de base ── */}
                                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                                    Coordonnées
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 0.5, mb: 2.5 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                            <BusinessIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Entreprise</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {selectedContact.company || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                            <EmailIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Email principal</Typography>
                                                <Typography
                                                    variant="body2" sx={{ fontWeight: 600 }}
                                                    component="a" href={`mailto:${selectedContact.email}`}
                                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                                >
                                                    {selectedContact.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                            <PhoneIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                                                <Typography
                                                    variant="body2" sx={{ fontWeight: 600 }}
                                                    component="a" href={`tel:${selectedContact.phone}`}
                                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                                >
                                                    {selectedContact.phone || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                            <DateIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Reçu le</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {formatDate(selectedContact.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ mb: 2 }} />

                                {/* ── Section spécifique : SUPPORT ── */}
                                {isSupport && (
                                    <>
                                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                                            Détails Support
                                        </Typography>
                                        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2.5 }}>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <ReasonIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Raison du contact</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {s.contactReason
                                                                ? s.contactReason.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                                                                : <span style={{ color: '#aaa', fontStyle: 'italic' }}>Non précisée</span>}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        <Divider sx={{ mb: 2 }} />
                                    </>
                                )}

                                {/* ── Section spécifique : SALES ── */}
                                {!isSupport && (
                                    <>
                                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                                            étails Commercial
                                        </Typography>
                                        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2.5 }}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <WorkIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Titre / Fonction</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {s.jobTitle || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <ContactMailIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Email professionnel</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}
                                                            component="a" href={s.professionalEmail ? `mailto:${s.professionalEmail}` : undefined}
                                                            style={{ color: 'inherit', textDecoration: 'none' }}
                                                        >
                                                            {s.professionalEmail || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <PublicIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Pays</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {s.country || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <OrdersIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Commandes / mois</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {s.ordersPerMonth || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <ERPIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">ERP actuel</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {s.currentERP || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Aucun / Non précisé</span>}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    {s.hasExistingAccount
                                                        ? <CheckCircleIcon fontSize="small" sx={{ color: '#16a34a', mt: 0.2 }} />
                                                        : <CancelIcon fontSize="small" sx={{ color: '#dc2626', mt: 0.2 }} />
                                                    }
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Compte ToonaShop existant</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {s.hasExistingAccount === null
                                                                ? <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>
                                                                : s.hasExistingAccount ? 'Oui' : 'Non'
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        <Divider sx={{ mb: 2 }} />
                                    </>
                                )}

                                {/* ── Message body ── */}
                                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                                    Message
                                </Typography>
                                <Box
                                    sx={{
                                        mt: 1,
                                        p: 2,
                                        bgcolor: 'grey.50',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'grey.200',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                                        {selectedContact.message}
                                    </Typography>
                                </Box>

                            </DialogContent>

                            <Divider />

                            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                                <Button onClick={closeDetail} variant="outlined" size="small">
                                    Fermer
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<WhatsAppIcon />}
                                    onClick={() => forwardMessage(selectedContact)}
                                    sx={{
                                        bgcolor: '#25D366',
                                        '&:hover': { bgcolor: '#1DA851' },
                                    }}
                                >
                                    Envoyer via WhatsApp
                                </Button>
                            </DialogActions>
                        </>
                    );
                })()}
            </Dialog>
        </Box>
    );
};

export default MessagesPage;
