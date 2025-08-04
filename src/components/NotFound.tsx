import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              to="/articles"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
