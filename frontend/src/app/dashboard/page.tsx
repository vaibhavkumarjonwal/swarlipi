'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  UploadIcon, 
  ProcessIcon, 
  StaffLinesIcon, 
  DownloadIcon,
  TrebleClefIcon,
  SitarIcon,
  NotesIcon 
} from '@/components/icons/MusicalIcons';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { username } = useAuth();

  const features = [
    {
      icon: UploadIcon,
      title: 'Upload PDF',
      description: 'Upload your Indian classical music notation PDF',
      action: () => router.push('/upload'),
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      icon: ProcessIcon,
      title: 'AI Processing',
      description: 'Advanced recognition and segmentation',
      action: () => {},
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      disabled: true
    },
    {
      icon: StaffLinesIcon,
      title: 'Review & Edit',
      description: 'Interactive editing and refinement',
      action: () => {},
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      disabled: true
    },
    {
      icon: DownloadIcon,
      title: 'Export Notation',
      description: 'Download in various formats',
      action: () => {},
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      disabled: true
    }
  ];

  const recentProjects = [
    { name: 'Raga Yaman - Vilambit', date: '2 days ago', status: 'Completed' },
    { name: 'Bhairavi Composition', date: '1 week ago', status: 'In Progress' },
    { name: 'Malkauns Bandish', date: '2 weeks ago', status: 'Completed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <SitarIcon className="text-orange-500 animate-float" size={48} />
              <TrebleClefIcon className="text-blue-600 absolute -top-2 -right-2" size={24} />
            </div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500"></div>
            <NotesIcon className="text-green-600 animate-pulse-gentle" size={40} />
          </div>
          
          <h1 className="text-4xl font-display font-bold text-slate-800 mb-4">
            Welcome to SwarLipi, {username}!
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your musical bridge between traditions. Start transforming Indian classical notation into Western staff notation.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-musical border border-orange-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UploadIcon className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">0</p>
                <p className="text-sm text-slate-600">PDFs Processed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-musical border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ProcessIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">0</p>
                <p className="text-sm text-slate-600">Ragas Identified</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-musical border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <StaffLinesIcon className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">0</p>
                <p className="text-sm text-slate-600">Notations Created</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-musical border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DownloadIcon className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">0</p>
                <p className="text-sm text-slate-600">Exports Generated</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-musical border border-orange-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span>Quick Actions</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <button
                    key={index}
                    onClick={feature.action}
                    disabled={feature.disabled}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      feature.disabled 
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' 
                        : `${feature.bgColor} ${feature.borderColor} hover:shadow-lg hover:scale-105 cursor-pointer`
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        feature.disabled 
                          ? 'bg-gray-200' 
                          : `bg-gradient-to-br ${feature.color}`
                      }`}>
                        <feature.icon 
                          className={feature.disabled ? 'text-gray-400' : 'text-white'} 
                          size={24} 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-2 ${
                          feature.disabled ? 'text-gray-400' : 'text-slate-800'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm ${
                          feature.disabled ? 'text-gray-400' : 'text-slate-600'
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    
                    {!feature.disabled && (
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    )}
                    
                    {feature.disabled && (
                      <div className="absolute top-4 right-4">
                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                          Soon
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Projects */}
            <div className="bg-white rounded-xl shadow-musical border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Recent Activity</span>
              </h3>
              
              <div className="space-y-3">
                {recentProjects.length > 0 ? recentProjects.map((project, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-slate-800 text-sm">{project.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-slate-500">{project.date}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'Completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <NotesIcon className="text-blue-600" size={24} />
                    </div>
                    <p className="text-sm text-slate-600 mb-2">No projects yet</p>
                    <p className="text-xs text-slate-500">Upload your first PDF to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Musical Tips */}
            <div className="bg-white rounded-xl shadow-musical border border-green-100 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Pro Tip</span>
              </h3>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-medium text-green-800 text-sm mb-2">
                  Best PDF Quality
                </h4>
                <p className="text-xs text-green-700 leading-relaxed">
                  For optimal results, ensure your PDF has clear, high-resolution notation with minimal noise or artifacts. Scanned images at 300 DPI or higher work best.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
