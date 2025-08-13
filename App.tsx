
import React, { useState, useCallback } from 'react';
import { InputData, ViralDNProfile } from './types';
import { generateVDP } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import VDPDisplay from './components/VDPDisplay';
import Loader from './components/Loader';
import { sampleVDP } from './constants';

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


const App: React.FC = () => {
  const [vdpResult, setVdpResult] = useState<ViralDNProfile | null>(null);
  const [idCounter, setIdCounter] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  const handleAnalyze = useCallback(async (data: InputData) => {
    setIsLoading(true);
    setError(null);
    setVdpResult(null);

    try {
      const result = await generateVDP(data);
      setVdpResult(result);
      // Only increment counter for new, non-derivative content
      if (!data.parentId) {
        setIdCounter(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleShowSample = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setVdpResult(sampleVDP);
  }, []);

  const handleCopy = useCallback(() => {
    if (!vdpResult) return;
    navigator.clipboard.writeText(JSON.stringify(vdpResult, null, 2))
      .then(() => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy JSON: ', err);
        alert('Failed to copy JSON to clipboard.');
      });
  }, [vdpResult]);

  const handleDownload = useCallback(() => {
    if (!vdpResult) return;
    const jsonString = JSON.stringify(vdpResult, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vdp-${vdpResult.content_id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [vdpResult]);


  const currentContentId = `C${String(idCounter).padStart(6, '0')}`;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <InputForm 
            onSubmit={handleAnalyze} 
            onShowSample={handleShowSample} 
            isLoading={isLoading} 
            contentId={currentContentId} 
          />
          
          <div className="bg-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700 min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">Analysis Result</h2>
              {vdpResult && !isLoading && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                    disabled={copyStatus}
                  >
                    <ClipboardIcon className="w-4 h-4" />
                    {copyStatus ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>
            {isLoading && <Loader />}
            {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
            {vdpResult && !isLoading && <VDPDisplay vdp={vdpResult} />}
            {!vdpResult && !isLoading && !error && (
              <div className="flex-grow flex items-center justify-center text-gray-500">
                <p>Results will be displayed here...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;