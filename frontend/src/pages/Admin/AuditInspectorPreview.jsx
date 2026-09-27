import { useState } from 'react';
import AdminHeader from '../../Components/navbar/AdminHeader';
import { AuditLogInspectorModal, DEFAULT_LOG_ENTRY } from '../../Components/Elements/auditInspect';

export default function AuditInspectorPreview() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <AdminHeader />
      <div style={{
        minHeight: '100vh',
        background: '#030617',
        color: '#fff',
        padding: '32px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '760px',
          padding: '24px',
          borderRadius: '14px',
          border: '1px solid rgba(143, 171, 212, 0.8)',
          background: 'rgba(3, 6, 23, 0.75)',
          textAlign: 'center',
        }}>
          <h1 style={{ margin: '0 0 14px', fontSize: '28px' }}>Audit Inspector Preview</h1>
          <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.72)' }}>
            This is a dummy preview page for the deep inspection modal.
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Open modal
          </button>
        </div>
      </div>

      {open && <AuditLogInspectorModal entry={DEFAULT_LOG_ENTRY} onClose={() => setOpen(false)} />}
    </>
  );
}
