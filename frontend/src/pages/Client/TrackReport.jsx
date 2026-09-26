import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import ClientHeader from "../../Components/navbar/ClientHeader";
import axiosClient from "../../api/axiosClient";
import "../../Components/design/client/TrackReport.css";

const formatDate = (value) => {
	if (!value) return "-";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const workflowStages = [
	{
		status: "Reported",
		description: "Incident received and recorded in the intake ledger.",
	},
	{
		status: "Under Review",
		description: "An assigned officer is reviewing the report and verifying its details.",
	},
	{
		status: "Investigating",
		description: "Active forensic examination is underway, including review of submitted evidence.",
	},
	{
		status: "Resolved",
		description: "Investigation concluded and findings prepared for closure.",
	},
];

export default function TrackReport() {
	const [trackingId, setTrackingId] = useState("");
	const [incident, setIncident] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (event) => {
		event.preventDefault();
		const normalizedId = trackingId.trim().toUpperCase().replace(/\s+/g, "");
		setIncident(null);
		setError("");

		if (!normalizedId) {
			setError("Enter your tracking ID to find your case.");
			return;
		}

		setIsLoading(true);
		try {
			const response = await axiosClient.get(`/incidents/track/${encodeURIComponent(normalizedId)}`);
			setIncident(response.data.incident);
			setTrackingId(response.data.incident.trackingId);
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Unable to find a case with that tracking ID.");
		} finally {
			setIsLoading(false);
		}
	};

	const statusClass = incident?.status?.toLowerCase().replace(/\s+/g, "-") || "";
	const currentStageIndex = incident
		? incident.status === "Closed"
			? workflowStages.length - 1
			: Math.max(0, workflowStages.findIndex((stage) => stage.status === incident.status))
		: -1;
	const caseNotes = Array.isArray(incident?.notes) ? [...incident.notes].reverse() : [];

	return (
		<>
			<ClientHeader />
			<main className="track-report-page">
				<section className="track-report-shell" aria-label="Track a case">
					<form className="track-report-form" onSubmit={handleSubmit}>
						<label htmlFor="tracking-id">Enter Tracking ID</label>
						<div className="track-report-input-row">
							<input
								id="tracking-id"
								value={trackingId}
								onChange={(event) => setTrackingId(event.target.value)}
								placeholder="e.g. CASE-2026-00005"
								autoComplete="off"
								aria-describedby={error ? "tracking-error" : undefined}
							/>
							<button type="submit" disabled={isLoading}>
								{isLoading ? <span className="track-report-spinner" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
								{isLoading ? "Searching" : "Find case"}
								{!isLoading && <ArrowRight size={15} aria-hidden="true" />}
							</button>
						</div>
					</form>

					{error && <p className="track-report-error" id="tracking-error" role="alert">{error}</p>}

					{incident && (
						<section className="tracked-case" aria-live="polite" aria-label="Case details">
							<header className="tracked-case-header">
								<div className="tracked-case-id-row">
									<span className="tracked-case-id">{incident.trackingId}</span>
									<span className={`tracked-case-status ${statusClass}`}>
										<span aria-hidden="true" />{incident.status}
									</span>
								</div>
								<h2>{incident.title}</h2>
								<div className="tracked-case-meta">
									<div><span>Category</span><strong>{incident.category || "-"}</strong></div>
									<div><span>Status</span><strong className={`tracked-case-status-text ${statusClass}`}>{incident.status || "-"}</strong></div>
									<div><span>Reported date</span><strong>{formatDate(incident.createdAt || incident.incidentDate)}</strong></div>
								</div>
								<div className="tracked-case-update-log">
									<h3>Update Log</h3>
									{caseNotes.length ? caseNotes.map((note, index) => (
										<p key={note._id || `${note.date}-${index}`}>
											<span>Log {caseNotes.length - index}:</span> {note.text}
										</p>
									)) : <p>No case updates have been recorded yet.</p>}
								</div>
							</header>

							<ol className="tracked-case-timeline" aria-label="Case progress">
								{workflowStages.map((stage, index) => {
									const stageState = index < currentStageIndex ? "complete" : index === currentStageIndex ? "current" : "pending";
									const stageTone = stage.status.toLowerCase().replace(/\s+/g, "-");
									const stageLabel = incident.status === "Closed" && stage.status === "Resolved" ? "Closed" : stage.status;
									return (
										<li className={`tracked-case-stage ${stageState} ${stageTone}`} key={stage.status}>
											<span className="tracked-case-stage-marker" aria-hidden="true" />
											<div className="tracked-case-stage-content">
												<div className="tracked-case-stage-topline">
													<span className="tracked-case-stage-label">{stageLabel}</span>
													<span className="tracked-case-stage-time">{stageState === "current" ? "Current status" : stageState === "complete" ? "Complete" : "Pending"}</span>
												</div>
												<p>{stage.description}</p>
											</div>
										</li>
									);
								})}
							</ol>
						</section>
					)}
				</section>
			</main>
		</>
	);
}
