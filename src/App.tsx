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
    <div className="w-[240px] bg-gray-900 text-white p-3">
      {loading && (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-gray-700 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-300 mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      )}

      {fontInfo && (
        <div>
          <div className="text-center mb-2">
            <h2 className="text-xs font-medium text-gray-300">Font Details</h2>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-gray-400">Family:</span>
              <span className="text-white font-medium">{fontInfo.family}</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-gray-400">Weight:</span>
              <span className="text-white font-medium">{fontInfo.weight}</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-gray-400">Style:</span>
              <span className="text-white font-medium">{fontInfo.style}</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-gray-400">Size:</span>
              <span className="text-white font-medium">{fontInfo.size}</span>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="w-full mt-2 py-1 px-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors duration-200"
          >
            Check Another
          </button>
        </div>
      )}
    </div>
  )
}

export default App
