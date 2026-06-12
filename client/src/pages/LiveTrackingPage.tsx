import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    Drawer,
    useTheme,
    useMediaQuery,
    Badge,
    CircularProgress,
    Alert,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    Slider,
    ListItemButton,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Person as PersonIcon,
    Speed as SpeedIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    Navigation as NavigationIcon,
    AccessTime as TimeIcon,
    Fullscreen as FullscreenIcon,
    Close as CloseIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { vehicleService } from '../services/vehicleService';
import { analyticsService } from '../services/analyticsService';
import { useSimulation } from '../hooks/useSimulation';
import type { DrivingSession, LocationLog } from '../types';

// Fix Leaflet default marker icons
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCarIcon = (color: string = '#1976d2', isActive: boolean = true) => new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
        </defs>
        <g filter="url(#shadow)">
            <circle cx="24" cy="24" r="20" fill="${color}" stroke="white" stroke-width="3"/>
            <path d="M34 16c-.4-1.1-1.5-2-2.7-2H16.7c-1.2 0-2.3.9-2.7 2L11 26v11c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5v-2h20v2c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5V26l-3-10zM15 31c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm18 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM13 24l2.5-7h17l2.5 7H13z" fill="white"/>
            ${isActive ? '<circle cx="36" cy="12" r="7" fill="#4caf50" stroke="white" stroke-width="2"/><text x="36" y="15" text-anchor="middle" fill="white" font-size="9" font-weight="bold">✓</text>' : ''}
        </g>
    </svg>`)}`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
});

// Ghana center
const GHANA_CENTER: LatLngExpression = [7.9465, -1.0232];
const GHANA_ZOOM = 8;

const TILE_STYLES = {
    light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    dark: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri',
    },
};

interface LiveVehicleData extends DrivingSession {
    currentLocation?: LocationLog;
    lastUpdate?: string;
}

// Component to programmatically set map view
const MapCenterUpdater: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [map, center, zoom]);
    return null;
};

const LiveTrackingPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [activeSessions, setActiveSessions] = useState<LiveVehicleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicleData | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [mapCenter] = useState<LatLngExpression>(GHANA_CENTER);
    const [mapZoom] = useState(GHANA_ZOOM);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(10);
    const [tileStyle, setTileStyle] = useState<'light' | 'dark' | 'satellite'>('dark');
    const [showAllMarkers, setShowAllMarkers] = useState(true);
    const [onlineOnly, setOnlineOnly] = useState(false);

    const sim = useSimulation();

    const socketRef = useRef<ReturnType<typeof io> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        loadActiveSessions();
        initializeWebSocket();
        return cleanup;
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
        return stopAutoRefresh;
    }, [autoRefresh, refreshInterval]);

    const loadActiveSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const sessions = await vehicleService.getActiveSessions();
            const sessionsWithLocation = await Promise.all(
                sessions.map(async (session) => {
                    try {
                        const routeData = await analyticsService.getRouteData(session.id);
                        const lastLocation = routeData.locations[routeData.locations.length - 1];
                        return { ...session, currentLocation: lastLocation, lastUpdate: new Date().toISOString() } as LiveVehicleData;
                    } catch {
                        return session as LiveVehicleData;
                    }
                })
            );
            setActiveSessions(sessionsWithLocation);
        } catch (err: any) {
            setError(err.message || 'Aktif oturumlar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const initializeWebSocket = () => {
        try {
            const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:9040';
            socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
            socketRef.current.on('locationUpdate', (data: any) => {
                setActiveSessions(prev => prev.map(s =>
                    s.id === data.sessionId ? { ...s, currentLocation: data, lastUpdate: new Date().toISOString() } : s
                ));
            });
            socketRef.current.on('sessionStart', loadActiveSessions);
            socketRef.current.on('sessionEnd', loadActiveSessions);
        } catch (err) {
            console.error('WebSocket init error:', err);
        }
    };

    const startAutoRefresh = () => {
        stopAutoRefresh();
        intervalRef.current = setInterval(loadActiveSessions, refreshInterval * 1000);
    };

    const stopAutoRefresh = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const cleanup = () => {
        stopAutoRefresh();
        socketRef.current?.disconnect();
    };

    const getStatusColor = (v: LiveVehicleData) => {
        if (!v.lastUpdate) return '#9e9e9e';
        const mins = (Date.now() - new Date(v.lastUpdate).getTime()) / 60000;
        if (mins < 2) return '#4caf50';
        if (mins < 10) return '#ff9800';
        return '#f44336';
    };

    const formatLastUpdate = (t?: string) => {
        if (!t) return 'Bilinmiyor';
        const s = Math.floor((Date.now() - new Date(t).getTime()) / 1000);
        if (s < 60) return `${s} saniye önce`;
        const m = Math.floor(s / 60);
        if (m < 60) return `${m} dakika önce`;
        return `${Math.floor(m / 60)} saat önce`;
    };

    const filteredSessions = activeSessions.filter(s =>
        onlineOnly ? s.currentLocation : true
    );

    const sidebarContent = (
        <Box sx={{
            width: isMobile ? '85vw' : 340,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : 'background.paper',
        }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Canlı Takip</Typography>
                        <Typography variant="caption" color="text.secondary">Gana - Araç Takip Sistemi</Typography>
                    </Box>
                    {isMobile && <IconButton onClick={() => setSidebarOpen(false)}><CloseIcon /></IconButton>}
                </Box>
                <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
                    <Chip label={`${activeSessions.length} Aktif`} color="primary" size="small" />
                    <Chip label={`${activeSessions.filter(v => v.currentLocation).length} Online`} color="success" size="small" />
                    <Chip label={`${activeSessions.filter(v => !v.currentLocation).length} Offline`} color="default" size="small" />
                </Box>
            </Box>

            <Accordion defaultExpanded sx={{ '&.MuiAccordion-root': { boxShadow: 'none', borderBottom: 1, borderColor: 'divider' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" fontWeight={600}>Takip Ayarları</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <FormControlLabel
                            control={<Switch checked={autoRefresh} onChange={(_, v) => setAutoRefresh(v)} size="small" />}
                            label={<Typography variant="body2">Otomatik Yenileme</Typography>}
                        />
                        {autoRefresh && (
                            <Box px={1}>
                                <Typography variant="caption" gutterBottom>Aralık: {refreshInterval}s</Typography>
                                <Slider value={refreshInterval} onChange={(_, v) => setRefreshInterval(v as number)} min={1} max={30} step={1} size="small" />
                            </Box>
                        )}
                        <FormControlLabel
                            control={<Switch checked={onlineOnly} onChange={(_, v) => setOnlineOnly(v)} size="small" />}
                            label={<Typography variant="body2">Sadece Online</Typography>}
                        />
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadActiveSessions} size="small" fullWidth>
                            Manuel Yenile
                        </Button>
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Box display="flex" justifyContent="center" p={1.5} borderBottom={1} borderColor="divider">
                <ToggleButtonGroup
                    value={tileStyle}
                    exclusive
                    onChange={(_, v) => v && setTileStyle(v)}
                    size="small"
                >
                    <ToggleButton value="light"><LightModeIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="dark"><DarkModeIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="satellite">
                        <Typography variant="caption" fontWeight={700}>S</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {error && <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}><CircularProgress size={32} /></Box>
                ) : filteredSessions.length === 0 ? (
                    <Box p={3} textAlign="center">
                        <Typography variant="body2" color="text.secondary">Aktif oturum yok</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {filteredSessions.map((session) => (
                            <ListItem key={session.id} disablePadding divider>
                                <ListItemButton
                                    onClick={() => setSelectedVehicle(session)}
                                    selected={selectedVehicle?.id === session.id}
                                    sx={{
                                        borderLeft: selectedVehicle?.id === session.id ? 3 : 0,
                                        borderColor: 'primary.main',
                                        py: 1.5,
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <CircleIcon
                                                    sx={{
                                                        fontSize: 14,
                                                        color: session.currentLocation ? '#4caf50' : '#9e9e9e',
                                                        bgcolor: 'background.paper',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            }
                                        >
                                            <Avatar sx={{ bgcolor: (session.vehicle as any)?.color || 'primary.main' }}>
                                                <CarIcon />
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {session.vehicle?.plateNumber || 'N/A'}
                                                <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                                                    {session.vehicle?.brand} {session.vehicle?.model}
                                                </Typography>
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    <PersonIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'text-top' }} />
                                                    {session.driver?.firstName} {session.driver?.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    <TimeIcon sx={{ fontSize: 11, mr: 0.3, verticalAlign: 'text-top' }} />
                                                    {formatLastUpdate(session.lastUpdate)}
                                                </Typography>
                                                {session.currentLocation && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        <SpeedIcon sx={{ fontSize: 11, mr: 0.3, verticalAlign: 'text-top' }} />
                                                        {Math.round(session.currentLocation.speed || 0)} km/h
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );

    const currentTile = TILE_STYLES[tileStyle];

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', mx: -3, mb: -3, overflow: 'hidden' }}>
            <Drawer
                variant={isMobile ? 'temporary' : 'persistent'}
                anchor="left"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                ModalProps={{ keepMounted: true }}
                PaperProps={{ sx: { position: 'relative', border: 'none' } }}
            >
                {sidebarContent}
            </Drawer>

            <Box sx={{ flex: 1, position: 'relative' }}>
                {/* Simulation control bar */}
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sim.status.running ? '#4caf50' : '#9e9e9e', animation: sim.status.running ? 'pulse 2s infinite' : 'none' }} />
                        <Typography variant="caption" fontWeight={600} fontSize={11}>SIM</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" fontSize={11}>
                        {sim.status.running ? `${sim.status.activeVehicles} vehicles moving` : 'Idle'}
                    </Typography>
                    <Button
                        size="small"
                        variant={sim.status.running ? 'outlined' : 'contained'}
                        color={sim.status.running ? 'error' : 'success'}
                        onClick={sim.status.running ? sim.stop : sim.start}
                        disabled={sim.loading}
                        sx={{ minWidth: 60, height: 26, fontSize: 11 }}
                    >
                        {sim.status.running ? 'STOP' : 'START'}
                    </Button>
                </Box>

                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {!sidebarOpen && (
                        <Tooltip title="Paneli Aç">
                            <IconButton onClick={() => setSidebarOpen(true)} sx={{ bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'background.paper' } }}>
                                <FilterIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Tam Ekran">
                        <IconButton sx={{ bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'background.paper' } }}>
                            <FullscreenIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={tileStyle === 'dark' ? 'Aydınlık Harita' : 'Karanlık Harita'}>
                        <IconButton
                            onClick={() => setTileStyle(tileStyle === 'dark' ? 'light' : 'dark')}
                            sx={{ bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'background.paper' } }}
                        >
                            {tileStyle === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url={currentTile.url} attribution={currentTile.attribution} />
                    <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
                    {filteredSessions.map((session) => {
                        if (!session.currentLocation) return null;
                        const pos: LatLngExpression = [session.currentLocation.latitude, session.currentLocation.longitude];
                        return (
                            <Marker key={session.id} position={pos} icon={createCarIcon(getStatusColor(session), true)}>
                                <Popup>
                                    <Box sx={{ minWidth: 260, maxWidth: 300 }}>
                                        {/* Vehicle Header */}
                                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                            <Avatar sx={{ bgcolor: getStatusColor(session), width: 36, height: 36 }}>
                                                <CarIcon sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} fontSize={14} lineHeight={1.2}>
                                                    {session.vehicle?.plateNumber || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {session.vehicle?.brand} {session.vehicle?.model} ({session.vehicle?.year})
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Status Badge */}
                                        <Box display="flex" gap={1} mb={1.5} flexWrap="wrap">
                                            <Chip
                                                label={session.currentLocation.speed > 0 ? 'Moving' : session.currentLocation.speed === 0 ? 'Idle' : 'Parked'}
                                                size="small"
                                                color={session.currentLocation.speed > 0 ? 'success' : 'warning'}
                                                variant="filled"
                                                sx={{ height: 22, fontSize: 11 }}
                                            />
                                            <Chip
                                                label={formatLastUpdate(session.lastUpdate)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 22, fontSize: 11 }}
                                            />
                                            <Chip
                                                label={`GN-${session.vehicle?.id || ''}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 22, fontSize: 11 }}
                                            />
                                        </Box>

                                        {/* Divider */}
                                        <Box sx={{ borderTop: 1, borderColor: 'divider', my: 1 }} />

                                        {/* Driver Info */}
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 12 }}>
                                                {session.driver?.firstName?.[0]}{session.driver?.lastName?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600} fontSize={13}>
                                                    {session.driver?.firstName} {session.driver?.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Driver • ID: {session.driverId}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Divider */}
                                        <Box sx={{ borderTop: 1, borderColor: 'divider', my: 1 }} />

                                        {/* Trip Stats */}
                                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Speed</Typography>
                                                <Typography variant="body2" fontWeight={700} color={session.currentLocation.speed > 80 ? 'error.main' : 'text.primary'}>
                                                    {Math.round(session.currentLocation.speed || 0)} km/h
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Heading</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {Math.round(session.currentLocation.heading || 0)}°
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Distance</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {Math.round(session.totalDistance || 0)} km
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Accuracy</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {Math.round(session.currentLocation.accuracy || 0)}m
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Started</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {new Date(session.startTime).toLocaleTimeString()}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Device ID</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {session.vehicle?.esp32DeviceId || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Coordinates */}
                                        <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1.5, pt: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Lat: {session.currentLocation.latitude.toFixed(6)}, Lng: {session.currentLocation.longitude.toFixed(6)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </Box>
        </Box>
    );
};

export default LiveTrackingPage;
