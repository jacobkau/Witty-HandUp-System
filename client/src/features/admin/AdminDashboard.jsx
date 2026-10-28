export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600">
          Welcome to the Admin Panel, <strong> Administrator</strong>.
        </p>
        <p className="text-gray-500 mt-2 text-sm">
          From here, you can manage users, view system analytics, and delete any inappropriate tasks.
        </p>
      </div>
    </div>
  );
}
