'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkflowProgress from '@/components/WorkflowProgress';
import MetadataForm from '@/components/MetadataForm';

interface ImageInfo {
  url: string;
  filename: string;
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://164.52.205.176:5000';

interface FormData {
  raag: string;
  taal: string;
  laya: string;
  source: string;
  pageNo: string;
  startRow: string;
  endRow: string;
}

const InitialRows = () => {
  const router = useRouter();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowPaths, setRowPaths] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    raag: '',
    taal: '',
    laya: '',
    source: '',
    pageNo: '',
    startRow: '',
    endRow: ''
  });

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem('initialRowsData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setRowPaths(parsedData.row_paths || []);
    } else {
      // No data found, redirect to upload page
      router.push('/upload');
    }
  }, [router]);

  useEffect(() => {
    if (rowPaths.length > 0) {
      fetchImages(rowPaths);
    }
  }, [rowPaths]);

  const fetchImages = async (rowImages: string[]) => {
    try {
      setIsLoading(true);

      // Sort row images by row number
      rowImages.sort((a, b) => {
        const numA = parseInt(a.match(/R(\d+)\.png$/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/R(\d+)\.png$/)?.[1] || '0', 10);
        return numA - numB;
      });

      // Load images from backend
      const imageUrls = await Promise.all(
        rowImages.map(async (filename) => {
          try {
            const imageResponse = await fetch(`${BACKEND_URL}/image/${filename}`);
            if (!imageResponse.ok) {
              throw new Error(`Failed to fetch image: ${filename}`);
            }
            const blob = await imageResponse.blob();
            return {
              url: URL.createObjectURL(blob),
              filename: filename,
            };
          } catch (error) {
            console.error(error);
            return null;
          }
        })
      );

      setImages(imageUrls.filter((img): img is ImageInfo => img !== null));
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMetadata = async () => {
    const { raag, taal, laya, startRow, endRow } = formData;
    
    if (!raag || !taal || !laya || !startRow || !endRow) {
      alert('Please fill in all mandatory fields: Raag, Taal, Laya, Start Row, and End Row.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/update_initial_rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const sam_taali_data = await response.json();
      if (!response.ok) throw new Error(sam_taali_data.error || "Failed to get initial rows");

      // Store the data in localStorage
      localStorage.setItem('rowsData', JSON.stringify(sam_taali_data));
      
      // Navigate to rows page
      router.push('/rows');

    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (rowPaths.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No Data Available</h2>
          <p className="text-slate-600 mb-6">Please upload a file first to continue.</p>
          <button 
            onClick={() => router.push('/upload')} 
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">
            Musical Analysis
          </h1>
          <p className="text-lg text-slate-600">
            Review the segmented rows and provide musical context
          </p>
        </div>

        {/* Workflow Progress */}
        <WorkflowProgress currentStep="process" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Metadata Form */}
          <div className="lg:col-span-1">
            <MetadataForm
              formData={formData}
              onFormChange={setFormData}
              onSubmit={handleSaveMetadata}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Row Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-musical border border-orange-100">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Segmented Rows ({images.length} detected)</span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  AI has identified and segmented individual musical lines from your PDF
                </p>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading musical rows...</p>
                    <p className="text-sm text-slate-500 mt-1">Processing your notation</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {images.map((image, index) => (
                      <div
                        key={image.filename}
                        className="group border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:border-orange-300"
                      >
                        <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-4 py-2 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">
                              Row {index + 1}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {image.filename}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <div className="relative overflow-hidden rounded-md bg-slate-50">
                            <img
                              src={image.url}
                              alt={`Musical Row ${index + 1}`}
                              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {images.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Rows Found</h3>
                    <p className="text-slate-600">Unable to detect musical rows in the uploaded PDF.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialRows;
