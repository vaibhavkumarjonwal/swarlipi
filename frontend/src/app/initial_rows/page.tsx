'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ImageInfo {
  url: string;
  filename: string;
}

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

// In initialrows.tsx, modify the handleSave function:
const handleSave = async () => {
  const { raag, taal, laya, startRow, endRow } = formData;
  
  if (!raag || !taal || !laya || !startRow || !endRow) {
    alert('Please fill in all mandatory fields: Raag, Taal, Laya, Start Row, and End Row.');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:5000/update_initial_rows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const sam_taali_data = await response.json();
    if (!response.ok) throw new Error(sam_taali_data.error || "Failed to get initial rows");

    // Store the data in localStorage
    localStorage.setItem('rowsData', JSON.stringify(sam_taali_data));
    
    // Navigate to rows page with data as query parameter
    const queryParams = new URLSearchParams();
    queryParams.set('data', JSON.stringify(sam_taali_data));
    router.push(`/rows?${queryParams.toString()}`);

  } catch (error) {
    console.error('Error saving data:', error);
    alert('Failed to save. Please try again.');
  }
};
  
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
            const imageResponse = await fetch(`http://127.0.0.1:5000/image/${filename}`);
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

  if (rowPaths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p>No data available. Please upload a file first.</p>
        <button 
          onClick={() => router.push('/upload')} 
          className="mt-2 underline text-blue-600"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto">
      <h2 className="text-2xl font-bold mb-5 text-center">Initial Rows</h2>
      
      <div className="flex gap-10 items-start">
        {/* Left side - Form inputs */}
        <div className="flex-1 max-w-[300px] pr-5 border-r border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="raag" className="font-medium min-w-[80px] mr-2">Raag*</label>
            <input
              type="text"
              id="raag"
              name="raag"
              value={formData.raag}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="taal" className="font-medium min-w-[80px] mr-2">Taal*</label>
            <select
              id="taal"
              name="taal"
              value={formData.taal}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm appearance-none"
            >
              <option value="">Select Taal</option>
              <option value="Rupak">Rupak</option>
              <option value="Sultaal">Sultaal</option>
              <option value="Chautaal">Chautaal</option>
              <option value="Ada Chautaal">Ada Chautaal</option>
              <option value="Jhoomra">Jhoomra</option>
              <option value="Dhamaar">Dhamaar</option>
              <option value="Deepchandi">Deepchandi</option>
              <option value="Punjabi (Tilwada)">Punjabi (Tilwada)</option>
              <option value="Dadra">Dadra</option>
              <option value="Jhaptal">Jhaptal</option>
              <option value="Ektaal">Ektaal</option>
              <option value="Teentaal">Teentaal</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="laya" className="font-medium min-w-[80px] mr-2">Laya*</label>
            <select
              id="laya"
              name="laya"
              value={formData.laya}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm appearance-none"
            >
              <option value="">Select Laya</option>
              <option value="vilambit">Vilambit</option>
              <option value="madhyalaya">Madhyalaya</option>
              <option value="drut">Drut</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="source" className="font-medium min-w-[80px] mr-2">Source</label>
            <input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="pageNo" className="font-medium min-w-[80px] mr-2">Page No.</label>
            <input
              type="text"
              id="pageNo"
              name="pageNo"
              value={formData.pageNo}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="startRow" className="font-medium min-w-[80px] mr-2">Start Row*</label>
            <input
              type="text"
              id="startRow"
              name="startRow"
              value={formData.startRow}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="endRow" className="font-medium min-w-[80px] mr-2">End Row*</label>
            <input
              type="text"
              id="endRow"
              name="endRow"
              value={formData.endRow}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
          </div>
          
          <button 
            className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        
        {/* Right side - Images */}
        <div className="flex-1 max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-center py-5 text-gray-600">Loading images...</p>
          ) : (
            <div className="flex flex-col border-t border-gray-200 mb-1">
              {images.map((image, index) => (
                <div key={image.filename} className="flex items-center gap-2 border-b border-gray-200 py-2">
                  <div className="font-medium min-w-[60px]">row_{index + 1}:</div>
                  <img 
                    src={image.url} 
                    alt={`Row ${index + 1}`} 
                    className="max-w-full h-auto bg-gray-100 rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitialRows;