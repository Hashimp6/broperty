import { Calendar } from 'lucide-react';

const Showings = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Showings</h1>
        <p className="text-gray-600">Manage your property viewing appointments</p>
      </div>

      <div className="card text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No showings scheduled</h3>
        <p className="text-gray-600">
          Schedule a showing by viewing properties and clicking "Book Showing"
        </p>
      </div>
    </div>
  );
};

export default Showings;