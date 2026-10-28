import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-5xl font-extrabold text-blue-600 mb-6">
        Witty HandUp System
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        A community-driven task management platform. Post tasks you need help with, 
        claim tasks posted by others, and build a stronger community together.
      </p>
      
      <div className="flex gap-4">
        <Link 
          to="/register" 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
        <Link 
          to="/login" 
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 font-semibold rounded-md shadow-sm hover:bg-blue-50 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
