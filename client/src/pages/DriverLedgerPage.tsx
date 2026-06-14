import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { UNIQUE_DRIVER_PHOTOS, getStablePhoto } from '../constants/photos';

interface DriverLedger {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  photo: string;
  rfidCardId: string;
  guarantorName: string;
  guarantorPhone: string;
  academyGraduationDate: string | null;
  deploymentStatus: 'deployed' | 'available' | 'suspended' | 'training';
  licenseExpiryDate: string;
  conductScore: number;
  remittanceTarget: number;
  remittanceActual: number;
  totalTrips: number;
  incidentCount: number;
  isActive: boolean;
}

const DEMO_DRIVERS: DriverLedger[] = [
  { id: 1, firstName: 'Kofi', lastName: 'Mensah', phone: '+233 24 100 2001', email: 'kofi.mensah@evergreen.logistics', photo: getStablePhoto(1, 'Kofi Mensah', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-001', guarantorName: 'Samuel Mensah', guarantorPhone: '+233 24 900 1001', academyGraduationDate: '2025-03-15', deploymentStatus: 'deployed', licenseExpiryDate: '2027-06-30', conductScore: 88, remittanceTarget: 450, remittanceActual: 420, totalTrips: 128, incidentCount: 1, isActive: true },
  { id: 2, firstName: 'Ama', lastName: 'Serwaa', phone: '+233 50 200 3002', email: 'ama.serwaa@evergreen.logistics', photo: getStablePhoto(2, 'Ama Serwaa', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-002', guarantorName: 'Kwame Serwaa', guarantorPhone: '+233 24 800 2002', academyGraduationDate: '2025-01-20', deploymentStatus: 'deployed', licenseExpiryDate: '2026-12-15', conductScore: 92, remittanceTarget: 400, remittanceActual: 440, totalTrips: 156, incidentCount: 0, isActive: true },
  { id: 3, firstName: 'Yaw', lastName: 'Boateng', phone: '+233 55 300 4003', email: 'yaw.boateng@evergreen.logistics', photo: getStablePhoto(3, 'Yaw Boateng', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-003', guarantorName: 'Adwoa Boateng', guarantorPhone: '+233 24 700 3003', academyGraduationDate: null, deploymentStatus: 'available', licenseExpiryDate: '2025-11-01', conductScore: 65, remittanceTarget: 350, remittanceActual: 280, totalTrips: 67, incidentCount: 3, isActive: true },
  { id: 4, firstName: 'Efia', lastName: 'Owusu', phone: '+233 24 400 5004', email: 'efia.owusu@evergreen.logistics', photo: getStablePhoto(4, 'Efia Owusu', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-004', guarantorName: 'Yaw Owusu', guarantorPhone: '+233 50 600 4004', academyGraduationDate: '2025-06-10', deploymentStatus: 'deployed', licenseExpiryDate: '2027-03-22', conductScore: 78, remittanceTarget: 500, remittanceActual: 460, totalTrips: 142, incidentCount: 1, isActive: true },
  { id: 5, firstName: 'Kwame', lastName: 'Asante', phone: '+233 20 500 6005', email: 'kwame.asante@evergreen.logistics', photo: getStablePhoto(5, 'Kwame Asante', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-005', guarantorName: 'Akua Asante', guarantorPhone: '+233 24 500 5005', academyGraduationDate: '2026-04-01', deploymentStatus: 'training', licenseExpiryDate: '2027-09-18', conductScore: 0, remittanceTarget: 0, remittanceActual: 0, totalTrips: 0, incidentCount: 0, isActive: true },
  { id: 6, firstName: 'Abena', lastName: 'Osei', phone: '+233 54 600 7006', email: 'abena.osei@evergreen.logistics', photo: getStablePhoto(6, 'Abena Osei', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-006', guarantorName: 'Kofi Osei', guarantorPhone: '+233 24 400 6006', academyGraduationDate: '2025-02-28', deploymentStatus: 'deployed', licenseExpiryDate: '2026-08-10', conductScore: 95, remittanceTarget: 450, remittanceActual: 500, totalTrips: 178, incidentCount: 0, isActive: true },
  { id: 7, firstName: 'Nana', lastName: 'Yaw', phone: '+233 27 700 8007', email: 'nana.yaw@evergreen.logistics', photo: getStablePhoto(7, 'Nana Yaw', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-007', guarantorName: 'Ama Yaw', guarantorPhone: '+233 55 300 7007', academyGraduationDate: '2025-09-12', deploymentStatus: 'suspended', licenseExpiryDate: '2025-05-20', conductScore: 45, remittanceTarget: 400, remittanceActual: 250, totalTrips: 83, incidentCount: 5, isActive: false },
  { id: 8, firstName: 'Akua', lastName: 'Sarpong', phone: '+233 23 800 9008', email: 'akua.sarpong@evergreen.logistics', photo: getStablePhoto(8, 'Akua Sarpong', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-008', guarantorName: 'Yaw Sarpong', guarantorPhone: '+233 24 200 8008', academyGraduationDate: '2024-11-05', deploymentStatus: 'available', licenseExpiryDate: '2026-10-30', conductScore: 82, remittanceTarget: 300, remittanceActual: 310, totalTrips: 94, incidentCount: 0, isActive: true },
  { id: 9, firstName: 'Kwesi', lastName: 'Appiah', phone: '+233 50 900 0109', email: 'kwesi.appiah@evergreen.logistics', photo: getStablePhoto(9, 'Kwesi Appiah', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-009', guarantorName: 'Efia Appiah', guarantorPhone: '+233 27 100 9009', academyGraduationDate: '2025-04-18', deploymentStatus: 'deployed', licenseExpiryDate: '2027-07-07', conductScore: 90, remittanceTarget: 500, remittanceActual: 480, totalTrips: 165, incidentCount: 1, isActive: true },
  { id: 10, firstName: 'Esi', lastName: 'Amankwah', phone: '+233 24 010 1001', email: 'esi.amankwah@evergreen.logistics', photo: getStablePhoto(10, 'Esi Amankwah', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-010', guarantorName: 'Kweku Amankwah', guarantorPhone: '+233 23 400 0100', academyGraduationDate: null, deploymentStatus: 'deployed', licenseExpiryDate: '2026-01-15', conductScore: 73, remittanceTarget: 350, remittanceActual: 320, totalTrips: 115, incidentCount: 2, isActive: true },
  { id: 11, firstName: 'Yaa', lastName: 'Achiaa', phone: '+233 55 111 2112', email: 'yaa.achiaa@evergreen.logistics', photo: getStablePhoto(11, 'Yaa Achiaa', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-011', guarantorName: 'Kwame Achiaa', guarantorPhone: '+233 20 555 1111', academyGraduationDate: '2026-05-20', deploymentStatus: 'training', licenseExpiryDate: '2028-02-28', conductScore: 0, remittanceTarget: 0, remittanceActual: 0, totalTrips: 0, incidentCount: 0, isActive: true },
  { id: 12, firstName: 'Kweku', lastName: 'Andoh', phone: '+233 27 222 3223', email: 'kweku.andoh@evergreen.logistics', photo: getStablePhoto(12, 'Kweku Andoh', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-012', guarantorName: 'Ama Andoh', guarantorPhone: '+233 54 666 2222', academyGraduationDate: '2025-07-22', deploymentStatus: 'deployed', licenseExpiryDate: '2027-11-12', conductScore: 85, remittanceTarget: 400, remittanceActual: 390, totalTrips: 149, incidentCount: 1, isActive: true },
  { id: 13, firstName: 'Afia', lastName: 'Badu', phone: '+233 24 333 4334', email: 'afia.badu@evergreen.logistics', photo: getStablePhoto(13, 'Afia Badu', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-013', guarantorName: 'Nana Badu', guarantorPhone: '+233 50 777 3333', academyGraduationDate: null, deploymentStatus: 'available', licenseExpiryDate: '2025-09-05', conductScore: 60, remittanceTarget: 250, remittanceActual: 180, totalTrips: 45, incidentCount: 2, isActive: true },
  { id: 14, firstName: 'Kojo', lastName: 'Frimpong', phone: '+233 20 444 5445', email: 'kojo.frimpong@evergreen.logistics', photo: getStablePhoto(14, 'Kojo Frimpong', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-014', guarantorName: 'Akosua Frimpong', guarantorPhone: '+233 27 888 4444', academyGraduationDate: '2025-05-30', deploymentStatus: 'deployed', licenseExpiryDate: '2028-04-19', conductScore: 97, remittanceTarget: 500, remittanceActual: 530, totalTrips: 192, incidentCount: 0, isActive: true },
  { id: 15, firstName: 'Adwoa', lastName: 'Nyarko', phone: '+233 54 555 6556', email: 'adwoa.nyarko@evergreen.logistics', photo: getStablePhoto(15, 'Adwoa Nyarko', UNIQUE_DRIVER_PHOTOS), rfidCardId: 'RFID-GH-015', guarantorName: 'Kofi Nyarko', guarantorPhone: '+233 24 999 5555', academyGraduationDate: '2025-08-14', deploymentStatus: 'suspended', licenseExpiryDate: '2026-03-10', conductScore: 55, remittanceTarget: 300, remittanceActual: 200, totalTrips: 72, incidentCount: 4, isActive: false },
];

const statusColors: Record<string, string> = { deployed: '#22c55e', available: '#3b82f6', suspended: '#ef4444', training: '#f59e0b' };

function getConductColor(score: number): string {
  if (score === 0) return '#5c6f8a';
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getLicenseStatus(expiry: string): { color: string; label: string; days: number } {
  const days = dayjs(expiry).diff(dayjs(), 'day');
  if (days < 0) return { color: '#ef4444', label: `Expired ${Math.abs(days)}d ago`, days };
  if (days <= 30) return { color: '#ef4444', label: `${days}d left`, days };
  if (days <= 90) return { color: '#f59e0b', label: `${days}d left`, days };
  return { color: '#22c55e', label: `${days}d left`, days };
}

function getAcademyStatus(d: DriverLedger): { label: string; color: string; icon: string } {
  if (!d.academyGraduationDate && d.deploymentStatus === 'training') return { label: 'In Training', color: '#f59e0b', icon: 'ti-loader' };
  if (d.academyGraduationDate) return { label: 'Graduated', color: '#22c55e', icon: 'ti-certificate' };
  return { label: 'None', color: '#5c6f8a', icon: 'ti-minus' };
}

const tabs = [
  { id: 'all', label: 'All', icon: 'ti-users' },
  { id: 'deployed', label: 'Deployed', icon: 'ti-player-play' },
  { id: 'training', label: 'Training', icon: 'ti-school' },
  { id: 'license', label: 'License Expiring', icon: 'ti-id-badge' },
  { id: 'risk', label: 'At Risk', icon: 'ti-alert-triangle' },
];

export default function DriverLedgerPage() {
  const [drivers] = useState<DriverLedger[]>(DEMO_DRIVERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'remittance'>('name');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState<DriverLedger | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const filtered = useMemo(() => {
    let result = [...drivers];
    const q = search.toLowerCase();
    if (q) result = result.filter(d => `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || d.phone.includes(q) || d.rfidCardId.toLowerCase().includes(q));
    if (statusFilter !== 'all') result = result.filter(d => d.deploymentStatus === statusFilter);
    const today = dayjs();
    switch (activeTab) {
      case 'deployed': result = result.filter(d => d.deploymentStatus === 'deployed'); break;
      case 'training': result = result.filter(d => d.deploymentStatus === 'training'); break;
      case 'license': result = result.filter(d => { const days = dayjs(d.licenseExpiryDate).diff(today, 'day'); return days >= 0 && days <= 60; }); break;
      case 'risk': result = result.filter(d => d.conductScore > 0 && d.conductScore < 60); break;
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.conductScore - a.conductScore;
        case 'remittance': return (b.remittanceActual / Math.max(b.remittanceTarget, 1)) - (a.remittanceActual / Math.max(a.remittanceTarget, 1));
        default: return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }
    });
    return result;
  }, [drivers, search, statusFilter, sortBy, activeTab]);

  const stats = useMemo(() => ({
    total: drivers.length,
    deployed: drivers.filter(d => d.deploymentStatus === 'deployed').length,
    inTraining: drivers.filter(d => d.deploymentStatus === 'training').length,
    suspended: drivers.filter(d => d.deploymentStatus === 'suspended').length,
    avgScore: Math.round(drivers.filter(d => d.conductScore > 0).reduce((s, d) => s + d.conductScore, 0) / Math.max(drivers.filter(d => d.conductScore > 0).length, 1)),
  }), [drivers]);

  const renderAvatar = (d: DriverLedger, size: number, borderColor?: string) => {
    const hasPhoto = d.photo && !imageErrors[d.id];
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: borderColor ? `3px solid ${borderColor}` : '3px solid var(--bg2)',
        overflow: 'hidden', background: hasPhoto ? 'transparent' : getConductColor(d.conductScore),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}>
        {hasPhoto ? (
          <img
            src={d.photo}
            alt={`${d.firstName} ${d.lastName}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImageErrors(prev => ({ ...prev, [d.id]: true }))}
          />
        ) : (
          `${d.firstName[0]}${d.lastName[0]}`
        )}
      </div>
    );
  };

  const renderCard = (d: DriverLedger) => {
    const scoreColor = getConductColor(d.conductScore);
    const lic = getLicenseStatus(d.licenseExpiryDate);
    const academy = getAcademyStatus(d);
    const remitPct = d.remittanceTarget > 0 ? Math.min(Math.round((d.remittanceActual / d.remittanceTarget) * 100), 100) : 0;

    return (
      <div
        key={d.id}
        onClick={() => setSelectedDriver(d)}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14,
          overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {/* Header gradient */}
        <div style={{
          height: 72, position: 'relative',
          background: `linear-gradient(135deg, ${scoreColor}25, ${scoreColor}08)`,
        }}>
          <div style={{ position: 'absolute', top: 8, right: 10, display: 'flex', gap: 4 }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${statusColors[d.deploymentStatus]}18`, color: statusColors[d.deploymentStatus], letterSpacing: '0.03em' }}>
              {d.deploymentStatus.charAt(0).toUpperCase() + d.deploymentStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div style={{ padding: '0 16px', marginTop: -32, position: 'relative', zIndex: 2 }}>
          {renderAvatar(d, 60, 'var(--bg2)')}
        </div>

        {/* Content */}
        <div style={{ padding: '10px 16px 16px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 1, lineHeight: 1.2 }}>
            {d.firstName} {d.lastName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{d.email}</div>
          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text3)', marginBottom: 10, opacity: 0.7 }}>
            {d.rfidCardId}
          </div>

          {/* Quick stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor }}>{d.conductScore || 'â€”'}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{d.totalTrips}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trips</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: d.incidentCount > 0 ? '#ef4444' : '#22c55e' }}>{d.incidentCount}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issues</div>
            </div>
          </div>

          {/* Conduct score bar */}
          {d.conductScore > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>Conduct</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: scoreColor }}>{d.conductScore}%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${d.conductScore}%`, height: '100%', background: scoreColor, borderRadius: 2 }} />
              </div>
            </div>
          )}

          {/* Remittance bar */}
          {d.remittanceTarget > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>Remittance</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: remitPct >= 100 ? '#22c55e' : '#f59e0b' }}>
                  GHS {d.remittanceActual}/{d.remittanceTarget}
                </span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${remitPct}%`, height: '100%', background: remitPct >= 100 ? '#22c55e' : 'var(--accent)', borderRadius: 2 }} />
              </div>
            </div>
          )}

          {/* Footer info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="las la-phone" style={{ fontSize: 11, color: 'var(--text3)' }} />
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{d.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="las la-id-card-badge" style={{ fontSize: 11, color: lic.color }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: lic.color }}>{lic.label}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!selectedDriver) return null;
    const d = selectedDriver;
    const scoreColor = getConductColor(d.conductScore);
    const lic = getLicenseStatus(d.licenseExpiryDate);
    const academy = getAcademyStatus(d);
    const remitPct = d.remittanceTarget > 0 ? Math.min(Math.round((d.remittanceActual / d.remittanceTarget) * 100), 100) : 0;

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedDriver(null)}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, width: 660, maxWidth: '92vw', maxHeight: '88vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div style={{ position: 'relative', padding: '24px 24px 18px' }}>
            <button onClick={() => setSelectedDriver(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg3)', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
            ><i className="las la-times" /></button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {renderAvatar(d, 72, scoreColor)}
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{d.firstName} {d.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{d.rfidCardId}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${statusColors[d.deploymentStatus]}18`, color: statusColors[d.deploymentStatus] }}>
                    {d.deploymentStatus.charAt(0).toUpperCase() + d.deploymentStatus.slice(1)}
                  </span>
                  <span style={{ fontSize: 11, color: d.isActive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {d.isActive ? 'â— Active' : 'â— Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px' }}>
            {/* Contact + Guarantor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Contact</div>
                <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="las la-phone" style={{ fontSize: 13, color: 'var(--accent)', width: 16 }} />{d.phone}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="las la-envelope" style={{ fontSize: 13, color: 'var(--accent)', width: 16 }} />{d.email}
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Guarantor</div>
                <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="las la-user" style={{ fontSize: 13, color: '#8b5cf6', width: 16 }} />{d.guarantorName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="las la-phone" style={{ fontSize: 13, color: '#8b5cf6', width: 16 }} />{d.guarantorPhone}
                </div>
              </div>
            </div>

            {/* Deployment + Academy + License */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Deployment</div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${statusColors[d.deploymentStatus]}18`, color: statusColors[d.deploymentStatus], display: 'inline-block', marginBottom: 6 }}>
                  {d.deploymentStatus.charAt(0).toUpperCase() + d.deploymentStatus.slice(1)}
                </span>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Academy</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className={`ti ${academy.icon}`} style={{ fontSize: 13, color: academy.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: academy.color }}>{academy.label}</span>
                </div>
                {d.academyGraduationDate && (
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{dayjs(d.academyGraduationDate).format('MMM D, YYYY')}</div>
                )}
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>License</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="las la-id-card-badge" style={{ fontSize: 13, color: lic.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: lic.color }}>{lic.label}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Exp {dayjs(d.licenseExpiryDate).format('MMM D, YYYY')}</div>
              </div>
            </div>

            {/* Remittance */}
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Remittance Performance</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Target</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>GHS {d.remittanceTarget}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)' }}>/day</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Actual</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: remitPct >= 100 ? '#22c55e' : '#f59e0b' }}>GHS {d.remittanceActual}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)' }}>/day</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Achievement</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: remitPct >= 100 ? '#22c55e' : '#f59e0b' }}>{remitPct}%</div>
                </div>
              </div>
              <div style={{ width: '100%', height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${remitPct}%`, height: '100%', background: remitPct >= 100 ? '#22c55e' : 'var(--accent)', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 11, color: remitPct >= 100 ? '#22c55e' : '#f59e0b', marginTop: 6, fontWeight: 500 }}>
                {remitPct >= 100 ? 'Meeting or exceeding daily target' : `${100 - remitPct}% below daily target (GHS ${d.remittanceTarget - d.remittanceActual} deficit)`}
              </div>
            </div>

            {/* Conduct + Incidents */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Conduct Score</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor }}>{d.conductScore > 0 ? d.conductScore : 'N/A'}</div>
                {d.conductScore > 0 && (
                  <div style={{ width: '100%', height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ width: `${d.conductScore}%`, height: '100%', background: scoreColor, borderRadius: 2 }} />
                  </div>
                )}
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Incidents</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: d.incidentCount === 0 ? '#22c55e' : '#ef4444' }}>{d.incidentCount}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Across {d.totalTrips} total trips</div>
              </div>
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Trips', value: String(d.totalTrips), icon: 'ti-road' },
                { label: 'Account', value: d.isActive ? 'Active' : 'Inactive', icon: 'ti-check-circle', color: d.isActive ? '#22c55e' : '#ef4444' },
                { label: 'Daily Target', value: `GHS ${d.remittanceTarget}`, icon: 'ti-coin' },
                { label: 'RFID', value: d.rfidCardId, icon: 'ti-id' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: 14, color: s.color || 'var(--accent)', marginBottom: 4, display: 'block' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.color || 'var(--text)' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total Drivers', value: stats.total, color: '#3b82f6', icon: 'ti-users' },
          { label: 'Deployed', value: stats.deployed, color: '#22c55e', icon: 'ti-player-play' },
          { label: 'In Training', value: stats.inTraining, color: '#f59e0b', icon: 'ti-school' },
          { label: 'Suspended', value: stats.suspended, color: '#ef4444', icon: 'ti-player-pause' },
          { label: 'Avg Score', value: stats.avgScore, color: '#8b5cf6', icon: 'ti-star' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 14, display: 'flex', overflow: 'hidden' }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); setStatusFilter('all'); }}
            style={{
              flex: 1, padding: '10px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              background: activeTab === t.id ? 'rgba(0,201,167,0.04)' : 'transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text3)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize: 14 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }} />
            <input placeholder="Search name, phone, RFID..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px 8px 32px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: 220 }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: 120 }}>
            <option value="all">All Status</option>
            <option value="deployed">Deployed</option>
            <option value="available">Available</option>
            <option value="suspended">Suspended</option>
            <option value="training">Training</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'score' | 'remittance')} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: 140 }}>
            <option value="name">Sort by Name</option>
            <option value="score">Sort by Score</option>
            <option value="remittance">Sort by Remittance</option>
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{filtered.length} driver{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Driver grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filtered.map(renderCard)}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: 'var(--text3)', fontSize: 13 }}>
            <i className="las la-users" style={{ fontSize: 36, opacity: 0.3, display: 'block', marginBottom: 10 }} />
            No drivers match the current filters
          </div>
        )}
      </div>

      {/* Detail modal */}
      {renderModal()}
    </div>
  );
}
