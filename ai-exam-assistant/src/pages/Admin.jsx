import React, { useEffect, useState } from 'react';
import { fetchAdminOverview, setAccountStatus } from '../data/api';

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    fetchAdminOverview().then((res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res);
    });
  };

  useEffect(load, []);

  const handleToggleStatus = async (account) => {
    const nextStatus = account.status === 'active' ? 'suspended' : 'active';
    await setAccountStatus(account.id, nextStatus);
    load();
  };

  if (error) {
    return (
      <main style={{ padding: '40px 48px' }}>
        <p style={{ color: 'var(--clay-deep)' }}>{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: '40px 48px' }}>
        <p style={{ color: 'var(--ink-soft)' }}>Loading usage reports…</p>
      </main>
    );
  }

  const { stats, accounts, errorLogs } = data;

  return (
    <main style={{ padding: '40px 48px' }}>
      <div className="eyebrow">UC-10 · Platform health</div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, margin: '8px 0 28px' }}>Usage reports</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Registered students" value={stats.registeredStudents.toLocaleString()} />
        <MetricCard label="Sessions today" value={stats.sessionsToday.toLocaleString()} />
        <MetricCard label="AI API calls (24h)" value={stats.aiCallsLast24h.toLocaleString()} />
        <MetricCard label="Failed AI calls" value={stats.failedAiCalls} tone="var(--clay-deep)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        {/* UC-11 — manage accounts */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 6 }}>Manage accounts</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>UC-11 · Suspend or reactivate a student account</p>
          {accounts.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No student accounts yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--ink-soft)', fontFamily: 'var(--mono)', fontSize: 10.5, textTransform: 'uppercase' }}>
                  <th style={{ paddingBottom: 10 }}>Student</th>
                  <th>Sessions</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 0' }}>{a.name}</td>
                    <td>{a.sessions}</td>
                    <td><span className={`pill pill-${a.status === 'active' ? 'sage' : 'clay'}`}>{a.status === 'active' ? 'Active' : 'Suspended'}</span></td>
                    <td>
                      <span style={{ color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 12 }} onClick={() => handleToggleStatus(a)}>
                        {a.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* UC-12 — error logs */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 6 }}>Error logs</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>UC-12 · Failed AI API calls</p>
          {errorLogs.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No errors recorded — everything's healthy.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {errorLogs.map((log, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper-dim)', borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 11.5 }}>
                  <span className="pill pill-clay" style={{ marginBottom: 4 }}>{log.code || 'ERR'}</span>
                  <br />
                  {log.endpoint} — {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, tone }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, marginTop: 8, color: tone }}>{value}</div>
    </div>
  );
}
