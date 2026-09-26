import { useNavigate } from 'react-router-dom';
import { ProvisionStaffModal } from './Elements/AddNewStaff';

export default function ProvisionStaff() {
	const navigate = useNavigate();

	return (
		<>
			<section id="provision-staff" className="provision-staff">
				<h2>Provision New Staff</h2>
				<p>Create an investigator staff account and assign the appropriate access level.</p>
			</section>
			<ProvisionStaffModal
				isOpen
				onSave={() => navigate('/admin/users')}
				onClose={() => navigate('/admin/users')}
			/>
		</>
	);
}
