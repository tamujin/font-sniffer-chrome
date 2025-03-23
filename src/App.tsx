import { useState, useEffect } from 'react'
import './App.css'

interface FontInfo {
  family: string;
  weight: string;
  style: string;
  size: string;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [fontInfo, setFontInfo] = useState<FontInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSelection = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        setError('No active tab found');
        return;
      }

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch {
        // Ignore error if script is already injected
      }

      const response = await new Promise<{ fontInfo: FontInfo | null }>((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id!, { action: 'getSelectedFontInfo' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      if (response?.fontInfo) {
        setFontInfo(response.fontInfo);
      } else {
        setError('Please select some text on the page first');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Unable to get font information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSelection();
  }, []);

  const handleRetry = () => {
    checkSelection();
  };

  return (
    <div className="w-[480px] min-h-[400px] bg-gray-900 text-white p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Font Sniffer
        </h1>
        <p className="text-gray-400">Select text on the page to inspect its font details</p>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin mb-6"></div>
          <p className="text-gray-400 text-lg">Analyzing selection...</p>
        </div>
      )}

      {error && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-red-900">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-300 flex-1 text-lg">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full py-3 px-6 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors duration-200 text-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {fontInfo && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold text-white mb-3">Font Details</h2>
            <p className="text-gray-400 text-lg">Information about the selected text</p>
          </div>
          
          <div className="space-y-8">
            <div className="font-detail-item bg-gray-800/50 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                </svg>
                <span className="text-gray-400 text-xl">Family</span>
              </div>
              <span className="block text-3xl font-medium text-white bg-gray-700/50 px-6 py-3 rounded-lg">
                {fontInfo.family}
              </span>
            </div>

            <div className="font-detail-item bg-gray-800/50 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-gray-400 text-xl">Weight</span>
              </div>
              <span className="block text-3xl font-medium text-white">
                {fontInfo.weight}
              </span>
            </div>

            <div className="font-detail-item bg-gray-800/50 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span className="text-gray-400 text-xl">Style</span>
              </div>
              <span className="block text-3xl font-medium text-white">
                {fontInfo.style}
              </span>
            </div>

            <div className="font-detail-item bg-gray-800/50 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-gray-400 text-xl">Size</span>
              </div>
              <span className="block text-3xl font-medium text-white">
                {fontInfo.size}
              </span>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="w-full mt-10 py-4 px-6 bg-gray-700/50 hover:bg-gray-700/70 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 text-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Check Another Selection
          </button>
        </div>
      )}
    </div>
  )
}

export default App
