import useAuthStore from '../store/authStore';
import { Home, Calendar, User } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your properties</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">My Properties</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Home className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Showings</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Profile Views</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent activity to display</p>
      </div>
    </div>
  );
};

export default Dashboard;