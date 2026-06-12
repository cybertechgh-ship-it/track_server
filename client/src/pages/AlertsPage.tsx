import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Alert as MuiAlert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Tooltip,
    TextField,
    InputAdornment,
    Button,
    useTheme,
    useMediaQuery,
    Menu,
    MenuItem,
    Fab,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreIcon,
    CheckCircle as AcknowledgeIcon,
    Visibility as ViewIcon,
    Warning as WarningIcon,
    Speed as SpeedIcon,
    GppBad as UnauthorizedIcon,
    LocationOff as GeofenceIcon,
    Build as MaintenanceIcon,
    Timer as IdleIcon,
    Refresh as RefreshIcon,
    PriorityHigh as CriticalIcon,
    LocalPolice as SecurityIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../services/api';
import type { ApiResponse, PaginationMeta } from '../types';

interface AlertItem {
    id: number;
    type: 'speed' | 'unauthorized' | 'geofence_enter' | 'geofence_exit' | 'maintenance' | 'idle';
    severity: 'low' | 'medium' | 'high' | 'critical';
    vehicleId: number;
    driverId: number | null;
    sessionId: number | null;
    message: string;
    data: any;
    isRead: boolean;
    isAcknowledged: boolean;
    acknowledgedBy: number | null;
    acknowledgedAt: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    updatedAt: string;
}

interface AlertStats {
    total: number;
    unread: number;
    bySeverity: { severity: string; count: number }[];
    byType: { type: string; count: number }[];
}

const typeConfig: Record<string, { label: string; icon: React.ReactElement; color: string }> = {
    speed: { label: 'Hız İhlali', icon: <SpeedIcon fontSize="small" />, color: 'error' },
    unauthorized: { label: 'Yetkisiz Erişim', icon: <UnauthorizedIcon fontSize="small" />, color: 'warning' },
    geofence_enter: { label: 'Bölge Giriş', icon: <GeofenceIcon fontSize="small" />, color: 'info' },
    geofence_exit: { label: 'Bölge Çıkış', icon: <GeofenceIcon fontSize="small" />, color: 'info' },
    maintenance: { label: 'Bakım', icon: <MaintenanceIcon fontSize="small" />, color: 'secondary' },
    idle: { label: 'Rölanti', icon: <IdleIcon fontSize="small" />, color: 'default' },
};

const severityConfig: Record<string, { color: 'success' | 'warning' | 'error' | 'default' }> = {
    low: { color: 'success' },
    medium: { color: 'warning' },
    high: { color: 'error' },
    critical: { color: 'error' },
};

const AlertsPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [severityFilter, setSeverityFilter] = useState<string>('');
    const [stats, setStats] = useState<AlertStats | null>(null);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            params.set('page', String(page + 1));
            params.set('limit', String(rowsPerPage));
            if (typeFilter) params.set('type', typeFilter);
            if (severityFilter) params.set('severity', severityFilter);
            const res = await api.get<ApiResponse<AlertItem[]>>(`/alerts?${params}`);
            setAlerts(res.data.data || []);
            setTotal(res.data.meta?.total || (res.data.data || []).length);
        } catch (err: any) {
            setError(err.message || 'Uyarılar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, typeFilter, severityFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get<ApiResponse<AlertStats>>('/alerts/stats');
            setStats(res.data.data || null);
        } catch {
            // non-critical
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
        fetchStats();
    }, [fetchAlerts, fetchStats]);

    const handleAcknowledge = async (alert: AlertItem) => {
        try {
            await api.patch(`/alerts/${alert.id}/acknowledge`);
            fetchAlerts();
            fetchStats();
            setAnchorEl(null);
        } catch (err: any) {
            setError(err.message || 'Onaylama başarısız');
        }
    };

    const handleMarkRead = async (ids: number[]) => {
        try {
            await api.patch('/alerts/read', { ids });
            fetchAlerts();
            fetchStats();
        } catch (err: any) {
            setError(err.message || 'Okundu işaretlenemedi');
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, alert: AlertItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedAlert(alert);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedAlert(null);
    };

    const filteredAlerts = alerts.filter((a) =>
        a.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeIcon = (type: string) => typeConfig[type]?.icon || <WarningIcon fontSize="small" />;
    const getTypeLabel = (type: string) => typeConfig[type]?.label || type;
    const getSeverityColor = (severity: string) => severityConfig[severity]?.color || 'default';

    if (loading && alerts.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={40} />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <MuiAlert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </MuiAlert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" color="primary" fontWeight={700}>
                                        {stats?.total ?? '-'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Toplam Uyarı
                                    </Typography>
                                </Box>
                                <WarningIcon color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" color="warning.main" fontWeight={700}>
                                        {stats?.unread ?? '-'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Okunmamış
                                    </Typography>
                                </Box>
                                <SecurityIcon color="warning" sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" color="error.main" fontWeight={700}>
                                        {stats?.bySeverity?.find((s) => s.severity === 'critical')?.count ?? '-'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Kritik
                                    </Typography>
                                </Box>
                                <CriticalIcon color="error" sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" color="error.main" fontWeight={700}>
                                        {stats?.bySeverity?.find((s) => s.severity === 'high')?.count ?? '-'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Yüksek
                                    </Typography>
                                </Box>
                                <SpeedIcon color="error" sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Toolbar */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                        <TextField
                            placeholder="Uyarı ara..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 250 }}
                        />

                        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Tür</InputLabel>
                                <Select
                                    value={typeFilter}
                                    label="Tür"
                                    onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    {Object.entries(typeConfig).map(([key, cfg]) => (
                                        <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Seviye</InputLabel>
                                <Select
                                    value={severityFilter}
                                    label="Seviye"
                                    onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="low">Düşük</MenuItem>
                                    <MenuItem value="medium">Orta</MenuItem>
                                    <MenuItem value="high">Yüksek</MenuItem>
                                    <MenuItem value="critical">Kritik</MenuItem>
                                </Select>
                            </FormControl>

                            <Tooltip title="Yenile">
                                <IconButton onClick={() => { fetchAlerts(); fetchStats(); }}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Unread banner */}
            {stats && stats.unread > 0 && filteredAlerts.length > 0 && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleMarkRead(filteredAlerts.filter(a => !a.isRead).map(a => a.id))}
                    >
                        Tümünü Okundu İşaretle
                    </Button>
                </Box>
            )}

            {/* Desktop Table */}
            {!isMobile ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tip</TableCell>
                                <TableCell>Mesaj</TableCell>
                                <TableCell>Seviye</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell>Tarih</TableCell>
                                <TableCell align="center">İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAlerts.map((alert) => (
                                <TableRow
                                    key={alert.id}
                                    hover
                                    sx={{
                                        backgroundColor: !alert.isRead ? 'action.hover' : 'transparent',
                                        fontWeight: !alert.isRead ? 600 : 400,
                                    }}
                                >
                                    <TableCell>
                                        <Chip
                                            icon={getTypeIcon(alert.type)}
                                            label={getTypeLabel(alert.type)}
                                            size="small"
                                            variant="outlined"
                                            color={typeConfig[alert.type]?.color as any || 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={!alert.isRead ? 600 : 400}>
                                            {alert.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={alert.severity.toUpperCase()}
                                            size="small"
                                            color={getSeverityColor(alert.severity)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {alert.isAcknowledged ? (
                                            <Chip label="Onaylandı" size="small" color="success" variant="outlined" />
                                        ) : alert.isRead ? (
                                            <Chip label="Okundu" size="small" color="info" variant="outlined" />
                                        ) : (
                                            <Chip label="Yeni" size="small" color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {dayjs(alert.createdAt).format('DD.MM.YYYY HH:mm')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" justifyContent="center" gap={1}>
                                            {!alert.isAcknowledged && (
                                                <Tooltip title="Onayla">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAcknowledge(alert)}
                                                        color="success"
                                                    >
                                                        <AcknowledgeIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuClick(e, alert)}
                                            >
                                                <MoreIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredAlerts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary" py={4}>
                                            Uyarı bulunamadı
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                /* Mobile Cards */
                <Box>
                    {filteredAlerts.map((alert) => (
                        <Card key={alert.id} sx={{ mb: 2, opacity: alert.isAcknowledged ? 0.7 : 1 }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="start">
                                    <Box flex={1}>
                                        <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                                            <Chip
                                                icon={getTypeIcon(alert.type)}
                                                label={getTypeLabel(alert.type)}
                                                size="small"
                                                variant="outlined"
                                                color={typeConfig[alert.type]?.color as any || 'default'}
                                            />
                                            <Chip
                                                label={alert.severity.toUpperCase()}
                                                size="small"
                                                color={getSeverityColor(alert.severity)}
                                            />
                                        </Box>
                                        <Typography variant="body2" fontWeight={!alert.isRead ? 600 : 400} mb={1}>
                                            {alert.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {dayjs(alert.createdAt).format('DD.MM.YYYY HH:mm')}
                                        </Typography>
                                    </Box>
                                    <IconButton onClick={(e) => handleMenuClick(e, alert)}>
                                        <MoreIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                labelRowsPerPage="Sayfa başına:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {selectedAlert && !selectedAlert.isAcknowledged && (
                    <MenuItem onClick={() => { if (selectedAlert) handleAcknowledge(selectedAlert); handleMenuClose(); }}>
                        <AcknowledgeIcon fontSize="small" sx={{ mr: 1 }} />
                        Onayla
                    </MenuItem>
                )}
                <MenuItem onClick={() => {
                    handleMarkRead([selectedAlert!.id]);
                    handleMenuClose();
                }}>
                    <ViewIcon fontSize="small" sx={{ mr: 1 }} />
                    Okundu İşaretle
                </MenuItem>
            </Menu>

            {/* Mobile FAB */}
            {isMobile && (
                <Fab
                    color="primary"
                    onClick={() => { fetchAlerts(); fetchStats(); }}
                    sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
                >
                    <RefreshIcon />
                </Fab>
            )}
        </Box>
    );
};

export default AlertsPage;
