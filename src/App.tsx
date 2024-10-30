import React, { useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { AgeDetector } from './components/AgeDetector';
import { Camera } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAgeDetector, setShowAgeDetector] = useState(false);

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          ¡Bienvenido!
        </h2>
        <button
          onClick={() => setShowAgeDetector(true)}
          className="flex items-center justify-center space-x-2 w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          <Camera size={24} />
          <span>Descubre tu edad</span>
        </button>

        {showAgeDetector && (
          <AgeDetector onClose={() => setShowAgeDetector(false)} />
        )}
      </div>
    </div>
  );
}

export default App;