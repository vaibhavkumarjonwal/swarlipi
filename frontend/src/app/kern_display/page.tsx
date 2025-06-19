'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TranslationProgress from '@/components/TranslationProgress';
import { TrebleClefIcon } from '@/components/icons/MusicalIcons';

interface KernSection {
  type: string;
  header: string;
  text: string;
  kern: string;
}
const BACKEND_URL = process.env.BACKEND_URL || 'http://164.52.205.176:5000' // Replace with your actual backend URL

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
  // Add a state for saving overlay
  const [showSavingOverlay, setShowSavingOverlay] = useState<boolean>(false);
  
  const formatRawKernText = (data: KernData | null) => {
    if (!data) return '';
    
    let content = data.metadata.header_text.trim();
    
    // Add sections without extra newlines
    data.sections.forEach(section => {
      // Remove any existing newlines at end of header
      const cleanHeader = section.header.trim();
      // Remove any existing newlines at start of text
      const cleanText = section.text.trim();
      content += '\n' + cleanHeader + '\n' + cleanText ;
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

        const response = await fetch(`${BACKEND_URL}/get_kern_data`, {
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
      setShowSavingOverlay(true); // Show the saving overlay
      const response = await fetch(`${BACKEND_URL}/save_kern`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          kern_data: editedKernData,
          preserve_outputs: true // Add this parameter to signal the backend not to delete the output folder
        }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to save kern data');
      
      setKernData(editedKernData);
      setSaveStatus('success');
      setEditMode(false);
      
      // Keep the overlay visible for a short moment after success
      setTimeout(() => {
        setShowSavingOverlay(false); // Hide the saving overlay
        setSaveStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Error saving kern data:', error);
      setSaveStatus('error');
      setTimeout(() => {
        setShowSavingOverlay(false);
        setSaveStatus('idle');
      }, 1500);
    }
  };

  const handleCancelEdit = () => {
    if (kernData) {
      setEditedKernData(JSON.parse(JSON.stringify(kernData)));
    }
    setEditMode(false);
  };
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-8 max-w-md mx-auto text-center">
        <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
          <TrebleClefIcon className="text-white" size={32} />
        </div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Loading Kern Notation</h2>
        <div className="flex justify-center mb-4">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
        <p className="text-gray-600">Please wait while we fetch your notation data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50 px-4">
      <div className="bg-white rounded-xl shadow-lg border border-red-100 p-8 max-w-md mx-auto text-center">
        <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-3 text-gray-800">Error Loading Data</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          onClick={handleBack}
        >
          Back to Editor
        </button>
      </div>
    </div>
  );
  
  if (!kernData) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md mx-auto text-center">
        <div className="mx-auto mb-6 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-3 text-gray-800">No Notation Data Available</h2>
        <p className="text-gray-600 mb-6">Please complete the previous steps to generate kern notation data.</p>
        <button 
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          onClick={handleBack}
        >
          Back to Editor
        </button>
      </div>
    </div>
  );
  
  const displayData = editMode ? editedKernData : kernData;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 font-sans">
      {/* Translation Progress */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200">
        <TranslationProgress currentStep="complete" />
      </div>
      
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-lg shadow-md">
                <TrebleClefIcon className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kern Notation</h1>
                <p className="text-gray-600 text-sm">Western notation format for your composition</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium"
                onClick={() => router.push('/upload')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add More Composition</span>
              </button>
              
              <button
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                onClick={handleBack}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* Success Banner */}
        <div className="bg-white rounded-lg shadow-md border border-green-200 p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
          
          <div className="relative flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg shadow-md flex-shrink-0">
              <svg className="text-white w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Notation Ready</h2>
              <p className="text-gray-600">Your composition has been successfully converted to Western notation format</p>
            </div>
          </div>
        </div>
      
        {/* Action Buttons & Tabs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button 
              className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'formatted' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-b-2 border-purple-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} ${editMode ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => !editMode && setActiveTab('formatted')}
              disabled={editMode}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span>Formatted View</span>
              </div>
            </button>
            <button 
              className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'raw' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-b-2 border-purple-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} ${editMode ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => !editMode && setActiveTab('raw')}
              disabled={editMode}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Raw Text</span>
              </div>
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 justify-end">
              {editMode ? (
                <>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                    onClick={handleCancelEdit}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center ${
                      saveStatus === 'saving' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                      saveStatus === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      saveStatus === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    onClick={handleSaveKern}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : saveStatus === 'success' ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved!
                      </>
                    ) : saveStatus === 'error' ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Save Failed
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                    onClick={() => setEditMode(true)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Kern
                  </button>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                    onClick={handleCopyAll}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy All
                  </button>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                    onClick={handleDownload}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center md:hidden"
                    onClick={() => router.push('/upload')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Composition
                  </button>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center md:hidden"
                    onClick={handleBack}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      
        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
          {activeTab === 'formatted' ? (
            <div>
              {/* Metadata Section */}
              <div className={`p-6 border-b ${getSectionBgColor('metadata')}`}>
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg shadow-md mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Composition Metadata</h2>
                </div>
                
                {editMode ? (
                  <textarea
                    className="w-full p-4 font-mono text-sm border border-purple-200 rounded-lg bg-purple-50 resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                    value={displayData?.metadata.header_text || ''}
                    onChange={handleMetadataTextChange}
                    rows={5}
                  />
                ) : (
                  <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm overflow-auto">
                    <pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap">
                      {displayData?.metadata.header_text}
                    </pre>
                  </div>
                )}
              </div>
              
              {/* Musical Sections */}
              {displayData?.sections.map((section, index) => (
                <div 
                  key={`${section.type}-${index}`} 
                  className={`p-6 border-b ${getSectionBgColor(section.type)}`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`${getSectionIconColor(section.type)} p-2 rounded-lg shadow-md mr-3`}>
                      {getSectionIcon(section.type)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {section.header.replace('!! ', '')}
                      </h2>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {section.type.split('_').join(' ')}
                      </span>
                    </div>
                  </div>
                  
                  {editMode ? (
                    <textarea
                      className="w-full p-4 font-mono text-sm border border-gray-300 rounded-lg bg-yellow-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      value={section.text}
                      onChange={(e) => handleSectionTextChange(index, e)}
                      rows={5}
                    />
                  ) : (
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm overflow-auto">
                      <pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap">
                        {section.text}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg shadow-md mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Raw Kern Notation</h2>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <pre className="min-h-[400px] font-mono text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto">
                  {formatRawKernText(displayData)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Saving Overlay */}
      {showSavingOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Saving Your Notation</h2>
            <p className="text-gray-600 text-lg">Please wait while we save your notation data...</p>
            <div className="mt-6 flex justify-center">
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
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
  
  function getSectionIconColor(type: string): string {
    switch(type) {
      case 'sthayee': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'antara': return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      case 'sanchari': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'aabhog': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'sthayee_antara_transition':
      case 'antara_sanchari_transition':
      case 'sanchari_aabhog_transition':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default: return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white';
    }
  }
  
  function getSectionIcon(type: string) {
    switch(type) {
      case 'sthayee':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'antara':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        );
      case 'sanchari':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'aabhog':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  }
};

 export default KernDisplay;