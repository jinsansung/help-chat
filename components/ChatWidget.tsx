import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import AdminPanel from './AdminPanel';
import { ChatIcon, CloseIcon, AdminIcon } from './icons';

type View = 'chat' | 'adminLogin';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('chat');

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if(isOpen) {
      setView('chat'); // Reset to chat view on close
    }
  };
  
  // Close chat on 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setView('chat');
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const headerTitle = view === 'chat' ? '생활백서봇' : '관리자 페이지';
  
  const openAnimation = isOpen ? 'animate-slide-in-up' : 'animate-slide-out-down';
  const buttonAnimation = isOpen ? 'animate-scale-out' : 'animate-scale-in';

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={handleToggle}
          className={`bg-primary text-black rounded-full p-4 shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-transform transform hover:scale-110 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
          style={{animationFillMode: 'forwards'}}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <ChatIcon />
        </button>
      </div>

      {isOpen && (
        <div className={`fixed bottom-20 right-5 z-40 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 ${openAnimation}`}>
          <header className="flex items-center justify-between p-4 bg-primary text-black rounded-t-2xl shadow-md">
            <h2 className="text-lg font-semibold">{headerTitle}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView(view === 'chat' ? 'adminLogin' : 'chat')}
                className="p-1 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Toggle Admin Panel"
                title="Admin Panel"
              >
                <AdminIcon />
              </button>
              <button
                onClick={handleToggle}
                className="p-1 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
          </header>
          <div className="flex-1 min-h-0">
            {view === 'chat' && <ChatWindow />}
            {view === 'adminLogin' && <AdminPanel onAuthSuccess={() => setView('chat')} />}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;