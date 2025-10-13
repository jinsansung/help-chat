
import React from 'react';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="font-sans">
      {/* This container is for the standalone app view. 
          When embedded, the ChatWidget will be fixed relative to the viewport. */}
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center text-gray-700">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Your Website Content</h1>
          <p className="text-lg">The AI Chatbot will appear in the bottom right corner.</p>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}

export default App;
