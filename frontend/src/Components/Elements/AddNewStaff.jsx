import { useState } from 'react';
import '../design/Admin/AddNewStaffModal.css';

export const PROVISION_STAFF_HEADER = {
	title: 'Provision New Staff',
	description: 'Grant authorized investigator staff access',
};

export const PROVISION_STAFF_FIELDS = [
	{ name: 'name', label: 'Profile Name', type: 'text', required: true },
	{ name: 'email', label: 'Agency Email', type: 'email', required: true },
	{ name: 'password', label: 'Generate Password', type: 'password', required: true },
];

const DEFAULT_ROLE = 'Investigator';

export function ProvisionStaffModal({ isOpen, onSave, onClose }) {
	const [values, setValues] = useState(() =>
		Object.fromEntries(PROVISION_STAFF_FIELDS.map((f) => [f.name, '']))
	);

	if (!isOpen) return null;

	const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));
	const isValid = PROVISION_STAFF_FIELDS.every((f) => !f.required || values[f.name].trim());

	const submit = (e) => {
		e.preventDefault();
		if (!isValid) return;
		onSave({ name: values.name, email: values.email, role: DEFAULT_ROLE });
	};

	return (
		<div className="psm-backdrop" onClick={onClose}>
			<div className="psm" onClick={(e) => e.stopPropagation()}>
				<div className="psm-header">
					<div className="psm-heading">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="9" cy="7" r="4" />
							<path d="M2 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" />
							<line x1="19" y1="8" x2="19" y2="14" />
							<line x1="16" y1="11" x2="22" y2="11" />
						</svg>
						<div>
							<h2>{PROVISION_STAFF_HEADER.title}</h2>
							<p>{PROVISION_STAFF_HEADER.description}</p>
						</div>
					</div>
					<button type="button" className="psm-close" aria-label="Close" onClick={onClose}>
						✕
					</button>
				</div>

				<hr className="psm-divider" />

				<form className="psm-form" onSubmit={submit}>
					{PROVISION_STAFF_FIELDS.map((f) => (
						<div className="psm-field" key={f.name}>
							<label htmlFor={f.name}>
								{f.label} {f.required && <span>*</span>}
							</label>
							<input
								id={f.name}
								type={f.type}
								value={values[f.name]}
								onChange={(e) => setField(f.name, e.target.value)}
								required={f.required}
							/>
						</div>
					))}
					<div className="psm-footer">
						<button type="submit" className="psm-save" disabled={!isValid}>Add New Staff</button>
					</div>
				</form>
			</div>
		</div>
	);
}

