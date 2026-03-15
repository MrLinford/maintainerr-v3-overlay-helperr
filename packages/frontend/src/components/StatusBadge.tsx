type Status = 'idle' | 'running' | 'error' | 'applied' | 'pending' | 'reverted';

const statusMap: Record<Status, { label: string; classes: string }> = {
  idle:     { label: 'Idle',     classes: 'bg-gray-700 text-gray-300' },
  running:  { label: 'Running',  classes: 'bg-blue-900 text-blue-200 animate-pulse' },
  error:    { label: 'Error',    classes: 'bg-red-900 text-red-200' },
  applied:  { label: 'Applied',  classes: 'bg-green-900 text-green-200' },
  pending:  { label: 'Pending',  classes: 'bg-yellow-900 text-yellow-200' },
  reverted: { label: 'Reverted', classes: 'bg-gray-700 text-gray-400' },
};

interface Props {
  status: Status;
}

export default function StatusBadge({ status }: Props) {
  const { label, classes } = statusMap[status] ?? statusMap.idle;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
