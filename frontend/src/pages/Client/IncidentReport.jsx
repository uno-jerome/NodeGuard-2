import ClientHeader from "../../Components/navbar/ClientHeader";
import Calendar from "../../Components/calendar/calendar";
import { CalendarDays, FileUp, ShieldAlert, UploadCloud, X } from "lucide-react";
import "../../Components/design/client/IncidentReport.css";

import { useEffect, useRef, useState } from "react";

export default function IncidentReport() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [incidentDateError, setIncidentDateError] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceError, setEvidenceError] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const calendarContainerRef = useRef(null);
  const evidenceInputRef = useRef(null);

  const supportedEvidenceTypes = ["png", "jpg", "jpeg", "pdf", "txt", "csv", "log", "eml", "zip"];
  const maxEvidenceSize = 50 * 1024 * 1024;

  useEffect(() => {
    if (!isCalendarOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!calendarContainerRef.current?.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCalendarOpen]);

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(previewFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [previewFile]);

  const formatIncidentDate = (dateValue) => {
    if (!dateValue) return "";

    const [year, month, day] = dateValue.split("-");
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (incidentDate && incidentDate > new Date().toISOString().slice(0, 10)) {
      setIncidentDateError("Incident date cannot be later than today.");
      return;
    }

    setIncidentDateError("");
  };

  const handleEvidenceSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const unsupportedFile = selectedFiles.find((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return !supportedEvidenceTypes.includes(extension);
    });

    if (unsupportedFile) {
      setEvidenceError(`${unsupportedFile.name} is not a supported file type.`);
      event.target.value = "";
      return;
    }

    const totalSize = [...evidenceFiles, ...selectedFiles].reduce((size, file) => size + file.size, 0);

    if (totalSize > maxEvidenceSize) {
      setEvidenceError("The total evidence file size must be 50MB or less.");
      event.target.value = "";
      return;
    }

    setEvidenceFiles((files) => [...files, ...selectedFiles]);
    setEvidenceError("");
    event.target.value = "";
  };

  const openEvidencePicker = () => evidenceInputRef.current?.click();

  const removeEvidenceFile = (fileToRemove) => {
    setEvidenceFiles((files) => files.filter((file) => file !== fileToRemove));
    if (previewFile === fileToRemove) setPreviewFile(null);
  };

  const getFileExtension = (file) => file.name.split(".").pop()?.toLowerCase();

  const isPreviewableFile = (file) =>
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    ["txt", "csv", "log", "eml"].includes(getFileExtension(file));

  return (
    <div className="incident-report-page">
      <ClientHeader />

      <main className="incident-report-shell">
        <form className="incident-report-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">
              Incident Title/Headline <span className="required">*</span>
            </span>
            <input type="text" className="text-input" />
          </label>

          <div className="two-col">
            <label className="field">
              <span className="field-label">
                Incident Category <span className="required">*</span>
              </span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="select-input"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, transparent 50%, #dfeeff 50%), linear-gradient(135deg, #dfeeff 50%, transparent 50%)",
                  backgroundPosition: "calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px)",
                  backgroundSize: "6px 6px, 6px 6px",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <option value="" disabled>Select category</option>
                <option value="phishing">Phishing</option>
                <option value="smishing-vishing">Smishing / Vishing</option>
                <option value="identity-theft">Identity Theft</option>
                <option value="account-takeover">Account Takeover</option>
                <option value="financial-fraud">Financial Fraud</option>
                <option value="business-email-compromise">Business Email Compromise</option>
                <option value="ransomware">Ransomware</option>
                <option value="malware">Malware / Spyware</option>
                <option value="credential-stuffing">Credential Stuffing</option>
                <option value="data-breach">Data Breach</option>
                <option value="online-harassment">Online Harassment / Cyberbullying</option>
                <option value="impersonation">Impersonation / Fake Profiles</option>
                <option value="extortion">Extortion</option>
                <option value="crypto-scam">Crypto Scam</option>
                <option value="social-engineering">Social Engineering</option>
                <option value="other">Other</option>
              </select>
            </label>

            {selectedCategory === "other" && (
              <label className="field">
                <span className="field-label">
                  Please specify <span className="required">*</span>
                </span>
                <input
                  type="text"
                  placeholder="Describe the incident category"
                  className="text-input"
                />
              </label>
            )}

            <label className="field">
              <span className="field-label">
                Incident Date <span className="required">*</span>
              </span>
              <div className="input-with-icon" ref={calendarContainerRef}>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  className="text-input date-input"
                  value={formatIncidentDate(incidentDate)}
                  readOnly
                />
                <button
                  type="button"
                  className="calendar-trigger"
                  onClick={() => setIsCalendarOpen((isOpen) => !isOpen)}
                  aria-label="Open incident date picker"
                  aria-expanded={isCalendarOpen}
                >
                  <CalendarDays className="calendar-icon" size={18} />
                </button>
                {isCalendarOpen && (
                  <div className="calendar-popup">
                    <Calendar
                      value={incidentDate}
                      maxDate={new Date().toISOString().slice(0, 10)}
                      onChange={(dateValue) => {
                        setIncidentDate(dateValue);
                        setIncidentDateError("");
                      }}
                    />
                  </div>
                )}
              </div>
              {incidentDateError && <span className="field-error" role="alert">{incidentDateError}</span>}
            </label>
          </div>

          <div className="two-col">
            <label className="field">
              <span className="field-label">
                Platform or Channel <span className="required">*</span>
              </span>
              <select
                value={selectedPlatform}
                onChange={(event) => setSelectedPlatform(event.target.value)}
                className="select-input"
              >
                <option value="" disabled>Choose platform</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone-call">Phone Call</option>
                <option value="social-media">Social Media</option>
                <option value="messenger">Messaging App</option>
                <option value="banking-app">Banking / Payment App</option>
                <option value="online-shopping">Online Shopping Platform</option>
                <option value="gaming">Gaming Platform</option>
                <option value="work-platform">Work / Collaboration Platform</option>
                <option value="website">Website / Web Portal</option>
                <option value="mobile-app">Mobile App</option>
                <option value="crypto-platform">Crypto Exchange / Wallet</option>
                <option value="other">Other</option>
              </select>
            </label>

            {selectedPlatform === "other" && (
              <label className="field">
                <span className="field-label">
                  Please specify <span className="required">*</span>
                </span>
                <input
                  type="text"
                  placeholder="Describe the platform or channel"
                  className="text-input"
                />
              </label>
            )}

            <label className="field">
              <span className="field-label">
                Estimated Financial Loss <span className="required">*</span>
              </span>
              <div className="currency-field">
                <span className="currency-symbol">PHP</span>
                <input type="number" step="0.01" min="0" placeholder="0.00" className="currency-input" />
              </div>
            </label>
          </div>

          <label className="field">
            <span className="field-label">
              Suspect Identifiers <span className="required">*</span>
            </span>
            <input type="text" className="text-input" />
          </label>

          <label className="field">
            <span className="field-label">
              Chronological Summary of What Happened <span className="required">*</span>
            </span>
            <textarea rows="7" className="textarea-input" />
          </label>

          <div className="complaint-panel">
            <label className="field complaint-heading">
              <span className="field-label">Complaint Details (optional)</span>
            </label>
            <p className="panel-note">
              Anonymous Filing: You do not need to add a complaint. Complaint details are strictly optional and confidential.
            </p>

            <div className="two-col complaint-grid">
              <label className="field">
                <span className="field-label">Your Name</span>
                <input type="text" placeholder="Leave Blank for Anonymous" className="text-input" />
              </label>

              <label className="field">
                <span className="field-label">Contact Number or Email</span>
                <input type="text" className="text-input" />
              </label>
            </div>
          </div>

          <div className="upload-panel">
            <label className="field upload-label">
              <span className="field-label">
                Digital Evidence Attachment <span className="required">*</span>
              </span>
            </label>

            <div
              className="upload-box"
              role="button"
              tabIndex="0"
              onClick={openEvidencePicker}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openEvidencePicker();
                }
              }}
            >
              <input
                ref={evidenceInputRef}
                className="upload-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.txt,.csv,.log,.eml,.zip"
                multiple
                onChange={handleEvidenceSelection}
              />
              <div className="upload-icon-wrap">
                <UploadCloud size={52} strokeWidth={1.7} />
              </div>
              <p className="upload-title">Drop files here or click to browse</p>
              <p className="upload-meta">Supported: PNG, JPG, PDF, TXT, CSV, LOG, EML, ZIP (Max 50MB)</p>
              <span className="upload-button">
                <FileUp size={16} />
                Drop files here or click to browse
              </span>
              {evidenceFiles.length > 0 && (
                <ul className="upload-file-list">
                  {evidenceFiles.map((file) => (
                    <li className="upload-file-item" key={`${file.name}-${file.size}-${file.lastModified}`}>
                      <button
                        type="button"
                        className="upload-file-name"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPreviewFile(file);
                        }}
                      >
                        {file.name}
                      </button>
                      <button
                        type="button"
                        className="remove-file-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeEvidenceFile(file);
                        }}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {evidenceError && <p className="upload-error" role="alert">{evidenceError}</p>}
            </div>
          </div>

          <div className="security-banner">
            <div className="security-icon-wrap">
              <ShieldAlert size={22} />
            </div>
            <p>
              Evidentiary Assurance: Your file is cryptographically hashed using streaming SHA-256 upon reception. This mathematical signature is recorded to an append-only ledger to ensure our continuity and admissibility.
            </p>
          </div>

          <div className="form-footer">
            <p>
              Fields marked with <span className="required-inline">*</span> are required for official intake.
            </p>
            <button type="submit" className="submit-button">Submit</button>
          </div>
        </form>
      </main>

      {previewFile && (
        <div className="file-preview-backdrop" role="presentation" onClick={() => setPreviewFile(null)}>
          <section className="file-preview-modal" role="dialog" aria-modal="true" aria-label={`Preview of ${previewFile.name}`} onClick={(event) => event.stopPropagation()}>
            <div className="file-preview-header">
              <strong>{previewFile.name}</strong>
              <button type="button" className="file-preview-close" onClick={() => setPreviewFile(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="file-preview-content">
              {previewUrl && previewFile.type.startsWith("image/") && <img src={previewUrl} alt={`Preview of ${previewFile.name}`} />}
              {previewUrl && previewFile.type === "application/pdf" && <iframe src={previewUrl} title={`Preview of ${previewFile.name}`} />}
              {previewUrl && ["txt", "csv", "log", "eml"].includes(getFileExtension(previewFile)) && <iframe src={previewUrl} title={`Preview of ${previewFile.name}`} />}
              {!isPreviewableFile(previewFile) && (
                <p>This file type cannot be previewed here. You can download it instead.</p>
              )}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

