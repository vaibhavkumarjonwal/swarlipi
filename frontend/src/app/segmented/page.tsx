'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PredictionData {
  metadata: {
    a: string;
    b: string;
    c: string;
  };
  predictions: {
    [subgroupKey: string]: {
      kann_swar: string[][];
      swar: string[][];
      meend: string[];
    };
  };
}

interface SubgroupData {
  [subgroupKey: string]: {
    swar_list: string[][];
    kann_swar_list: string[][];
    swar_articulation_checks: (boolean | [])[];
    lyrics_articulation_checks: (boolean | [])[];
    lyrics_list: string[][];
    meend_list: string[];
  };
}

interface SegmentedData {
  predictions: PredictionData;
  subgroups: SubgroupData;
  row_paths: string[];
}

interface ImageInfo {
  url: string;
  filename: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://164.52.205.176/:5000';

const Segmented: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<SegmentedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedData, setEditedData] = useState<PredictionData | null>(null);
  const [imageCache, setImageCache] = useState<{[key: string]: ImageInfo}>({});
  const [rowImages, setRowImages] = useState<ImageInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedData = localStorage.getItem('segmentedData');
        if (storedData) {
          const receivedData = JSON.parse(storedData);
          
          Object.keys(receivedData.predictions.predictions).forEach(subgroupKey => {
            const subgroup = receivedData.predictions.predictions[subgroupKey];
            if (!subgroup.meend || !Array.isArray(subgroup.meend)) {
              subgroup.meend = new Array(subgroup.swar.length).fill('');
            }
          });
          
          setData(receivedData);
          setEditedData(JSON.parse(JSON.stringify(receivedData.predictions)));
          
          if (receivedData.row_paths?.length > 0) {
            const images = await fetchImages(receivedData.row_paths);
            setRowImages(images);
          }
          setLoading(false);
          return;
        }
  
        const searchParams = new URLSearchParams(window.location.search);
        const dataParam = searchParams.get('data');
        
        if (dataParam) {
          const receivedData = JSON.parse(dataParam);
          
          Object.keys(receivedData.predictions.predictions).forEach(subgroupKey => {
            const subgroup = receivedData.predictions.predictions[subgroupKey];
            if (!subgroup.meend || !Array.isArray(subgroup.meend)) {
              subgroup.meend = new Array(subgroup.swar.length).fill('');
            }
          });
          
          setData(receivedData);
          setEditedData(JSON.parse(JSON.stringify(receivedData.predictions)));
          
          if (receivedData.row_paths?.length > 0) {
            const images = await fetchImages(receivedData.row_paths);
            setRowImages(images);
          }
          setLoading(false);
          return;
        }
  
        const response = await fetch(`${BACKEND_URL}/get_segmented_data`);
        if (response.ok) {
          const receivedData = await response.json();
          
          Object.keys(receivedData.predictions.predictions).forEach(subgroupKey => {
            const subgroup = receivedData.predictions.predictions[subgroupKey];
            if (!subgroup.meend || !Array.isArray(subgroup.meend)) {
              subgroup.meend = new Array(subgroup.swar.length).fill('');
            }
          });
          
          setData(receivedData);
          setEditedData(JSON.parse(JSON.stringify(receivedData.predictions)));
          
          if (receivedData.row_paths?.length > 0) {
            const images = await fetchImages(receivedData.row_paths);
            setRowImages(images);
          }
        } else {
          throw new Error("Failed to load data from server");
        }
      } catch (err) {
        setError('Failed to load prediction data');
        console.error('Error initializing data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  const fetchImage = async (filename: string): Promise<ImageInfo | null> => {
    if (imageCache[filename]) return imageCache[filename];
    if (!filename || filename.trim() === '') {
      console.warn('Empty filename provided to fetchImage');
      return null;
    }
    
    try {
      const imageResponse = await fetch(`${BACKEND_URL}/fetch_image/${encodeURIComponent(filename)}`);
      if (!imageResponse.ok) {
        console.error(`Failed to fetch image: ${filename} - Status: ${imageResponse.status}`);
        throw new Error(`Failed to fetch image: ${filename}`);
      }
      
      const blob = await imageResponse.blob();
      const imageInfo = {
        url: URL.createObjectURL(blob),
        filename: filename,
      };
      
      setImageCache(prev => ({ ...prev, [filename]: imageInfo }));
      return imageInfo;
    } catch (error) {
      console.error(`Error fetching image ${filename}:`, error);
      return null;
    }
  };

  const fetchImages = async (imagePaths: string[]): Promise<ImageInfo[]> => {
    try {
      const validPaths = imagePaths.filter(path => path && path.trim() !== '');
      const sortedPaths = [...validPaths].sort((a, b) => {
        const numA = parseInt(a.match(/R(\d+)\.png$/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/R(\d+)\.png$/)?.[1] || '0', 10);
        return numA - numB;
      });

      const imagePromises = sortedPaths.map(filename => fetchImage(filename));
      const imageInfos = await Promise.all(imagePromises);
      return imageInfos.filter((img): img is ImageInfo => img !== null);
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Use edited data if in edit mode, otherwise use original data
      const predictionsToSubmit = editMode ? editedData : data?.predictions;
      
      if (!predictionsToSubmit) {
        throw new Error('No data to submit');
      }

      const postData = {
        predictions: predictionsToSubmit,
        subgroups: data?.subgroups,
        row_paths: data?.row_paths
      };

      try {
        localStorage.setItem('segmentedFinalData', JSON.stringify(postData));
      } catch (e) {
        console.warn('LocalStorage is full, falling back to server storage');
      }

      const response = await fetch(`${BACKEND_URL}/final_save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit final data');
      }

      const responseData = await response.json();
      
      localStorage.setItem('kernDisplayData', JSON.stringify(responseData.kern_data));
      
      router.push('/kern_display');
      
    } catch (error) {
      console.error('Error submitting final data:', error);
      alert('Failed to submit final data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeendChange = (subgroupKey: string, idx: number, value: string) => {
    if (!editedData) return;
    
    setEditedData(prevData => {
      if (!prevData) return null;
      
      const newData = {...prevData};
      const meendList = [...newData.predictions[subgroupKey].meend];
      
      if (!value) {
        meendList[idx] = '';
        newData.predictions[subgroupKey].meend = meendList;
        return newData;
      }
      
      let startsBefore = 0;
      let endsBefore = 0;
      
      for (let i = 0; i < meendList.length; i++) {
        if (meendList[i] === 'S') startsBefore++;
        if (meendList[i] === 'E') endsBefore++;
        if (i < idx) {
          if (meendList[i] === 'S') startsBefore++;
          if (meendList[i] === 'E') endsBefore++;
        }
      }
      
      if (value === 'S' && meendList[idx] === 'E') {
        alert("Cannot set Start where an End marker already exists");
        return prevData;
      }
      
      if (value === 'E') {
        if (startsBefore <= endsBefore) {
          alert("Cannot add End without a matching Start earlier in the sequence");
          return prevData;
        }
        if (meendList[idx] === 'S') {
          alert("Cannot set End where a Start marker already exists");
          return prevData;
        }
      }
      
      meendList[idx] = value;
      newData.predictions[subgroupKey].meend = meendList;
      return newData;
    });
  };

  const validateMeendPairs = () => {
    if (!editedData) return { isValid: false, message: 'No data to validate' };
    
    let isValid = true;
    let errorMessage = '';
    
    Object.keys(editedData.predictions).forEach(subgroupKey => {
      const meendList = editedData.predictions[subgroupKey].meend;
      let startIndices: number[] = [];
      let endIndices: number[] = [];
      
      for (let i = 0; i < meendList.length; i++) {
        if (meendList[i] === 'S') startIndices.push(i);
        if (meendList[i] === 'E') endIndices.push(i);
      }
      
      if (startIndices.length !== endIndices.length) {
        isValid = false;
        errorMessage = `In ${subgroupKey}: Unequal number of Start (${startIndices.length}) and End (${endIndices.length}) markers`;
        return;
      }
      
      for (let i = 0; i < startIndices.length; i++) {
        if (startIndices[i] >= endIndices[i]) {
          isValid = false;
          errorMessage = `In ${subgroupKey}: End marker must come after its corresponding Start marker`;
          return;
        }
        
        if (i > 0 && startIndices[i] < endIndices[i-1]) {
          isValid = false;
          errorMessage = `In ${subgroupKey}: Overlapping meend pairs detected`;
          return;
        }
      }
    });
    
    return { isValid, message: errorMessage };
  };

  const handlePredictionChange = (
    subgroupKey: string,
    type: 'kann_swar' | 'swar' | 'meend',
    rowIndex: number,
    newValue: string
  ) => {
    if (!editedData) return;
    
    setEditedData(prevData => {
      if (!prevData) return null;
      
      const newData = {...prevData};
      
      if (type === 'meend') {
        newData.predictions[subgroupKey][type][rowIndex] = newValue;
      } else {
        const valueArray = newValue
          .split(' ')
          .map(item => item.trim())
          .filter(item => item !== '');
        
        newData.predictions[subgroupKey][type][rowIndex] = valueArray;
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const { isValid, message } = validateMeendPairs();
      if (!isValid) {
        alert(`Meend validation failed: ${message}`);
        return;
      }
      
      if (!editedData || !data) {
        throw new Error('No data to save');
      }

      // Update the data with edited values first
      const updatedData = {
        ...data,
        predictions: editedData
      };

      // Prepare the data to be sent to final_save
      const postData = {
        predictions: editedData,
        subgroups: data.subgroups,
        row_paths: data.row_paths
      };

      // Save to localStorage if needed
      try {
        localStorage.setItem('segmentedFinalData', JSON.stringify(postData));
      } catch (e) {
        console.warn('LocalStorage is full, falling back to server storage');
      }

      // Post directly to final_save
      const response = await fetch(`${BACKEND_URL}/final_save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) throw new Error('Failed to save changes');
      
      const responseData = await response.json();
      
      // Update local state with the new data
      setData(updatedData);
      setEditedData(editedData);
      setEditMode(false);
      
      // Store kern data and redirect
      localStorage.setItem('kernDisplayData', JSON.stringify(responseData.kern_data));
      router.push('/kern_display');
      
    } catch (err) {
      console.error('Error saving changes:', err);
      alert('Failed to save changes');
    }
  };

  const handleCancel = () => {
    if (data) setEditedData(JSON.parse(JSON.stringify(data.predictions)));
    setEditMode(false);
  };

  const handleAddCell = (subgroupKey: string, type: 'kann_swar' | 'swar', position?: number) => {
    if (!editedData || !data) return;

    setEditedData(prevData => {
      if (!prevData) return null;
      const newData = {...prevData};
      
      if (typeof position === 'number') {
        newData.predictions[subgroupKey][type].splice(position, 0, []);
        if (type === 'swar') {
          newData.predictions[subgroupKey].meend.splice(position, 0, '');
        }
      } else {
        newData.predictions[subgroupKey][type].push([]);
        if (type === 'swar') {
          newData.predictions[subgroupKey].meend.push('');
        }
      }
      
      return newData;
    });

    setData(prevData => {
      if (!prevData) return null;
      const newData = {...prevData};
      
      if (typeof position === 'number') {
        newData.subgroups[subgroupKey][type === 'kann_swar' ? 'kann_swar_list' : 'swar_list'].splice(position, 0, []);
      } else {
        newData.subgroups[subgroupKey][type === 'kann_swar' ? 'kann_swar_list' : 'swar_list'].push([]);
      }
      
      return newData;
    });
  };

  const handleDeleteCell = (subgroupKey: string, type: 'kann_swar' | 'swar', index: number) => {
    if (!editedData || !data) return;

    setEditedData(prevData => {
      if (!prevData) return null;
      const newData = {...prevData};
      
      newData.predictions[subgroupKey][type].splice(index, 1);
      
      if (type === 'swar') {
        newData.predictions[subgroupKey].meend.splice(index, 1);
      }
      
      return newData;
    });

    setData(prevData => {
      if (!prevData) return null;
      const newData = {...prevData};
      
      newData.subgroups[subgroupKey][type === 'kann_swar' ? 'kann_swar_list' : 'swar_list'].splice(index, 1);
      
      return newData;
    });
  };

  const hasData = (subgroupKey: string, type: 'kann_swar' | 'swar', index: number): boolean => {
    if (!data?.predictions?.predictions[subgroupKey]) return false;
    const predArray = data.predictions.predictions[subgroupKey][type][index];
    return Array.isArray(predArray) && predArray.length > 0;
  };

  const arrayToDisplayString = (arr: string[] | undefined, type: 'kann_swar' | 'swar' | 'meend'): string => {
    if (!arr || arr.length === 0) return '';
    if (type === 'kann_swar') return arr.join(', ');
    if (type === 'swar') return arr.join(' ');
    return arr[0] || '';
  };

  if (loading) return <div className="loading text-center py-10 text-lg">Loading prediction data...</div>;
  if (error) return <div className="error text-center py-10 text-lg text-red-600">{error}</div>;
  if (!data) return <div className="error text-center py-10 text-lg text-red-600">No data available</div>;

  const subgroupKeys = Object.keys(data.subgroups).sort((a, b) => {
    const getStartNum = (key: string) => parseInt(key.match(/subgroup_(\d+)_\d+/)?.[1] || '0', 10);
    return getStartNum(a) - getStartNum(b);
  });
  
  return (
    <div className="segmented-container max-w-(--breakpoint-2xl) mx-auto px-4 py-12 h-[90vh]">
      <h1 className="text-2xl font-bold text-center mb-6">Predictions</h1>
      
      <div className="main-layout h-full flex flex-col lg:flex-row gap-4 border border-gray-200 rounded-lg">
        <div className='flex flex-col lg:w-3/5 '>
          <div className="prediction-content flex-1 lg:w-full overflow-x-auto p-4 ">
            {subgroupKeys.map(subgroupKey => (
              <div key={subgroupKey} className="subgroup-section mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-300">{subgroupKey}</h2>
                
                <div className='flex flex-col overflow-x-scroll '>
                  <div className="prediction-row flex flex-col mb-6 ">
                    <div className="row-label font-medium mb-2 flex justify-between items-center ">
                      <span>Kann Swar</span>
                      {editMode && (
                        <button 
                          onClick={() => handleAddCell(subgroupKey, 'kann_swar')}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                        >
                          + Add Cell
                        </button>
                      )}
                    </div>
                    
                    <div className="cells-container flex gap-3 pb-2 pr-5">
                      {data.subgroups[subgroupKey].kann_swar_list.map((imagePaths, idx) => (
                        <React.Fragment key={`${subgroupKey}-kann-swar-${idx}`}>
                          {editMode && (
                            <button 
                              onClick={() => handleAddCell(subgroupKey, 'kann_swar', idx)}
                              className="add-cell-before bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center self-center transition-colors"
                              title="Add cell before"
                            >
                              +
                            </button>
                          )}
                          <div className="cell-group flex flex-col items-center min-w-[80px] relative">
                            {editMode && (
                              <button
                                onClick={() => handleDeleteCell(subgroupKey, 'kann_swar', idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10 hover:bg-red-600 transition-colors"
                                title="Delete cell"
                              >
                                ×
                              </button>
                            )}

                            <div className={`image-container flex justify-center items-center w-full h-16 bg-gray-200 rounded ${
                              hasData(subgroupKey, 'kann_swar', idx) ? 'ring-2 ring-blue-500' : ''
                            }`}>
                              {imagePaths.length > 0 ? (
                                <ImageCell 
                                  key={`${subgroupKey}-kann-swar-${idx}-images`}
                                  imagePaths={imagePaths}
                                  fetchImage={fetchImage}
                                  hasData={hasData(subgroupKey, 'kann_swar', idx)}
                                />
                              ) : (
                                <div className="text-xs text-gray-500">No image</div>
                              )}
                            </div>
                            
                            <div className="prediction-text mt-1 w-full text-center text-base ">
                              {editMode ? (
                                <input
                                  type="text"
                                  value={Array.isArray(editedData?.predictions[subgroupKey]?.kann_swar[idx]) 
                                    ? editedData?.predictions[subgroupKey]?.kann_swar[idx].join(' ') 
                                    : editedData?.predictions[subgroupKey]?.kann_swar[idx] || ''}
                                  onChange={(e) => {
                                    setEditedData(prevData => {
                                      if (!prevData) return null;
                                      const newData = {...prevData};
                                      newData.predictions[subgroupKey].kann_swar[idx] = [e.target.value];
                                      return newData;
                                    });
                                  }}
                                  onBlur={(e) => handlePredictionChange(
                                    subgroupKey,
                                    'kann_swar',
                                    idx,
                                    e.target.value
                                  )}
                                  className="edit-input w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              ) : (
                                arrayToDisplayString(
                                  data.predictions.predictions[subgroupKey]?.kann_swar[idx],
                                  'kann_swar'
                                )
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="prediction-row flex flex-col  ">
                    <div className="row-label font-medium mb-2 flex justify-between items-center">
                      <span>Swar</span>
                      {editMode && (
                        <button 
                          onClick={() => handleAddCell(subgroupKey, 'swar')}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                        >
                          + Add Cell
                        </button>
                      )}
                    </div>
                    <div className="cells-container flex gap-3 pb-2 pr-5">
                      {data.subgroups[subgroupKey].swar_list.map((imagePaths, idx) => (
                        <React.Fragment key={`${subgroupKey}-swar-${idx}`}>
                          {editMode && (
                            <button 
                              onClick={() => handleAddCell(subgroupKey, 'swar', idx)}
                              className="add-cell-before bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center self-center transition-colors"
                              title="Add cell before"
                            >
                              +
                            </button>
                          )}
                          <div className="cell-group flex flex-col items-center min-w-[80px] relative">
                            {editMode && (
                              <button
                                onClick={() => handleDeleteCell(subgroupKey, 'swar', idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10 hover:bg-red-600 transition-colors"
                                title="Delete cell"
                              >
                                ×
                              </button>
                            )}
                            <div className={`image-container flex justify-center items-center w-full h-16 bg-gray-200 rounded ${
                              hasData(subgroupKey, 'swar', idx) ? 'ring-2 ring-blue-500' : ''
                            }`}>
                              {imagePaths.length > 0 ? (
                                <ImageCell 
                                  key={`${subgroupKey}-swar-${idx}-images`}
                                  imagePaths={imagePaths}
                                  fetchImage={fetchImage}
                                  hasData={hasData(subgroupKey, 'swar', idx)}
                                />
                              ) : (
                                <div className="text-xs text-gray-500">No image</div>
                              )}
                            </div>
                            
                            <div className="prediction-text mt-1 w-full text-center text-base">
                              {editMode ? (
                                <input
                                  type="text"
                                  value={Array.isArray(editedData?.predictions[subgroupKey]?.swar[idx]) 
                                    ? editedData?.predictions[subgroupKey]?.swar[idx].join(' ') 
                                    : editedData?.predictions[subgroupKey]?.swar[idx] || ''}
                                  onChange={(e) => {
                                    setEditedData(prevData => {
                                      if (!prevData) return null;
                                      const newData = {...prevData};
                                      newData.predictions[subgroupKey].swar[idx] = [e.target.value];
                                      return newData;
                                    });
                                  }}
                                  onBlur={(e) => handlePredictionChange(
                                    subgroupKey,
                                    'swar',
                                    idx,
                                    e.target.value
                                  )}
                                  className="edit-input w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              ) : (
                                arrayToDisplayString(
                                  data.predictions.predictions[subgroupKey]?.swar[idx],
                                  'swar'
                                )
                              )}
                            </div>
                            
                            <div className="meend-indicators mt-1 flex gap-2 text-base">
                              {editMode ? (
                                <div className="meend-edit-controls flex gap-2">
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={editedData?.predictions[subgroupKey]?.meend[idx] === 'S'}
                                      onChange={(e) => handleMeendChange(subgroupKey, idx, e.target.checked ? 'S' : '')}
                                      className="h-4 w-4" 
                                    />
                                    S
                                  </label>
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={editedData?.predictions[subgroupKey]?.meend[idx] === 'E'}
                                      onChange={(e) => handleMeendChange(subgroupKey, idx, e.target.checked ? 'E' : '')}
                                      className="h-4 w-4"
                                    />
                                    E
                                  </label>
                                </div>
                              ) : (
                                <div className="meend-display flex gap-1">
                                  {data.predictions.predictions[subgroupKey]?.meend[idx] === 'S' && (
                                    <span className="meend-start text-green-600 font-medium">S</span> 
                                  )}
                                  {data.predictions.predictions[subgroupKey]?.meend[idx] === 'E' && (
                                    <span className="meend-end text-red-600 font-medium">E</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="row-panel h-full lg:w-2/5 bg-white border-l border-gray-200 p-4 overflow-y-auto max-h-screen">
          <h3 className="font-semibold mb-4 text-lg">Row Images</h3>
          {rowImages.length > 0 ? (
            <div className="row-images-list space-y-4">
              {rowImages.map((imgInfo, index) => (
                <div key={`row-${index}`} className="row-display flex items-center gap-4 border-b border-gray-100 pb-4">
                  <span className="row-label text-base font-medium w-16">Row {index+1}</span>
                  <img 
                    src={imgInfo.url} 
                    alt={`Row ${index+1}`} 
                    className="row-image max-h-24 object-contain" 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="row-placeholder text-gray-500 italic text-base">No row data available</div> 
          )}
        </div>
      </div>
      
      <div className="button-group flex justify-center gap-4 mt-6 ">
        {editMode ? (
          <>
            <button 
              onClick={handleCancel}
              className="cancel-button px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="save-button px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setEditMode(true)}
              className="edit-button px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="submit-button px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

interface ImageCellProps {
  imagePaths: string[];
  fetchImage: (path: string) => Promise<ImageInfo | null>;
  hasData?: boolean;
}

const ImageCell: React.FC<ImageCellProps> = ({ imagePaths, fetchImage, hasData = false }) => {
  const [imageInfos, setImageInfos] = useState<(ImageInfo | null)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const getImages = async () => {
      if (!imagePaths || imagePaths.length === 0) {
        if (isMounted) {
          setIsLoading(false);
          setError('No image paths provided');
        }
        return;
      }
      
      try {
        setIsLoading(true);
        const imagePromises = imagePaths.map(path => fetchImage(path));
        const infos = await Promise.all(imagePromises);
        
        if (isMounted) {
          setImageInfos(infos);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in ImageCell:', err);
          setError(`Error loading images: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setIsLoading(false);
        }
      }
    };
    
    getImages();
    
    return () => {
      isMounted = false;
    };
  }, [imagePaths, fetchImage]);
  
  return (
    <div className={`image-cell flex gap-1 justify-center items-center h-full ${
      isLoading ? 'loading-image' : error ? 'error-image' : ''
    } ${hasData ? 'has-data' : ''}`}>
      {isLoading ? (
        <div className="image-placeholder text-xs text-gray-500">Loading...</div>
      ) : error ? (
        <div className="image-error text-red-500" title={error}>❌</div>
      ) : imageInfos.length === 0 ? (
        <div className="image-placeholder text-xs text-gray-500">No image</div>
      ) : (
        imageInfos.filter(img => img !== null).map((img, idx) => (
          <img
            key={idx}
            src={img!.url}
            alt={`Image ${img!.filename}`}
            onError={() => setError(`Failed to display image ${img!.filename}`)}
            className="image-item max-h-full max-w-full object-contain"
          />
        ))
      )}
    </div>
  );
};

export default Segmented;
