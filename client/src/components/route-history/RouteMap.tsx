import React, { useEffect, useRef, useState } from 'react';
import { Paper, Box, Typography, ToggleButtonGroup, ToggleButton, useTheme } from '@mui/material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ExtendedRouteData } from '../../types';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TILE_STYLES = {
    light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap',
    },
    dark: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        attribution: '&copy; Stadia Maps',
    },
};

const getStartIcon = () => new L.DivIcon({
    html: `<div style="
        width:32px;height:32px;border-radius:50%;
        background:linear-gradient(135deg,#4caf50,#2e7d32);
        border:3px solid white;
        box-shadow:0 3px 8px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;font-weight:bold;color:white;
    ">▶</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
});

const getEndIcon = () => new L.DivIcon({
    html: `<div style="
        width:32px;height:32px;border-radius:50%;
        background:linear-gradient(135deg,#f44336,#c62828);
        border:3px solid white;
        box-shadow:0 3px 8px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;font-weight:bold;color:white;
    ">■</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
});

const getWaypointIcon = (color: string) => new L.DivIcon({
    html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:${color};border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,0.3);
    ">${''}</div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const FitBounds: React.FC<{ routes: ExtendedRouteData[] }> = ({ routes }) => {
    const map = useMap();

    useEffect(() => {
        if (routes.length === 0) return;

        const allPoints: LatLngExpression[] = routes.flatMap(r =>
            r.locations.map(loc => [loc.latitude, loc.longitude] as LatLngExpression)
        );

        if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [routes, map]);

    return null;
};

interface RouteMapProps {
    routes: ExtendedRouteData[];
    center: LatLngExpression;
    zoom: number;
}

export const RouteMap: React.FC<RouteMapProps> = React.memo(({ routes, center, zoom }) => {
    const mapRef = useRef<L.Map | null>(null);
    const [tileStyle, setTileStyle] = useState<'light' | 'dark'>('dark');
    const theme = useTheme();

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const currentTile = TILE_STYLES[tileStyle];

    return (
        <Paper sx={{ height: 600, overflow: 'hidden', position: 'relative', borderRadius: 2 }}>
            {/* Tile style toggle */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
                <ToggleButtonGroup
                    value={tileStyle}
                    exclusive
                    onChange={(_, v) => v && setTileStyle(v)}
                    size="small"
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                        '& .MuiToggleButton-root': { border: 'none', px: 1.5 },
                    }}
                >
                    <ToggleButton value="light"><LightModeIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="dark"><DarkModeIcon fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {routes.length === 0 ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    bgcolor={tileStyle === 'dark' ? '#1a1a2e' : 'grey.50'}
                    gap={1}
                >
                    <Typography variant="h5" color={tileStyle === 'dark' ? 'grey.400' : 'text.secondary'}>
                        🗺️ Gana Haritası
                    </Typography>
                    <Typography variant="body2" color={tileStyle === 'dark' ? 'grey.600' : 'text.secondary'}>
                        Sol panelden bir rota seçin
                    </Typography>
                </Box>
            ) : (
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                    key={tileStyle}
                >
                    <TileLayer url={currentTile.url} attribution={currentTile.attribution} />

                    <FitBounds routes={routes} />

                    {routes.map((route) => {
                        const positions: LatLngExpression[] = route.locations.map(loc => [
                            loc.latitude,
                            loc.longitude,
                        ]);

                        if (positions.length < 2) return null;

                        const startLoc = route.locations[0];
                        const endLoc = route.locations[route.locations.length - 1];

                        return (
                            <React.Fragment key={route.session.id}>
                                <Polyline
                                    positions={positions}
                                    pathOptions={{
                                        color: route.color,
                                        weight: 4,
                                        opacity: 0.9,
                                        dashArray: undefined,
                                    }}
                                />

                                {route.locations.filter((_, idx) => idx > 0 && idx < route.locations.length - 1 && idx % Math.max(1, Math.floor(route.locations.length / 5)) === 0).map((loc, idx) => (
                                    <Marker
                                        key={`wp-${idx}`}
                                        position={[loc.latitude, loc.longitude]}
                                        icon={getWaypointIcon(route.color)}
                                    />
                                ))}

                                <Marker
                                    position={[startLoc.latitude, startLoc.longitude]}
                                    icon={getStartIcon()}
                                >
                                    <Popup>
                                        <Box sx={{ minWidth: 160 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>Başlangıç</Typography>
                                            <Typography variant="body2">{route.session.vehicle?.plateNumber}</Typography>
                                            <Typography variant="caption" color="text.secondary">{formatDate(route.session.startTime)}</Typography>
                                        </Box>
                                    </Popup>
                                </Marker>

                                {route.session.endTime && (
                                    <Marker
                                        position={[endLoc.latitude, endLoc.longitude]}
                                        icon={getEndIcon()}
                                    >
                                        <Popup>
                                            <Box sx={{ minWidth: 160 }}>
                                                <Typography variant="subtitle2" fontWeight={700}>Bitiş</Typography>
                                                <Typography variant="body2">{route.session.vehicle?.plateNumber}</Typography>
                                                <Typography variant="caption" color="text.secondary">{formatDate(route.session.endTime)}</Typography>
                                            </Box>
                                        </Popup>
                                    </Marker>
                                )}
                            </React.Fragment>
                        );
                    })}
                </MapContainer>
            )}
        </Paper>
    );
});

RouteMap.displayName = 'RouteMap';
