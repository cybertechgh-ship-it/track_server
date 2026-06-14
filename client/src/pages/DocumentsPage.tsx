import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { insuranceService, type Insurance } from '../services/insuranceService';
import { trainingService, type Training } from '../services/trainingService';
import { vehicleService } from '../services/vehicleService';
import { CYTRACK_LOGO } from '../constants/logo';
import type { Vehicle } from '../types';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)', transition: 'all 0.15s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--accent)', color: '#00221c', borderColor: 'var(--accent)' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };
const cellStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' };
const hdrStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' };

const INSURANCE_TYPE_COLORS: Record<string, string> = {
  comprehensive: '#3b82f6', third_party: '#22c55e', liability: '#f59e0b', collision: '#ef4444',
};
const INSURANCE_TYPE_LABELS: Record<string, string> = {
  comprehensive: 'Comprehensive', third_party: 'Third Party', liability: 'Liability', collision: 'Collision',
};
const TRAINING_TYPE_COLORS: Record<string, string> = {
  defensive_driving: '#3b82f6', safety: '#22c55e', certification: '#8b5cf6', refresher: '#f59e0b', compliance: '#06b6d4', other: '#64748b',
};
const TRAINING_TYPE_LABELS: Record<string, string> = {
  defensive_driving: 'Defensive Driving', safety: 'Safety', certification: 'Certification', refresher: 'Refresher', compliance: 'Compliance', other: 'Other',
};

const tabs = ['Insurance', 'Training & Certifications', 'Registration'];

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{label}</span>
);

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [editInsurance, setEditInsurance] = useState<Insurance | null>(null);
  const [insuranceForm, setInsuranceForm] = useState({ vehicleId: 0, policyNumber: '', provider: '', type: 'comprehensive' as Insurance['type'], startDate: '', endDate: '', premium: 0, coverageDetails: '', notes: '' });
  const [insuranceFormLoading, setInsuranceFormLoading] = useState(false);
  const [insuranceFormError, setInsuranceFormError] = useState<string | null>(null);

  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [editTraining, setEditTraining] = useState<Training | null>(null);
  const [trainingForm, setTrainingForm] = useState({ driverId: 0, type: 'defensive_driving' as Training['type'], title: '', provider: '', completionDate: '', expiryDate: '', certificateUrl: '', score: null as number | null, notes: '' });
  const [trainingFormLoading, setTrainingFormLoading] = useState(false);
  const [trainingFormError, setTrainingFormError] = useState<string | null>(null);

  const DEMO_INSURANCES: Insurance[] = [
    { id: 1, vehicleId: 81, policyNumber: 'POL-2024-001', provider: 'SIC Insurance', type: 'comprehensive', startDate: '2024-01-15', endDate: '2025-01-14', premium: 4500, coverageDetails: 'Full comprehensive coverage including third-party liability, fire, theft, and vandalism', documents: null, isActive: true, notes: null, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 2, vehicleId: 82, policyNumber: 'POL-2024-002', provider: 'Star Assurance', type: 'third_party', startDate: '2024-03-01', endDate: '2025-02-28', premium: 1800, coverageDetails: 'Third-party liability only', documents: null, isActive: true, notes: 'Basic coverage', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z' },
    { id: 3, vehicleId: 83, policyNumber: 'POL-2024-003', provider: 'Enterprise Insurance', type: 'liability', startDate: '2024-06-01', endDate: '2024-12-31', premium: 2200, coverageDetails: 'Public liability and employee injury coverage', documents: null, isActive: true, notes: null, createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
    { id: 4, vehicleId: 84, policyNumber: 'POL-2024-004', provider: 'Hollard Insurance', type: 'collision', startDate: '2024-02-15', endDate: '2025-02-14', premium: 3200, coverageDetails: 'Collision damage waiver and comprehensive add-on', documents: null, isActive: true, notes: 'High-value vehicle coverage', createdAt: '2024-02-15T00:00:00Z', updatedAt: '2024-02-15T00:00:00Z' },
    { id: 5, vehicleId: 85, policyNumber: 'POL-2024-005', provider: 'SIC Insurance', type: 'comprehensive', startDate: '2024-04-10', endDate: '2025-04-09', premium: 5100, coverageDetails: 'Full comprehensive with passenger liability', documents: null, isActive: false, notes: 'Cancelled - switched provider', createdAt: '2024-04-10T00:00:00Z', updatedAt: '2024-10-15T00:00:00Z' },
    { id: 6, vehicleId: 86, policyNumber: 'POL-2025-006', provider: 'Allianz Ghana', type: 'comprehensive', startDate: '2025-01-01', endDate: '2025-12-31', premium: 3800, coverageDetails: 'Comprehensive coverage with roadside assistance and rental car benefit', documents: null, isActive: true, notes: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 7, vehicleId: 87, policyNumber: 'POL-2025-007', provider: 'Ghana First Insurance', type: 'third_party', startDate: '2025-03-15', endDate: '2026-03-14', premium: 1500, coverageDetails: 'Third-party bodily injury and property damage liability', documents: null, isActive: true, notes: 'Budget-friendly renewal', createdAt: '2025-03-15T00:00:00Z', updatedAt: '2025-03-15T00:00:00Z' },
  ];

  const DEMO_TRAININGS: Training[] = [
    { id: 1, driverId: 1, type: 'defensive_driving', title: 'Advanced Defensive Driving Course', provider: 'DVLA Ghana', completionDate: '2024-03-15', expiryDate: '2026-03-15', certificateUrl: null, score: 92, notes: null, createdAt: '2024-03-15T00:00:00Z', updatedAt: '2024-03-15T00:00:00Z' },
    { id: 2, driverId: 1, type: 'safety', title: 'Workplace Safety & HSE Training', provider: 'OSHA Compliance', completionDate: '2024-06-20', expiryDate: '2025-06-20', certificateUrl: null, score: 88, notes: 'Annual safety refresher required', createdAt: '2024-06-20T00:00:00Z', updatedAt: '2024-06-20T00:00:00Z' },
    { id: 3, driverId: 2, type: 'certification', title: 'Hazardous Materials Handling', provider: 'EPA Ghana', completionDate: '2024-02-10', expiryDate: '2025-02-10', certificateUrl: null, score: 95, notes: null, createdAt: '2024-02-10T00:00:00Z', updatedAt: '2024-02-10T00:00:00Z' },
    { id: 4, driverId: 2, type: 'refresher', title: 'Fleet Safety Refresher Q1', provider: 'Internal', completionDate: '2024-01-05', expiryDate: null, certificateUrl: null, score: 78, notes: 'Needs improvement on speed awareness', createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z' },
    { id: 5, driverId: 3, type: 'defensive_driving', title: 'Advanced Defensive Driving Refresher', provider: 'DVLA Ghana', completionDate: '2024-08-01', expiryDate: '2026-08-01', certificateUrl: null, score: 90, notes: null, createdAt: '2024-08-01T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z' },
    { id: 6, driverId: 3, type: 'compliance', title: 'Fleet Compliance & Regulations', provider: 'Transport Ministry', completionDate: '2024-04-18', expiryDate: '2025-04-18', certificateUrl: null, score: 85, notes: null, createdAt: '2024-04-18T00:00:00Z', updatedAt: '2024-04-18T00:00:00Z' },
    { id: 7, driverId: 4, type: 'safety', title: 'Emergency Response Training', provider: 'Red Cross Ghana', completionDate: '2024-07-22', expiryDate: '2026-07-22', certificateUrl: null, score: 91, notes: null, createdAt: '2024-07-22T00:00:00Z', updatedAt: '2024-07-22T00:00:00Z' },
    { id: 8, driverId: 4, type: 'other', title: 'Customer Service for Drivers', provider: 'Internal', completionDate: '2024-09-05', expiryDate: null, certificateUrl: null, score: 84, notes: 'Soft skills training', createdAt: '2024-09-05T00:00:00Z', updatedAt: '2024-09-05T00:00:00Z' },
  ];

  const loadInsurances = useCallback(async () => {
    try { const data = await insuranceService.getAll(); setInsurances(data.length ? data : DEMO_INSURANCES); }
    catch { setInsurances(DEMO_INSURANCES); }
  }, []);
  const loadTrainings = useCallback(async () => {
    try { const data = await trainingService.getAll(); setTrainings(data.length ? data : DEMO_TRAININGS); }
    catch { setTrainings(DEMO_TRAININGS); }
  }, []);
  const loadVehicles = useCallback(async () => {
    try { const data = await vehicleService.getAll(); setVehicles(data.length ? data : []); }
    catch { setVehicles([]); }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadInsurances(), loadTrainings(), loadVehicles()]);
    setLoading(false);
  }, [loadInsurances, loadTrainings, loadVehicles]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const expiringSoon30 = insurances.filter(i => {
    const days = dayjs(i.endDate).diff(dayjs(), 'day');
    return days >= 0 && days <= 30;
  });
  const activePolicies = insurances.filter(i => i.isActive && new Date(i.endDate) > new Date()).length;
  const totalPremium = insurances.reduce((s, i) => s + i.premium, 0);

  const getVehiclePlate = (id: number) => vehicles.find(v => v.id === id)?.plateNumber || `V#${id}`;

  const openAddInsurance = () => {
    setEditInsurance(null);
    setInsuranceForm({ vehicleId: 0, policyNumber: '', provider: '', type: 'comprehensive', startDate: '', endDate: '', premium: 0, coverageDetails: '', notes: '' });
    setInsuranceFormError(null);
    setShowInsuranceModal(true);
  };
  const openEditInsurance = (i: Insurance) => {
    setEditInsurance(i);
    setInsuranceForm({ vehicleId: i.vehicleId, policyNumber: i.policyNumber, provider: i.provider, type: i.type, startDate: i.startDate, endDate: i.endDate, premium: i.premium, coverageDetails: i.coverageDetails || '', notes: i.notes || '' });
    setInsuranceFormError(null);
    setShowInsuranceModal(true);
  };
  const handleInsuranceSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setInsuranceFormLoading(true); setInsuranceFormError(null);
    try {
      if (editInsurance) await insuranceService.update(editInsurance.id, insuranceForm);
      else await insuranceService.create(insuranceForm as any);
      await loadInsurances(); setShowInsuranceModal(false);
    } catch (err: any) {
      setInsuranceFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setInsuranceFormLoading(false); }
  };
  const handleInsuranceDelete = async (i: Insurance) => {
    if (!window.confirm(`Delete insurance policy ${i.policyNumber}?`)) return;
    try { await insuranceService.delete(i.id); await loadInsurances(); }
    catch (err: any) { /* ignore */ }
  };

  const openAddTraining = () => {
    setEditTraining(null);
    setTrainingForm({ driverId: 0, type: 'defensive_driving', title: '', provider: '', completionDate: '', expiryDate: '', certificateUrl: '', score: null, notes: '' });
    setTrainingFormError(null);
    setShowTrainingModal(true);
  };
  const openEditTraining = (t: Training) => {
    setEditTraining(t);
    setTrainingForm({ driverId: t.driverId, type: t.type, title: t.title, provider: t.provider || '', completionDate: t.completionDate, expiryDate: t.expiryDate || '', certificateUrl: t.certificateUrl || '', score: t.score, notes: t.notes || '' });
    setTrainingFormError(null);
    setShowTrainingModal(true);
  };
  const handleTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setTrainingFormLoading(true); setTrainingFormError(null);
    try {
      if (editTraining) await trainingService.update(editTraining.id, trainingForm);
      else await trainingService.create(trainingForm as any);
      await loadTrainings(); setShowTrainingModal(false);
    } catch (err: any) {
      setTrainingFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally { setTrainingFormLoading(false); }
  };
  const handleTrainingDelete = async (t: Training) => {
    if (!window.confirm(`Delete training record "${t.title}"?`)) return;
    try { await trainingService.delete(t.id); await loadTrainings(); }
    catch (err: any) { /* ignore */ }
  };

  if (loading && insurances.length === 0 && trainings.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <img
            src={CYTRACK_LOGO.url}
            alt={CYTRACK_LOGO.alt}
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ display: 'grid', gap: 2 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Documents & Compliance</div>
            <div style={{ fontSize: 14, color: 'var(--text3)' }}>Manage insurance policies, driver certifications, and vehicle registrations</div>
          </div>
        </div>
        <button style={btnPrimary} onClick={loadAll}><i className="las la-sync" style={{ fontSize: 14 }}></i> Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: 'transparent', color: activeTab === i ? 'var(--accent)' : 'var(--text3)',
            borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className={`ti ${i === 0 ? 'ti-shield-check' : i === 1 ? 'ti-certificate' : 'ti-clipboard-list'}`} style={{ fontSize: 14 }}></i>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Active Policies', value: activePolicies, color: '#22c55e', icon: 'ti-shield-check' },
              { label: 'Expiring Soon (30d)', value: expiringSoon30.length, color: '#f59e0b', icon: 'ti-alert-triangle' },
              { label: 'Total Premium / Year', value: `GHS ${totalPremium.toLocaleString()}`, color: '#3b82f6', icon: 'ti-currency-dollar' },
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
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={btnPrimary} onClick={openAddInsurance}><i className="las la-plus" style={{ fontSize: 14 }}></i> Add Policy</button>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    <th style={hdrStyle}>Vehicle</th>
                    <th style={hdrStyle}>Policy #</th>
                    <th style={hdrStyle}>Provider</th>
                    <th style={hdrStyle}>Type</th>
                    <th style={hdrStyle}>Start</th>
                    <th style={hdrStyle}>End</th>
                    <th style={hdrStyle}>Premium</th>
                    <th style={hdrStyle}>Status</th>
                    <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {insurances.map(i => {
                    const isExpiring = i.isActive && dayjs(i.endDate).diff(dayjs(), 'day') >= 0 && dayjs(i.endDate).diff(dayjs(), 'day') <= 30;
                    return (
                      <tr key={i.id} onClick={() => setSelectedInsurance(i)} style={{ borderLeft: isExpiring ? '3px solid #f59e0b' : '3px solid transparent', transition: 'background 0.1s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={cellStyle}>{getVehiclePlate(i.vehicleId)}</td>
                        <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{i.policyNumber}</td>
                        <td style={cellStyle}>{i.provider}</td>
                        <td style={cellStyle}>{badge(INSURANCE_TYPE_LABELS[i.type] || i.type, INSURANCE_TYPE_COLORS[i.type] || '#64748b')}</td>
                        <td style={{ ...cellStyle, fontSize: 12 }}>{dayjs(i.startDate).format('DD/MM/YYYY')}</td>
                        <td style={{ ...cellStyle, fontSize: 12, color: isExpiring ? '#f59e0b' : 'var(--text)' }}>{dayjs(i.endDate).format('DD/MM/YYYY')}</td>
                        <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>GHS {i.premium.toLocaleString()}</td>
                        <td style={cellStyle}>{badge(i.isActive ? 'Active' : 'Inactive', i.isActive ? '#22c55e' : '#64748b')}</td>
                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                            <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEditInsurance(i)}><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                            <button style={{ ...btn, padding: '5px 10px', color: '#ef4444' }} onClick={() => handleInsuranceDelete(i)}><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {insurances.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No insurance policies found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={btnPrimary} onClick={openAddTraining}><i className="las la-plus" style={{ fontSize: 14 }}></i> Add Training Record</button>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    <th style={hdrStyle}>Driver ID</th>
                    <th style={hdrStyle}>Title</th>
                    <th style={hdrStyle}>Type</th>
                    <th style={hdrStyle}>Provider</th>
                    <th style={hdrStyle}>Completion</th>
                    <th style={hdrStyle}>Expiry</th>
                    <th style={hdrStyle}>Score</th>
                    <th style={{ ...hdrStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.map(t => (
                    <tr key={t.id} onClick={() => setSelectedTraining(t)} style={{ transition: 'background 0.1s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...cellStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>D#{t.driverId}</td>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 500 }}>{t.title}</div>
                      </td>
                      <td style={cellStyle}>{badge(TRAINING_TYPE_LABELS[t.type] || t.type, TRAINING_TYPE_COLORS[t.type] || '#64748b')}</td>
                      <td style={cellStyle}>{t.provider || '-'}</td>
                      <td style={{ ...cellStyle, fontSize: 12 }}>{dayjs(t.completionDate).format('DD/MM/YYYY')}</td>
                      <td style={{ ...cellStyle, fontSize: 12, color: t.expiryDate && dayjs(t.expiryDate).diff(dayjs(), 'day') <= 30 && dayjs(t.expiryDate).diff(dayjs(), 'day') >= 0 ? '#f59e0b' : 'var(--text)' }}>
                        {t.expiryDate ? dayjs(t.expiryDate).format('DD/MM/YYYY') : '-'}
                      </td>
                      <td style={cellStyle}>
                        {t.score !== null ? (
                          <span style={{ fontWeight: 600, color: t.score >= 90 ? '#22c55e' : t.score >= 75 ? '#f59e0b' : '#ef4444' }}>{t.score}%</span>
                        ) : '-'}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                          <button style={{ ...btn, padding: '5px 10px' }} onClick={() => openEditTraining(t)}><i className="las la-edit" style={{ fontSize: 14 }}></i></button>
                          <button style={{ ...btn, padding: '5px 10px', color: '#ef4444' }} onClick={() => handleTrainingDelete(t)}><i className="las la-trash-alt" style={{ fontSize: 14 }}></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {trainings.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No training records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No vehicles found for registration display</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {vehicles.map(v => {
                const regDate = v.registrationDate ? dayjs(v.registrationDate) : null;
                const daysUntilExpiry = regDate ? 365 - dayjs().diff(regDate, 'day') : null;
                return (
                  <div key={v.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="las la-truck" style={{ fontSize: 20, color: '#3b82f6' }}></i>
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{v.plateNumber}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.brand} {v.model} &middot; {v.year}</div>
                        </div>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: v.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(92,111,138,0.12)', color: v.isActive ? '#22c55e' : '#64748b' }}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Registration Date</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{v.registrationDate ? dayjs(v.registrationDate).format('DD/MM/YYYY') : '-'}</div>
                      </div>
                      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Days Until Expiry</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: daysUntilExpiry !== null && daysUntilExpiry <= 30 ? '#f59e0b' : 'var(--text)', marginTop: 2 }}>
                          {daysUntilExpiry !== null ? daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired' : '-'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="las la-file-text" style={{ fontSize: 14, color: 'var(--text3)' }}></i>
                      {v.registrationDoc ? (
                        <a href={v.registrationDoc} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>View Registration Doc</a>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>No registration document</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showInsuranceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleInsuranceSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editInsurance ? 'Edit Insurance Policy' : 'Add Insurance Policy'}</div>
                <button type="button" onClick={() => setShowInsuranceModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {insuranceFormError && (
                  <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{insuranceFormError}</div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Vehicle ID</label>
                    <input type="number" required value={insuranceForm.vehicleId || ''} onChange={e => setInsuranceForm({ ...insuranceForm, vehicleId: parseInt(e.target.value) || 0 })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Policy Number</label>
                    <input required value={insuranceForm.policyNumber} onChange={e => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Provider</label>
                    <input required value={insuranceForm.provider} onChange={e => setInsuranceForm({ ...insuranceForm, provider: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select value={insuranceForm.type} onChange={e => setInsuranceForm({ ...insuranceForm, type: e.target.value as Insurance['type'] })} style={inputStyle}>
                      <option value="comprehensive">Comprehensive</option>
                      <option value="third_party">Third Party</option>
                      <option value="liability">Liability</option>
                      <option value="collision">Collision</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" required value={insuranceForm.startDate} onChange={e => setInsuranceForm({ ...insuranceForm, startDate: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" required value={insuranceForm.endDate} onChange={e => setInsuranceForm({ ...insuranceForm, endDate: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Premium (GHS)</label>
                    <input type="number" required value={insuranceForm.premium || ''} onChange={e => setInsuranceForm({ ...insuranceForm, premium: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Coverage Details</label>
                    <textarea value={insuranceForm.coverageDetails} onChange={e => setInsuranceForm({ ...insuranceForm, coverageDetails: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={insuranceForm.notes} onChange={e => setInsuranceForm({ ...insuranceForm, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowInsuranceModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: insuranceFormLoading ? 0.6 : 1 }} disabled={insuranceFormLoading}>
                  {insuranceFormLoading ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editInsurance ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTrainingModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <form onSubmit={handleTrainingSubmit}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{editTraining ? 'Edit Training Record' : 'Add Training Record'}</div>
                <button type="button" onClick={() => setShowTrainingModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                {trainingFormError && (
                  <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--danger)' }}><i className="las la-exclamation-triangle" style={{ marginRight: 6 }}></i>{trainingFormError}</div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Driver ID</label>
                    <input type="number" required value={trainingForm.driverId || ''} onChange={e => setTrainingForm({ ...trainingForm, driverId: parseInt(e.target.value) || 0 })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select value={trainingForm.type} onChange={e => setTrainingForm({ ...trainingForm, type: e.target.value as Training['type'] })} style={inputStyle}>
                      <option value="defensive_driving">Defensive Driving</option>
                      <option value="safety">Safety</option>
                      <option value="certification">Certification</option>
                      <option value="refresher">Refresher</option>
                      <option value="compliance">Compliance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Title</label>
                    <input required value={trainingForm.title} onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Provider</label>
                    <input value={trainingForm.provider} onChange={e => setTrainingForm({ ...trainingForm, provider: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Score</label>
                    <input type="number" value={trainingForm.score ?? ''} onChange={e => setTrainingForm({ ...trainingForm, score: e.target.value ? parseInt(e.target.value) : null })} min={0} max={100} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Completion Date</label>
                    <input type="date" required value={trainingForm.completionDate} onChange={e => setTrainingForm({ ...trainingForm, completionDate: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Expiry Date</label>
                    <input type="date" value={trainingForm.expiryDate} onChange={e => setTrainingForm({ ...trainingForm, expiryDate: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Certificate URL</label>
                    <input value={trainingForm.certificateUrl} onChange={e => setTrainingForm({ ...trainingForm, certificateUrl: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={trainingForm.notes} onChange={e => setTrainingForm({ ...trainingForm, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" style={btn} onClick={() => setShowTrainingModal(false)}>Cancel</button>
                <button type="submit" style={{ ...btnPrimary, opacity: trainingFormLoading ? 0.6 : 1 }} disabled={trainingFormLoading}>
                  {trainingFormLoading ? <i className="las la-spinner" style={{ fontSize: 14, animation: 'spin 0.8s linear infinite' }}></i> : <i className="las la-save" style={{ fontSize: 14 }}></i>}
                  {editTraining ? ' Update' : ' Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInsurance && !showInsuranceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={() => setSelectedInsurance(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Insurance Policy Details</div>
              <button type="button" onClick={() => setSelectedInsurance(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Vehicle</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{getVehiclePlate(selectedInsurance.vehicleId)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Policy Number</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default', fontFamily: "'JetBrains Mono', monospace" }}>{selectedInsurance.policyNumber}</div>
                </div>
                <div>
                  <div style={labelStyle}>Provider</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{selectedInsurance.provider}</div>
                </div>
                <div>
                  <div style={labelStyle}>Type</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{badge(INSURANCE_TYPE_LABELS[selectedInsurance.type] || selectedInsurance.type, INSURANCE_TYPE_COLORS[selectedInsurance.type] || '#64748b')}</div>
                </div>
                <div>
                  <div style={labelStyle}>Status</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{badge(selectedInsurance.isActive ? 'Active' : 'Inactive', selectedInsurance.isActive ? '#22c55e' : '#64748b')}</div>
                </div>
                <div>
                  <div style={labelStyle}>Start Date</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{dayjs(selectedInsurance.startDate).format('DD/MM/YYYY')}</div>
                </div>
                <div>
                  <div style={labelStyle}>End Date</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{dayjs(selectedInsurance.endDate).format('DD/MM/YYYY')}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Premium (GHS)</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default', fontFamily: "'JetBrains Mono', monospace" }}>GHS {selectedInsurance.premium.toLocaleString()}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Coverage Details</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default', minHeight: 60, whiteSpace: 'pre-wrap' }}>{selectedInsurance.coverageDetails || '-'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Notes</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default', minHeight: 40, whiteSpace: 'pre-wrap' }}>{selectedInsurance.notes || '-'}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" style={btn} onClick={() => setSelectedInsurance(null)}>Close</button>
              <button type="button" style={btnPrimary} onClick={() => { setSelectedInsurance(null); openEditInsurance(selectedInsurance); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {selectedTraining && !showTrainingModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }} onClick={() => setSelectedTraining(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Training Record Details</div>
              <button type="button" onClick={() => setSelectedTraining(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}><i className="las la-times"></i></button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={labelStyle}>Driver ID</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default', fontFamily: "'JetBrains Mono', monospace" }}>D#{selectedTraining.driverId}</div>
                </div>
                <div>
                  <div style={labelStyle}>Type</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{badge(TRAINING_TYPE_LABELS[selectedTraining.type] || selectedTraining.type, TRAINING_TYPE_COLORS[selectedTraining.type] || '#64748b')}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Title</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{selectedTraining.title}</div>
                </div>
                <div>
                  <div style={labelStyle}>Provider</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{selectedTraining.provider || '-'}</div>
                </div>
                <div>
                  <div style={labelStyle}>Score</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>
                    {selectedTraining.score !== null ? (
                      <span style={{ fontWeight: 600, color: selectedTraining.score >= 90 ? '#22c55e' : selectedTraining.score >= 75 ? '#f59e0b' : '#ef4444' }}>{selectedTraining.score}%</span>
                    ) : '-'}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Completion Date</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{dayjs(selectedTraining.completionDate).format('DD/MM/YYYY')}</div>
                </div>
                <div>
                  <div style={labelStyle}>Expiry Date</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>{selectedTraining.expiryDate ? dayjs(selectedTraining.expiryDate).format('DD/MM/YYYY') : '-'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Certificate URL</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default' }}>
                    {selectedTraining.certificateUrl ? (
                      <a href={selectedTraining.certificateUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>{selectedTraining.certificateUrl}</a>
                    ) : '-'}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>Notes</div>
                  <div style={{ ...inputStyle, background: 'var(--bg3)', cursor: 'default', minHeight: 40, whiteSpace: 'pre-wrap' }}>{selectedTraining.notes || '-'}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" style={btn} onClick={() => setSelectedTraining(null)}>Close</button>
              <button type="button" style={btnPrimary} onClick={() => { setSelectedTraining(null); openEditTraining(selectedTraining); }}>Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
