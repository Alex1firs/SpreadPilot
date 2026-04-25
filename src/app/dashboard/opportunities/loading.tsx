export default function LoadingOpportunities() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-gray-800 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-900 rounded"></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-32"></div>
        ))}
      </div>
    </div>
  );
}
