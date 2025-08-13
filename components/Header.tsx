
import React from 'react';

const DnaIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 14.5A3.5 3.5 0 0 1 7.5 11H12"/><path d="M16.5 11a3.5 3.5 0 0 1 0 7H12"/>
        <path d="M12 11V4a3.5 3.5 0 0 0-3.5 3.5"/>
        <path d="M12 20v-7"/>
        <path d="M4 14.5A3.5 3.5 0 0 0 7.5 18H12"/>
        <path d="M16.5 18a3.5 3.5 0 0 0 0-7H12"/>
    </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/70 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
                <DnaIcon className="h-8 w-8 text-cyan-400" />
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Viral DNA Profile Extractor
                    </h1>
                    <p className="text-sm text-gray-400">AI-Powered Short-form Video Analysis</p>
                </div>
            </div>
        </div>
    </header>
  );
};

export default Header;
