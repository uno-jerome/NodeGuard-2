export const DEFAULT_ENTRIES = [
	{ 
		id: 1, 
		action: 'VERIFY_FAIL', 
		actor: 'A. Hart', 
		role: 'Investigator', 
		ip: '10.0.0.12', 
		details: 'Hash mismatch detected during evidence intake verification.', 
		timestamp: '2026-09-24T14:22:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 2, 
		action: 'VERIFY_PASS', 
		actor: 'M. Cole', 
		role: 'Admin', 
		ip: '10.0.0.41', 
		details: 'Evidence chain verified and sealed successfully.', 
		timestamp: '2026-09-23T09:10:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 3, 
		action: 'INGESTION', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.77', 
		details: 'New forensic artifact uploaded from client packet.', 
		timestamp: '2026-09-20T18:15:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 4, 
		action: 'STATUS_CHANGE', 
		actor: 'K. James', 
		role: 'Investigator', 
		ip: '10.0.0.28', 
		details: 'Case status changed from investigation to review.', 
		timestamp: '2026-09-19T11:42:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 5, 
		action: 'VIEW', 
		actor: 'S. Lin', 
		role: 'Admin', 
		ip: '10.0.0.19', 
		details: 'Incident evidence review opened by administrator.', 
		timestamp: '2026-09-18T08:35:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 6, 
		action: 'DOWNLOAD', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.91', 
		details: 'Case archive package downloaded for legal review.', 
		timestamp: '2026-09-17T16:04:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 7, 
		action: 'VERIFY_PASS', 
		actor: 'A. Hart', 
		role: 'Investigator', 
		ip: '10.0.0.12', 
		details: 'Checksum recomputed and matched original ledger entry.', 
		timestamp: '2026-09-17T10:02:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 8, 
		action: 'VIEW', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.83', 
		details: 'Public case summary viewed via tracking portal.', 
		timestamp: '2026-09-16T13:47:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 9, 
		action: 'INGESTION', 
		actor: 'M. Cole', 
		role: 'Admin', 
		ip: '10.0.0.41', 
		details: 'Bulk evidence batch ingested from field upload.', 
		timestamp: '2026-09-16T07:58:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 10, 
		action: 'VERIFY_FAIL', 
		actor: 'K. James', 
		role: 'Investigator', 
		ip: '10.0.0.28', 
		details: 'Tamper flag raised on secondary hash comparison.', 
		timestamp: '2026-09-15T22:31:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 11, 
		action: 'DOWNLOAD', 
		actor: 'S. Lin', 
		role: 'Admin', 
		ip: '10.0.0.19', 
		details: 'Full audit trail exported for compliance review.', 
		timestamp: '2026-09-15T15:12:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 12, 
		action: 'STATUS_CHANGE', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.77', 
		details: 'Client-submitted status inquiry logged as event.', 
		timestamp: '2026-09-14T19:05:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 13, 
		action: 'VIEW', 
		actor: 'A. Hart', 
		role: 'Investigator', 
		ip: '10.0.0.12', 
		details: 'Evidence file previewed prior to formal intake.', 
		timestamp: '2026-09-14T12:20:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 14, 
		action: 'VERIFY_PASS', 
		actor: 'M. Cole', 
		role: 'Admin', 
		ip: '10.0.0.41', 
		details: 'Signature verification completed without discrepancy.', 
		timestamp: '2026-09-13T09:44:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 15, 
		action: 'INGESTION', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.91', 
		details: 'Client uploaded supplemental photographic evidence.', 
		timestamp: '2026-09-13T06:18:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 16, 
		action: 'VERIFY_FAIL', 
		actor: 'S. Lin', 
		role: 'Admin', 
		ip: '10.0.0.19', 
		details: 'Ledger entry rejected due to invalid signature block.', 
		timestamp: '2026-09-12T20:53:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 17, 
		action: 'DOWNLOAD', 
		actor: 'K. James', 
		role: 'Investigator', 
		ip: '10.0.0.28', 
		details: 'Case file bundle downloaded for court submission.', 
		timestamp: '2026-09-12T14:09:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 18, 
		action: 'STATUS_CHANGE', 
		actor: 'A. Hart', 
		role: 'Investigator', 
		ip: '10.0.0.12', 
		details: 'Case reopened following new evidence submission.', 
		timestamp: '2026-09-11T17:26:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 19, 
		action: 'VIEW', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.83', 
		details: 'Anonymous portal access to redacted case notes.', 
		timestamp: '2026-09-11T10:31:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 20, 
		action: 'VERIFY_PASS', 
		actor: 'M. Cole', 
		role: 'Admin', 
		ip: '10.0.0.41', 
		details: 'Batch verification of intake queue completed.', 
		timestamp: '2026-09-10T23:47:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 21, 
		action: 'INGESTION', 
		actor: 'S. Lin', 
		role: 'Admin', 
		ip: '10.0.0.19', 
		details: 'Digital forensics image ingested and hashed.', 
		timestamp: '2026-09-10T16:02:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 22, 
		action: 'VERIFY_FAIL', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.77', 
		details: 'Client-submitted packet failed integrity check.', 
		timestamp: '2026-09-09T21:14:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 23, 
		action: 'DOWNLOAD', 
		actor: 'K. James', 
		role: 'Investigator', 
		ip: '10.0.0.28', 
		details: 'Chain of custody log exported for internal audit.', 
		timestamp: '2026-09-09T13:38:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 24, 
		action: 'STATUS_CHANGE', 
		actor: 'M. Cole', 
		role: 'Admin', 
		ip: '10.0.0.41', 
		details: 'Case escalated to Level-2 investigation clearance.', 
		timestamp: '2026-09-08T18:57:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 25, 
		action: 'VIEW', 
		actor: 'A. Hart', 
		role: 'Investigator', 
		ip: '10.0.0.12', 
		details: 'Metadata inspection performed on ingested artifact.', 
		timestamp: '2026-09-08T11:04:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 26, 
		action: 'INGESTION', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.91', 
		details: 'Encrypted client file received and queued for review.', 
		timestamp: '2026-09-07T22:40:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 27, 
		action: 'VERIFY_PASS', 
		actor: 'S. Lin', 
		role: 'Admin', 
		ip: '10.0.0.19', 
		details: 'Independent verification confirmed original checksum.', 
		timestamp: '2026-09-07T15:16:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 28, 
		action: 'DOWNLOAD', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.83', 
		details: 'Redacted case summary downloaded by requester.', 
		timestamp: '2026-09-06T19:29:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 29, 
		action: 'VERIFY_FAIL', 
		actor: 'K. James', 
		role: 'Investigator', 
		ip: '10.0.0.28', 
		details: 'Discrepancy found between ledger and stored hash.', 
		timestamp: '2026-09-06T12:51:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 30, 
		action: 'STATUS_CHANGE', 
		actor: 'A. Hart', 
		role: 'Investigator', 
		ip: '10.0.0.12', 
		details: 'Investigation status updated to pending closure.', 
		timestamp: '2026-09-05T20:03:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 31, 
		action: 'VIEW', 
		actor: 'M. Cole', 
		role: 'Admin', 
		ip: '10.0.0.41', 
		details: 'Administrative review of flagged log entries.', 
		timestamp: '2026-09-05T13:27:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 32, 
		action: 'INGESTION', 
		actor: 'S. Lin', 
		role: 'Admin', 
		ip: '10.0.0.19', 
		details: 'Third-party lab report ingested into case record.', 
		timestamp: '2026-09-04T09:12:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 33, 
		action: 'VERIFY_PASS', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.77', 
		details: 'Client-side hash self-check passed before submission.', 
		timestamp: '2026-09-04T02:45:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 34, 
		action: 'DOWNLOAD', 
		actor: 'K. James', 
		role: 'Investigator', 
		ip: '10.0.0.28', 
		details: 'Evidence photos exported for forensic lab handoff.', 
		timestamp: '2026-09-03T17:59:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 35, 
		action: 'VERIFY_FAIL', 
		actor: 'M. Cole', 
		role: 'Admin', 
		ip: '10.0.0.41', 
		details: 'Automated integrity sweep flagged one corrupted record.', 
		timestamp: '2026-09-03T10:33:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 36, 
		action: 'STATUS_CHANGE', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.91', 
		details: 'Client acknowledgment recorded for case closure notice.', 
		timestamp: '2026-09-02T23:18:00Z', 
		incidentId: 'INC-403' 
	},
	{ 
		id: 37, 
		action: 'VIEW', 
		actor: 'S. Lin', 
		role: 'Admin', 
		ip: '10.0.0.19', 
		details: 'Full timeline reviewed ahead of court disclosure.', 
		timestamp: '2026-09-02T14:41:00Z', 
		incidentId: 'INC-1024' 
	},
	{ 
		id: 38, 
		action: 'INGESTION', 
		actor: 'A. Hart', 
		role: 'Investigator', 
		ip: '10.0.0.12', 
		details: 'Field-collected sample logged into evidence locker.', 
		timestamp: '2026-09-01T19:06:00Z', 
		incidentId: 'INC-860' 
	},
	{ 
		id: 39, 
		action: 'VERIFY_PASS', 
		actor: 'K. James', 
		role: 'Investigator', 
		ip: '10.0.0.28', 
		details: 'Final chain-of-custody seal verified before archival.', 
		timestamp: '2026-09-01T08:22:00Z', 
		incidentId: 'INC-219' 
	},
	{ 
		id: 40, 
		action: 'DOWNLOAD', 
		actor: 'PUBLIC_ANONYMOUS', 
		role: 'Client', 
		ip: '10.0.0.83', 
		details: 'Case status export requested through public portal.', 
		timestamp: '2026-08-31T21:50:00Z', 
		incidentId: 'INC-403' 
	},
];