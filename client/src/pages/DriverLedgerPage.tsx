import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

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
  { id: 1, firstName: 'Kofi', lastName: 'Mensah', phone: '+233 24 100 2001', email: 'kofi.mensah@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-001', guarantorName: 'Samuel Mensah', guarantorPhone: '+233 24 900 1001', academyGraduationDate: '2025-03-15', deploymentStatus: 'deployed', licenseExpiryDate: '2027-06-30', conductScore: 88, remittanceTarget: 450, remittanceActual: 420, totalTrips: 128, incidentCount: 1, isActive: true },
  { id: 2, firstName: 'Ama', lastName: 'Serwaa', phone: '+233 50 200 3002', email: 'ama.serwaa@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-002', guarantorName: 'Kwame Serwaa', guarantorPhone: '+233 24 800 2002', academyGraduationDate: '2025-01-20', deploymentStatus: 'deployed', licenseExpiryDate: '2026-12-15', conductScore: 92, remittanceTarget: 400, remittanceActual: 440, totalTrips: 156, incidentCount: 0, isActive: true },
  { id: 3, firstName: 'Yaw', lastName: 'Boateng', phone: '+233 55 300 4003', email: 'yaw.boateng@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-003', guarantorName: 'Adwoa Boateng', guarantorPhone: '+233 24 700 3003', academyGraduationDate: null, deploymentStatus: 'available', licenseExpiryDate: '2025-11-01', conductScore: 65, remittanceTarget: 350, remittanceActual: 280, totalTrips: 67, incidentCount: 3, isActive: true },
  { id: 4, firstName: 'Efia', lastName: 'Owusu', phone: '+233 24 400 5004', email: 'efia.owusu@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-004', guarantorName: 'Yaw Owusu', guarantorPhone: '+233 50 600 4004', academyGraduationDate: '2025-06-10', deploymentStatus: 'deployed', licenseExpiryDate: '2027-03-22', conductScore: 78, remittanceTarget: 500, remittanceActual: 460, totalTrips: 142, incidentCount: 1, isActive: true },
  { id: 5, firstName: 'Kwame', lastName: 'Asante', phone: '+233 20 500 6005', email: 'kwame.asante@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-005', guarantorName: 'Akua Asante', guarantorPhone: '+233 24 500 5005', academyGraduationDate: '2026-04-01', deploymentStatus: 'training', licenseExpiryDate: '2027-09-18', conductScore: 0, remittanceTarget: 0, remittanceActual: 0, totalTrips: 0, incidentCount: 0, isActive: true },
  { id: 6, firstName: 'Abena', lastName: 'Osei', phone: '+233 54 600 7006', email: 'abena.osei@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-006', guarantorName: 'Kofi Osei', guarantorPhone: '+233 24 400 6006', academyGraduationDate: '2025-02-28', deploymentStatus: 'deployed', licenseExpiryDate: '2026-08-10', conductScore: 95, remittanceTarget: 450, remittanceActual: 500, totalTrips: 178, incidentCount: 0, isActive: true },
  { id: 7, firstName: 'Nana', lastName: 'Yaw', phone: '+233 27 700 8007', email: 'nana.yaw@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-007', guarantorName: 'Ama Yaw', guarantorPhone: '+233 55 300 7007', academyGraduationDate: '2025-09-12', deploymentStatus: 'suspended', licenseExpiryDate: '2025-05-20', conductScore: 45, remittanceTarget: 400, remittanceActual: 250, totalTrips: 83, incidentCount: 5, isActive: false },
  { id: 8, firstName: 'Akua', lastName: 'Sarpong', phone: '+233 23 800 9008', email: 'akua.sarpong@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-008', guarantorName: 'Yaw Sarpong', guarantorPhone: '+233 24 200 8008', academyGraduationDate: '2024-11-05', deploymentStatus: 'available', licenseExpiryDate: '2026-10-30', conductScore: 82, remittanceTarget: 300, remittanceActual: 310, totalTrips: 94, incidentCount: 0, isActive: true },
  { id: 9, firstName: 'Kwesi', lastName: 'Appiah', phone: '+233 50 900 0109', email: 'kwesi.appiah@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-009', guarantorName: 'Efia Appiah', guarantorPhone: '+233 27 100 9009', academyGraduationDate: '2025-04-18', deploymentStatus: 'deployed', licenseExpiryDate: '2027-07-07', conductScore: 90, remittanceTarget: 500, remittanceActual: 480, totalTrips: 165, incidentCount: 1, isActive: true },
  { id: 10, firstName: 'Esi', lastName: 'Amankwah', phone: '+233 24 010 1001', email: 'esi.amankwah@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-010', guarantorName: 'Kweku Amankwah', guarantorPhone: '+233 23 400 0100', academyGraduationDate: null, deploymentStatus: 'deployed', licenseExpiryDate: '2026-01-15', conductScore: 73, remittanceTarget: 350, remittanceActual: 320, totalTrips: 115, incidentCount: 2, isActive: true },
  { id: 11, firstName: 'Yaa', lastName: 'Achiaa', phone: '+233 55 111 2112', email: 'yaa.achiaa@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-011', guarantorName: 'Kwame Achiaa', guarantorPhone: '+233 20 555 1111', academyGraduationDate: '2026-05-20', deploymentStatus: 'training', licenseExpiryDate: '2028-02-28', conductScore: 0, remittanceTarget: 0, remittanceActual: 0, totalTrips: 0, incidentCount: 0, isActive: true },
  { id: 12, firstName: 'Kweku', lastName: 'Andoh', phone: '+233 27 222 3223', email: 'kweku.andoh@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-012', guarantorName: 'Ama Andoh', guarantorPhone: '+233 54 666 2222', academyGraduationDate: '2025-07-22', deploymentStatus: 'deployed', licenseExpiryDate: '2027-11-12', conductScore: 85, remittanceTarget: 400, remittanceActual: 390, totalTrips: 149, incidentCount: 1, isActive: true },
  { id: 13, firstName: 'Afia', lastName: 'Badu', phone: '+233 24 333 4334', email: 'afia.badu@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-013', guarantorName: 'Nana Badu', guarantorPhone: '+233 50 777 3333', academyGraduationDate: null, deploymentStatus: 'available', licenseExpiryDate: '2025-09-05', conductScore: 60, remittanceTarget: 250, remittanceActual: 180, totalTrips: 45, incidentCount: 2, isActive: true },
  { id: 14, firstName: 'Kojo', lastName: 'Frimpong', phone: '+233 20 444 5445', email: 'kojo.frimpong@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-014', guarantorName: 'Akosua Frimpong', guarantorPhone: '+233 27 888 4444', academyGraduationDate: '2025-05-30', deploymentStatus: 'deployed', licenseExpiryDate: '2028-04-19', conductScore: 97, remittanceTarget: 500, remittanceActual: 530, totalTrips: 192, incidentCount: 0, isActive: true },
  { id: 15, firstName: 'Adwoa', lastName: 'Nyarko', phone: '+233 54 555 6556', email: 'adwoa.nyarko@evergreen.logistics', photo: '', rfidCardId: 'RFID-GH-015', guarantorName: 'Kofi Nyarko', guarantorPhone: '+233 24 999 5555', academyGraduationDate: '2025-08-14', deploymentStatus: 'suspended', licenseExpiryDate: '2026-03-10', conductScore: 55, remittanceTarget: 300, remittanceActual: 200, totalTrips: 72, incidentCount: 4, isActive: false },
];

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
);

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
  if (days <= 30) return { color: '#ef4444', label: `${days}d remaining`, days };
  if (days <= 90) return { color: '#f59e0b', label: `${days}d remaining`, days };
  return { color: '#22c55e', label: `${days}d remaining`, days };
}

function getAcademyStatus(d: DriverLedger): { label: string; color: string; icon: string } {
  if (!d.academyGraduationDate && d.deploymentStatus === 'training') return { label: 'In Training', color: '#f59e0b', icon: 'ti-loader' };
  if (d.academyGraduationDate) return { label: 'Graduated', color: '#22c55e', icon: 'ti-certificate' };
  return { label: 'None', color: '#5c6f8a', icon: 'ti-minus' };
}

const tabs = [
  { id: 'all', label: 'All Drivers', icon: 'ti-users' },
  { id: 'deployed', label: 'Deployed', icon: 'ti-player-play' },
  { id: 'training', label: 'In Training', icon: 'ti-school' },
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

  const filtered = useMemo(() => {
    let result = [...drivers];

    const q = search.toLowerCase();
    if (q) {
      result = result.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.rfidCardId.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(d => d.deploymentStatus === statusFilter);
    }

    const today = dayjs();
    switch (activeTab) {
      case 'deployed':
        result = result.filter(d => d.deploymentStatus === 'deployed');
        break;
      case 'training':
        result = result.filter(d => d.deploymentStatus === 'training');
        break;
      case 'license':
        result = result.filter(d => {
          const days = dayjs(d.licenseExpiryDate).diff(today, 'day');
          return days >= 0 && days <= 60;
        });
        break;
      case 'risk':
        result = result.filter(d => d.conductScore > 0 && d.conductScore < 60);
        break;
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
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
          overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ height: 64, background: `linear-gradient(135deg, ${scoreColor}33, ${scoreColor}11)`, position: 'relative' }}>
          <div style={{
            position: 'absolute', bottom: -24, left: 16, width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--bg2)', overflow: 'hidden', background: scoreColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff',
          }}>
            {d.firstName[0]}{d.lastName[0]}
          </div>
          <div style={{ position: 'absolute', top: 8, right: 12, display: 'flex', gap: 4 }}>
            {badge(d.deploymentStatus.charAt(0).toUpperCase() + d.deploymentStatus.slice(1), statusColors[d.deploymentStatus])}
          </div>
        </div>

        <div style={{ padding: '30px 16px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{d.firstName} {d.lastName}</div>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text3)', marginBottom: 8 }}>
            {d.rfidCardId}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
            <i className="ti ti-phone" style={{ fontSize: 12, color: 'var(--text3)' }}></i>
            {d.phone}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <i className={`ti ${academy.icon}`} style={{ fontSize: 12, color: academy.color }}></i>
            <span style={{ fontSize: 11, fontWeight: 600, color: academy.color }}>{academy.label}</span>
            {d.academyGraduationDate && (
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{dayjs(d.academyGraduationDate).format('MMM YYYY')}</span>
            )}
          </div>

          {d.conductScore > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <i className="ti ti-star" style={{ fontSize: 12, color: scoreColor }}></i>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, flex: 1 }}>Conduct Score</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{d.conductScore}</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${d.conductScore}%`, height: '100%', background: scoreColor, borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </>
          )}

          {d.remittanceTarget > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <i className="ti ti-coin" style={{ fontSize: 12, color: 'var(--accent)' }}></i>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, flex: 1 }}>Remittance</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: remitPct >= 100 ? '#22c55e' : '#f59e0b' }}>
                  GHS {d.remittanceActual} / {d.remittanceTarget}
                </span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${remitPct}%`, height: '100%', background: remitPct >= 100 ? '#22c55e' : 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)' }}>
            <i className="ti ti-id-badge" style={{ fontSize: 12, color: lic.color }}></i>
            <span style={{ color: lic.color, fontWeight: 500 }}>{lic.label}</span>
            <span style={{ marginLeft: 'auto' }}>
              <i className="ti ti-road" style={{ fontSize: 12 }}></i> {d.totalTrips} trips
            </span>
          </div>
          {d.incidentCount > 0 && (
            <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 12 }}></i> {d.incidentCount} incident{d.incidentCount !== 1 ? 's' : ''}
            </div>
          )}
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
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={() => setSelectedDriver(null)}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 620, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: scoreColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
              }}>
                {d.firstName[0]}{d.lastName[0]}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{d.firstName} {d.lastName}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>{d.rfidCardId}</div>
              </div>
            </div>
            <button onClick={() => setSelectedDriver(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="ti ti-x"></i></button>
          </div>

          <div style={{ padding: '18px 22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Contact</div>
                <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4 }}><i className="ti ti-phone" style={{ fontSize: 12, marginRight: 6, color: 'var(--text3)' }}></i>{d.phone}</div>
                <div style={{ fontSize: 12, color: 'var(--text)' }}><i className="ti ti-mail" style={{ fontSize: 12, marginRight: 6, color: 'var(--text3)' }}></i>{d.email}</div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Guarantor</div>
                <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4 }}><i className="ti ti-user" style={{ fontSize: 12, marginRight: 6, color: 'var(--text3)' }}></i>{d.guarantorName}</div>
                <div style={{ fontSize: 12, color: 'var(--text)' }}><i className="ti ti-phone" style={{ fontSize: 12, marginRight: 6, color: 'var(--text3)' }}></i>{d.guarantorPhone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Deployment</div>
                <div style={{ marginBottom: 4 }}>{badge(d.deploymentStatus.charAt(0).toUpperCase() + d.deploymentStatus.slice(1), statusColors[d.deploymentStatus])}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  <i className="ti ti-check-circle" style={{ fontSize: 12, marginRight: 6 }}></i>
                  {d.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Academy</div>
                <div style={{ marginBottom: 4 }}>
                  <i className={`ti ${academy.icon}`} style={{ fontSize: 12, marginRight: 4, color: academy.color }}></i>
                  <span style={{ fontSize: 12, fontWeight: 600, color: academy.color }}>{academy.label}</span>
                </div>
                {d.academyGraduationDate && (
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    Graduated {dayjs(d.academyGraduationDate).format('MMM D, YYYY')}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>License</div>
                <div style={{ fontSize: 12, color: lic.color, fontWeight: 600, marginBottom: 4 }}>
                  <i className="ti ti-id-badge" style={{ fontSize: 12, marginRight: 4 }}></i>
                  {lic.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Expires {dayjs(d.licenseExpiryDate).format('MMM D, YYYY')}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Remittance Performance</div>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Target</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>GHS {d.remittanceTarget}/day</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Actual</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: remitPct >= 100 ? '#22c55e' : '#f59e0b' }}>GHS {d.remittanceActual}/day</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden', margin: '4px 0 6px' }}>
                  <div style={{ width: `${remitPct}%`, height: '100%', background: remitPct >= 100 ? '#22c55e' : 'var(--accent)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: 'var(--text3)' }}>0%</span>
                  <span style={{ color: 'var(--text3)' }}>50%</span>
                  <span style={{ color: 'var(--text3)' }}>100%</span>
                  <span style={{ fontWeight: 600, color: remitPct >= 100 ? '#22c55e' : '#f59e0b' }}>{remitPct}%</span>
                </div>
                {d.remittanceTarget > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
                    {remitPct >= 100
                      ? 'Meeting or exceeding daily target'
                      : `${100 - remitPct}% below daily target (GHS ${d.remittanceTarget - d.remittanceActual} deficit)`
                    }
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Conduct Score</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor }}>{d.conductScore > 0 ? d.conductScore : 'N/A'}</div>
                <div style={{ width: '100%', height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
                  <div style={{ width: `${d.conductScore}%`, height: '100%', background: scoreColor, borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Incidents</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: d.incidentCount === 0 ? '#22c55e' : 'var(--danger)' }}>{d.incidentCount}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                  Across {d.totalTrips} total trips
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Deployment History Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div><span style={{ color: 'var(--text3)' }}>Total Trips:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d.totalTrips}</span></div>
                <div><span style={{ color: 'var(--text3)' }}>Status:</span> {badge(d.deploymentStatus.charAt(0).toUpperCase() + d.deploymentStatus.slice(1), statusColors[d.deploymentStatus])}</div>
                <div><span style={{ color: 'var(--text3)' }}>Account:</span> <span style={{ color: d.isActive ? '#22c55e' : 'var(--danger)', fontWeight: 600 }}>{d.isActive ? 'Active' : 'Inactive'}</span></div>
                <div><span style={{ color: 'var(--text3)' }}>Daily Target:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>GHS {d.remittanceTarget}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Drivers', value: stats.total, color: '#3b82f6', icon: 'ti-users' },
          { label: 'Deployed', value: stats.deployed, color: '#22c55e', icon: 'ti-player-play' },
          { label: 'In Training', value: stats.inTraining, color: '#f59e0b', icon: 'ti-school' },
          { label: 'Suspended', value: stats.suspended, color: '#ef4444', icon: 'ti-player-pause' },
          { label: 'Avg Conduct Score', value: stats.avgScore, color: '#8b5cf6', icon: 'ti-star' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, display: 'flex', overflow: 'hidden' }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); setStatusFilter('all'); }}
            style={{
              flex: 1, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              background: activeTab === t.id ? 'rgba(0,201,167,0.04)' : 'transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text3)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize: 14 }}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
            <input placeholder="Search name, phone, or RFID..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, width: 240 }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 130, padding: '8px 10px' }}>
            <option value="all">All Status</option>
            <option value="deployed">Deployed</option>
            <option value="available">Available</option>
            <option value="suspended">Suspended</option>
            <option value="training">Training</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'score' | 'remittance')} style={{ ...inputStyle, width: 140, padding: '8px 10px' }}>
            <option value="name">Sort by Name</option>
            <option value="score">Sort by Score</option>
            <option value="remittance">Sort by Remittance</option>
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{filtered.length} driver{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Driver grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
        {filtered.map(renderCard)}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
            No drivers match the current filters
          </div>
        )}
      </div>

      {/* Detail modal */}
      {renderModal()}
    </div>
  );
}
