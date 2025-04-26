import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiDownload, FiFileText, FiFile, FiCheck, FiCopy } from 'react-icons/fi';

function DataExport() {
  const prices = useSelector((state) => state.market.prices);
  const trends = useSelector((state) => state.market.trends);
  const [activeExport, setActiveExport] = useState(null);
  const [copied, setCopied] = useState(false);

  const exportData = (data, filename, format) => {
    setActiveExport(filename);
    
    setTimeout(() => {
      let content, mimeType, extension;
      
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else {
        // Default to CSV
        content = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).map(v => 
            typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
          ).join(','))
        ].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename.replace(/\.[^/.]+$/, '')}.${extension}`;
      a.click();
      setActiveExport(null);
    }, 300); // Small delay for visual feedback
  };

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiDownload className="mr-2 text-green-500" />
          Data Export Center
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Download market data in multiple formats
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Prices Export Card */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 flex items-center">
                <FiFileText className="mr-2 text-blue-500" />
                Price Data
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {prices.length} records available
              </p>
            </div>
            <button 
              onClick={() => copyToClipboard(prices)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy JSON to clipboard"
            >
              {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => exportData(prices, 'market_prices.csv', 'csv')}
              disabled={activeExport === 'market_prices.csv'}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeExport === 'market_prices.csv' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <FiFile className="mr-2" />
              {activeExport === 'market_prices.csv' ? 'Exporting...' : 'CSV Format'}
            </button>
            
            <button
              onClick={() => exportData(prices, 'market_prices.json', 'json')}
              disabled={activeExport === 'market_prices.json'}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeExport === 'market_prices.json' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <FiFile className="mr-2" />
              {activeExport === 'market_prices.json' ? 'Exporting...' : 'JSON Format'}
            </button>
          </div>
        </div>

        {/* Trends Export Card */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 flex items-center">
                <FiFileText className="mr-2 text-orange-500" />
                Trend Data
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {trends.length} records available
              </p>
            </div>
            <button 
              onClick={() => copyToClipboard(trends)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy JSON to clipboard"
            >
              {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => exportData(trends, 'market_trends.csv', 'csv')}
              disabled={activeExport === 'market_trends.csv'}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeExport === 'market_trends.csv' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <FiFile className="mr-2" />
              {activeExport === 'market_trends.csv' ? 'Exporting...' : 'CSV Format'}
            </button>
            
            <button
              onClick={() => exportData(trends, 'market_trends.json', 'json')}
              disabled={activeExport === 'market_trends.json'}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeExport === 'market_trends.json' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <FiFile className="mr-2" />
              {activeExport === 'market_trends.json' ? 'Exporting...' : 'JSON Format'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Data will be exported in your browser. Large datasets may take a moment to process.
        </p>
      </div>
    </div>
  );
}

export default DataExport;