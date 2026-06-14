import { useState, useEffect } from 'react';
import { revenueService, type RevenueRecord } from '../services/revenueService';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type RemittanceStatus = 'collected' | 'remitted' | 'short' | 'over' | 'pending' | 'disputed';
type PaymentMethod = 'cash' | 'mobile_money' | 'bank_transfer';

interface RemittanceRecord {
  id: number;
  deploymentId: number;
  driverId: number;
  vehicleId: number;
  supervisorId: number | null;
  driverName: string;
  plateNumber: string;
  targetAmount: number;
  actualAmount: number;
  commission: number;
  shortage: number;
  currency: string;
  collectionDate: string;
  shiftType: 'day' | 'night' | 'split';
  passengerCount: number | null;
  tripCount: number | null;
  status: RemittanceStatus;
  remittanceDate: string | null;
  remittedById: number | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmt = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dFmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const dtFmt = (d: string) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PAYMENT_LABELS: Record<PaymentMethod, string> = { cash: 'Cash', mobile_money: 'Mobile Money', bank_transfer: 'Bank Transfer' };
const PAYMENT_ICONS: Record<PaymentMethod, string> = { cash: 'ti-currency-dollar', mobile_money: 'ti-device-mobile', bank_transfer: 'ti-building-bank' };

const DRIVER_MAP: Record<number, { name: string; plate: string }> = {
  101: { name: 'Kwame Asante', plate: 'GT 1234-20' },
  102: { name: 'Abena Osei', plate: 'GT 5678-21' },
  103: { name: 'Yaw Mensah', plate: 'GT 9012-22' },
  104: { name: 'Afia Owusu', plate: 'GT 3456-23' },
  105: { name: 'Kofi Boateng', plate: 'GT 7890-24' },
  106: { name: 'Esi Quansah', plate: 'GT 1111-25' },
  107: { name: 'Nana Yeboah', plate: 'GT 2222-26' },
  108: { name: 'Akua Sarpong', plate: 'GT 3333-27' },
  109: { name: 'Kwesi Adjei', plate: 'GT 4444-28' },
  110: { name: 'Ama Donkor', plate: 'GT 5555-29' },
  111: { name: 'Kojo Turkson', plate: 'GT 6666-30' },
  112: { name: 'Efia Nkrumah', plate: 'GT 7777-31' },
  113: { name: 'Yaw Asare', plate: 'GT 8888-32' },
  114: { name: 'Abla Tetteh', plate: 'GT 9999-33' },
  115: { name: 'Kweku Annan', plate: 'GT 1010-34' },
  116: { name: 'Maame Serwaa', plate: 'GT 2020-35' },
  117: { name: 'Kwame Antwi', plate: 'GT 3030-36' },
  118: { name: 'Naa Dede', plate: 'GT 4040-37' },
  119: { name: 'Fiifi Hayford', plate: 'GT 5050-38' },
  120: { name: 'Adwoa Poku', plate: 'GT 6060-39' },
};

const SUPERVISOR_MAP: Record<number, string> = {
  1: 'Samuel Tetteh', 2: 'Grace Amponsah', 3: 'Emmanuel Sowah',
  4: 'Faustina Badu', 5: 'Isaac Nkrumah', 6: 'Rebecca Asare',
};

function fromRevenueRecord(r: RevenueRecord): RemittanceRecord {
  const t = r.expectedAmount ?? 0;
  const a = r.amount;
  const d = DRIVER_MAP[r.driverId];
  return {
    id: r.id, deploymentId: r.deploymentId, driverId: r.driverId,
    vehicleId: r.vehicleId, supervisorId: r.supervisorId,
    driverName: d?.name ?? `Driver #${r.driverId}`,
    plateNumber: d?.plate ?? 'Unknown',
    targetAmount: t, actualAmount: a,
    commission: Math.round(a * 0.2 * 100) / 100,
    shortage: Math.round((t - a) * 100) / 100,
    currency: r.currency, collectionDate: r.collectionDate,
    shiftType: r.shiftType, passengerCount: r.passengerCount,
    tripCount: r.tripCount, status: r.status as RemittanceStatus,
    remittanceDate: r.remittanceDate, remittedById: r.remittedById,
    verifiedBy: null, verifiedAt: null, notes: r.notes,
    paymentMethod: 'cash',
  };
}

// â”€â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const btnDanger: React.CSSProperties = { ...btn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' };
const btnSuccess: React.CSSProperties = { ...btn, color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' };
const btnWarning: React.CSSProperties = { ...btn, color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const statusColors: Record<string, string> = {
  collected: '#3b82f6', remitted: '#22c55e', short: '#ef4444',
  over: '#f59e0b', pending: '#5c6f8a', disputed: '#a855f7',
};
const statusIcons: Record<string, string> = {
  collected: 'ti-clock', remitted: 'ti-circle-check', short: 'ti-alert-triangle',
  over: 'ti-arrow-up-circle', pending: 'ti-hourglass', disputed: 'ti-alert-circle',
};

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color, whiteSpace: 'nowrap' }}>{label}</span>
);

// â”€â”€â”€ Shortage Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ShortageBar = ({ shortage, target }: { shortage: number; target: number }) => {
  const pct = target > 0 ? shortage / target : 0;
  const isSurplus = shortage <= 0;
  const within10 = !isSurplus && pct <= 0.1;
  const isShort = !isSurplus && pct > 0.1;
  const barColor = isSurplus ? '#22c55e' : within10 ? '#f59e0b' : '#ef4444';
  const barWidth = Math.min(Math.abs(pct) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)' }}>
        <div style={{ width: `${Math.max(barWidth, 3)}%`, height: '100%', borderRadius: 3, background: barColor, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: barColor, minWidth: 65, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
        {shortage <= 0 ? '+' : ''}{fmt(Math.abs(shortage))}
      </span>
    </div>
  );
};

// â”€â”€â”€ Demo Data (20 Ghana remittance records) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEMO_RECORDS: RemittanceRecord[] = [
  { id: 1, deploymentId: 1, driverId: 101, vehicleId: 201, supervisorId: 1, driverName: 'Kwame Asante', plateNumber: 'GT 1234-20', targetAmount: 500, actualAmount: 450, commission: 90, shortage: 50, currency: 'GHS', collectionDate: '2026-06-01T06:00:00Z', shiftType: 'day', passengerCount: 28, tripCount: 6, status: 'remitted', remittanceDate: '2026-06-01T18:00:00Z', remittedById: 1, verifiedBy: 'Samuel Tetteh', verifiedAt: '2026-06-01T18:30:00Z', notes: 'Slightly below target due to traffic', paymentMethod: 'cash' },
  { id: 2, deploymentId: 1, driverId: 101, vehicleId: 201, supervisorId: 1, driverName: 'Kwame Asante', plateNumber: 'GT 1234-20', targetAmount: 500, actualAmount: 520, commission: 104, shortage: -20, currency: 'GHS', collectionDate: '2026-06-02T06:00:00Z', shiftType: 'day', passengerCount: 32, tripCount: 7, status: 'remitted', remittanceDate: '2026-06-02T17:30:00Z', remittedById: 1, verifiedBy: 'Samuel Tetteh', verifiedAt: '2026-06-02T18:00:00Z', notes: null, paymentMethod: 'mobile_money' },
  { id: 3, deploymentId: 2, driverId: 102, vehicleId: 202, supervisorId: 1, driverName: 'Abena Osei', plateNumber: 'GT 5678-21', targetAmount: 400, actualAmount: 380, commission: 76, shortage: 20, currency: 'GHS', collectionDate: '2026-06-01T18:00:00Z', shiftType: 'night', passengerCount: 22, tripCount: 5, status: 'remitted', remittanceDate: '2026-06-02T08:00:00Z', remittedById: 1, verifiedBy: 'Samuel Tetteh', verifiedAt: '2026-06-02T08:15:00Z', notes: 'Night shift, lower volume', paymentMethod: 'cash' },
  { id: 4, deploymentId: 3, driverId: 103, vehicleId: 203, supervisorId: 2, driverName: 'Yaw Mensah', plateNumber: 'GT 9012-22', targetAmount: 550, actualAmount: 610, commission: 122, shortage: -60, currency: 'GHS', collectionDate: '2026-06-01T06:00:00Z', shiftType: 'day', passengerCount: 38, tripCount: 8, status: 'remitted', remittanceDate: '2026-06-01T19:00:00Z', remittedById: 2, verifiedBy: 'Grace Amponsah', verifiedAt: '2026-06-01T19:20:00Z', notes: 'Great day, exceeded target', paymentMethod: 'cash' },
  { id: 5, deploymentId: 3, driverId: 103, vehicleId: 203, supervisorId: 2, driverName: 'Yaw Mensah', plateNumber: 'GT 9012-22', targetAmount: 550, actualAmount: 580, commission: 116, shortage: -30, currency: 'GHS', collectionDate: '2026-06-02T06:00:00Z', shiftType: 'day', passengerCount: 35, tripCount: 7, status: 'remitted', remittanceDate: '2026-06-02T18:30:00Z', remittedById: 2, verifiedBy: 'Grace Amponsah', verifiedAt: '2026-06-02T19:00:00Z', notes: null, paymentMethod: 'mobile_money' },
  { id: 6, deploymentId: 5, driverId: 105, vehicleId: 205, supervisorId: 3, driverName: 'Kofi Boateng', plateNumber: 'GT 7890-24', targetAmount: 450, actualAmount: 320, commission: 64, shortage: 130, currency: 'GHS', collectionDate: '2026-06-01T06:00:00Z', shiftType: 'day', passengerCount: 18, tripCount: 4, status: 'short', remittanceDate: '2026-06-01T17:00:00Z', remittedById: 3, verifiedBy: 'Emmanuel Sowah', verifiedAt: '2026-06-01T17:30:00Z', notes: 'Vehicle breakdown caused 2hr delay', paymentMethod: 'cash' },
  { id: 7, deploymentId: 5, driverId: 106, vehicleId: 206, supervisorId: 3, driverName: 'Esi Quansah', plateNumber: 'GT 1111-25', targetAmount: 450, actualAmount: 490, commission: 98, shortage: -40, currency: 'GHS', collectionDate: '2026-06-02T06:00:00Z', shiftType: 'day', passengerCount: 30, tripCount: 6, status: 'pending', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: null, paymentMethod: 'mobile_money' },
  { id: 8, deploymentId: 6, driverId: 108, vehicleId: 208, supervisorId: 1, driverName: 'Akua Sarpong', plateNumber: 'GT 3333-27', targetAmount: 300, actualAmount: 210, commission: 42, shortage: 90, currency: 'GHS', collectionDate: '2026-06-01T06:00:00Z', shiftType: 'split', passengerCount: 12, tripCount: 3, status: 'collected', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: 'Pool vehicle - part-time usage', paymentMethod: 'cash' },
  { id: 9, deploymentId: 10, driverId: 111, vehicleId: 211, supervisorId: 6, driverName: 'Kojo Turkson', plateNumber: 'GT 6666-30', targetAmount: 600, actualAmount: 670, commission: 134, shortage: -70, currency: 'GHS', collectionDate: '2026-06-01T06:00:00Z', shiftType: 'day', passengerCount: 42, tripCount: 9, status: 'over', remittanceDate: '2026-06-01T20:00:00Z', remittedById: 6, verifiedBy: 'Rebecca Asare', verifiedAt: '2026-06-01T20:15:00Z', notes: 'Exceptional day, 70 GHS above target', paymentMethod: 'mobile_money' },
  { id: 10, deploymentId: 10, driverId: 111, vehicleId: 211, supervisorId: 6, driverName: 'Kojo Turkson', plateNumber: 'GT 6666-30', targetAmount: 600, actualAmount: 550, commission: 110, shortage: 50, currency: 'GHS', collectionDate: '2026-06-02T06:00:00Z', shiftType: 'day', passengerCount: 34, tripCount: 7, status: 'pending', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: null, paymentMethod: 'bank_transfer' },
  { id: 11, deploymentId: 11, driverId: 112, vehicleId: 212, supervisorId: 2, driverName: 'Efia Nkrumah', plateNumber: 'GT 7777-31', targetAmount: 650, actualAmount: 720, commission: 144, shortage: -70, currency: 'GHS', collectionDate: '2026-06-03T06:00:00Z', shiftType: 'day', passengerCount: 45, tripCount: 10, status: 'pending', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: 'Awaiting supervisor verification', paymentMethod: 'bank_transfer' },
  { id: 12, deploymentId: 9, driverId: 109, vehicleId: 209, supervisorId: 1, driverName: 'Kwesi Adjei', plateNumber: 'GT 4444-28', targetAmount: 250, actualAmount: 190, commission: 38, shortage: 60, currency: 'GHS', collectionDate: '2026-06-02T18:00:00Z', shiftType: 'night', passengerCount: 10, tripCount: 2, status: 'collected', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: 'Reserve driver - minimal shifts', paymentMethod: 'cash' },
  { id: 13, deploymentId: 15, driverId: 115, vehicleId: 215, supervisorId: 5, driverName: 'Kweku Annan', plateNumber: 'GT 1010-34', targetAmount: 500, actualAmount: 510, commission: 102, shortage: -10, currency: 'GHS', collectionDate: '2026-06-03T06:00:00Z', shiftType: 'day', passengerCount: 31, tripCount: 7, status: 'pending', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: null, paymentMethod: 'mobile_money' },
  { id: 14, deploymentId: 2, driverId: 114, vehicleId: 214, supervisorId: 1, driverName: 'Abla Tetteh', plateNumber: 'GT 9999-33', targetAmount: 400, actualAmount: 350, commission: 70, shortage: 50, currency: 'GHS', collectionDate: '2026-06-03T18:00:00Z', shiftType: 'night', passengerCount: 20, tripCount: 4, status: 'collected', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: null, paymentMethod: 'cash' },
  { id: 15, deploymentId: 4, driverId: 104, vehicleId: 204, supervisorId: 2, driverName: 'Afia Owusu', plateNumber: 'GT 3456-23', targetAmount: 500, actualAmount: 480, commission: 96, shortage: 20, currency: 'GHS', collectionDate: '2026-06-02T06:00:00Z', shiftType: 'split', passengerCount: 27, tripCount: 6, status: 'remitted', remittanceDate: '2026-06-02T21:00:00Z', remittedById: 2, verifiedBy: 'Grace Amponsah', verifiedAt: '2026-06-02T21:30:00Z', notes: null, paymentMethod: 'cash' },
  { id: 16, deploymentId: 7, driverId: 116, vehicleId: 216, supervisorId: 4, driverName: 'Maame Serwaa', plateNumber: 'GT 2020-35', targetAmount: 700, actualAmount: 760, commission: 152, shortage: -60, currency: 'GHS', collectionDate: '2026-06-04T06:00:00Z', shiftType: 'day', passengerCount: 48, tripCount: 11, status: 'over', remittanceDate: '2026-06-04T19:00:00Z', remittedById: 4, verifiedBy: 'Faustina Badu', verifiedAt: '2026-06-04T19:30:00Z', notes: 'Record passenger count', paymentMethod: 'mobile_money' },
  { id: 17, deploymentId: 8, driverId: 117, vehicleId: 217, supervisorId: 4, driverName: 'Kwame Antwi', plateNumber: 'GT 3030-36', targetAmount: 450, actualAmount: 410, commission: 82, shortage: 40, currency: 'GHS', collectionDate: '2026-06-04T18:00:00Z', shiftType: 'night', passengerCount: 25, tripCount: 5, status: 'remitted', remittanceDate: '2026-06-05T08:00:00Z', remittedById: 4, verifiedBy: 'Faustina Badu', verifiedAt: '2026-06-05T08:20:00Z', notes: 'Consistent night performance', paymentMethod: 'cash' },
  { id: 18, deploymentId: 12, driverId: 118, vehicleId: 218, supervisorId: 5, driverName: 'Naa Dede', plateNumber: 'GT 4040-37', targetAmount: 600, actualAmount: 280, commission: 56, shortage: 320, currency: 'GHS', collectionDate: '2026-06-05T06:00:00Z', shiftType: 'day', passengerCount: 16, tripCount: 3, status: 'short', remittanceDate: '2026-06-05T17:00:00Z', remittedById: 5, verifiedBy: 'Isaac Nkrumah', verifiedAt: '2026-06-05T17:15:00Z', notes: 'Major shortfall - road closure diverted all traffic', paymentMethod: 'cash' },
  { id: 19, deploymentId: 13, driverId: 119, vehicleId: 219, supervisorId: 5, driverName: 'Fiifi Hayford', plateNumber: 'GT 5050-38', targetAmount: 550, actualAmount: 600, commission: 120, shortage: -50, currency: 'GHS', collectionDate: '2026-06-05T06:00:00Z', shiftType: 'day', passengerCount: 36, tripCount: 8, status: 'disputed', remittanceDate: '2026-06-05T18:00:00Z', remittedById: 5, verifiedBy: 'Isaac Nkrumah', verifiedAt: '2026-06-05T18:30:00Z', notes: 'Driver disputes shortage calculation - claims actual collected is 620', paymentMethod: 'bank_transfer' },
  { id: 20, deploymentId: 14, driverId: 120, vehicleId: 220, supervisorId: 6, driverName: 'Adwoa Poku', plateNumber: 'GT 6060-39', targetAmount: 500, actualAmount: 540, commission: 108, shortage: -40, currency: 'GHS', collectionDate: '2026-06-06T06:00:00Z', shiftType: 'day', passengerCount: 33, tripCount: 7, status: 'pending', remittanceDate: null, remittedById: null, verifiedBy: null, verifiedAt: null, notes: 'Awaiting cash count verification', paymentMethod: 'mobile_money' },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function RevenuePage() {
  const [data, setData] = useState<RemittanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<RemittanceRecord | null>(null);
  const [detailItem, setDetailItem] = useState<RemittanceRecord | null>(null);
  const [verifyItem, setVerifyItem] = useState<RemittanceRecord | null>(null);
  const [verifyName, setVerifyName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    driverName: '', plateNumber: '', targetAmount: '', actualAmount: '',
    currency: 'GHS', collectionDate: '', shiftType: 'day' as const,
    passengerCount: '' as string, tripCount: '' as string,
    paymentMethod: 'cash' as PaymentMethod, notes: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [records] = await Promise.all([revenueService.getAll().catch(() => [] as RevenueRecord[])]);
      if (records.length > 0) {
        setData(records.map(fromRevenueRecord));
      } else {
        setData(DEMO_RECORDS);
      }
    } catch {
      setData(DEMO_RECORDS);
    } finally { setLoading(false); }
  };

  // â”€â”€ Computed â”€â”€
  const totalRemitted = data.filter(r => r.status === 'remitted').reduce((s, r) => s + r.actualAmount, 0);
  const totalShortages = data.filter(r => r.shortage > 0).reduce((s, r) => s + r.shortage, 0);
  const pendingCount = data.filter(r => r.status === 'pending').length;
  const avgCommission = data.length > 0 ? data.reduce((s, r) => s + r.commission, 0) / data.length : 0;

  const filtered = data.filter(r => {
    const s = search.toLowerCase();
    const matchesSearch = !s || r.driverName.toLowerCase().includes(s) || r.plateNumber.toLowerCase().includes(s) || `#${r.id}`.includes(s);
    const matchesStatus = statusTab === 'all' || r.status === statusTab;
    return matchesSearch && matchesStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const summaryCards = [
    { label: 'Total Remitted', value: fmt(totalRemitted), color: '#22c55e', icon: 'ti-currency-dollar' },
    { label: 'Total Shortages', value: fmt(totalShortages), color: '#ef4444', icon: 'ti-alert-triangle' },
    { label: 'Pending Verification', value: pendingCount, color: '#f59e0b', icon: 'ti-hourglass' },
    { label: 'Avg Commission', value: fmt(avgCommission), color: '#3b82f6', icon: 'ti-calculator' },
  ];

  const tabs = [
    { key: 'all', label: 'All', icon: 'ti-list' },
    { key: 'remitted', label: 'Remitted', icon: 'ti-circle-check' },
    { key: 'short', label: 'Short', icon: 'ti-alert-triangle' },
    { key: 'over', label: 'Over', icon: 'ti-arrow-up-circle' },
    { key: 'pending', label: 'Pending', icon: 'ti-hourglass' },
    { key: 'disputed', label: 'Disputed', icon: 'ti-alert-circle' },
  ];

  // â”€â”€ Actions â”€â”€
  const openAdd = () => {
    setEditItem(null);
    setForm({ driverName: '', plateNumber: '', targetAmount: '', actualAmount: '', currency: 'GHS', collectionDate: '', shiftType: 'day', passengerCount: '', tripCount: '', paymentMethod: 'cash', notes: '' });
    setFormError(null); setShowForm(true);
  };

  const openEdit = (r: RemittanceRecord) => {
    setEditItem(r);
    setForm({
      driverName: r.driverName, plateNumber: r.plateNumber,
      targetAmount: String(r.targetAmount), actualAmount: String(r.actualAmount),
      currency: r.currency, collectionDate: r.collectionDate.slice(0, 10),
      shiftType: r.shiftType, passengerCount: r.passengerCount ? String(r.passengerCount) : '',
      tripCount: r.tripCount ? String(r.tripCount) : '',
      paymentMethod: r.paymentMethod, notes: r.notes || '',
    });
    setFormError(null); setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const ta = Number(form.targetAmount);
      const aa = Number(form.actualAmount);
      const rec: RemittanceRecord = {
        id: editItem ? editItem.id : Math.max(...data.map(d => d.id), 0) + 1,
        deploymentId: editItem?.deploymentId ?? 0,
        driverId: editItem?.driverId ?? 0,
        vehicleId: editItem?.vehicleId ?? 0,
        supervisorId: editItem?.supervisorId ?? null,
        driverName: form.driverName,
        plateNumber: form.plateNumber,
        targetAmount: ta,
        actualAmount: aa,
        commission: Math.round(aa * 0.2 * 100) / 100,
        shortage: Math.round((ta - aa) * 100) / 100,
        currency: form.currency,
        collectionDate: form.collectionDate,
        shiftType: form.shiftType,
        passengerCount: form.passengerCount ? Number(form.passengerCount) : null,
        tripCount: form.tripCount ? Number(form.tripCount) : null,
        status: editItem?.status ?? 'collected',
        remittanceDate: editItem?.remittanceDate ?? null,
        remittedById: editItem?.remittedById ?? null,
        verifiedBy: editItem?.verifiedBy ?? null,
        verifiedAt: editItem?.verifiedAt ?? null,
        notes: form.notes || null,
        paymentMethod: form.paymentMethod,
      };
      if (editItem) {
        setData(prev => prev.map(x => x.id === editItem.id ? rec : x));
      } else {
        setData(prev => [...prev, rec]);
      }
      setShowForm(false);
    } catch (err: any) { setFormError(err.message || 'Operation failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = (r: RemittanceRecord) => {
    if (!confirm(`Delete remittance record #${r.id} for ${r.driverName}?`)) return;
    setData(prev => prev.filter(x => x.id !== r.id));
  };

  const handleRemit = (id: number) => {
    setData(prev => prev.map(x => x.id === id ? {
      ...x, status: 'remitted' as const, remittanceDate: new Date().toISOString(),
      remittedById: 1,
    } : x));
  };

  const handleVerify = () => {
    if (!verifyItem || !verifyName.trim()) return;
    setData(prev => prev.map(x => x.id === verifyItem.id ? {
      ...x, verifiedBy: verifyName.trim(), verifiedAt: new Date().toISOString(),
      status: x.status === 'pending' ? 'collected' as const : x.status,
    } : x));
    setVerifyItem(null); setVerifyName('');
  };

  const handleDispute = (id: number) => {
    setData(prev => prev.map(x => x.id === id ? { ...x, status: 'disputed' as const } : x));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div>
      {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
        <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
      </div>}

      {/* â”€â”€ Summary Cards â”€â”€ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* â”€â”€ Toolbar + Tabs â”€â”€ */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
              <input placeholder="Search driver, vehicle, ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
            </div>
          </div>
          <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Add Remittance</button>
        </div>
        <div style={{ display: 'flex', gap: 0, padding: '10px 14px', borderTop: '1px solid var(--border)', marginTop: 12 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setStatusTab(t.key); setPage(0); }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', background: statusTab === t.key ? 'rgba(0,179,144,0.12)' : 'transparent',
              color: statusTab === t.key ? 'var(--accent)' : 'var(--text3)',
              borderRadius: 6, transition: 'all 0.15s',
            }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: 14 }}></i>
              {t.label}
              {t.key !== 'all' && <span style={{ fontSize: 11, opacity: 0.6 }}>({data.filter(r => r.status === t.key).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ Table â”€â”€ */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>Date</th>
                <th style={hdrStyle}>Driver</th>
                <th style={hdrStyle}>Vehicle</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Target (GHS)</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Actual (GHS)</th>
                <th style={{ ...hdrStyle, minWidth: 160 }}>Shortage</th>
                <th style={{ ...hdrStyle, textAlign: 'right' }}>Commission</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Verification</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={cellStyle}>{dFmt(r.collectionDate)}</td>
                  <td style={{ ...cellStyle, fontWeight: 500 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{r.driverName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace" }}>#{r.driverId}</span>
                    </div>
                  </td>
                  <td style={{ ...cellStyle }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.plateNumber}</span>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{r.shiftType}</div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{fmt(r.targetAmount)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{fmt(r.actualAmount)}</td>
                  <td style={cellStyle}>
                    <ShortageBar shortage={r.shortage} target={r.targetAmount} />
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{fmt(r.commission)}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {badge(r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' '), statusColors[r.status] || '#5c6f8a')}
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                        <i className={`ti ${PAYMENT_ICONS[r.paymentMethod]}`} style={{ fontSize: 10, marginRight: 2 }}></i>
                        {PAYMENT_LABELS[r.paymentMethod]}
                      </span>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    {r.verifiedBy ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}><i className="las la-user-check" style={{ fontSize: 12, marginRight: 3 }}></i>{r.verifiedBy}</span>
                        {r.verifiedAt && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{dtFmt(r.verifiedAt)}</span>}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>â€”</span>
                    )}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <button style={{ ...btn, padding: '5px 7px' }} onClick={() => setDetailItem(r)} title="View details"><i className="las la-eye" style={{ fontSize: 14 }}></i></button>
                      {r.status === 'pending' && !r.verifiedBy && (
                        <button style={{ ...btnWarning, padding: '5px 7px' }} onClick={() => { setVerifyItem(r); setVerifyName(''); }} title="Verify"><i className="las la-user-check" style={{ fontSize: 14 }}></i></button>
                      )}
                      {r.status !== 'remitted' && r.status !== 'disputed' && r.verifiedBy && (
                        <button style={{ ...btnSuccess, padding: '5px 7px' }} onClick={() => handleRemit(r.id)} title="Remit"><i className="las la-check" style={{ fontSize: 14 }}></i></button>
                      )}
                      {r.status === 'short' && (
                        <button style={{ ...btnDanger, padding: '5px 7px' }} onClick={() => handleDispute(r.id)} title="Dispute"><i className="las la-exclamation-circle" style={{ fontSize: 14 }}></i></button>
                      )}
                      <button style={{ ...btn, padding: '5px 7px' }} onClick={() => openEdit(r)}><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                      <button style={{ ...btnDanger, padding: '5px 7px' }} onClick={() => handleDelete(r)}><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} records</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows: </span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: 70, padding: '4px 8px', fontSize: 12 }}>
              <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
            </select>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="las la-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 } as React.CSSProperties} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="las la-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>

      {/* â”€â”€ Add/Edit Form Modal â”€â”€ */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 580, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Remittance' : 'Add Remittance Record'}</div>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={labelStyle}>Driver Name</label><input required value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Plate Number</label><input required value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Target Amount (GHS)</label><input required type="number" step="0.01" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Actual Amount (GHS)</label><input required type="number" step="0.01" value={form.actualAmount} onChange={e => setForm({ ...form, actualAmount: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Collection Date</label><input required type="date" value={form.collectionDate} onChange={e => setForm({ ...form, collectionDate: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Shift</label><select value={form.shiftType} onChange={e => setForm({ ...form, shiftType: e.target.value as 'day' | 'night' | 'split' })} style={inputStyle}>
                    <option value="day">Day</option><option value="night">Night</option><option value="split">Split</option>
                  </select></div>
                  <div><label style={labelStyle}>Trip Count</label><input type="number" value={form.tripCount} onChange={e => setForm({ ...form, tripCount: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Passenger Count</label><input type="number" value={form.passengerCount} onChange={e => setForm({ ...form, passengerCount: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Payment Method</label><select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })} style={inputStyle}>
                    <option value="cash">Cash</option><option value="mobile_money">Mobile Money</option><option value="bank_transfer">Bank Transfer</option>
                  </select></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={inputStyle} /></div>
                </div>
                {Number(form.targetAmount) > 0 && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Commission (20%): <strong style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{fmt(Number(form.actualAmount || 0) * 0.2)}</strong></div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Shortage: <strong style={{ color: (Number(form.targetAmount) - Number(form.actualAmount)) <= 0 ? '#22c55e' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
                      {(Number(form.targetAmount) - Number(form.actualAmount)) <= 0 ? '+' : ''}{fmt(Math.max(0, Number(form.targetAmount) - Number(form.actualAmount)) || 0)}
                    </strong></div>
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="las la-spinner" style={{ animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editItem ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ Verify Modal â”€â”€ */}
      {verifyItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 400, maxWidth: '90vw' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Verify Remittance</div>
              <button type="button" onClick={() => setVerifyItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text2)' }}>
                Verifying remittance for <strong>{verifyItem.driverName}</strong> ({verifyItem.plateNumber}) â€” {dFmt(verifyItem.collectionDate)}
              </div>
              <label style={labelStyle}>Supervisor Name</label>
              <input autoFocus value={verifyName} onChange={e => setVerifyName(e.target.value)} placeholder="Enter supervisor name" style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleVerify()} />
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={btn} onClick={() => setVerifyItem(null)}>Cancel</button>
              <button style={{ ...btnPrimary, opacity: verifyName.trim() ? 1 : 0.5 } as React.CSSProperties} disabled={!verifyName.trim()} onClick={handleVerify}>
                <i className="las la-user-check" style={{ fontSize: 14 }}></i> Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Detail Modal â”€â”€ */}
      {detailItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={() => setDetailItem(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="las la-receipt" style={{ fontSize: 18, color: 'var(--accent)' }}></i>
                Remittance Detail #{detailItem.id}
              </div>
              <button type="button" onClick={() => setDetailItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Driver & Vehicle */}
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Driver & Vehicle</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Driver</span><div style={{ fontSize: 14, fontWeight: 600 }}>{detailItem.driverName} <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 12 }}>#{detailItem.driverId}</span></div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Vehicle</span><div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{detailItem.plateNumber} <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 12 }}>#{detailItem.vehicleId}</span></div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Shift</span><div style={{ fontSize: 14, textTransform: 'capitalize' }}>{detailItem.shiftType}</div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Date</span><div style={{ fontSize: 14 }}>{dFmt(detailItem.collectionDate)}</div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Trips / Passengers</span><div style={{ fontSize: 14 }}>{detailItem.tripCount ?? 'â€”'} / {detailItem.passengerCount ?? 'â€”'}</div></div>
                  <div><span style={{ fontSize: 12, color: 'var(--text3)' }}>Payment</span><div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}><i className={`ti ${PAYMENT_ICONS[detailItem.paymentMethod]}`} style={{ fontSize: 14 }}></i>{PAYMENT_LABELS[detailItem.paymentMethod]}</div></div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Financial Breakdown</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>Target Amount</span>
                    <span style={{ fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(detailItem.targetAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>Actual Collected</span>
                    <span style={{ fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(detailItem.actualAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text2)' }}>Shortage</span>
                    <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: detailItem.shortage <= 0 ? '#22c55e' : '#ef4444' }}>
                      {detailItem.shortage <= 0 ? '+' : ''}{fmt(detailItem.shortage)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>Commission (20%)</span>
                    <span style={{ fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", color: '#3b82f6' }}>{fmt(detailItem.commission)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>Currency</span>
                    <span style={{ fontWeight: 500 }}>{detailItem.currency}</span>
                  </div>
                </div>
              </div>

              {/* Status & Verification Chain */}
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Status & Verification</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>Current Status</span>
                    {badge(detailItem.status.charAt(0).toUpperCase() + detailItem.status.slice(1), statusColors[detailItem.status] || '#5c6f8a')}
                  </div>
                  {detailItem.verifiedBy && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: 'var(--text2)' }}><i className="las la-user-check" style={{ fontSize: 13, marginRight: 3 }}></i>Verified By</span>
                      <span style={{ fontWeight: 500 }}>{detailItem.verifiedBy}</span>
                    </div>
                  )}
                  {detailItem.verifiedAt && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: 'var(--text2)' }}>Verified At</span>
                      <span>{dtFmt(detailItem.verifiedAt)}</span>
                    </div>
                  )}
                  {detailItem.remittanceDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: 'var(--text2)' }}><i className="las la-check" style={{ fontSize: 13, marginRight: 3 }}></i>Remitted At</span>
                      <span>{dtFmt(detailItem.remittanceDate)}</span>
                    </div>
                  )}
                  {detailItem.remittedById && SUPERVISOR_MAP[detailItem.remittedById] && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: 'var(--text2)' }}>Remitted By</span>
                      <span style={{ fontWeight: 500 }}>{SUPERVISOR_MAP[detailItem.remittedById]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {detailItem.notes && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{detailItem.notes}</div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
