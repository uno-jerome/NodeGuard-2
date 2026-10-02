import AdminHeader from "../../Components/navbar/AdminHeader";
import AnalystDashboard from "../Analyst/AnalystDashboard";


export default function AdminDashboard() {
	return (
		<>
			<AdminHeader />
			<AnalystDashboard showHeader={false} showInspect={false} adminMode />
		</>
	);
}
