import AnalystHeader from "../../Components/navbar/AnalystHeader";
import { ArrowLeft, Paperclip, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../../Components/design/AnalystCaseUpdate.css";

const normalizeTrackingId = (value) => String(value || "").trim().toUpperCase().replace(/\s+/g, "");

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-CA");
};

export default function AnalystCaseUpdate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [caseId, setCaseId] = useState(searchParams.get("trackingId") || "");
  const [incident, setIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [localNotes, setLocalNotes] = useState([]);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");
  const noteInputRef = useRef(null);

  const loadIncident = useCallback(async (trackingIdValue) => {
    const normalized = normalizeTrackingId(trackingIdValue);
    if (!normalized) {
      setIncident(null);
      setError("Enter a valid case ID to view an incident report.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axiosClient.get("/incidents", { params: { limit: 200 } });
      const matches = response.data.incidents || [];
      const found = matches.find((item) => normalizeTrackingId(item.trackingId) === normalized);

      if (!found) {
        throw new Error("No incident matches that case ID.");
      }

      setIncident(found);
      setCaseId(found.trackingId);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("trackingId", found.trackingId);
      setSearchParams(nextParams, { replace: true });
    } catch (requestError) {
      setIncident(null);
      setError(requestError.response?.data?.message || requestError.message || "Unable to load this case.");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const trackingIdFromUrl = searchParams.get("trackingId");
    if (trackingIdFromUrl) {
      setCaseId(trackingIdFromUrl);
      loadIncident(trackingIdFromUrl);
    }
  }, [loadIncident, searchParams]);

  const statusTone = useMemo(() => {
    if (!incident) return "review";
    return String(incident.status).toLowerCase().replace(/\s+/g, "-");
  }, [incident]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadIncident(caseId);
  };

  useEffect(() => {
    setLocalNotes(Array.isArray(incident?.notes) ? incident.notes : []);
    setNoteDraft("");
  }, [incident]);

  useEffect(() => {
    if (!noteInputRef.current) return;
    noteInputRef.current.style.height = "auto";
    noteInputRef.current.style.height = `${Math.max(noteInputRef.current.scrollHeight, 88)}px`;
  }, [noteDraft]);

  const addInternalNote = async () => {
    const trimmed = noteDraft.trim();
    if (!trimmed || !incident?._id || isSavingNote) return;

    setIsSavingNote(true);
    setNoteError("");
    try {
      const response = await axiosClient.post(`/incidents/${incident._id}/notes`, { text: trimmed });
      const savedNotes = Array.isArray(response.data.notes) ? response.data.notes : [];
      setLocalNotes(savedNotes);
      setIncident((currentIncident) => currentIncident ? { ...currentIncident, notes: savedNotes } : currentIncident);
      setNoteDraft("");
    } catch (requestError) {
      setNoteError(requestError.response?.data?.message || "Unable to save this note. Please try again.");
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <>
      <AnalystHeader />

      <main className="analyst-case-update">
        <div className="case-update-shell">
          <div className="case-update-topbar">
            <a href="/analyst" aria-label="Back to dashboard">
              <ArrowLeft size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Back to Dashboard
            </a>
          </div>

          <form className="case-id-search" onSubmit={handleSubmit}>
            <label htmlFor="case-id-input">Case ID</label>
            <div className="case-id-search-row">
              <input
                id="case-id-input"
                value={caseId}
                onChange={(event) => setCaseId(event.target.value)}
                placeholder="Enter case ID"
                aria-label="Case ID"
              />
              <button type="submit" className="inline-action" disabled={isLoading}>
                {isLoading ? "Loading..." : "View Case"}
              </button>
            </div>
          </form>

          {error && <p className="case-load-error" role="alert">{error}</p>}

          {!incident && !isLoading && !error && (
            <div className="case-empty-state">Choose a case from the dashboard or enter a valid tracking ID to review it here.</div>
          )}

          {incident && (
            <>
              <header className="case-update-header">
                <div className="case-header-meta">
                  <span className="case-id">{incident.trackingId}</span>
                  <span className="case-type-tag">{incident.category}</span>
                </div>

                <div className="case-title-row">
                  <h1 className="case-title">{incident.title}</h1>

                  <div className="case-status-stack">
                    <span className={`status-pill ${statusTone}`}>
                      <span className="dot" />
                      {incident.status}
                    </span>
                  </div>
                </div>

                <div className="case-divider" />
              </header>

              <section className="case-panel">
                <div className="case-summary-card">
                  <h2 className="section-label">Incident Description &amp; Narrative</h2>
                  <p>{incident.narrative || "No narrative description provided."}</p>
                </div>

                <div className="meta-grid">
                  <div className="meta-item">
                    <span>Complainant</span>
                    <strong>{incident.complainantName || "Anonymous"}</strong>
                  </div>
                  <div className="meta-item">
                    <span>Contact Details</span>
                    <strong>{incident.complainantContact || incident.complainantEmail || "N/A"}</strong>
                  </div>
                  <div className="meta-item">
                    <span>Incident Date</span>
                    <strong>{formatDisplayDate(incident.incidentDate)}</strong>
                  </div>
                  <div className="meta-item">
                    <span>Date Filed</span>
                    <strong>{formatDisplayDate(incident.createdAt)}</strong>
                  </div>
                </div>

                <div className="case-content-grid">
                  <div className="content-card evidence-panel">
                    <div className="evidence-top">
                      <div>
                        <h3>Digital Evidence Files &amp; Integrity Verification</h3>
                        <p className="secondary-text">
                          Securely stored evidence files. Recalculate SHA-256 checksum on demand to verify integrity and ensure compliance with internal standards.
                        </p>
                      </div>
                      <span className="attachment-badge">
                        <Paperclip size={14} />
                        Attached
                      </span>
                    </div>

                    <div className="secondary-text">Files: {incident.evidenceFiles?.length || 0}</div>

                    <div className="empty-file-box">
                      {incident.evidenceFiles?.length ? "Evidence file summary will appear here." : "No Files Attached To This Case"}
                    </div>

                    <div className="chain-log">
                      <div className="chain-log-header">
                        <h2>Chain of Custody Activity Log</h2>
                        <p>Sequential, cryptographically verified audit trail. Guaranteed append-only by database schema hooks</p>
                      </div>

                      <div className="chain-log-toolbar" aria-label="Log filters">
                        <span className="ledger-records">
                          <span className="ledger-dot" />
                          LEDGER RECORDS: {incident.evidenceFiles?.length || 0} TOTAL
                        </span>
                        <span className="append-only-pill" aria-label="Ledger is append-only">Append-Only</span>
                        <button type="button" className="log-action-pill">All Actions ({incident.notes?.length || 0})</button>
                        <button type="button" className="log-action-pill log-sort-pill">Oldest First</button>
                      </div>

                      <div className="chain-log-empty-box" aria-live="polite">
                        No audit entries matching the selected filter criteria
                      </div>
                    </div>
                  </div>

                  <aside className="status-panel">
                    <div className="status-box">
                      <h3>Investigation Status</h3>
                      <div className="status-line">
                        <span>Current State</span>
                        <strong>{incident.status}</strong>
                      </div>
                      <button type="button" className="inline-action">Update Case Status</button>
                    </div>

                    <div className="status-box notes-box">
                      <header>
                        <h3>Internal Notes ({localNotes.length})</h3>
                        <span className="secondary-text">Restricted to Staff</span>
                      </header>

                      <textarea
                        ref={noteInputRef}
                        className="note-input"
                        value={noteDraft}
                        onChange={(event) => setNoteDraft(event.target.value)}
                        placeholder="Log investigation notes, observation, or hypothesis..."
                      />
                      <button type="button" className="inline-action" onClick={addInternalNote} disabled={isSavingNote}>
                        <Plus size={15} style={{ marginRight: 6 }} />
                        {isSavingNote ? "Saving..." : "Add Internal Note"}
                      </button>
                      {noteError && <p className="note-save-error" role="alert">{noteError}</p>}

                      <div className="notes-list">
                        {localNotes.map((note, index) => (
                          <article className="note-card" key={`${note.author}-${index}`}>
                            <div className="note-meta">
                              <strong>{note.author}</strong>
                              <span>{formatDisplayDate(note.date)}</span>
                            </div>
                            <p>{note.text}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
