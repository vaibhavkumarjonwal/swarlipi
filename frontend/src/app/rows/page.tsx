'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
interface RowItem {
  id: string;
  selected: boolean;
  option: string;
  imagePath: string;
  imageUrl: string | null;
  samBeat?: string;
  dropdownDisabled?: boolean; 
} 

interface ImageInfo {
  url: string;
  filename: string;
}

interface CategoryMap {
  'Articulation Rows'?: number[];
  'Kann Swar Rows'?: number[];
  'Swar Rows'?: number[];
  'Lyrics Rows'?: number[];
  [key: string]: number[] | undefined;
}

interface FinalRowsData {
  articulation: number[];
  kann_swar: number[];
  swar: number[];
  lyrics: number[];
  Sthayee: { row: number, sam_beat: string }[];
  Antara: { row: number, sam_beat: string }[];
  Sanchari: { row: number, sam_beat: string }[];
  Aabhog: { row: number, sam_beat: string }[];
  row_paths: string[];
}
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';

const Rows: React.FC = () => {
  const router = useRouter();
  const [rows, setRows] = useState<RowItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [dropdownEnabled, setDropdownEnabled] = useState<boolean>(false);
  const [receivedData, setReceivedData] = useState<any>(null);
  
  const [rowPaths, setRowPaths] = useState<string[]>([]);
  const [samAndTaalisRows, setSamAndTaalisRows] = useState<number[]>([]);

  const disabledOptions = ['select option', 'Sthayee', 'Antara', 'Sanchari', 'Aabhog', 'articulation', 'swar', 'kann_swar', 'lyrics', 'miscellaneous', 'metadata'];
  const options = [...disabledOptions];
  const samBeatRequiredOptions = ['Sthayee', 'Antara', 'Sanchari', 'Aabhog'];

  useEffect(() => {
    const loadData = () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const dataParam = searchParams.get('data');
        
        if (dataParam) {
          try {
            const data = JSON.parse(dataParam);
            setReceivedData(data);
            setRowPaths(data.row_paths || []);
            setSamAndTaalisRows(data.sam_and_taalis_rows || []);
            return;
          } catch (err) {
            console.error('Error parsing URL data:', err);
          }
        }
        
        const storedData = localStorage.getItem('rowsData');
        if (storedData) {
          try {
            const data = JSON.parse(storedData);
            setReceivedData(data);
            setRowPaths(data.row_paths || []);
            setSamAndTaalisRows(data.sam_and_taalis_rows || []);
          } catch (err) {
            console.error('Error parsing localStorage data:', err);
          }
        }
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (rowPaths.length > 0) {
      fetchImages(rowPaths);
    } else {
      setIsLoading(false);
    }
  }, [rowPaths]);

  useEffect(() => {
    if (images.length > 0) {
      initializeRows();
    }
  }, [images]);

  const applyCategoriesToRows = (categoryMap: CategoryMap) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        const rowNumMatch = row.id.match(/row_(\d+)$/);
        const rowNum = rowNumMatch ? parseInt(rowNumMatch[1], 10) : null;
  
        if (!rowNum) return row;
  
        const categoryMapping: Record<string, string> = {
          'Articulation Rows': 'articulation',
          'Kann Swar Rows': 'kann_swar',
          'Swar Rows': 'swar',
          'Lyrics Rows': 'lyrics'
        };
  
        for (const [category, rowNums] of Object.entries(categoryMap)) {
          if (rowNums && rowNums.includes(rowNum)) {
            const dropdownOption = categoryMapping[category] || category;
            return {
              ...row,
              option: dropdownOption,
              dropdownDisabled: row.dropdownDisabled 
            };
          }
        }
  
        return row;
      });
    });
    
    setDropdownEnabled(true);
  };
  
  const initializeRows = () => {
    try {
      const newRows = images.map((image, index) => {
        const rowNumMatch = image.filename.match(/R(\d+)\.png$/);
        const rowNum = rowNumMatch ? parseInt(rowNumMatch[1], 10) : index + 1;
        const selected = samAndTaalisRows.includes(rowNum);
        
        return {
          id: `row_${rowNum}`,
          selected,
          option: 'select option',
          imagePath: image.filename,
          imageUrl: image.url,
          samBeat: '',
          dropdownDisabled: false
        };
      });
      
      setRows(newRows);
    } catch (error) {
      console.error('Error initializing rows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImages = async (rowImages: string[]) => {
    try {
      setIsLoading(true);

      rowImages.sort((a, b) => {
        const numA = parseInt(a.match(/R(\d+)\.png$/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/R(\d+)\.png$/)?.[1] || '0', 10);
        return numA - numB;
      });

      const imageUrls = await Promise.all(
        rowImages.map(async (filename) => {
          try {
            const imageResponse = await fetch(`${BACKEND_URL}/image/${filename}`);
            if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${filename}`);
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
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, selected: !row.selected } : row
    ));
  };

  const handleOptionChange = (id: string, value: string) => {
    if (value === 'Sthayee') {
      setRows(rows.map(row => 
        row.id === id 
          ? { ...row, option: value } 
          : row.option === 'Sthayee' 
            ? { ...row, option: 'select option' } 
            : row
      ));
    } else {
      setRows(rows.map(row => 
        row.id === id ? { ...row, option: value } : row
      ));
    }
  };

  const handleSamBeatChange = (id: string, value: string) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, samBeat: value } : row
    ));
  };

  const handleSubmit = async () => {
    const incompleteRows = rows.filter(row => 
      samBeatRequiredOptions.includes(row.option) && (!row.samBeat || row.samBeat.trim() === '')
    );

    if (incompleteRows.length > 0) {
      alert('Please fill in the Sam Beat for all Sthayee, Antara, Sanchari, and Aabhog rows.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedRows = rows
        .filter(row => row.selected)
        .map(row => ({
          id: row.id,
          option: row.option,
          imagePath: row.imagePath,
          samBeat: row.samBeat || null
        }));
      
      const currentSamAndTaalisRows = rows
        .filter(row => row.selected)
        .map(row => {
          const rowNumMatch = row.id.match(/row_(\d+)$/);
          return rowNumMatch ? parseInt(rowNumMatch[1], 10) : -1;
        })
        .filter(num => num !== -1);
      
      const response = await fetch(`${BACKEND_URL}/update_sam_taali`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          selections: selectedRows,
          row_paths: rowPaths,
          sam_and_taalis_rows: currentSamAndTaalisRows
        })
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save selections');
      }
      
      const result = await response.json();
      console.log("API Response:", result);

      setRows(prevRows => prevRows.map(row => {
        if (row.selected) {
          return {
            ...row,
            dropdownDisabled: true
          };
        }
        return row;
      }));
      
      setDropdownEnabled(true);   
      
      if (result.row_categories) {
        applyCategoriesToRows(result.row_categories);
      } else if (result['Articulation Rows'] || result['Kann Swar Rows'] || result['Swar Rows'] || result['Lyrics Rows']) {
        applyCategoriesToRows(result);
      } else {
        alert('Selections saved successfully!');
      }
      
    } catch (error) {
      console.error('Error saving selections:', error);
      alert('Failed to save selections. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare the final data structure
      const finalData: FinalRowsData = {
        articulation: [],
        kann_swar: [],
        swar: [],
        lyrics: [],
        Sthayee: [],
        Antara: [],
        Sanchari: [],
        Aabhog: [],
        row_paths: rowPaths
      };
  
      // Process rows to populate finalData
      rows.forEach(row => {
        const rowNumMatch = row.id.match(/row_(\d+)$/);
        const rowNum = rowNumMatch ? parseInt(rowNumMatch[1], 10) : null;
        
        if (!rowNum) return;
  
        switch (row.option) {
          case 'articulation':
            finalData.articulation.push(rowNum);
            break;
          case 'kann_swar':
            finalData.kann_swar.push(rowNum);
            break;
          case 'swar':
            finalData.swar.push(rowNum);
            break;
          case 'lyrics':
            finalData.lyrics.push(rowNum);
            break;
          case 'Sthayee':
            if (row.samBeat) {
              finalData.Sthayee.push({ row: rowNum, sam_beat: row.samBeat });
            }
            break;
          case 'Antara':
            if (row.samBeat) {
              finalData.Antara.push({ row: rowNum, sam_beat: row.samBeat });
            }
            break;
          case 'Sanchari':
            if (row.samBeat) {
              finalData.Sanchari.push({ row: rowNum, sam_beat: row.samBeat });
            }
            break;
          case 'Aabhog':
            if (row.samBeat) {
              finalData.Aabhog.push({ row: rowNum, sam_beat: row.samBeat });
            }
            break;
        }
      });
  
      // First try to store data in localStorage (for smaller datasets)
      try {
        localStorage.setItem('rowsFinalData', JSON.stringify(finalData));
      } catch (e) {
        console.warn('LocalStorage is full, falling back to server storage');
      }
  
      // Send data to server endpoint
      const response = await fetch(`${BACKEND_URL}/final_rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit final selections');
      }
  
      const responseData = await response.json();
      
      // Store the response data in localStorage
      localStorage.setItem('segmentedData', JSON.stringify({
        predictions: responseData.predictions,
        subgroups: responseData.subgroups,
        row_paths: responseData.row_paths
      }));
      
      // Navigate to segmented page
      router.push('/segmented');
      
    } catch (error) {
      console.error('Error submitting final selections:', error);
      alert('Failed to submit final selections. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  async function compressData(data: string): Promise<Blob> {
    const stream = new Blob([data]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    return await new Response(compressedStream).blob();
  }

  const handleGoBack = () => {
    router.back();
  };

  if (!receivedData) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-lg text-gray-600">No data available. Please go back and complete the previous step.</p>
        <button 
          onClick={() => router.push('/initial-rows')} 
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-10 text-lg text-gray-600">
        Loading rows...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-center mb-6">Select Rows with Sam, Taali and Khali</h2>
      
      <div className="border-t border-gray-200 mb-6">
        {rows.map(row => (
          <div key={row.id} className="flex items-center gap-4 py-4 border-b border-gray-200">
            <div className="flex items-center w-24">
              <input
                type="checkbox"
                checked={row.selected}
                onChange={() => handleCheckboxChange(row.id)}
                className={`w-5 h-5 text-blue-600 rounded ${row.selected ? 'bg-blue-600' : 'bg-white'} border-gray-300 focus:ring-blue-500`}
                disabled={dropdownEnabled || isSubmitting}
              />
              <span className="ml-2 text-sm">{row.id}:</span>
            </div>
            
            <div className="w-40">
              <select 
                value={row.option}
                onChange={(e) => handleOptionChange(row.id, e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded ${row.dropdownDisabled ? 'bg-gray-100' : 'bg-red-100'} border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
                disabled={!dropdownEnabled || isSubmitting || row.dropdownDisabled}
              >
                {options.map(option => (
                  <option 
                    key={option} 
                    value={option}
                    disabled={option === 'select option'}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {samBeatRequiredOptions.includes(row.option) && (
              <div className="w-40">
                <input
                  type="text"
                  value={row.samBeat || ''}
                  onChange={(e) => handleSamBeatChange(row.id, e.target.value)}
                  placeholder="Enter Sam Beat"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            )}
            
            <div className="flex-1">
              {row.imageUrl ? (
                <img 
                  src={row.imageUrl} 
                  alt={`Row ${row.id}`} 
                  className="max-h-20 object-contain" 
                />
              ) : (
                <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                  No image available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-4">
        <button 
          onClick={handleGoBack} 
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
          disabled={isSubmitting}
        >
          Back
        </button>
        
        {!dropdownEnabled ? (
          <button 
            onClick={handleSubmit} 
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Selections'}
          </button>
        ) : (
          <button 
            onClick={handleFinalSubmit} 
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Submit Final Rows'}
          </button>
        )}
      </div>
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-700">Processing data, segmenting rows...</p>
        </div>
      )}
    </div>
  );
};

export default Rows;