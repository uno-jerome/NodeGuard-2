import { useEffect, useState } from 'react';
import '../design/Admin/SessionProvisionLog.css';

const bookmark = 'https://www.figma.com/api/mcp/asset/00a97632-2c2e-4fed-8bc7-fe3f130900ac.svg';

const nameOf = ({ name, email }) => name?.trim() || email.split('@')[0];

export function useProvisioningLog() {
  const [entries, setEntries] = useState([]);
  const [toast, setToast] = useState(null);   

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    const addStaff = ({ name = '', email, role = 'Investigator' }) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const entry = { id: crypto.randomUUID(), name, email, role, time };
    setEntries((list) => [entry, ...list]);
    setToast({ type: 'added', entry });
  };
 
  const removeStaff = (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    setEntries((list) => list.filter((e) => e.id !== id));
    setToast({ type: 'removed', entry });
  };
 
  return { entries, addStaff, removeStaff, toast, clearToast: () => setToast(null) };
}
 
export function SessionProvisioningLog({ entries, onRemove }) {
  const [selected, setSelected] = useState(null);
  const toggle = (id) => setSelected((cur) => (cur === id ? null : id));
 
  return (
    <section className="spl">
      <header>
        <img src={bookmark} alt="" />
        <h2>Session Provisioning Log</h2>
        <span>{entries.length} added</span>
      </header>
 
      {entries.length === 0 ? (
        <p className="empty">No staff added yet</p>
      ) : (
        <ul>
          {entries.map((e) => (
            <li
              key={e.id}
              className={e.id === selected ? 'on' : ''}
              tabIndex={0}
              onClick={() => toggle(e.id)}
              onKeyDown={(ev) => {
                if (ev.target !== ev.currentTarget) return;
                if (ev.key === 'Enter') toggle(e.id);
                if (ev.key === 'Escape') setSelected(null);
              }}
            >
              <div className="who">
                <p>{nameOf(e)}</p>
                <p>{e.email}</p>
                <p>Role: {e.role}</p>
              </div>
              <div className="meta">
                <span className="badge">Active</span>
                <div className="slot">
                  {e.id === selected ? (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onRemove(e.id);
                      }}
                    >
                      Delete
                    </button>
                  ) : (
                    `Time: ${e.time}`
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
 
export function StaffToast({ toast, onClose }) {
  return (
    <div className={`spl-toast ${toast ? 'show' : ''} ${toast?.type ?? ''}`} onClick={onClose} role="status">
      {toast && (
        <>
          <b>{nameOf(toast.entry)}</b> {toast.type === 'added' ? 'was added to' : 'was removed from'} the session log
        </>
      )}
    </div>
  );
}