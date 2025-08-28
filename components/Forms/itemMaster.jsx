import React, { useState } from 'react';
import { Search, Plus, Save, FileText, Settings, Users, DollarSign, CheckCircle, Calendar, Hash, Building, Package, Beaker } from 'lucide-react';

const ERPDashboard = () => {
  const [activeTab, setActiveTab] = useState('basics');
  const [activeSubForm, setActiveSubForm] = useState('category');

  const tabs = [
    { id: 'basics', label: 'BASICS', icon: Package },
    { id: 'group', label: 'GROUP', icon: Users },
    { id: 'financials', label: 'FINANCIALS', icon: DollarSign },
    { id: 'quality', label: 'QUALITY ASSURANCE', icon: CheckCircle }
  ];

  const qualityTests = [
    { id: 'viscosity', label: 'Viscosity', standard: 'VISCOSITY' },
    { id: 'colorBulk', label: 'Color Bulk', standard: 'COLOR_BULK' },
    { id: 'gloss', label: 'Gloss', standard: 'GLOSS' },
    { id: 'opacity', label: 'Opacity', standard: 'OPACITY' },
    { id: 'fineness', label: 'Fineness', standard: 'FINENESS' },
    { id: 'solid', label: 'Solid', standard: 'SOLID' },
    { id: 'adhesion', label: 'Adhesion', standard: 'ADHESION' },
    { id: 'e', label: 'E', standard: 'AE' },
    { id: 'a', label: 'A', standard: 'A' },
    { id: 'l', label: 'L', standard: 'L' },
    { id: 'b', label: 'B', standard: 'B' }
  ];

  const renderBasicsContent = () => {
    if (activeSubForm === 'category') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Category
              </label>
              <input
                type="text"
                placeholder="ITEM_CATEGORY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                placeholder="CATEGORY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Master
                </label>
                <input
                  type="text"
                  placeholder="ITCD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Master Sample
                </label>
                <input
                  type="text"
                  placeholder="ALTERNATE_ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Description
              </label>
              <textarea
                placeholder="ITEM"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measurement
                </label>
                <input
                  type="text"
                  placeholder="UNIT"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Substrates
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>INDUSTRY</option>
                  <option>AUTOMOTIVE</option>
                  <option>CONSTRUCTION</option>
                  <option>MARINE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid To
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MS Creation Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CDATE
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  placeholder="QUALITY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MS/Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI_DATE
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  With White
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>PLANT_ID</option>
                  <option>Plant A</option>
                  <option>Plant B</option>
                  <option>Plant C</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQualityContent = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Quality Testing Standards
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-gray-700">
              <div>TEST</div>
              <div>REQUIRED STANDARD</div>
              <div>ENABLED</div>
            </div>
            
            {qualityTests.map((test) => (
              <div key={test.id} className="grid grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{test.label}</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    defaultValue={test.standard}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basics':
        return renderBasicsContent();
      case 'group':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center text-gray-500 py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Group management content would go here</p>
            </div>
          </div>
        );
      case 'financials':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center text-gray-500 py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Financial information content would go here</p>
            </div>
          </div>
        );
      case 'quality':
        return renderQualityContent();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">ERP Management System</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sub Navigation for Basics */}
      {activeTab === 'basics' && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 py-3">
              <button
                onClick={() => setActiveSubForm('category')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSubForm === 'category'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Item Category
              </button>
              <button
                onClick={() => setActiveSubForm('master')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSubForm === 'master'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Material Master
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>ADD RECORD</span>
          </button>

          <div className="flex space-x-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              SAVE
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              QUERY RESULT
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              POST QUERY
            </button>
            <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              QUIT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ERPDashboard;