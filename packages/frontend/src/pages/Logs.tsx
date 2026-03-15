import LogViewer from '../components/LogViewer';

export default function Logs() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <h2 className="text-xl font-semibold">Logs</h2>
      <div className="flex-1 min-h-0">
        <LogViewer maxLines={500} autoScroll />
      </div>
    </div>
  );
}
