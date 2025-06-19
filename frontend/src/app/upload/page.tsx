'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon, ProcessIcon, StaffLinesIcon } from '@/components/icons/MusicalIcons';
import TranslationProgress from '@/components/TranslationProgress';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://164.52.205.176:5000';

const UploadPage = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Clear outputs folder when component mounts (new composition)
  useEffect(() => {
    const clearOutputsFolder = async () => {
      try {
        await fetch(`${BACKEND_URL}/clear_outputs`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.log('Note: Could not clear outputs folder (may not exist yet)');
      }
    };
    
    clearOutputsFolder();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a PDF file only.");
      }
    }
  };

  const handleUpload = async () => {
    setError(null);

    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const rowsRes = await fetch(`${BACKEND_URL}/get_initial_rows`, {
        method: "GET",
        credentials: "include",
      });

      const rowsData = await rowsRes.json();
      if (!rowsRes.ok) throw new Error(rowsData.error || "Failed to get initial rows");

      localStorage.setItem('initialRowsData', JSON.stringify(rowsData));
      router.push("/initial_rows");    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Translation Progress */}
        <TranslationProgress currentStep="upload" />
        
        {/* Header Section */}
        <div className="text-center mb-12">
          
          
          <h1 className="text-4xl font-display font-bold text-slate-800 mb-4">
            Upload Your Music
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to <span className="font-semibold text-orange-600">SwarLipi</span>! 
            Transform your Indian classical music PDFs into Western notation with AI-powered precision.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-indian border border-orange-100 overflow-hidden">
          {/* Progress Indicator */}
          <div className="bg-gradient-to-r from-orange-500 to-blue-500 h-1"></div>
          
          <div className="p-8">
            {/* Upload Area */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-slate-800 mb-4">
                Choose Your Music PDF
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group ${
                  dragActive 
                    ? 'border-orange-400 bg-orange-50' 
                    : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <UploadIcon className="text-white" size={32} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {dragActive ? 'Drop your PDF here' : 'Upload Indian Classical Music PDF'}
                  </h3>
                  
                  <p className="text-slate-600 mb-4">
                    Drag and drop your PDF file here, or{' '}
                    <span className="text-orange-600 font-medium">click to browse</span>
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>PDF files only • Maximum 10MB</span>
                  </div>
                </div>
              </div>

              {/* File Preview */}
              {file && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{file.name}</p>
                      <p className="text-sm text-green-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <span className="text-lg">Processing Your Music...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <ProcessIcon className="text-white" size={24} />
                  <span className="text-lg">Start Musical Translation</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-musical border border-orange-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">AI-Powered Recognition</h3>
            <p className="text-sm text-slate-600">Advanced machine learning models trained specifically on Indian classical music notation patterns.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-musical border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Seamless Translation</h3>
            <p className="text-sm text-slate-600">Convert between Indian swaras and Western note notation while preserving musical integrity and context.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-musical border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Interactive Editing</h3>
            <p className="text-sm text-slate-600">Review, edit, and refine the translation with our intuitive interface before exporting to standard formats.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
