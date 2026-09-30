import AdminHeader from "../../Components/navbar/AdminHeader";
import AnalystDashboard from "../Analyst/AnalystDashboard";


export default function AdminCaseUpdate() {
	return (
		<>
			<AdminHeader />
			<AnalystDashboard showHeader={false} showInspect={false} />
		</>
	);
}
