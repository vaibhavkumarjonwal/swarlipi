import React from 'react';
import { UploadIcon, ProcessIcon, StaffLinesIcon, DownloadIcon } from './icons/MusicalIcons';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  status: 'completed' | 'current' | 'upcoming';
}

interface WorkflowProgressProps {
  currentStep: string;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ currentStep }) => {
  const steps: WorkflowStep[] = [
    {
      id: 'upload',
      title: 'Upload',
      description: 'Upload your PDF',
      icon: UploadIcon,
      status: 'completed'
    },
    {
      id: 'initial_rows',
      title: 'Analyze',
      description: 'Initial row detection',
      icon: ProcessIcon,
      status: currentStep === 'upload' ? 'upcoming' : 
              currentStep === 'initial_rows' ? 'current' : 'completed'
    },
    {
      id: 'process',
      title: 'Classify',
      description: 'Row classification',
      icon: StaffLinesIcon,
      status: ['upload', 'initial_rows'].includes(currentStep) ? 'upcoming' : 
              currentStep === 'process' ? 'current' : 'completed'
    },
    {
      id: 'segmented',
      title: 'Segment',
      description: 'Review predictions',
      icon: ProcessIcon,
      status: ['upload', 'initial_rows', 'process'].includes(currentStep) ? 'upcoming' : 
              currentStep === 'segmented' ? 'current' : 'completed'
    },
    {
      id: 'completed',
      title: 'Complete',
      description: 'Western notation',
      icon: DownloadIcon,
      status: ['upload', 'initial_rows', 'process', 'segmented'].includes(currentStep) ? 'upcoming' : 'current'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-musical border border-orange-100 p-6 mb-8">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">
        Translation Progress
      </h3>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step.status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.status === 'current'
                    ? 'bg-orange-500 border-orange-500 text-white animate-pulse-gentle'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {step.status === 'completed' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <step.icon size={20} />
                )}
                
                {step.status === 'current' && (
                  <div className="absolute -inset-1 bg-orange-500 rounded-full animate-ping opacity-25"></div>
                )}
              </div>
              
              {/* Step Info */}
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-medium ${
                    step.status === 'current'
                      ? 'text-orange-600'
                      : step.status === 'completed'
                      ? 'text-green-600'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">{step.description}</p>
              </div>
            </div>
            
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${
                  steps[index + 1].status === 'completed' || steps[index + 1].status === 'current'
                    ? 'bg-gradient-to-r from-green-500 to-orange-500'
                    : 'bg-slate-300'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowProgress;
