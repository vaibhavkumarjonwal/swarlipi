'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkflowProgress from '@/components/WorkflowProgress';
import { NotesIcon, ProcessIcon, TrebleClefIcon, StaffLinesIcon, RagaIcon } from '@/components/icons/MusicalIcons';

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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://164.52.205.176:5000';

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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-musical">
          <div className="animate-spin w-12 h-12 border-4 border-saffron border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-indigo-blue font-musical">खंडीकरण लोड कर रहे हैं...</p>
          <p className="text-gray-600 mt-2">Loading segmented data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-musical max-w-md mx-4">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrebleClefIcon className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 bg-gradient-indian text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Return to Upload
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-musical max-w-md mx-4">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <StaffLinesIcon className="text-gray-600" size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-700 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">No segmented data found. Please start from the upload step.</p>
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 bg-gradient-indian text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Start New Upload
          </button>
        </div>
      </div>
    );
  }

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
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
      if (!editedData || !data) {
        throw new Error('No data to save');
      }

      const updatedData = {
        ...data,
        predictions: editedData
      };

      const postData = {
        predictions: editedData,
        subgroups: data.subgroups,
        row_paths: data.row_paths
      };

      try {
        localStorage.setItem('segmentedFinalData', JSON.stringify(postData));
      } catch (e) {
        console.warn('LocalStorage is full, falling back to server storage');
      }

      const response = await fetch(`${BACKEND_URL}/final_save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) throw new Error('Failed to save changes');
      
      const responseData = await response.json();
      
      setData(updatedData);
      setEditedData(editedData);
      setEditMode(false);
      
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

  const subgroupKeys = Object.keys(data.subgroups).sort((a, b) => {
    const getStartNum = (key: string) => parseInt(key.match(/subgroup_(\d+)_\d+/)?.[1] || '0', 10);
    return getStartNum(a) - getStartNum(b);
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 pb-8">
      {/* Header */}
      

      <div className="max-w-7xl mx-auto px-6 py-8 pb-16">
        {/* Translation Progress Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">
            Musical Segmentation
          </h1>
          <p className="text-lg text-slate-600">
            Track your document's journey from PDF to Western notation
          </p>
        </div>

        {/* Workflow Progress */}
        <WorkflowProgress currentStep="segmented" />

        {/* Instructions Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-musical p-6 mb-8 border border-amber-200">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-indian p-3 rounded-lg">
              <NotesIcon className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-indigo-blue mb-2">
                Step 3: Review & Edit Predictions
              </h2>
              <p className="text-gray-700 mb-4">
                AI has analyzed and segmented your musical notation. Review the predictions and make corrections if needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-800">Kann Swar</p>
                  <p className="text-blue-600">Ornamental notes</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-green-800">Swar</p>
                  <p className="text-green-600">Main musical notes</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-semibold text-purple-800">Meend</p>
                  <p className="text-purple-600">Glide markings (S/E)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-musical overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Predictions Panel */}
            <div className="flex-1 lg:w-1/2 overflow-hidden flex flex-col">
              <div className="bg-gradient-indian p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white mb-1">Musical Predictions</h3>
                    <p className="text-white/90">AI-generated notation analysis</p>
                  </div>
                  {!editMode && (
                    <button 
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all duration-200"
                    >
                      <ProcessIcon className="inline mr-2" size={16} />
                      Edit Mode
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: '60vh' }}>
                {subgroupKeys.map(subgroupKey => (
                  <div key={subgroupKey} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-amber-50 to-blue-50 p-4 border-b border-gray-200">
                      <h4 className="text-lg font-display font-bold text-indigo-blue">{subgroupKey}</h4>
                    </div>
                    
                    <div className="p-4">
                      {/* Single horizontal scroller for both Kann Swar and Swar */}
                      <div className="overflow-x-auto pb-4">
                        <div className="space-y-6">
                          {/* Kann Swar Row */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
                                Kann Swar (कण स्वर)
                              </span>
                              {editMode && (
                                <button 
                                  onClick={() => handleAddCell(subgroupKey, 'kann_swar')}
                                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                                >
                                  + Add Cell
                                </button>
                              )}
                            </div>
                            
                            <div className="flex gap-3 pb-2">
                          {data.subgroups[subgroupKey].kann_swar_list.map((imagePaths, idx) => (
                            <React.Fragment key={`${subgroupKey}-kann-swar-${idx}`}>
                              {editMode && (
                                <button 
                                  onClick={() => handleAddCell(subgroupKey, 'kann_swar', idx)}
                                  className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center self-center transition-colors"
                                  title="Add cell before"
                                >
                                  +
                                </button>
                              )}

                              <div className="flex-shrink-0 bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[100px] hover:border-blue-300 transition-colors">
                                {editMode && (
                                  <button
                                    onClick={() => handleDeleteCell(subgroupKey, 'kann_swar', idx)}
                                    className="float-right bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors mb-2"
                                    title="Delete cell"
                                  >
                                    ×
                                  </button>
                                )}

                                <div className={`h-16 bg-gray-50 rounded flex items-center justify-center mb-2 ${
                                  hasData(subgroupKey, 'kann_swar', idx) ? 'ring-2 ring-blue-400' : ''
                                }`}>
                                  {imagePaths.length > 0 ? (
                                    <ImageCell 
                                      key={`${subgroupKey}-kann-swar-${idx}-images`}
                                      imagePaths={imagePaths}
                                      fetchImage={fetchImage}
                                      hasData={hasData(subgroupKey, 'kann_swar', idx)}
                                    />
                                  ) : (
                                    <div className="text-xs text-gray-400">No image</div>
                                  )}
                                </div>
                                
                                <div className="text-center text-sm">
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
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      placeholder="कण स्वर"
                                    />
                                  ) : (
                                    <span className="text-blue-700 font-medium">
                                      {arrayToDisplayString(
                                        data.predictions.predictions[subgroupKey]?.kann_swar[idx],
                                        'kann_swar'
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Swar Row */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-green-800 bg-green-50 px-3 py-1 rounded-full">
                            Swar (स्वर)
                          </span>
                          {editMode && (
                            <button 
                              onClick={() => handleAddCell(subgroupKey, 'swar')}
                              className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                            >
                              + Add Cell
                            </button>
                          )}
                        </div>                            <div className="flex gap-3 pb-2">
                          {data.subgroups[subgroupKey].swar_list.map((imagePaths, idx) => (
                            <React.Fragment key={`${subgroupKey}-swar-${idx}`}>
                              {editMode && (
                                <button 
                                  onClick={() => handleAddCell(subgroupKey, 'swar', idx)}
                                  className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center self-center transition-colors"
                                  title="Add cell before"
                                >
                                  +
                                </button>
                              )}

                              <div className="flex-shrink-0 bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[100px] hover:border-green-300 transition-colors">
                                {editMode && (
                                  <button
                                    onClick={() => handleDeleteCell(subgroupKey, 'swar', idx)}
                                    className="float-right bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors mb-2"
                                    title="Delete cell"
                                  >
                                    ×
                                  </button>
                                )}

                                <div className={`h-16 bg-gray-50 rounded flex items-center justify-center mb-2 ${
                                  hasData(subgroupKey, 'swar', idx) ? 'ring-2 ring-green-400' : ''
                                }`}>
                                  {imagePaths.length > 0 ? (
                                    <ImageCell 
                                      key={`${subgroupKey}-swar-${idx}-images`}
                                      imagePaths={imagePaths}
                                      fetchImage={fetchImage}
                                      hasData={hasData(subgroupKey, 'swar', idx)}
                                    />
                                  ) : (
                                    <div className="text-xs text-gray-400">No image</div>
                                  )}
                                </div>
                                
                                <div className="text-center text-sm mb-2">
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
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                      placeholder="स्वर"
                                    />
                                  ) : (
                                    <span className="text-green-700 font-medium">
                                      {arrayToDisplayString(
                                        data.predictions.predictions[subgroupKey]?.swar[idx],
                                        'swar'
                                      )}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Meend Indicators */}
                                <div className="flex justify-center gap-2 text-xs">
                                  {editMode ? (
                                    <div className="flex gap-2">
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={editedData?.predictions[subgroupKey]?.meend[idx] === 'S'}
                                          onChange={(e) => handleMeendChange(subgroupKey, idx, e.target.checked ? 'S' : '')}
                                          className="w-3 h-3 text-green-600" 
                                        />
                                        <span className="text-green-600 font-bold">S</span>
                                      </label>
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={editedData?.predictions[subgroupKey]?.meend[idx] === 'E'}
                                          onChange={(e) => handleMeendChange(subgroupKey, idx, e.target.checked ? 'E' : '')}
                                          className="w-3 h-3 text-red-600"
                                        />
                                        <span className="text-red-600 font-bold">E</span>
                                      </label>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1">
                                      {data.predictions.predictions[subgroupKey]?.meend[idx] === 'S' && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">S</span> 
                                      )}
                                      {data.predictions.predictions[subgroupKey]?.meend[idx] === 'E' && (
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">E</span>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Row Images Panel */}
            <div className="lg:w-1/2 bg-gray-50 border-l border-gray-200 flex flex-col">
              <div className="bg-gradient-western p-6">
                <h3 className="text-xl font-display font-bold text-white mb-1">Original Rows</h3>
                <p className="text-white/90">Source notation images</p>
              </div>
              
              <div className="overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
                {rowImages.length > 0 ? (
                  <div className="space-y-4">
                    {rowImages.map((imgInfo, index) => (
                      <div key={`row-${index}`} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 transition-colors">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full min-w-fit flex-shrink-0">
                            Row {index + 1}
                          </span>
                          <img 
                            src={imgInfo.url} 
                            alt={`Row ${index + 1}`} 
                            className="max-h-32 flex-1 object-contain rounded border border-gray-200 min-w-0" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <StaffLinesIcon className="text-gray-400 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No row images available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-8 mb-12">
          {editMode ? (
            <>
              <button 
                onClick={handleCancel}
                className="px-8 py-3 bg-white border-2 border-red-300 text-red-700 rounded-lg font-medium hover:border-red-400 hover:shadow-md transition-all duration-200"
              >
                Cancel Changes
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ProcessIcon className="inline mr-2" size={18} />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => router.back()}
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:shadow-md transition-all duration-200"
              >
                ← Previous Step
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-musical text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <NotesIcon className="inline mr-2" size={18} />
                    Generate Western Notation
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Processing Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="bg-gradient-musical w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrebleClefIcon className="text-white animate-pulse" size={32} />
            </div>
            <h3 className="text-xl font-display font-bold text-indigo-blue mb-2">Converting to Western Notation</h3>
            <p className="text-gray-600 mb-4">
              Transforming Indian classical notation into Western musical format...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-musical h-2 rounded-full animate-pulse" style={{width: '90%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-3 font-musical">पाश्चात्य संगीत में परिवर्तन...</p>
          </div>
        </div>
      )}
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
