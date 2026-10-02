import AnalystHeader from "../../Components/navbar/AnalystHeader";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Copy, Download, Eye, Loader2, Paperclip, Plus, ShieldCheck, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import "../../Components/design/Analyst/AnalystCaseUpdate.css";

const INCIDENT_STATUSES = ["Reported", "Under Review", "Investigating", "Resolved", "Closed"];
const CUSTODY_LOGS_PER_PAGE = 5;

const normalizeTrackingId = (value) => String(value || "").trim().toUpperCase().replace(/\s+/g, "");

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-CA");
};

const formatLogTimestamp = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

const formatDisplayTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return `Verified at: ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [caseId, setCaseId] = useState(searchParams.get("trackingId") || "");
  const [incident, setIncident] = useState(null);
  const [custodyLogs, setCustodyLogs] = useState([]);
  const [isNewestFirst, setIsNewestFirst] = useState(false);
  const [custodyLogPage, setCustodyLogPage] = useState(1);
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
  const [previewCache, setPreviewCache] = useState({});
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [evidenceVerification, setEvidenceVerification] = useState({});
  const [evidenceVerificationResults, setEvidenceVerificationResults] = useState({});
  const [copiedHash, setCopiedHash] = useState("");
  const [previewingFileId, setPreviewingFileId] = useState("");
  const [downloadingFileId, setDownloadingFileId] = useState("");
  const [evidenceActionError, setEvidenceActionError] = useState("");
  const noteInputRef = useRef(null);
  const previewCacheRef = useRef({});
  const incidentAbortRef = useRef(null);
  const previewAbortRef = useRef(null);
  const verifyAbortRef = useRef(null);
  const downloadAbortRef = useRef(null);
  const exportAbortRef = useRef(null);
  const loadedTrackingIdRef = useRef("");

  const isProcessing = isVerifying || isLoadingPreview || Boolean(downloadingFileId);

  useEffect(() => {
    previewCacheRef.current = previewCache;
  }, [previewCache]);

  useEffect(() => {
    return () => {
      if (incidentAbortRef.current) incidentAbortRef.current.abort();
      if (previewAbortRef.current) previewAbortRef.current.abort();
      if (verifyAbortRef.current) verifyAbortRef.current.abort();
      if (downloadAbortRef.current) downloadAbortRef.current.abort();
      if (exportAbortRef.current) exportAbortRef.current.abort();

      Object.values(previewCacheRef.current).forEach((cached) => {
        if (cached?.url) {
          try {
            URL.revokeObjectURL(cached.url);
          } catch {
            // Ignore revoke errors
          }
        }
      });
    };
  }, []);

  const loadIncident = useCallback(async (trackingIdValue, signal) => {
    const normalized = normalizeTrackingId(trackingIdValue);
    if (!normalized) {
      setIncident(null);
      setCustodyLogs([]);
      setError("Enter a valid case ID to view an incident report.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axiosClient.get("/incidents", {
        params: { limit: 200 },
        signal,
      });
      const matches = response.data.incidents || [];
      const found = matches.find((item) => normalizeTrackingId(item.trackingId) === normalized);

      if (!found) {
        throw new Error("No incident matches that case ID.");
      }

      const detailsResponse = await axiosClient.get(`/incidents/${found._id}`, { signal });
      const caseDetails = detailsResponse.data.incident;
      setIncident(caseDetails);
      setCustodyLogs(Array.isArray(detailsResponse.data.custodyLogs) ? detailsResponse.data.custodyLogs : []);
      setCustodyLogPage(1);
      setEvidenceVerification(Object.fromEntries(
        (caseDetails.evidenceFiles || []).filter((file) => file?._id).map((file) => [file._id, file.verificationStatus || 'not-verified'])
      ));
      setEvidenceVerificationResults({});
      setCaseId(found.trackingId);
      loadedTrackingIdRef.current = found.trackingId;

      setSearchParams((prevParams) => {
        if (prevParams.get("trackingId") === caseDetails.trackingId) {
          return prevParams;
        }
        const next = new URLSearchParams(prevParams);
        next.set("trackingId", caseDetails.trackingId);
        return next;
      }, { replace: true });
    } catch (requestError) {
      if (signal?.aborted) return;
      setIncident(null);
      setCustodyLogs([]);
      setError(requestError.response?.data?.message || requestError.message || "Unable to load this case.");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [setSearchParams]);

  useEffect(() => {
    const trackingIdFromUrl = searchParams.get("trackingId");
    if (trackingIdFromUrl && trackingIdFromUrl !== loadedTrackingIdRef.current) {
      setCaseId(trackingIdFromUrl);

      if (incidentAbortRef.current) {
        incidentAbortRef.current.abort();
      }
      const controller = new AbortController();
      incidentAbortRef.current = controller;

      loadIncident(trackingIdFromUrl, controller.signal);

      return () => {
        controller.abort();
      };
    }
  }, [searchParams, loadIncident]);

  const statusTone = useMemo(() => {
    if (!incident) return "review";
    return String(incident.status).toLowerCase().replace(/\s+/g, "-");
  }, [incident]);

  const orderedCustodyLogs = useMemo(
    () => isNewestFirst ? [...custodyLogs].reverse() : custodyLogs,
    [custodyLogs, isNewestFirst]
  );
  const totalCustodyLogPages = Math.max(1, Math.ceil(orderedCustodyLogs.length / CUSTODY_LOGS_PER_PAGE));
  const visibleCustodyLogs = orderedCustodyLogs.slice(
    (custodyLogPage - 1) * CUSTODY_LOGS_PER_PAGE,
    custodyLogPage * CUSTODY_LOGS_PER_PAGE
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isLoading) return;
    const normalized = normalizeTrackingId(caseId);
    if (!normalized) return;

    if (incidentAbortRef.current) {
      incidentAbortRef.current.abort();
    }
    const controller = new AbortController();
    incidentAbortRef.current = controller;

    loadIncident(normalized, controller.signal);
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

  const previewEvidenceFile = async (file) => {
    if (!file?._id || isProcessing) return;

    const cached = previewCache[file._id];
    if (cached) {
      setEvidencePreview(cached);
      return;
    }

    setIsLoadingPreview(true);
    setPreviewingFileId(file._id);
    setEvidenceActionError("");

    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
    }
    const controller = new AbortController();
    previewAbortRef.current = controller;

    try {
      const response = await axiosClient.get(`/evidence/${file._id}/download`, {
        params: { disposition: "inline" },
        responseType: "blob",
        signal: controller.signal,
      });
      const kind = getEvidencePreviewKind(file);
      const preview = kind === "text"
        ? { file, kind, text: await response.data.text() }
        : { file, kind, url: URL.createObjectURL(response.data) };

      setPreviewCache((prev) => ({ ...prev, [file._id]: preview }));
      setEvidencePreview(preview);
    } catch {
      if (controller.signal.aborted) return;
      setEvidenceActionError(`Unable to preview ${file.originalFilename || "this file"}. Please try again.`);
    } finally {
      if (previewAbortRef.current === controller) {
        previewAbortRef.current = null;
      }
      setIsLoadingPreview(false);
      setPreviewingFileId("");
    }
  };

  const downloadEvidenceFile = async (file) => {
    if (!file?._id || isProcessing) return;

    setDownloadingFileId(file._id);
    setEvidenceActionError("");

    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort();
    }
    const controller = new AbortController();
    downloadAbortRef.current = controller;

    try {
      const response = await axiosClient.get(`/evidence/${file._id}/download`, {
        responseType: "blob",
        signal: controller.signal,
      });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.originalFilename || "evidence-file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch {
      if (controller.signal.aborted) return;
      setEvidenceActionError(`Unable to download ${file.originalFilename || "this file"}. Please try again.`);
    } finally {
      if (downloadAbortRef.current === controller) {
        downloadAbortRef.current = null;
      }
      setDownloadingFileId("");
    }
  };

  const closeEvidencePreview = () => setEvidencePreview(null);

  const verifyEvidenceFiles = async () => {
    const files = incident?.evidenceFiles || [];
    if (!files.length || isProcessing) return;

    setIsVerifying(true);
    setEvidenceActionError("");
    setEvidenceVerification((current) => ({
      ...current,
      ...Object.fromEntries(files.filter((file) => file._id).map((file) => [file._id, "verifying"])),
    }));
    setEvidenceVerificationResults({});

    if (verifyAbortRef.current) {
      verifyAbortRef.current.abort();
    }
    const controller = new AbortController();
    verifyAbortRef.current = controller;

    try {
      const results = await Promise.all(files.map(async (file) => {
        if (!file._id) return [file._id, { verificationStatus: "error", errorMessage: "Evidence record ID is missing." }];
        try {
          const response = await axiosClient.post(`/evidence/${file._id}/verify`, {}, {
            signal: controller.signal,
          });
          const verificationStatus = response.data.verificationStatus || (response.data.match ? "verified" : "mismatch");
          return [file._id, { ...response.data, verificationStatus }];
        } catch (requestError) {
          if (controller.signal.aborted) throw requestError;
          return [file._id, {
            verificationStatus: "error",
            errorMessage: requestError.response?.data?.message || "Unable to verify this evidence file.",
          }];
        }
      }));

      const verificationResults = Object.fromEntries(results);
      setEvidenceVerificationResults(verificationResults);
      setEvidenceVerification((prev) => {
        const next = { ...prev };
        for (const [id, r] of results) next[id] = r.verificationStatus;
        return next;
      });
      setIncident((prev) => prev && {
        ...prev,
        evidenceFiles: prev.evidenceFiles?.map((file) => {
          const res = verificationResults[file._id];
          return res ? { ...file, verificationStatus: res.verificationStatus, verifiedAt: res.verifiedAt || new Date().toISOString() } : file;
        }),
      });
    } catch {
      if (!controller.signal.aborted) {
        setEvidenceActionError("Verification encountered an error. Please try again.");
      }
    } finally {
      if (verifyAbortRef.current === controller) verifyAbortRef.current = null;
      setIsVerifying(false);
    }
  };

  const copyEvidenceHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      window.setTimeout(() => setCopiedHash(""), 1500);
    } catch {
      setEvidenceActionError("Unable to copy the SHA-256 hash to the clipboard.");
    }
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

    if (exportAbortRef.current) {
      exportAbortRef.current.abort();
    }
    const controller = new AbortController();
    exportAbortRef.current = controller;

    try {
      const response = await axiosClient.get(`/incidents/${incident._id}/dossier`, {
        responseType: "blob",
        signal: controller.signal,
      });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Dossier-${incident.trackingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch {
      if (controller.signal.aborted) return;
      setReportExportError("Unable to export this report. Please try again.");
    } finally {
      if (exportAbortRef.current === controller) {
        exportAbortRef.current = null;
      }
      setIsExportingReport(false);
    }
  };

  return (
    <>
      {showHeader && <AnalystHeader />}

      <main className="analyst-case-update">
        <div className="case-update-shell">
          <div className="case-update-topbar">
            <button type="button" onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/analyst')} aria-label="Back to dashboard">
              <ArrowLeft size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Back to Dashboard
            </button>
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
                          disabled={!incident.evidenceFiles?.length || isProcessing}
                          aria-busy={isVerifying}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 size={13} className="verify-spinner" aria-hidden="true" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={13} aria-hidden="true" />
                              <span>Verify Evidence Integrity</span>
                            </>
                          )}
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
                                disabled={getEvidencePreviewKind(file) === "unsupported" || isProcessing}
                                aria-label={`Preview ${file.originalFilename || "evidence file"}`}
                                title={getEvidencePreviewKind(file) === "unsupported" ? "Preview not available for this file type" : "Preview file"}
                              >
                                {isLoadingPreview && previewingFileId === file._id ? (
                                  <Loader2 size={16} className="verify-spinner" aria-hidden="true" />
                                ) : (
                                  <Eye size={16} aria-hidden="true" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadEvidenceFile(file)}
                                disabled={isProcessing}
                                aria-label={`Download ${file.originalFilename || "evidence file"}`}
                                title="Download file"
                              >
                                {downloadingFileId === file._id ? (
                                  <Loader2 size={16} className="verify-spinner" aria-hidden="true" />
                                ) : (
                                  <Download size={16} aria-hidden="true" />
                                )}
                              </button>
                            </span>
                            <div className="evidence-integrity-details">
                              <div className="evidence-hash-row">
                                <span>Original SHA-256:</span>
                                <code>{file.sha256Hash || "Unavailable"}</code>
                                {file.sha256Hash && (
                                  <button type="button" onClick={() => copyEvidenceHash(file.sha256Hash)} title="Copy SHA-256 hash">
                                    <Copy size={14} aria-hidden="true" />
                                    {copiedHash === file.sha256Hash ? "Copied" : "Copy"}
                                  </button>
                                )}
                              </div>
                              <div className="evidence-hash-row">
                                <span>Baseline MD5:</span>
                                <code>{file.md5Hash || "Unavailable"}</code>
                              </div>
                            </div>
                            {evidenceVerificationResults[file._id] && (() => {
                              const result = evidenceVerificationResults[file._id];
                              const isClean = result.verificationStatus === "verified";
                              const heading = isClean
                                ? "Cryptographic integrity confirmed (clean hash)"
                                : result.verificationStatus === "mismatch"
                                  ? "Integrity mismatch detected"
                                  : "Integrity check failed";

                              return (
                                <div className={`evidence-clean-hash ${isClean ? "verified" : "failed"}`} role="status">
                                  <div className="evidence-clean-hash-heading">
                                    {isClean ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
                                    <strong>{heading}</strong>
                                    <span>{formatDisplayTime(result.verifiedAt)}</span>
                                  </div>
                                  <p>
                                    {result.errorMessage || (isClean
                                      ? "Recalculated SHA-256 matches the original intake baseline."
                                      : result.match === false
                                        ? "Recalculated SHA-256 does not match the original intake baseline."
                                        : "The file could not be verified against its intake baseline.")}
                                  </p>
                                  {result.currentHash && <code>SHA-256: {result.currentHash}</code>}
                                </div>
                              );
                            })()}
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
                          LEDGER RECORDS: {custodyLogs.length} TOTAL
                        </span>
                        <span className="append-only-pill" aria-label="Ledger is append-only">Append-Only</span>
                        <button type="button" className="log-action-pill" onClick={() => { setIsNewestFirst(false); setCustodyLogPage(1); }}>All Actions ({custodyLogs.length})</button>
                        <button
                          type="button"
                          className="log-action-pill log-sort-pill"
                          onClick={() => {
                            setIsNewestFirst((current) => !current);
                            setCustodyLogPage(1);
                          }}
                          aria-pressed={isNewestFirst}
                        >
                          {isNewestFirst ? "Newest First" : "Oldest First"}
                        </button>
                      </div>

                      {visibleCustodyLogs.length ? (
                        <div className="chain-log-entries" role="list" aria-label="Chain of custody entries">
                          {visibleCustodyLogs.map((log) => (
                            <article className="chain-log-entry" role="listitem" key={log._id}>
                              <div className="chain-log-entry-header">
                                <strong>{String(log.action || "Activity").replace(/_/g, " ")}</strong>
                                <time dateTime={log.timestamp}>{formatLogTimestamp(log.timestamp)}</time>
                              </div>
                              <p>{log.details || "No details recorded."}</p>
                              <div className="chain-log-entry-meta">
                                <span>By {log.performedBy?.name || log.performedBy?.email || "System"}</span>
                                {log.evidenceFileId?.originalFilename && <span>Evidence: {log.evidenceFileId.originalFilename}</span>}
                                {log.ipAddress && <span>IP: {String(log.ipAddress).replace(/^::ffff:/, '')}</span>}
                              </div>
                              {log.calculatedHash && <p className="chain-log-entry-hash">Hash: {log.calculatedHash}</p>}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="chain-log-empty-box" aria-live="polite">
                          No chain of custody entries recorded for this case.
                        </div>
                      )}
                      {orderedCustodyLogs.length > 0 && (
                        <nav className="chain-log-pagination" aria-label="Chain of custody pages">
                          <button
                            type="button"
                            className="chain-log-page-button"
                            onClick={() => setCustodyLogPage((page) => Math.max(1, page - 1))}
                            disabled={custodyLogPage === 1}
                          >
                            <ChevronLeft size={16} aria-hidden="true" />
                            Previous
                          </button>
                          <span className="chain-log-page-count" aria-live="polite">
                            Page {custodyLogPage} of {totalCustodyLogPages}
                          </span>
                          <button
                            type="button"
                            className="chain-log-page-button"
                            onClick={() => setCustodyLogPage((page) => Math.min(totalCustodyLogPages, page + 1))}
                            disabled={custodyLogPage === totalCustodyLogPages}
                          >
                            Next
                            <ChevronRight size={16} aria-hidden="true" />
                          </button>
                        </nav>
                      )}
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
