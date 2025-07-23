import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Search } from 'lucide-react';
import { fetchModelsFromAPI, getDefaultModel } from '../utils/models';

function ModelSelectionDialog({ isOpen, onClose, onSelectModel }) {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const modelsList = await fetchModelsFromAPI();
      setModels(modelsList);
      
      // Set default selection
      const defaultModel = getDefaultModel();
      setSelectedModel(defaultModel);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    const finalModel = selectedModel === 'custom' ? customModel : selectedModel;
    if (finalModel) {
      onSelectModel(finalModel);
      onClose();
    }
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Model for New Session
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search models..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading models...
            </div>
          ) : (
            <>
              {filteredModels.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {model.provider} • {model.id}
                    </div>
                  </div>
                </label>
              ))}
              
              {filteredModels.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No models found matching your search.
                </div>
              )}
            </>
          )}
        </div>

        {/* Custom Model Input */}
        {selectedModel === 'custom' && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Model ID
            </label>
            <Input
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="Enter custom model ID (e.g., my-custom-model)"
              className="w-full"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedModel || (selectedModel === 'custom' && !customModel)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Session
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ModelSelectionDialog;