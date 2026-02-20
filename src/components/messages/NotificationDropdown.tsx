import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IconButton,
    Badge,
    Popover,
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Button,
    Chip,
    Skeleton,
} from '@mui/material';
import {
    NotificationsNone as NotificationsIcon,
    MarkEmailUnread as MarkEmailUnreadIcon,
    TrendingUp as SalesIcon,
    Support as SupportIcon,
} from '@mui/icons-material';
import { useMessages } from '../../context/MessagesContext';
import { getContacts, Contact, ContactType } from '../../services/contactService';

const READ_IDS_KEY = 'toona_read_message_ids';
const getReadIds = (): Set<number> => {
    try {
        const raw = localStorage.getItem(READ_IDS_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

const TYPE_CONFIG: Record<ContactType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    sales: { label: 'Commercial', color: '#15803D', bg: '#DCFCE7', icon: <SalesIcon sx={{ fontSize: 18 }} /> },
    support: { label: 'Support', color: '#C2410C', bg: '#FFEDD5', icon: <SupportIcon sx={{ fontSize: 18 }} /> },
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

const NotificationDropdown: React.FC = () => {
    const { unreadCount, markAllSeen, refreshUnread } = useMessages();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [recentMessages, setRecentMessages] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [readIds, setReadIds] = useState<Set<number>>(getReadIds);

    const open = Boolean(anchorEl);

    const handleOpen = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
        setLoading(true);
        try {
            const contacts = await getContacts();
            // Show the 5 most recent messages
            setRecentMessages(contacts.slice(0, 5));
            setReadIds(getReadIds());
        } catch {
            setRecentMessages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleClose = () => setAnchorEl(null);

    const handleViewAll = () => {
        handleClose();
        navigate('/messages');
    };

    const handleMarkAllRead = () => {
        markAllSeen();
        refreshUnread();
        handleClose();
    };

    return (
        <>
            <IconButton size="large" onClick={handleOpen}>
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    max={99}
                    overlap="circular"
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        width: 380,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        mt: 1,
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Notifications
                        </Typography>
                        {unreadCount > 0 && (
                            <Chip
                                label={unreadCount}
                                size="small"
                                color="error"
                                sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                            />
                        )}
                    </Box>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: 12 }}>
                            Tout marquer lu
                        </Button>
                    )}
                </Box>

                <Divider />

                {/* Message list */}
                {loading ? (
                    <Box sx={{ p: 2 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                        ))}
                    </Box>
                ) : recentMessages.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                        <MarkEmailUnreadIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" variant="body2">
                            Aucun message récent
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {recentMessages.map((msg, idx) => {
                            const cfg = TYPE_CONFIG[msg.type];
                            const isRead = readIds.has(msg.id);
                            return (
                                <React.Fragment key={msg.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            px: 2.5,
                                            py: 1.5,
                                            bgcolor: isRead ? 'transparent' : 'primary.50',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                        onClick={() => {
                                            handleClose();
                                            navigate('/messages');
                                        }}
                                    >
                                        <ListItemAvatar sx={{ minWidth: 44 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: cfg.bg,
                                                    color: cfg.color,
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {msg.fullName.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontWeight: isRead ? 500 : 700, fontSize: 13 }}
                                                    >
                                                        {msg.fullName}
                                                    </Typography>
                                                    <Chip
                                                        label={cfg.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: cfg.bg,
                                                            color: cfg.color,
                                                            fontWeight: 700,
                                                            fontSize: 10,
                                                            height: 18,
                                                            ml: 1,
                                                        }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {msg.message}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.disabled"
                                                        display="block"
                                                    >
                                                        {formatDate(msg.createdAt)}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {idx < recentMessages.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}

                <Divider />

                {/* Footer */}
                <Box sx={{ p: 1.5, textAlign: 'center' }}>
                    <Button
                        fullWidth
                        variant="text"
                        size="small"
                        onClick={handleViewAll}
                        sx={{ fontWeight: 600 }}
                    >
                        Voir tous les messages →
                    </Button>
                </Box>
            </Popover>
        </>
    );
};

export default NotificationDropdown;
