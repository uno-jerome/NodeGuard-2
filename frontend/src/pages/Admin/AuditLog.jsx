import AdminHeader from "../../Components/navbar/AdminHeader";
import { useState } from "react";
import { SessionProvisioningLog } from "../../Components/Elements/SessionProvisonLog";

const previewEntries = [
	{ id: "preview-1", name: "Amina Rahman", email: "amina@nodeguard.local", role: "Investigator", time: "09:42" },
	{ id: "preview-2", name: "David Chen", email: "david@nodeguard.local", role: "Analyst", time: "09:18" },
];

export default function AuditLog() {
	const [entries, setEntries] = useState(previewEntries);

	return (
		<>
			<AdminHeader />
			<main>
				<h1>Session Provisioning Log</h1>
				<SessionProvisioningLog
					entries={entries}
					onRemove={(id) => setEntries((current) => current.filter((entry) => entry.id !== id))}
				/>
			</main>
		</>
	);
}
