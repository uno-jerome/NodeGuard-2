import '../design/client/ProgressStepper.css';

const formatDateTime = (dateString) => {
	if (!dateString) return 'Pending Phase';
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
	});
};

const stateOf = (index, currentStageIndex) =>
	index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'current' : 'pending';

function CheckIcon() {
	return (
		<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20 6L9 17l-5-5" />
		</svg>
	);
}

function ClockIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 3" />
		</svg>
	);
}

export function ProgressStepper({ trackingStages, currentStageIndex, incidentData, t }) {
	return (
		<div className="ps-card">
			<div className="ps-header">
				<div>
					<h3>{t('track.progress_title')}</h3>
					<p>{t('track.progress_sub')}</p>
				</div>
				<span className="ps-counter">
					{t('track.stage_counter', { current: currentStageIndex + 1, total: trackingStages.length })}
				</span>
			</div>

			<div className="ps-list">
				{trackingStages.map((stage, index) => {
					const state = stateOf(index, currentStageIndex);
					const isLast = index === trackingStages.length - 1;

					return (
						<div className="ps-item" key={stage.key}>
							{!isLast && <div className={`ps-connector ps-connector--${state}`} />}

							<div className={`ps-badge ps-badge--${state}`}>
								{state === 'completed' ? <CheckIcon />
									: state === 'current' ? <div className="ps-dot" />
									: index + 1}
							</div>

							<div className={`ps-panel ps-panel--${state}`}>
								<div className="ps-panel-top">
									<div className="ps-panel-left">
										<span className={`ps-label ps-label--${state}`}>{stage.label}</span>
										<span className="ps-title">{stage.title}</span>
									</div>
									<span className="ps-time">
										<ClockIcon />
										<span>
											{state === 'completed'
												? (index === 0 ? formatDateTime(incidentData.createdAt) : 'Completed')
												: state === 'current'
												? `Active Since ${formatDateTime(incidentData.updatedAt || incidentData.createdAt)}`
												: 'Pending'}
										</span>
									</span>
								</div>
								<p className="ps-desc">{stage.definition}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}