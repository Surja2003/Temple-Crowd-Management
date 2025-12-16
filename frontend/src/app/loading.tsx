export default function RootLoading() {
  return (
    <div className="w-full py-16 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600" />
      <span className="ml-3 text-sm text-gray-600">Loading…</span>
    </div>
  );
}
