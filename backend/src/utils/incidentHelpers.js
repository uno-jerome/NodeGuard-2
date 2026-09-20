export const ALLOWED_STATUSES = [
  'Reported',
  'Under Review',
  'Investigating',
  'Resolved',
  'Closed',
];

export const buildIncidentFilter = (query) => {
  const { category, status, priority } = query;
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  return filter;
};

export default {
  ALLOWED_STATUSES,
  buildIncidentFilter,
};
