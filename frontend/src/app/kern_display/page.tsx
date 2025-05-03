'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KernSection {
  type: string;
  header: string;
  text: string;
  kern: string;
}

interface KernData {
  metadata: {
    header_text: string;
    header_kern: string;
  };
  sections: KernSection[];
}

const KernDisplay: React.FC = () => {
  const router = useRouter();
  const [kernData, setKernData] = useState<KernData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedKernData, setEditedKernData] = useState<KernData | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const formatRawKernText = (data: KernData | null) => {
    if (!data) return '';
    
    let content = data.metadata.header_text.trim();
    
    // Add sections without extra newlines
    data.sections.forEach(section => {
      // Remove any existing newlines at end of header
      const cleanHeader = section.header.trim();
      // Remove any existing newlines at start of text
      const cleanText = section.text.trim();
      content += cleanHeader + '\n' + cleanText;
    });
    
    return content;
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = localStorage.getItem('kernDisplayData');
        if (storedData) {
          const data = JSON.parse(storedData);
          setKernData(data);
          setEditedKernData(JSON.parse(JSON.stringify(data)));
          setLoading(false);
          return;
        }
  
        const searchParams = new URLSearchParams(window.location.search);
        const dataParam = searchParams.get('data');
        
        if (dataParam) {
          const data = JSON.parse(dataParam);
          setKernData(data.kernData);
          setEditedKernData(JSON.parse(JSON.stringify(data.kernData)));
          setLoading(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:5000/get_kern_data', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setKernData(data);
          setEditedKernData(JSON.parse(JSON.stringify(data)));
        } else {
          throw new Error("Failed to load data from server");
        }
      } catch (err) {
        setError('Failed to load kern data');
        console.error('Error loading kern data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleDownload = () => {
    if (!kernData) return;
    
    const content = formatRawKernText(kernData);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kern_notation.txt';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const handleCopyAll = async () => {
    if (!kernData) return;
    
    const content = formatRawKernText(kernData);
    
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const handleBack = () => {
    router.back();
  };

  const handleMetadataTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editedKernData) return;
    
    setEditedKernData({
      ...editedKernData,
      metadata: {
        ...editedKernData.metadata,
        header_text: event.target.value
      }
    });
  };

  const handleSectionTextChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editedKernData) return;
    
    const updatedSections = [...editedKernData.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      text: event.target.value
    };
    
    setEditedKernData({
      ...editedKernData,
      sections: updatedSections
    });
  };

  const handleSaveKern = async () => {
    if (!editedKernData) return;
    
    try {
      setSaveStatus('saving');
      const response = await fetch('http://127.0.0.1:5000/save_kern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ kern_data: editedKernData }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to save kern data');
      
      setKernData(editedKernData);
      setSaveStatus('success');
      setEditMode(false);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving kern data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleCancelEdit = () => {
    if (kernData) {
      setEditedKernData(JSON.parse(JSON.stringify(kernData)));
    }
    setEditMode(false);
  };
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center py-10 text-lg">Loading kern data...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <div className="text-center text-lg text-red-600">{error}</div>
      <button 
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        onClick={handleBack}
      >
        Back to Editor
      </button>
    </div>
  );
  
  if (!kernData) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center py-10 text-lg text-red-600">No kern data available</div>
    </div>
  );
  
  const displayData = editMode ? editedKernData : kernData;
  
  return (
    <div className="max-w-6xl mx-auto px-5 py-6 font-sans min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Kern Notation</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded transition-colors ${activeTab === 'formatted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} ${editMode ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            onClick={() => !editMode && setActiveTab('formatted')}
            disabled={editMode}
          >
            Formatted View
          </button>
          <button 
            className={`px-4 py-2 rounded transition-colors ${activeTab === 'raw' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} ${editMode ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
            onClick={() => !editMode && setActiveTab('raw')}
            disabled={editMode}
          >
            Raw Text
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {editMode ? (
            <>
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 rounded text-white transition-colors ${
                  saveStatus === 'saving' ? 'bg-orange-500' :
                  saveStatus === 'success' ? 'bg-green-600' :
                  saveStatus === 'error' ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'
                }`}
                onClick={handleSaveKern}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'success' ? 'Saved!' : 
                 saveStatus === 'error' ? 'Save Failed' : 'Save Kern'}
              </button>
            </>
          ) : (
            <>
              <button 
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                onClick={() => setEditMode(true)}
              >
                Edit Kern
              </button>
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                onClick={handleDownload}
              >
                Download
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={handleCopyAll}
              >
                Copy All
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={handleBack}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
        {activeTab === 'formatted' ? (
          <div>
            <div className={`p-4 border-b ${getSectionBgColor('metadata')}`}>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Metadata</h2>
              {editMode ? (
                <textarea
                  className="w-full p-3 font-mono text-sm border border-gray-300 rounded bg-yellow-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={displayData?.metadata.header_text || ''}
                  onChange={handleMetadataTextChange}
                  rows={5}
                />
              ) : (
                <pre className="p-3 bg-gray-50 rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {displayData?.metadata.header_text}
                </pre>
              )}
            </div>
            
            {displayData?.sections.map((section, index) => (
              <div 
                key={`${section.type}-${index}`} 
                className={`p-4 border-b ${getSectionBgColor(section.type)}`}
              >
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  {section.header.replace('!! ', '')}
                </h2>
                {editMode ? (
                  <textarea
                    className="w-full p-3 font-mono text-sm border border-gray-300 rounded bg-yellow-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={section.text}
                    onChange={(e) => handleSectionTextChange(index, e)}
                    rows={5}
                  />
                ) : (
                  <pre className="p-3 bg-gray-50 rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {section.text}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <pre className="min-h-[400px] p-3 bg-gray-50 rounded font-mono text-sm whitespace-pre overflow-x-auto">
              {formatRawKernText(displayData)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  function getSectionBgColor(type: string): string {
    switch(type) {
      case 'sthayee': return 'bg-blue-50';
      case 'antara': return 'bg-yellow-50';
      case 'sanchari': return 'bg-green-50';
      case 'aabhog': return 'bg-red-50';
      case 'sthayee_antara_transition':
      case 'antara_sanchari_transition':
      case 'sanchari_aabhog_transition':
        return 'bg-gray-100';
      case 'metadata': return 'bg-purple-50';
      default: return 'bg-white';
    }
  }
};

export default KernDisplay;