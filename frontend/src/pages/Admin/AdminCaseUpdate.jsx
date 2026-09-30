import AdminHeader from "../../Components/navbar/AdminHeader";
import AnalystCaseUpdate from "../Analyst/AnalystCaseUpdate";

export default function AdminCaseUpdate() {
	return (
		<>
			<AdminHeader />
			<AnalystCaseUpdate showHeader={false} />
		</>
	);
}
