import ClientHeader from "../../Components/navbar/ClientHeader";
import { ProgressStepper } from "../../Components/Elements/ProgressStepper";

const translate = (key, values = {}) => {
	const messages = {
		'track.progress_title': 'Report progress',
		'track.progress_sub': 'Follow the current status of your report.',
		'track.stage_counter': `Stage ${values.current} of ${values.total}`,
	};

	return messages[key] ?? key;
};

export default function TrackReport() {
	const trackingStages = [
		{ key: 'Reported', label: 'Reported', title: 'Report submitted', definition: 'Your report has been received.' },
		{ key: 'Under Review', label: 'Under Review', title: 'Under review', definition: 'Our team is reviewing the report.' },
		{ key: 'Investigating', label: 'Investigating', title: 'Investigation in progress', definition: 'Our team is investigating the reported incident.' },
		{ key: 'Resolved', label: 'Resolved', title: 'Report resolved', definition: 'The report has been resolved.' },
	];

	return (
		<div>
			<ClientHeader />
			<ProgressStepper
				trackingStages={trackingStages}
				currentStageIndex={0}
				incidentData={{ createdAt: null, updatedAt: null }}
				t={translate}
			/>
		</div>
	);
}