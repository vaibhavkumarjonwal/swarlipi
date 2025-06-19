'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StaffLinesIcon, NotesIcon, ProcessIcon, TrebleClefIcon } from '@/components/icons/MusicalIcons';

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
  
      try {
        localStorage.setItem('rowsFinalData', JSON.stringify(finalData));
      } catch (e) {
        console.warn('LocalStorage is full, falling back to server storage');
      }
  
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
      
      localStorage.setItem('segmentedData', JSON.stringify({
        predictions: responseData.predictions,
        subgroups: responseData.subgroups,
        row_paths: responseData.row_paths
      }));
      
      router.push('/segmented');
      
    } catch (error) {
      console.error('Error submitting final selections:', error);
      alert('Failed to submit final selections. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!receivedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-orange-200 max-w-md mx-4">
          <div className="text-center">
            <TrebleClefIcon className="text-orange-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800 mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-6">Please go back and complete the previous step.</p>
            <button 
              onClick={() => router.push('/initial-rows')} 
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Go Back to Previous Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-orange-200 max-w-md mx-4">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <StaffLinesIcon className="text-orange-500 absolute inset-0 m-auto" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Music Rows</h2>
            <p className="text-gray-600 text-sm">संगीत पंक्तियों को लोड कर रहे हैं...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl">
                <NotesIcon className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Music Row Classification</h1>
                <p className="text-gray-600">Select Sam, Tali, Khali markers and classify each row</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-orange-700 font-medium">Step 2 of 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Instructions Card */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg flex-shrink-0">
              <ProcessIcon className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-3">How to Classify Rows</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Step 1: Select Sam/Tali/Khali Rows</h3>
                  <p className="text-blue-700 text-sm">Check the boxes for rows containing rhythmic cycle markers (Sam, Tali, Khali).</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Step 2: Classify Content</h3>
                  <p className="text-green-700 text-sm">Use dropdowns to categorize rows: Sthayee, Antara, Swar, Kann Swar, etc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {!dropdownEnabled ? (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Select rows with Sam, Tali, and Khali markings</p>
                  <p className="text-blue-600 text-sm">Currently selected: {rows.filter(r => r.selected).length} rows</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-200 px-4 py-2 rounded-lg">
                  <p className="text-blue-800 font-bold">{rows.filter(r => r.selected).length}/{rows.length}</p>
                  <p className="text-blue-600 text-xs">Selected</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-green-800">Now classify each row using the dropdown menus</p>
                  <p className="text-green-600 text-sm">Classifications completed: {rows.filter(r => r.option !== 'select option').length}/{rows.length}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-200 px-4 py-2 rounded-lg">
                  <p className="text-green-800 font-bold">{rows.filter(r => r.option !== 'select option').length}/{rows.length}</p>
                  <p className="text-green-600 text-xs">Classified</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rows Grid */}
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className={`bg-white rounded-xl shadow-md border-2 transition-all duration-300 ${
              row.selected 
                ? 'border-blue-400 shadow-lg transform scale-[1.01]' 
                : 'border-gray-200 hover:border-orange-300 hover:shadow-lg'
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* Checkbox Section */}
                  <div className="flex items-center space-x-3 min-w-fit">
                    <button
                      type="button"
                      onClick={() => handleCheckboxChange(row.id)}
                      disabled={dropdownEnabled || isSubmitting}
                      className={`w-8 h-8 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        dropdownEnabled || isSubmitting 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer hover:scale-110 hover:shadow-md'
                      } ${
                        row.selected 
                          ? 'bg-blue-500 border-blue-500 shadow-md' 
                          : 'border-gray-300 hover:border-blue-400 bg-white'
                      }`}
                    >
                      {row.selected && (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <span className="text-lg font-semibold text-gray-700 min-w-fit">
                      {row.id.replace('row_', 'Row ')}
                    </span>
                  </div>
                  
                  {/* Dropdown Section */}
                  <div className="min-w-fit w-56">
                    <select 
                      value={row.option}
                      onChange={(e) => handleOptionChange(row.id, e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                        row.dropdownDisabled 
                          ? 'bg-gray-50 border-gray-200 text-gray-500' 
                          : row.option === 'select option'
                            ? 'bg-red-50 border-red-300 text-red-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400'
                      }`}
                      disabled={!dropdownEnabled || isSubmitting || row.dropdownDisabled}
                    >
                      {options.map(option => (
                        <option 
                          key={option} 
                          value={option}
                          disabled={option === 'select option'}
                        >
                          {option === 'select option' ? 'Choose classification...' : option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sam Beat Input */}
                  {samBeatRequiredOptions.includes(row.option) && (
                    <div className="min-w-fit w-40">
                      <input
                        type="text"
                        value={row.samBeat || ''}
                        onChange={(e) => handleSamBeatChange(row.id, e.target.value)}
                        placeholder="Sam Beat"
                        className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  
                  {/* Image Section */}
                  <div className="flex-1 min-w-0">
                    {row.imageUrl ? (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <img 
                          src={row.imageUrl} 
                          alt={`Row ${row.id}`} 
                          className="max-h-20 w-full object-contain rounded" 
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <TrebleClefIcon className="text-gray-400 mx-auto mb-2" size={24} />
                          <p className="text-gray-500 text-sm">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-12">
          <button 
            onClick={handleGoBack} 
            className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            ← Back
          </button>
          
          {!dropdownEnabled ? (
            <button 
              onClick={handleSubmit} 
              className="px-12 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <ProcessIcon className="inline mr-2" size={20} />
                  Save Selections
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleFinalSubmit} 
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <NotesIcon className="inline mr-2" size={20} />
                  Continue to Segmentation →
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Processing Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <ProcessIcon className="text-white animate-pulse" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Processing Music Data</h3>
            <p className="text-gray-600 mb-6">
              Analyzing rows and preparing for segmentation...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">संगीत विश्लेषण जारी है...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rows;
