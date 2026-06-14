import { useState, useEffect, useRef } from 'react';
import { incidentService, type IncidentReport } from '../services/incidentService';

type ActionTaken = 'none' | 'verbal_warning' | 'written_warning' | 'suspension' | 'termination' | 'police_report';

interface EvidenceItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'pdf' | 'document' | 'other';
  uploadedAt: string;
}

interface ExtendedIncident extends IncidentReport {
  evidenceRefs: string[];
  evidenceFiles: EvidenceItem[];
  actionTaken: ActionTaken;
  investigatedBy: string | null;
  investigatedAt: string | null;
  disciplinaryOutcome: string | null;
}

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const btnSuccess: React.CSSProperties = { ...btn, background: '#22c55e18', color: '#22c55e', borderColor: 'rgba(34,197,94,0.25)' };
const btnWarning: React.CSSProperties = { ...btn, background: '#f59e0b18', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.25)' };
const btnDanger: React.CSSProperties = { ...btn, background: '#ef444418', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const badge = (label: string, color: string) => <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>;
const severityColors: Record<string, string> = { minor: '#22c55e', moderate: '#f59e0b', major: '#ef4444', critical: '#dc2626' };
const statusColors: Record<string, string> = { reported: '#3b82f6', investigating: '#8b5cf6', escalated: '#ef4444', resolved: '#22c55e', closed: '#5c6f8a' };
const actionColors: Record<ActionTaken, string> = { none: '#5c6f8a', verbal_warning: '#f59e0b', written_warning: '#f59e0b', suspension: '#ef4444', termination: '#dc2626', police_report: '#3b82f6' };
const actionLabels: Record<ActionTaken, string> = { none: 'None', verbal_warning: 'Verbal Warning', written_warning: 'Written Warning', suspension: 'Suspension', termination: 'Termination', police_report: 'Police Report' };

const MAX_EVIDENCE_FILES = 10;
const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const DEMO_EVIDENCE_DIR: Record<number, EvidenceItem[]> = {
  1: [
    { id: 'ev1', name: 'dashcam_footage.mp4', url: '', type: 'video', uploadedAt: '2026-06-10T10:00:00Z' },
    { id: 'ev2', name: 'bumper_damage.jpg', url: '', type: 'image', uploadedAt: '2026-06-10T10:05:00Z' },
    { id: 'ev3', name: 'insurance_claim.pdf', url: '', type: 'pdf', uploadedAt: '2026-06-11T08:00:00Z' },
  ],
  2: [
    { id: 'ev4', name: 'police_report.pdf', url: '', type: 'pdf', uploadedAt: '2026-06-08T12:00:00Z' },
    { id: 'ev5', name: 'gps_logs.csv', url: '', type: 'document', uploadedAt: '2026-06-08T14:00:00Z' },
  ],
  4: [
    { id: 'ev6', name: 'brake_line_damage.jpg', url: '', type: 'image', uploadedAt: '2026-06-06T09:00:00Z' },
    { id: 'ev7', name: 'workshop_report.pdf', url: '', type: 'pdf', uploadedAt: '2026-06-06T11:00:00Z' },
  ],
  5: [
    { id: 'ev8', name: 'passenger_statement.mp4', url: '', type: 'video', uploadedAt: '2026-06-04T10:00:00Z' },
  ],
  8: [
    { id: 'ev9', name: 'dashcam_20260525.mp4', url: '', type: 'video', uploadedAt: '2026-05-25T18:00:00Z' },
    { id: 'ev10', name: 'medical_report.pdf', url: '', type: 'pdf', uploadedAt: '2026-05-26T08:00:00Z' },
  ],
};

const DEMO_INCIDENTS: ExtendedIncident[] = [
  { id: 1, type: 'accident', severity: 'major', status: 'resolved', driverId: 101, vehicleId: 201, reportedById: 1, assignedToId: null, dateOfIncident: '2026-06-10T00:00:00Z', location: 'Accra-Tema Motorway, Junction 8', description: 'Rear-end collision at traffic light. Minor bumper damage to both vehicles. No injuries.', findings: 'Driver distraction â€” phone use at time of incident. Dashcam footage confirmed device in hand.', resolution: 'Driver formally warned. Vehicle repaired at Nippon Motors. Insurance claim filed with SIC Insurance.', isEscalated: false, escalatedToId: null, escalatedAt: null, resolvedAt: '2026-06-11T10:00:00Z', evidenceRefs: ['DASHCAM_20260610_001', 'WORKSHOP_RPT_20260611', 'INSURANCE_CLM_4492'], evidenceFiles: DEMO_EVIDENCE_DIR[1], actionTaken: 'verbal_warning', investigatedBy: 'James Asare', investigatedAt: '2026-06-11T08:00:00Z', disciplinaryOutcome: 'Verbal warning issued. Driver placed on 30-day observation period.' },
  { id: 2, type: 'theft', severity: 'critical', status: 'escalated', driverId: 102, vehicleId: 202, reportedById: 1, assignedToId: 3, dateOfIncident: '2026-06-08T00:00:00Z', location: 'Madina Market Car Park', description: 'Aftermarket stereo and GPS unit stolen from parked vehicle overnight. Forced entry through passenger door.', findings: null, resolution: null, isEscalated: true, escalatedToId: 3, escalatedAt: '2026-06-09T08:00:00Z', resolvedAt: null, evidenceRefs: ['POLICE_RPT_MADINA_0608', 'GPS_LOG_V202_20260607'], evidenceFiles: DEMO_EVIDENCE_DIR[2], actionTaken: 'police_report', investigatedBy: null, investigatedAt: null, disciplinaryOutcome: null },
  { id: 3, type: 'traffic_violation', severity: 'moderate', status: 'reported', driverId: 103, vehicleId: 203, reportedById: 2, assignedToId: null, dateOfIncident: '2026-06-07T00:00:00Z', location: 'Kumasi - Kejetia Interchange', description: 'Driver ran red light at Kejetia Interchange. Captured by traffic camera. Fine issued.', findings: null, resolution: null, isEscalated: false, escalatedToId: null, escalatedAt: null, resolvedAt: null, evidenceRefs: [], evidenceFiles: [], actionTaken: 'none', investigatedBy: null, investigatedAt: null, disciplinaryOutcome: null },
  { id: 4, type: 'mechanical', severity: 'major', status: 'investigating', driverId: 105, vehicleId: 205, reportedById: 5, assignedToId: null, dateOfIncident: '2026-06-05T00:00:00Z', location: 'Takoradi - Market Circle', description: 'Brake failure reported during route. Driver managed to stop safely using handbrake. Vehicle towed to workshop.', findings: 'Brake fluid leak from damaged hydraulic line. Workshop report confirms worn hose.', resolution: null, isEscalated: false, escalatedToId: null, escalatedAt: null, resolvedAt: null, evidenceRefs: ['TOW_RCPT_205_0605', 'WORKSHOP_RPT_BRAKE_205', 'GPS_LOG_V205_20260605'], evidenceFiles: DEMO_EVIDENCE_DIR[4], actionTaken: 'none', investigatedBy: 'Grace Amponsah', investigatedAt: '2026-06-06T09:00:00Z', disciplinaryOutcome: null },
  { id: 5, type: 'passenger_complaint', severity: 'minor', status: 'resolved', driverId: 106, vehicleId: 206, reportedById: 1, assignedToId: null, dateOfIncident: '2026-06-03T00:00:00Z', location: 'Madina - Accra Central route', description: 'Passenger complained about reckless driving and harsh braking during trip.', findings: 'Driver defense: swerved to avoid pedestrian crossing unexpectedly. GPS data shows speed within limit.', resolution: 'Verbal warning issued. Driver counseling scheduled. Passenger followed up.', isEscalated: false, escalatedToId: null, escalatedAt: null, resolvedAt: '2026-06-04T14:00:00Z', evidenceRefs: ['GPS_LOG_V206_20260603', 'PASSENGER_STMT_001'], evidenceFiles: DEMO_EVIDENCE_DIR[5], actionTaken: 'verbal_warning', investigatedBy: 'James Asare', investigatedAt: '2026-06-04T10:00:00Z', disciplinaryOutcome: 'Verbal warning. Driver to complete defensive driving course within 14 days.' },
  { id: 6, type: 'damage', severity: 'moderate', status: 'reported', driverId: 108, vehicleId: 208, reportedById: 4, assignedToId: null, dateOfIncident: '2026-06-02T00:00:00Z', location: 'Tema Port - Container Terminal', description: 'Side mirror scraped against container during tight maneuver at Tema Port loading bay.', findings: null, resolution: null, isEscalated: false, escalatedToId: null, escalatedAt: null, resolvedAt: null, evidenceRefs: [], evidenceFiles: [], actionTaken: 'none', investigatedBy: null, investigatedAt: null, disciplinaryOutcome: null },
  { id: 7, type: 'disciplinary', severity: 'moderate', status: 'resolved', driverId: 107, vehicleId: 207, reportedById: 1, assignedToId: null, dateOfIncident: '2026-05-28T00:00:00Z', location: 'Accra HQ', description: 'Driver reported late for shift 3 times in one week. No prior warning submitted.', findings: 'Driver had family emergency, failed to notify supervisor. No prior disciplinary record.', resolution: 'Written warning issued. Improved communication plan agreed.', isEscalated: false, escalatedToId: null, escalatedAt: null, resolvedAt: '2026-05-30T00:00:00Z', evidenceRefs: ['ATTENDANCE_LOG_MAY2026', 'SUPERVISOR_NOTE_0528'], evidenceFiles: [], actionTaken: 'written_warning', investigatedBy: 'Grace Amponsah', investigatedAt: '2026-05-29T11:00:00Z', disciplinaryOutcome: 'Written warning on file. Any further lateness within 90 days will result in 3-day suspension.' },
  { id: 8, type: 'accident', severity: 'critical', status: 'investigating', driverId: 110, vehicleId: 210, reportedById: 6, assignedToId: 2, dateOfIncident: '2026-05-25T00:00:00Z', location: 'East Legon - Spintex Road', description: 'Vehicle hit a motorcyclist at intersection. Motorcyclist hospitalized with leg fracture.', findings: 'Ongoing police investigation. Dashcam footage being reviewed. Motorcyclist in stable condition.', resolution: null, isEscalated: true, escalatedToId: 2, escalatedAt: '2026-05-26T09:00:00Z', resolvedAt: null, evidenceRefs: ['DASHCAM_20260525', 'POLICE_RPT_EL_0525', 'MEDICAL_RPT_LEG_FRX', 'GPS_LOG_V210_20260525'], evidenceFiles: DEMO_EVIDENCE_DIR[8], actionTaken: 'none', investigatedBy: 'James Asare', investigatedAt: '2026-05-26T08:00:00Z', disciplinaryOutcome: null },
];

const statusTimeline = ['reported', 'investigating', 'resolved', 'closed'] as const;

const getEvidenceType = (mime: string): EvidenceItem['type'] => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('document')) return 'document';
  return 'other';
};

const evidenceIcon: Record<EvidenceItem['type'], string> = { image: 'ti-photo', video: 'ti-video', pdf: 'ti-file-text', document: 'ti-file-description', other: 'ti-file-unknown' };
const evidenceColor: Record<EvidenceItem['type'], string> = { image: '#3b82f6', video: '#8b5cf6', pdf: '#ef4444', document: '#f59e0b', other: '#5c6f8a' };

const EvidenceThumbnail: React.FC<{ item: EvidenceItem; onClick?: () => void }> = ({ item, onClick }) => {
  const isImg = item.type === 'image' && item.url;
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: 'var(--bg3)', border: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
      {isImg ? (
        <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <i className={`ti ${evidenceIcon[item.type]}`} style={{ fontSize: 22, color: evidenceColor[item.type] }}></i>
          {item.type === 'video' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}><div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="las la-play-circle-filled" style={{ fontSize: 10, color: '#fff' }}></i></div></div>}
        </>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2px 4px', background: 'rgba(0,0,0,0.6)', fontSize: 8, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</div>
    </div>
  );
};

const getFileIcon = (type: EvidenceItem['type']) => evidenceIcon[type];
const getFileColor = (type: EvidenceItem['type']) => evidenceColor[type];

export default function IncidentsPage() {
  const [data, setData] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('all');
  const [statusTab, setStatusTab] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIncident, setSelectedIncident] = useState<ExtendedIncident | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<IncidentReport | null>(null);
  const [form, setForm] = useState({ type: 'other', severity: 'moderate', driverId: '', vehicleId: '', dateOfIncident: '', location: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formEvidence, setFormEvidence] = useState<{ file: File; preview: string }[]>([]);
  const [evidencePreviewItem, setEvidencePreviewItem] = useState<EvidenceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<ExtendedIncident | null>(null);
  const [resolveForm, setResolveForm] = useState({ findings: '', resolution: '' });

  const [showDisciplinaryForm, setShowDisciplinaryForm] = useState(false);
  const [discTarget, setDiscTarget] = useState<ExtendedIncident | null>(null);
  const [discForm, setDiscForm] = useState<{ actionTaken: ActionTaken; disciplinaryOutcome: string }>({ actionTaken: 'verbal_warning', disciplinaryOutcome: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setError(null); const result = await incidentService.getAll(); setData(result.length ? result : DEMO_INCIDENTS); }
    catch { setData(DEMO_INCIDENTS); }
    finally { setLoading(false); }
  };

  const getDemoEvidence = (id: number): EvidenceItem[] => DEMO_EVIDENCE_DIR[id] || [];

  const openAdd = () => {
    setEditItem(null);
    setForm({ type: 'other', severity: 'moderate', driverId: '', vehicleId: '', dateOfIncident: '', location: '', description: '' });
    setFormEvidence([]);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (r: IncidentReport) => {
    setEditItem(r);
    setForm({ type: r.type, severity: r.severity, driverId: String(r.driverId ?? ''), vehicleId: String(r.vehicleId ?? ''), dateOfIncident: r.dateOfIncident.slice(0, 10), location: r.location || '', description: r.description });
    setFormEvidence([]);
    setFormError(null);
    setShowModal(true);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const newFiles: { file: File; preview: string }[] = [];
    const remaining = MAX_EVIDENCE_FILES - formEvidence.length;
    const toProcess = Array.from(files).slice(0, remaining);
    for (const f of toProcess) {
      if (ALLOWED_EVIDENCE_TYPES.includes(f.type)) {
        const preview = await readFileAsDataURL(f);
        newFiles.push({ file: f, preview });
      }
    }
    setFormEvidence(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFormEvidence = (idx: number) => {
    setFormEvidence(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const d: any = { ...form, driverId: form.driverId ? Number(form.driverId) : null, vehicleId: form.vehicleId ? Number(form.vehicleId) : null };
      if (editItem) await incidentService.update(editItem.id, d);
      else await incidentService.create(d);
      await load();
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
      if (!navigator.onLine || err.response?.status !== 200) {
        if (editItem) {
          setData(prev => prev.map(x => x.id === editItem.id ? { ...x, ...d, id: editItem.id } as IncidentReport : x));
        } else {
          const newId = Math.max(...data.map(x => x.id), 0) + 1;
          setData(prev => [...prev, { ...d, id: newId, status: 'reported', reportedById: 1, isEscalated: false } as IncidentReport]);
        }
        setShowModal(false);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (r: IncidentReport) => {
    if (!confirm(`Delete incident #${r.id}?`)) return;
    try { await incidentService.delete(r.id); await load(); }
    catch { setData(prev => prev.filter(x => x.id !== r.id)); }
  };

  const handleInvestigate = async (r: ExtendedIncident) => {
    try { await incidentService.update(r.id, { status: 'investigating' } as any); await load(); }
    catch { setData(prev => prev.map(x => x.id === r.id ? { ...x, status: 'investigating' as const } : x)); }
  };

  const openResolve = (r: ExtendedIncident) => {
    setResolveTarget(r);
    setResolveForm({ findings: r.findings || '', resolution: r.resolution || '' });
    setShowResolveForm(true);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;
    try {
      await incidentService.update(resolveTarget.id, {
        status: 'resolved', findings: resolveForm.findings, resolution: resolveForm.resolution, resolvedAt: new Date().toISOString(),
      } as any);
      await load();
      setShowResolveForm(false);
      setResolveTarget(null);
    } catch {
      setData(prev => prev.map(x => x.id === resolveTarget.id ? { ...x, status: 'resolved' as const, findings: resolveForm.findings, resolution: resolveForm.resolution, resolvedAt: new Date().toISOString() } : x));
      setShowResolveForm(false);
      setResolveTarget(null);
    }
  };

  const openDisciplinary = (r: ExtendedIncident) => {
    setDiscTarget(r);
    setDiscForm({ actionTaken: r.actionTaken === 'none' ? 'verbal_warning' : r.actionTaken, disciplinaryOutcome: r.disciplinaryOutcome || '' });
    setShowDisciplinaryForm(true);
  };

  const handleDisciplinarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discTarget) return;
    try {
      await incidentService.update(discTarget.id, { actionTaken: discForm.actionTaken, disciplinaryOutcome: discForm.disciplinaryOutcome } as any);
      await load();
      setShowDisciplinaryForm(false);
      setDiscTarget(null);
    } catch {
      setData(prev => prev.map(x => x.id === discTarget.id ? { ...x, actionTaken: discForm.actionTaken, disciplinaryOutcome: discForm.disciplinaryOutcome } as any : x));
      setShowDisciplinaryForm(false);
      setDiscTarget(null);
    }
  };

  const castRow = (r: IncidentReport): ExtendedIncident => ({
    ...r,
    findings: (r as ExtendedIncident).findings ?? null,
    resolution: (r as ExtendedIncident).resolution ?? null,
    evidenceRefs: (r as ExtendedIncident).evidenceRefs ?? [],
    evidenceFiles: (r as ExtendedIncident).evidenceFiles ?? getDemoEvidence(r.id),
    actionTaken: (r as ExtendedIncident).actionTaken ?? 'none',
    investigatedBy: (r as ExtendedIncident).investigatedBy ?? null,
    investigatedAt: (r as ExtendedIncident).investigatedAt ?? null,
    disciplinaryOutcome: (r as ExtendedIncident).disciplinaryOutcome ?? null,
  });

  const filtered = data.filter(r => {
    const s = search.toLowerCase();
    if (s && !r.description.toLowerCase().includes(s) && !r.type.includes(s) && !`#${r.id}`.includes(s)) return false;
    if (sevFilter !== 'all' && r.severity !== sevFilter) return false;
    if (statusTab !== 'all') {
      if (statusTab === 'investigating' && r.status !== 'investigating') return false;
      if (statusTab === 'resolved' && r.status !== 'resolved' && r.status !== 'closed') return false;
      if (statusTab === 'disciplinary') {
        const ext = castRow(r);
        if (ext.actionTaken === 'none' && !ext.disciplinaryOutcome) return false;
      }
    }
    return true;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div>
      {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{error}</span>
        <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12 }} onClick={() => setError(null)}>Dismiss</span>
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {(() => {
          const withActions = data.filter(r => castRow(r).actionTaken !== 'none');
          return [
            { label: 'Total Incidents', value: data.length, color: '#ef4444', icon: 'ti-alert-triangle' },
            { label: 'Under Investigation', value: data.filter(r => r.status === 'investigating').length, color: '#8b5cf6', icon: 'ti-search' },
            { label: 'Closed', value: data.filter(r => r.status === 'closed' || r.status === 'resolved').length, color: '#22c55e', icon: 'ti-check-circle' },
            { label: 'Disciplinary Actions', value: withActions.length, color: '#f59e0b', icon: 'ti-gavel' },
          ];
        })().map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{s.label}</div></div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color }}></i>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 14px' }}>
          {[
            { key: 'all', label: 'All', icon: 'ti-list' },
            { key: 'investigating', label: 'Under Investigation', icon: 'ti-search' },
            { key: 'resolved', label: 'Resolved', icon: 'ti-check-circle' },
            { key: 'disciplinary', label: 'Disciplinary', icon: 'ti-gavel' },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setStatusTab(tab.key); setPage(0); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', borderBottom: statusTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent', background: 'none', color: statusTab === tab.key ? 'var(--accent)' : 'var(--text3)', transition: 'all 0.15s' }}>
              <i className={`ti ${tab.icon}`} style={{ fontSize: 14 }}></i> {tab.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <i className="las la-search" style={{ position: 'absolute', left: 10, top: 9, fontSize: 15, color: 'var(--text3)' }}></i>
              <input placeholder="Search incidents..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, paddingLeft: 32, width: 200 }} />
            </div>
            <select value={sevFilter} onChange={e => { setSevFilter(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 130, padding: '8px 10px' }}>
              <option value="all">All Severity</option>
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button style={btnPrimary} onClick={openAdd}><i className="las la-plus" style={{ fontSize: 15 }}></i> Report Incident</button>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={hdrStyle}>ID</th>
                <th style={hdrStyle}>Type</th>
                <th style={hdrStyle}>Severity</th>
                <th style={hdrStyle}>Vehicle</th>
                <th style={hdrStyle}>Driver</th>
                <th style={hdrStyle}>Status</th>
                <th style={hdrStyle}>Evidence</th>
                <th style={hdrStyle}>Action Taken</th>
                <th style={hdrStyle}>Date</th>
                <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(raw => {
                const r = castRow(raw);
                return (
                  <tr key={r.id} onClick={() => setSelectedIncident(r)} style={{ cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={cellStyle}><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{r.id}</span></td>
                    <td style={{ ...cellStyle, fontSize: 12, textTransform: 'capitalize' }}>{r.type.replace(/_/g, ' ')}</td>
                    <td style={cellStyle}>{badge(r.severity, severityColors[r.severity])}</td>
                    <td style={cellStyle}>{r.vehicleId ? <><i className="las la-truck" style={{ fontSize: 12, marginRight: 4, color: 'var(--text3)' }}></i>V# {r.vehicleId}</> : '-'}</td>
                    <td style={cellStyle}>{r.driverId ? <><i className="las la-user" style={{ fontSize: 12, marginRight: 4, color: 'var(--text3)' }}></i>D# {r.driverId}</> : '-'}</td>
                    <td style={cellStyle}>{badge(r.status, statusColors[r.status])}</td>
                    <td style={cellStyle}>
                      {r.evidenceFiles.length > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--accent)', fontSize: 12 }}>
                          <i className="las la-paperclip" style={{ fontSize: 12 }}></i> {r.evidenceFiles.length}
                        </span>
                      ) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>â€”</span>}
                    </td>
                    <td style={cellStyle}>
                      {r.actionTaken !== 'none'
                        ? badge(actionLabels[r.actionTaken], actionColors[r.actionTaken])
                        : <span style={{ color: 'var(--text3)', fontSize: 12 }}>â€”</span>}
                    </td>
                    <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text3)' }}>{new Date(r.dateOfIncident).toLocaleDateString()}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        {r.status === 'reported' && <button style={{ ...btn, padding: '5px 10px', color: '#8b5cf6' }} onClick={() => handleInvestigate(r)} title="Investigate"><i className="las la-search" style={{ fontSize: 14 }}></i></button>}
                        {r.status === 'investigating' && <button style={{ ...btnSuccess, padding: '5px 10px' }} onClick={() => openResolve(r)} title="Resolve"><i className="las la-check" style={{ fontSize: 14 }}></i></button>}
                        {(r.status === 'resolved' || r.status === 'investigating') && r.actionTaken === 'none' && <button style={{ ...btnWarning, padding: '5px 10px' }} onClick={() => openDisciplinary(r)} title="Disciplinary Action"><i className="las la-gavel" style={{ fontSize: 14 }}></i></button>}
                        <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEdit(r)}><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                        <button style={{ ...btn, padding: '5px 10px', color: 'var(--danger)' }} onClick={() => handleDelete(r)}><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No incidents found</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <span>{filtered.length} total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows: </span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: 70, padding: '4px 8px', fontSize: 12 }}>
              <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
            </select>
            <button style={{ ...btn, padding: '4px 10px', opacity: page === 0 ? 0.4 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}><i className="las la-chevron-left" style={{ fontSize: 14 }}></i></button>
            <span>{page + 1} / {Math.max(1, Math.ceil(filtered.length / rowsPerPage))}</span>
            <button style={{ ...btn, padding: '4px 10px', opacity: page >= Math.ceil(filtered.length / rowsPerPage) - 1 ? 0.4 : 1 }} disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1} onClick={() => setPage(p => p + 1)}><i className="las la-chevron-right" style={{ fontSize: 14 }}></i></button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 600, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Incident' : 'Report Incident'}</div>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {formError && <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={labelStyle}>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    <option value="accident">Accident</option><option value="theft">Theft</option><option value="damage">Damage</option>
                    <option value="traffic_violation">Traffic Violation</option><option value="passenger_complaint">Passenger Complaint</option>
                    <option value="disciplinary">Disciplinary</option><option value="mechanical">Mechanical</option><option value="other">Other</option>
                  </select></div>
                  <div><label style={labelStyle}>Severity</label><select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={inputStyle}>
                    <option value="minor">Minor</option><option value="moderate">Moderate</option><option value="major">Major</option><option value="critical">Critical</option>
                  </select></div>
                  <div><label style={labelStyle}>Driver ID</label><input type="number" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Vehicle ID</label><input type="number" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Date of Incident</label><input required type="date" value={form.dateOfIncident} onChange={e => setForm({ ...form, dateOfIncident: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={inputStyle} /></div>
                </div>

                {/* Evidence Upload */}
                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Media Evidence <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(images, videos, PDFs â€” max {MAX_EVIDENCE_FILES} files)</span></label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', background: dragOver ? 'rgba(0,201,167,0.05)' : 'var(--bg3)' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="las la-upload" style={{ fontSize: 24, color: 'var(--text3)', display: 'block', marginBottom: 6 }}></i>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Drag & drop files or click to browse</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, opacity: 0.6 }}>JPG, PNG, WebP, GIF, MP4, MOV, PDF, DOC</div>
                    <input ref={fileInputRef} type="file" multiple accept={ALLOWED_EVIDENCE_TYPES.join(',')} onChange={e => handleFileSelect(e.target.files)} style={{ display: 'none' }} />
                  </div>
                  {formEvidence.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      {formEvidence.map((ev, idx) => (
                        <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border2)' }}>
                          {ev.file.type.startsWith('image/') ? (
                            <img src={ev.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)' }}>
                              <i className={`ti ${getFileIcon(getEvidenceType(ev.file.type))}`} style={{ fontSize: 20, color: getFileColor(getEvidenceType(ev.file.type)) }}></i>
                              <div style={{ fontSize: 8, color: 'var(--text3)', marginTop: 2, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.file.name}</div>
                            </div>
                          )}
                          <button type="button" onClick={() => removeFormEvidence(idx)} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}><i className="las la-times"></i></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: formLoading ? 0.6 : 1 }} disabled={formLoading}>
                  {formLoading ? <i className="las la-spinner" style={{ animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editItem ? ' Update' : ' Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveForm && resolveTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleResolveSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Resolve Incident #{resolveTarget.id}</div>
                <button type="button" onClick={() => { setShowResolveForm(false); setResolveTarget(null); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Investigation Findings</label>
                  <textarea value={resolveForm.findings} onChange={e => setResolveForm({ ...resolveForm, findings: e.target.value })} rows={4} style={inputStyle} placeholder="Document investigation findings..." />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Resolution</label>
                  <textarea required value={resolveForm.resolution} onChange={e => setResolveForm({ ...resolveForm, resolution: e.target.value })} rows={4} style={inputStyle} placeholder="Describe the resolution..." />
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => { setShowResolveForm(false); setResolveTarget(null); }}>Cancel</button>
                <button type="submit" style={btnSuccess}><i className="las la-check" style={{ fontSize: 14 }}></i> Resolve Incident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disciplinary Action Modal */}
      {showDisciplinaryForm && discTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleDisciplinarySubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Disciplinary Action â€” Incident #{discTarget.id}</div>
                <button type="button" onClick={() => { setShowDisciplinaryForm(false); setDiscTarget(null); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Action Taken</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { value: 'verbal_warning' as ActionTaken, label: 'Verbal Warning', icon: 'ti-message', color: '#f59e0b' },
                      { value: 'written_warning' as ActionTaken, label: 'Written Warning', icon: 'ti-file-text', color: '#f59e0b' },
                      { value: 'suspension' as ActionTaken, label: 'Suspension', icon: 'ti-player-pause', color: '#ef4444' },
                      { value: 'termination' as ActionTaken, label: 'Termination', icon: 'ti-user-x', color: '#dc2626' },
                      { value: 'police_report' as ActionTaken, label: 'Police Report', icon: 'ti-shield', color: '#3b82f6' },
                    ].map(opt => (
                      <label key={opt.value} onClick={() => setDiscForm({ ...discForm, actionTaken: opt.value })}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: `2px solid ${discForm.actionTaken === opt.value ? opt.color : 'var(--border2)'}`, background: discForm.actionTaken === opt.value ? `${opt.color}12` : 'var(--bg3)', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input type="radio" name="actionTaken" value={opt.value} checked={discForm.actionTaken === opt.value} onChange={() => {}} style={{ display: 'none' }} />
                        <i className={`ti ${opt.icon}`} style={{ fontSize: 16, color: discForm.actionTaken === opt.value ? opt.color : 'var(--text3)' }}></i>
                        <span style={{ fontSize: 12, fontWeight: 600, color: discForm.actionTaken === opt.value ? opt.color : 'var(--text)' }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Disciplinary Outcome</label>
                  <textarea value={discForm.disciplinaryOutcome} onChange={e => setDiscForm({ ...discForm, disciplinaryOutcome: e.target.value })} rows={4} style={inputStyle} placeholder="Describe the disciplinary outcome and any conditions..." />
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => { setShowDisciplinaryForm(false); setDiscTarget(null); }}>Cancel</button>
                <button type="submit" style={btnWarning}><i className="las la-gavel" style={{ fontSize: 14 }}></i> Apply Action</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail Popup */}
      {selectedIncident && (
        <div onClick={() => setSelectedIncident(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 640, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'relative', padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${severityColors[selectedIncident.severity] || '#ef4444'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="las la-exclamation-triangle" style={{ fontSize: 20, color: severityColors[selectedIncident.severity] || '#ef4444' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Incident #{selectedIncident.id}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'capitalize' }}>{selectedIncident.type.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedIncident(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border2)', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="las la-times" style={{ fontSize: 16 }}></i>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                {badge(selectedIncident.severity, severityColors[selectedIncident.severity])}
                {badge(selectedIncident.status, statusColors[selectedIncident.status])}
                {selectedIncident.actionTaken !== 'none' && badge(actionLabels[selectedIncident.actionTaken], actionColors[selectedIncident.actionTaken])}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 8 }}>STATUS TIMELINE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {statusTimeline.map((step, idx) => {
                    const stepOrder = statusTimeline.indexOf(step);
                    const currentOrder = statusTimeline.indexOf(selectedIncident.status as typeof statusTimeline[number]);
                    const completed = stepOrder <= currentOrder || selectedIncident.status === 'closed' && step !== 'closed';
                    const isCurrent = selectedIncident.status === step;
                    return (
                      <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <div style={{ flex: idx === 0 ? 0.5 : 1, height: 2, background: completed ? 'var(--accent)' : 'var(--border)', marginLeft: idx === 0 ? '-50%' : 0 }} />
                          <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: completed ? 'var(--accent)' : 'var(--bg3)', border: `2px solid ${completed ? 'var(--accent)' : 'var(--border)'}`, color: completed ? '#00221c' : 'var(--text3)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {completed ? <i className="las la-check" style={{ fontSize: 11 }}></i> : idx + 1}
                          </div>
                          <div style={{ flex: idx === statusTimeline.length - 1 ? 0.5 : 1, height: 2, background: completed ? 'var(--accent)' : 'var(--border)', marginRight: idx === statusTimeline.length - 1 ? '-50%' : 0 }} />
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: isCurrent ? 'var(--accent)' : completed ? 'var(--text2)' : 'var(--text3)', marginTop: 6, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{step}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 6 }}>DESCRIPTION</div>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, background: 'var(--bg3)', borderRadius: 8, padding: 12 }}>{selectedIncident.description}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Date', value: new Date(selectedIncident.dateOfIncident).toLocaleDateString(), icon: 'ti-calendar' },
                  { label: 'Location', value: selectedIncident.location || 'N/A', icon: 'ti-map-pin' },
                  { label: 'Driver', value: selectedIncident.driverId ? `D#${selectedIncident.driverId}` : 'N/A', icon: 'ti-user' },
                  { label: 'Vehicle', value: selectedIncident.vehicleId ? `V#${selectedIncident.vehicleId}` : 'N/A', icon: 'ti-truck' },
                ].map(d => (
                  <div key={d.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className={`ti ${d.icon}`} style={{ fontSize: 14, color: 'var(--accent)' }}></i>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{d.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Media Evidence Gallery */}
              {selectedIncident.evidenceFiles.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="las la-paperclip" style={{ fontSize: 14 }}></i> MEDIA EVIDENCE <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text3)' }}>({selectedIncident.evidenceFiles.length} files)</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedIncident.evidenceFiles.map(ev => (
                      <EvidenceThumbnail key={ev.id} item={ev} onClick={() => {
                        if (ev.url) setEvidencePreviewItem(ev);
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence References */}
              {selectedIncident.evidenceRefs && selectedIncident.evidenceRefs.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="las la-file-description" style={{ fontSize: 14 }}></i> EVIDENCE REFERENCES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedIncident.evidenceRefs.map((ref, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border2)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text2)' }}>
                        <i className="las la-file" style={{ fontSize: 11, color: 'var(--accent)' }}></i>
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="las la-clipboard" style={{ fontSize: 14 }}></i> INVESTIGATION
                </div>
                {selectedIncident.findings ? (
                  <div style={{ background: 'rgba(139,92,246,0.08)', borderRadius: 8, padding: 12, border: '1px solid rgba(139,92,246,0.15)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 10 }}>{selectedIncident.findings}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
                      {selectedIncident.investigatedBy && <span><i className="las la-user" style={{ fontSize: 12, marginRight: 4 }}></i> by {selectedIncident.investigatedBy}</span>}
                      {selectedIncident.investigatedAt && <span><i className="las la-calendar" style={{ fontSize: 12, marginRight: 4 }}></i> {new Date(selectedIncident.investigatedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg3)', borderRadius: 8, padding: 12, fontStyle: 'italic' }}>No investigation findings recorded yet.</div>
                )}
              </div>

              {selectedIncident.resolution && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="las la-check-circle" style={{ fontSize: 14 }}></i> RESOLUTION
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)', background: 'rgba(34,197,94,0.08)', borderRadius: 8, padding: 12, border: '1px solid rgba(34,197,94,0.15)' }}>
                    {selectedIncident.resolution}
                  </div>
                </div>
              )}

              {selectedIncident.actionTaken !== 'none' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="las la-gavel" style={{ fontSize: 14 }}></i> DISCIPLINARY ACTION
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: 12, border: '1px solid rgba(245,158,11,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: actionColors[selectedIncident.actionTaken] }}>
                        {badge(actionLabels[selectedIncident.actionTaken], actionColors[selectedIncident.actionTaken])}
                      </span>
                    </div>
                    {selectedIncident.disciplinaryOutcome && (
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{selectedIncident.disciplinaryOutcome}</div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedIncident.status === 'reported' && (
                  <button style={{ ...btn, color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.25)' }} onClick={() => { handleInvestigate(selectedIncident); setSelectedIncident(null); }}>
                    <i className="las la-search" style={{ fontSize: 14 }}></i> Investigate
                  </button>
                )}
                {selectedIncident.status === 'investigating' && (
                  <button style={{ ...btnSuccess }} onClick={() => { setSelectedIncident(null); openResolve(selectedIncident); }}>
                    <i className="las la-check" style={{ fontSize: 14 }}></i> Resolve
                  </button>
                )}
                {selectedIncident.actionTaken === 'none' && (selectedIncident.status === 'resolved' || selectedIncident.status === 'investigating') && (
                  <button style={{ ...btnWarning }} onClick={() => { setSelectedIncident(null); openDisciplinary(selectedIncident); }}>
                    <i className="las la-gavel" style={{ fontSize: 14 }}></i> Disciplinary Action
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Preview Lightbox */}
      {evidencePreviewItem && evidencePreviewItem.url && (
        <div onClick={() => setEvidencePreviewItem(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
            <button onClick={() => setEvidencePreviewItem(null)} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24 }}><i className="las la-times"></i></button>
            {evidencePreviewItem.type === 'image' ? (
              <img src={evidencePreviewItem.url} alt={evidencePreviewItem.name} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain' }} />
            ) : evidencePreviewItem.type === 'video' ? (
              <video controls src={evidencePreviewItem.url} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>
                <i className={`ti ${evidenceIcon[evidencePreviewItem.type]}`} style={{ fontSize: 48, display: 'block', marginBottom: 12 }}></i>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{evidencePreviewItem.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Preview not available for this file type</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
