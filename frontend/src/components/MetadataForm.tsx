import React from 'react';
import { RagaIcon } from './icons/MusicalIcons';

interface FormData {
  raag: string;
  taal: string;
  laya: string;
  source: string;
  pageNo: string;
  startRow: string;
  endRow: string;
}

interface MetadataFormProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const MetadataForm: React.FC<MetadataFormProps> = ({ 
  formData, 
  onFormChange, 
  onSubmit, 
  isLoading = false 
}) => {
  const handleInputChange = (field: keyof FormData, value: string) => {
    onFormChange({
      ...formData,
      [field]: value
    });
  };

  const commonRagas = [
    'Yaman', 'Bhairav', 'Asavari', 'Bilawal', 'Kafi', 'Kalyan', 'Khamaj', 'Bhairavi',
    'Malkauns', 'Darbari', 'Bageshri', 'Marwa', 'Purvi', 'Todi', 'Multani', 'Sohni'
  ];

  const commonTaals = [
    'Teentaal', 'Jhaptal', 'Rupak', 'Dadra', 'Deepchandi', 
    'Ektaal', 'Punjabi (Tilwada)', 'Dhamaar', 'Chautaal', 'Sultaal',
    'Ada Chautaal', 'Jhoomra'
  ];

  const layaOptions = ['Vilambit', 'Madhya', 'Drut'];

  return (
    <div className="bg-white rounded-xl shadow-musical border border-orange-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
          <RagaIcon className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Musical Metadata</h3>
          <p className="text-sm text-slate-600">Provide details about your composition</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Raag */}
        <div>
          <label htmlFor="raag" className="block text-sm font-medium text-slate-700 mb-2">
            Raag <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <input
              id="raag"
              type="text"
              list="ragas"
              value={formData.raag}
              onChange={(e) => handleInputChange('raag', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Yaman, Bhairav..."
              required
            />
            <datalist id="ragas">
              {commonRagas.map(raga => (
                <option key={raga} value={raga} />
              ))}
            </datalist>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Taal */}
        <div>
          <label htmlFor="taal" className="block text-sm font-medium text-slate-700 mb-2">
            Taal <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <input
              id="taal"
              type="text"
              list="taals"
              value={formData.taal}
              onChange={(e) => handleInputChange('taal', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Teental, Jhaptal..."
              required
            />
            <datalist id="taals">
              {commonTaals.map(taal => (
                <option key={taal} value={taal} />
              ))}
            </datalist>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Laya */}
        <div>
          <label htmlFor="laya" className="block text-sm font-medium text-slate-700 mb-2">
            Laya <span className="text-orange-500">*</span>
          </label>
          <select
            id="laya"
            value={formData.laya}
            onChange={(e) => handleInputChange('laya', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Select tempo...</option>
            {layaOptions.map(laya => (
              <option key={laya} value={laya}>{laya}</option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-slate-700 mb-2">
            Source
          </label>
          <input
            id="source"
            type="text"
            value={formData.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Book, manuscript, or collection name"
          />
        </div>

        {/* Page Number */}
        <div>
          <label htmlFor="pageNo" className="block text-sm font-medium text-slate-700 mb-2">
            Page Number
          </label>
          <input
            id="pageNo"
            type="text"
            value={formData.pageNo}
            onChange={(e) => handleInputChange('pageNo', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., 42, 42-43"
          />
        </div>

        {/* Row Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Row Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.startRow}
              onChange={(e) => handleInputChange('startRow', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Start row"
            />
            <input
              type="text"
              value={formData.endRow}
              onChange={(e) => handleInputChange('endRow', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="End row"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={onSubmit}
          disabled={isLoading || !formData.raag || !formData.taal || !formData.laya}
          className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing Metadata...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span>Continue to Segmentation</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default MetadataForm;
