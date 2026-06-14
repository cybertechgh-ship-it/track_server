import { CYTRACK_LOGO } from '../constants/logo';
import api from '../services/api';

const printStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; color: #1a1a2e; padding: 40px; background: #fff; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 48px; height: 48px; border-radius: 10px; }
  .brand-name { font-size: 22px; font-weight: 700; color: #06120e; }
  .brand-tag { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 20px; font-weight: 700; color: #06120e; }
  .doc-title .doc-num { font-size: 13px; color: #6b7280; font-family: monospace; margin-top: 4px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  .meta-box { padding: 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; }
  .meta-label { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .meta-value { font-size: 14px; font-weight: 600; color: #1a1a2e; }
  .meta-value.muted { color: #6b7280; font-weight: 400; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f3f4f6; padding: 10px 14px; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border-bottom: 2px solid #e5e7eb; }
  td { padding: 12px 14px; font-size: 13px; color: #1a1a2e; border-bottom: 1px solid #f3f4f6; }
  .amount { text-align: right; font-family: monospace; font-weight: 600; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
  .totals-box { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #6b7280; }
  .totals-row.total { border-top: 2px solid #1a1a2e; padding-top: 12px; margin-top: 4px; font-size: 16px; font-weight: 700; color: #06120e; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge.paid { background: #dcfce7; color: #16a34a; }
  .badge.sent { background: #dbeafe; color: #2563eb; }
  .badge.overdue { background: #fee2e2; color: #dc2626; }
  .badge.draft { background: #f3f4f6; color: #6b7280; }
  .notes { padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; margin-bottom: 28px; }
  .notes-title { font-size: 11px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .notes-text { font-size: 13px; color: #78350f; line-height: 1.5; }
  .verification { margin-top: 32px; padding: 20px; border: 2px solid #06b6d4; border-radius: 12px; background: linear-gradient(135deg, rgba(6,182,212,0.04), rgba(6,182,212,0.01)); }
  .verification-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #e0f2fe; }
  .verification-icon { width: 28px; height: 28px; border-radius: 50%; background: #06b6d4; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }
  .verification-title { font-size: 13px; font-weight: 700; color: #0e7490; text-transform: uppercase; letter-spacing: 1px; }
  .verification-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .verification-row { display: flex; flex-direction: column; gap: 2px; }
  .verification-row .label { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.3px; }
  .verification-row .value { font-size: 12px; font-weight: 600; color: #1a1a2e; font-family: monospace; }
  .verification-row .value.time { color: #0e7490; }
  .verification-hash { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e0f2fe; font-size: 10px; color: #9ca3af; letter-spacing: 0.3px; }
  .verification-hash span { font-family: monospace; color: #0e7490; font-weight: 600; }
  .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
  .footer .cyber { font-weight: 700; color: #06120e; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .summary-card { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e5e7eb; }
  .summary-card .value { font-size: 20px; font-weight: 700; }
  .summary-card .label { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .highlights { margin-bottom: 24px; }
  .highlights-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
  .highlight-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .highlight-item::before { content: '\\2713'; color: #06b6d4; font-weight: 700; flex-shrink: 0; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none !important; }
    .verification { break-inside: avoid; }
  }
`;

async function getServerTime(): Promise<string> {
  try {
    const res = await api.get('/health');
    return res.data.timestamp || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function generateFingerprint(docId: string, serverTime: string): string {
  let hash = 0;
  const str = `${docId}|${serverTime}|cytrack-verified`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 4)}-${hex.slice(4)}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

function formatServerTimestamp(iso: string): { date: string; time: string; full: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }),
    full: d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }),
  };
}

function verificationStamp(docId: string, docLabel: string, serverTime: string): string {
  const ts = formatServerTimestamp(serverTime);
  const fingerprint = generateFingerprint(docId, serverTime);
  return `
    <div class="verification">
      <div class="verification-header">
        <div class="verification-icon">&#x1F512;</div>
        <div class="verification-title">Verified Document</div>
      </div>
      <div class="verification-grid">
        <div class="verification-row">
          <div class="label">Server Timestamp (UTC)</div>
          <div class="value time">${ts.full} UTC</div>
        </div>
        <div class="verification-row">
          <div class="label">Document</div>
          <div class="value">${docLabel}</div>
        </div>
        <div class="verification-row">
          <div class="label">Document ID</div>
          <div class="value">${docId}</div>
        </div>
        <div class="verification-row">
          <div class="label">Generated By</div>
          <div class="value">${CYTRACK_LOGO.brandName} Fleet Intelligence</div>
        </div>
      </div>
      <div class="verification-hash">Fingerprint: <span>${fingerprint}</span> &middot; This document was server-verified at ${ts.full} UTC</div>
    </div>
  `;
}

function openPrintWindow(html: string) {
  const win = window.open('', '_blank', 'width=800,height=600');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>Print</title><style>${printStyles}</style></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

const fmt = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dFmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export async function printInvoice(invoice: any) {
  const serverTime = await getServerTime();
  const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
  const html = `
    <div class="header">
      <div class="brand">
        <img src="${CYTRACK_LOGO.url}" alt="CyTrack" />
        <div>
          <div class="brand-name">${CYTRACK_LOGO.brandName}</div>
          <div class="brand-tag">${CYTRACK_LOGO.tagline}</div>
        </div>
      </div>
      <div class="doc-title">
        <h1>INVOICE</h1>
        <div class="doc-num">${invoice.invoiceNumber}</div>
      </div>
    </div>
    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Bill To</div>
        <div class="meta-value">${invoice.clientName}</div>
        ${invoice.clientEmail ? `<div class="meta-value muted">${invoice.clientEmail}</div>` : ''}
        ${invoice.clientAddress ? `<div class="meta-value muted">${invoice.clientAddress}</div>` : ''}
      </div>
      <div class="meta-box">
        <div class="meta-label">Details</div>
        <div class="meta-value">Status: <span class="badge ${invoice.status}">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span></div>
        <div class="meta-value muted" style="margin-top:6px">Due: ${dFmt(invoice.dueDate)}</div>
        ${invoice.paidAt ? `<div class="meta-value muted">Paid: ${dFmt(invoice.paidAt)}</div>` : ''}
      </div>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${items.map((item: any) => `
        <tr>
          <td>${item.desc}</td>
          <td>${item.qty}</td>
          <td class="amount">${fmt(item.rate)}</td>
          <td class="amount">${fmt(item.qty * item.rate)}</td>
        </tr>
      `).join('')}</tbody>
    </table>
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>${fmt(invoice.subtotal)}</span></div>
        <div class="totals-row"><span>Tax</span><span>${fmt(invoice.tax)}</span></div>
        <div class="totals-row total"><span>Total</span><span>${fmt(invoice.total)}</span></div>
      </div>
    </div>
    ${invoice.notes ? `<div class="notes"><div class="notes-title">Notes</div><div class="notes-text">${invoice.notes}</div></div>` : ''}
    ${verificationStamp(invoice.invoiceNumber, 'Invoice', serverTime)}
    <div class="footer"><span class="cyber">${CYTRACK_LOGO.brandName}</span> Fleet Intelligence Platform</div>
  `;
  openPrintWindow(html);
}

export async function printReceipt(payment: any) {
  const serverTime = await getServerTime();
  const receiptNum = `REC-${String(payment.id).padStart(4, '0')}`;
  const html = `
    <div class="header">
      <div class="brand">
        <img src="${CYTRACK_LOGO.url}" alt="CyTrack" />
        <div>
          <div class="brand-name">${CYTRACK_LOGO.brandName}</div>
          <div class="brand-tag">${CYTRACK_LOGO.tagline}</div>
        </div>
      </div>
      <div class="doc-title">
        <h1>PAYMENT RECEIPT</h1>
        <div class="doc-num">${receiptNum}</div>
      </div>
    </div>
    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Received From</div>
        <div class="meta-value">${payment.driverName}</div>
        <div class="meta-value muted">#${payment.driverId} &middot; ${payment.plateNumber}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Payment Details</div>
        <div class="meta-value" style="color:#16a34a;font-size:20px">${fmt(payment.amount)}</div>
        <div class="meta-value muted" style="margin-top:4px">Method: ${payment.method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
      <div class="meta-box">
        <div class="meta-label">Date</div>
        <div class="meta-value">${dFmt(payment.paidAt)}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Reference</div>
        <div class="meta-value" style="font-family:monospace">${payment.reference || '—'}</div>
      </div>
    </div>
    ${payment.notes ? `<div class="notes"><div class="notes-title">Notes</div><div class="notes-text">${payment.notes}</div></div>` : ''}
    ${verificationStamp(receiptNum, 'Payment Receipt', serverTime)}
    <div class="footer"><span class="cyber">${CYTRACK_LOGO.brandName}</span> Fleet Intelligence Platform</div>
  `;
  openPrintWindow(html);
}

export async function printReport(report: any) {
  const serverTime = await getServerTime();
  const docId = `RPT-${String(report.id || 0).padStart(4, '0')}`;
  const html = `
    <div class="header">
      <div class="brand">
        <img src="${CYTRACK_LOGO.url}" alt="CyTrack" />
        <div>
          <div class="brand-name">${CYTRACK_LOGO.brandName}</div>
          <div class="brand-tag">${CYTRACK_LOGO.tagline}</div>
        </div>
      </div>
      <div class="doc-title">
        <h1>${report.title}</h1>
        <div class="doc-num">${report.type} &middot; ${report.period}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap">
      <span class="badge sent">${report.format}</span>
      <span class="badge draft">${report.type}</span>
      <span class="badge draft">${report.fileSize || '—'}</span>
      ${report.generatedBy ? `<span class="badge draft">By ${report.generatedBy}</span>` : ''}
    </div>
    ${report.summary ? `
      <div class="summary-grid">
        ${report.summary.map((s: any) => `
          <div class="summary-card" style="background:${s.color}08;border-color:${s.color}20">
            <div class="value" style="color:${s.color}">${s.value}</div>
            <div class="label">${s.label}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    ${report.chartData ? `
      <div style="margin-bottom:24px">
        <table>
          <thead><tr><th>Category</th><th style="text-align:right">Value</th></tr></thead>
          <tbody>${report.chartData.map((c: any) => `
            <tr>
              <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c.color};margin-right:8px"></span>${c.name}</td>
              <td class="amount">${typeof c.value === 'number' && c.value > 1000 ? c.value.toLocaleString() : c.value}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    ` : ''}
    ${report.highlights ? `
      <div class="highlights">
        <div class="highlights-title">Key Highlights</div>
        ${report.highlights.map((h: string) => `<div class="highlight-item">${h}</div>`).join('')}
      </div>
    ` : ''}
    ${verificationStamp(docId, report.title, serverTime)}
    <div class="footer"><span class="cyber">${CYTRACK_LOGO.brandName}</span> Fleet Intelligence Platform</div>
  `;
  openPrintWindow(html);
}
