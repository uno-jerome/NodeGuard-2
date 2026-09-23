import { UserRound } from "lucide-react";
import { useState } from "react";
import AdminHeader from "../../Components/navbar/AdminHeader";
import { ProvisionStaffModal } from "../../Components/Elements/AddNewStaff";
import { SessionProvisioningLog } from "../../Components/Elements/SessionProvisonLog";
import "../../Components/design/Admin/UserManagement.css";

const initialProvisioningEntries = [
	{ id: "preview-1", name: "Amina Rahman", email: "amina@nodeguard.local", role: "Investigator", time: "09:42" },
	{ id: "preview-2", name: "David Chen", email: "david@nodeguard.local", role: "Analyst", time: "09:18" },
];

const FORENSIC_CLEARANCE_BADGES = [
	{ id: "role", label: "Roles: Investigator", variant: "blue" },
	{ id: "encryption", label: "Streaming SHA-256 Vault", variant: "green" },
	{ id: "hashing", label: "Bcrypt 10 Rounds", variant: "gray" },
];

const FORENSIC_ROLE_CLEARANCE_CARD = {
	title: "Forensic Role Clearance Architecture",
	description:
		"Investigator accounts are provisioned with Level-2 system clearance.",
	badges: FORENSIC_CLEARANCE_BADGES,
};

const PROVISION_NOTE = {
	label: "Forensic Security & Audit",
	icon : "https://www.figma.com/api/mcp/asset/00a97632-2c2e-4fed-8bc7-fe3f130900ac.svg",
	Description: "All investigator activities—logging in, viewing evidence files, calculating checksums, and updating notes—are recorded in the append-only Chain of Custody ledger.",
};

export default function UserManament() {
	const [isProvisionModalOpen, setProvisionModalOpen] = useState(false);
	const [entries, setEntries] = useState(initialProvisioningEntries);

	const handleStaffSave = (staff) => {
		const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
		setEntries((current) => [
			{ id: crypto.randomUUID(), ...staff, time },
			...current,
		]);
		setProvisionModalOpen(false);
	};

	return (
		<>
			<AdminHeader />
			<div className="user-management-container">
				<section className="user-management-header">
					<h1>User Management</h1>
					<h2>Manage user accounts, roles, and permissions within the system.</h2>
				</section>

				<section className="user-management-content">
					<div className="user-management-left">
						<div className="user-left-info">
							<div className="user-left-info-title">
								<UserRound aria-hidden="true" />
								<h3>Investigator Staff Access</h3>
							</div>
							<p className="user-left-info-description">
								Manage the access and permissions of investigator staff members within the system.
								Assign roles, update user information, and ensure appropriate access levels for each user.
							</p>

							<div className="user-left-info_container">
								<div className="user-left-info-Header">
									<h3>{FORENSIC_ROLE_CLEARANCE_CARD.title}</h3>
									<p>{FORENSIC_ROLE_CLEARANCE_CARD.description}</p>
									<div className="forensic-clearance-badges">
										{FORENSIC_ROLE_CLEARANCE_CARD.badges.map((badge) => (
											<span
												className={`forensic-clearance-badge forensic-clearance-badge--${badge.variant}`}
												key={badge.id}
											>
												{badge.label}
											</span>
										))}
									</div>
								</div>
								<button
									className="user-management-button"
									type="button"
									onClick={() => setProvisionModalOpen(true)}
								>
									Provision New Staff
								</button>
							</div>
						</div>
					</div>
					<div className="user-management-right">
						<SessionProvisioningLog
							entries={entries}
							onRemove={(id) => setEntries((current) => current.filter((entry) => entry.id !== id))}
						/>
						<div className="user-management-note">
							<div className="user-management-note-title">
								<img src={PROVISION_NOTE.icon} alt="" aria-hidden="true" />
								<h3>{PROVISION_NOTE.label}</h3>
							</div>
							<p>{PROVISION_NOTE.Description}</p>
						</div>
					</div>
				</section>
				<ProvisionStaffModal
					isOpen={isProvisionModalOpen}
					onSave={handleStaffSave}
					onClose={() => setProvisionModalOpen(false)}
				/>
			</div>
		</>
	);
}
