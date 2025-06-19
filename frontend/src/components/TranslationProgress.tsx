'use client';
import React from 'react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TranslationProgressProps {
  currentStep: 'upload' | 'analyze' | 'classify' | 'segment' | 'complete';
}

const TranslationProgress: React.FC<TranslationProgressProps> = ({ currentStep }) => {
  const steps: Step[] = [
    {
      id: 'upload',
      title: 'Upload',
      description: 'Upload your PDF',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      id: 'analyze',
      title: 'Analyze',
      description: 'Initial row detection',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'classify',
      title: 'Classify',
      description: 'Row classification',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'segment',
      title: 'Segment',
      description: 'Review predictions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Western notation',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const getStepIndex = (stepId: string) => steps.findIndex(step => step.id === stepId);
  const currentStepIndex = getStepIndex(currentStep);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 text-white border-green-500',
          text: 'text-green-600',
          line: 'bg-green-500'
        };
      case 'current':
        return {
          circle: 'bg-orange-500 text-white border-orange-500',
          text: 'text-orange-600',
          line: 'bg-gray-200'
        };
      default:
        return {
          circle: 'bg-white text-gray-400 border-gray-300',
          text: 'text-gray-400',
          line: 'bg-gray-200'
        };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Translation Progress</h2>
        <p className="text-gray-600 text-center">Track your document's journey from PDF to Western notation</p>
      </div>
      
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 z-0">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const classes = getStepClasses(status);
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Circle */}
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${classes.circle} shadow-lg`}>
                {status === 'completed' ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              
              {/* Text */}
              <div className="mt-4 text-center">
                <div className={`font-semibold text-sm ${classes.text}`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 ${classes.text}`}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranslationProgress;
