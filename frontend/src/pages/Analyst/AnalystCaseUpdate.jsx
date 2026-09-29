import AnalystHeader from "../../Components/navbar/AnalystHeader";
import { ArrowLeft, CheckCircle2, Download, Eye, Paperclip, Plus, ShieldCheck, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../../Components/design/AnalystCaseUpdate.css";

const INCIDENT_STATUSES = ["Reported", "Under Review", "Investigating", "Resolved", "Closed"];

const normalizeTrackingId = (value) => String(value || "").trim().toUpperCase().replace(/\s+/g, "");

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-CA");
};

const formatFileSize = (sizeValue) => {
  const bytes = Number(sizeValue);
  if (!Number.isFinite(bytes) || bytes < 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const getEvidencePreviewKind = (file) => {
  const mimeType = String(file.mimeType || "").toLowerCase();
  const extension = String(file.originalFilename || "").split(".").pop()?.toLowerCase();
  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg"].includes(extension)) return "image";
  if (mimeType === "application/pdf" || extension === "pdf") return "pdf";
  if (mimeType.startsWith("text/") || mimeType === "message/rfc822" || ["txt", "csv", "log", "eml"].includes(extension)) return "text";
  return "unsupported";
};

export default function AnalystCaseUpdate({ showHeader = true }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [caseId, setCaseId] = useState(searchParams.get("trackingId") || "");
  const [incident, setIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [localNotes, setLocalNotes] = useState([]);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [reportExportError, setReportExportError] = useState("");
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [isVerifyingEvidence, setIsVerifyingEvidence] = useState(false);
  const [evidenceVerification, setEvidenceVerification] = useState({});
  const [previewingFileId, setPreviewingFileId] = useState("");
  const [downloadingFileId, setDownloadingFileId] = useState("");
  const [evidenceActionError, setEvidenceActionError] = useState("");
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
      setEvidenceVerification(Object.fromEntries(
        (found.evidenceFiles || []).filter((file) => file?._id).map((file) => [file._id, file.verificationStatus || 'not-verified'])
      ));
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

  const updateCaseStatus = async (status) => {
    if (!incident?._id || isUpdatingStatus || status === incident.status) return;

    setIsUpdatingStatus(true);
    setStatusError("");
    try {
      const response = await axiosClient.patch(`/incidents/${incident._id}/status`, { status });
      setIncident((currentIncident) => currentIncident
        ? { ...currentIncident, status: response.data.incident.status }
        : currentIncident);
    } catch (requestError) {
      setStatusError(requestError.response?.data?.message || "Unable to update case status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
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

  useEffect(() => () => {
    if (evidencePreview?.url) URL.revokeObjectURL(evidencePreview.url);
  }, [evidencePreview]);

  const previewEvidenceFile = async (file) => {
    if (!file._id || previewingFileId) return;

    setPreviewingFileId(file._id);
    setEvidenceActionError("");
    try {
      const response = await axiosClient.get(`/evidence/${file._id}/download`, {
        params: { disposition: "inline" },
        responseType: "blob",
      });
      const kind = getEvidencePreviewKind(file);
      const preview = kind === "text"
        ? { file, kind, text: await response.data.text() }
        : { file, kind, url: URL.createObjectURL(response.data) };
      setEvidencePreview(preview);
    } catch {
      setEvidenceActionError(`Unable to preview ${file.originalFilename || "this file"}. Please try again.`);
    } finally {
      setPreviewingFileId("");
    }
  };

  const downloadEvidenceFile = async (file) => {
    if (!file._id || downloadingFileId) return;

    setDownloadingFileId(file._id);
    setEvidenceActionError("");
    try {
      const response = await axiosClient.get(`/evidence/${file._id}/download`, { responseType: "blob" });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.originalFilename || "evidence-file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch {
      setEvidenceActionError(`Unable to download ${file.originalFilename || "this file"}. Please try again.`);
    } finally {
      setDownloadingFileId("");
    }
  };

  const closeEvidencePreview = () => setEvidencePreview(null);

  const verifyEvidenceFiles = async () => {
    const files = incident?.evidenceFiles || [];
    if (!files.length || isVerifyingEvidence) return;

    setIsVerifyingEvidence(true);
    setEvidenceActionError("");
    setEvidenceVerification((current) => ({
      ...current,
      ...Object.fromEntries(files.filter((file) => file._id).map((file) => [file._id, "verifying"])),
    }));

    const results = await Promise.all(files.map(async (file) => {
      if (!file._id) return [file._id, "error"];
      try {
        const response = await axiosClient.post(`/evidence/${file._id}/verify`);
        const verificationStatus = response.data.verificationStatus || (response.data.match ? "verified" : "mismatch");
        return [file._id, verificationStatus];
      } catch {
        return [file._id, "error"];
      }
    }));

    const savedVerificationMap = Object.fromEntries(results);
    setEvidenceVerification((current) => ({ ...current, ...savedVerificationMap }));
    setIncident((currentIncident) => {
      if (!currentIncident) return currentIncident;
      return {
        ...currentIncident,
        evidenceFiles: (currentIncident.evidenceFiles || []).map((file) => {
          const updatedStatus = savedVerificationMap[file._id];
          if (!updatedStatus) return file;
          return {
            ...file,
            verificationStatus: updatedStatus,
            verifiedAt: new Date().toISOString(),
          };
        }),
      };
    });
    setIsVerifyingEvidence(false);
  };

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

  const exportIncidentReport = async () => {
    if (!incident?._id || isExportingReport) return;
    if (!["Resolved", "Closed"].includes(incident.status)) {
      setReportExportError("PDF export is available only when the case is resolved or closed.");
      return;
    }

    setIsExportingReport(true);
    setReportExportError("");
    try {
      const response = await axiosClient.get(`/incidents/${incident._id}/dossier`, { responseType: "blob" });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Dossier-${incident.trackingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch {
      setReportExportError("Unable to export this report. Please try again.");
    } finally {
      setIsExportingReport(false);
    }
  };

  return (
    <>
      {showHeader && <AnalystHeader />}

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
                      <div className="evidence-top-actions">
                        <span className="attachment-badge">
                          <Paperclip size={14} />
                          Attached
                        </span>
                        <button
                          type="button"
                          className="verify-evidence-button"
                          onClick={verifyEvidenceFiles}
                          disabled={!incident.evidenceFiles?.length || isVerifyingEvidence}
                        >
                          <ShieldCheck size={13} aria-hidden="true" />
                          {isVerifyingEvidence ? "Verifying..." : "Verify Evidence Integrity"}
                        </button>
                      </div>
                    </div>

                    <div className="secondary-text">Files: {incident.evidenceFiles?.length || 0}</div>
                    {evidenceActionError && <p className="evidence-action-error" role="alert">{evidenceActionError}</p>}

                    {incident.evidenceFiles?.length ? (
                      <div className="evidence-file-list" role="list" aria-label="Attached evidence files">
                        {incident.evidenceFiles.map((file, index) => (
                          <div className="evidence-file-item" role="listitem" key={file._id || file.originalFilename || index}>
                            <span className="evidence-file-icon"><Paperclip size={16} aria-hidden="true" /></span>
                            <span className="evidence-file-details">
                              <strong title={file.originalFilename}>{file.originalFilename || "Evidence file"}</strong>
                              <span>{formatFileSize(file.fileSize)} <span aria-hidden="true">·</span> {file.mimeType || "Unknown file type"}</span>
                              {(() => {
                                const verification = evidenceVerification[file._id] || "not-verified";
                                const VerificationIcon = verification === "verified" ? CheckCircle2 : verification === "mismatch" || verification === "error" ? XCircle : null;
                                const label = {
                                  "not-verified": "Not Verified",
                                  verifying: "Verifying...",
                                  verified: "Verified",
                                  mismatch: "Integrity Mismatch",
                                  error: "Could Not Verify",
                                }[verification];
                                return (
                                  <span className={`evidence-verification-status ${verification}`} role="status">
                                    {VerificationIcon && <VerificationIcon size={13} aria-hidden="true" />}
                                    {label}
                                  </span>
                                );
                              })()}
                            </span>
                            <span className="evidence-file-actions">
                              <button
                                type="button"
                                onClick={() => previewEvidenceFile(file)}
                                disabled={getEvidencePreviewKind(file) === "unsupported" || Boolean(previewingFileId)}
                                aria-label={`Preview ${file.originalFilename || "evidence file"}`}
                                title={getEvidencePreviewKind(file) === "unsupported" ? "Preview not available for this file type" : "Preview file"}
                              >
                                <Eye size={16} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadEvidenceFile(file)}
                                disabled={Boolean(downloadingFileId)}
                                aria-label={`Download ${file.originalFilename || "evidence file"}`}
                                title="Download file"
                              >
                                <Download size={16} aria-hidden="true" />
                              </button>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-file-box">No Files Attached To This Case</div>
                    )}

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
                        <strong className={`status-value status-${statusTone}`}>{incident.status}</strong>
                      </div>
                      <label className="status-select-label" htmlFor="case-status-select">Update Case Status</label>
                      <select
                        id="case-status-select"
                        className="status-select"
                        value={incident.status}
                        onChange={(event) => updateCaseStatus(event.target.value)}
                        disabled={isUpdatingStatus}
                        aria-describedby={statusError ? "case-status-error" : undefined}
                      >
                        {INCIDENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      {statusError && <p className="status-update-error" id="case-status-error" role="alert">{statusError}</p>}
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
                      {reportExportError && <p className="note-save-error" role="alert">{reportExportError}</p>}
                      <button
                        type="button"
                        className="inline-action notes-export-button"
                        onClick={exportIncidentReport}
                        disabled={isExportingReport}
                        title={["Resolved", "Closed"].includes(incident.status) ? "Export the case report as PDF" : "Resolve or close the case to enable PDF export"}
                      >
                        <Download size={15} aria-hidden="true" />
                        {isExportingReport ? "Exporting PDF..." : "Export PDF Report"}
                      </button>
                    </div>
                  </aside>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {evidencePreview && (
        <div className="analyst-evidence-preview-backdrop" onClick={closeEvidencePreview}>
          <section
            className="analyst-evidence-preview"
            role="dialog"
            aria-modal="true"
            aria-label={`Preview of ${evidencePreview.file.originalFilename || "evidence file"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="analyst-evidence-preview-header">
              <strong title={evidencePreview.file.originalFilename}>{evidencePreview.file.originalFilename || "Evidence preview"}</strong>
              <button type="button" onClick={closeEvidencePreview} aria-label="Close preview" title="Close preview">
                <X size={18} aria-hidden="true" />
              </button>
            </header>
            <div className="analyst-evidence-preview-content">
              {evidencePreview.kind === "image" && <img src={evidencePreview.url} alt={evidencePreview.file.originalFilename || "Evidence file preview"} />}
              {evidencePreview.kind === "pdf" && <iframe src={evidencePreview.url} title={`Preview of ${evidencePreview.file.originalFilename}`} />}
              {evidencePreview.kind === "text" && <pre>{evidencePreview.text}</pre>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
