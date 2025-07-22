import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Settings, Check } from 'lucide-react';

function ModelSelector({ onShowSettings, isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('claude-model-selection');
    return saved ? JSON.parse(saved) : { type: 'claude', model: 'sonnet' };
  });
  const dropdownRef = useRef(null);

  // Available models configuration
  const modelOptions = {
    claude: [
      { value: 'sonnet', label: 'Claude 3.5 Sonnet', description: 'Balanced performance' },
      { value: 'opus', label: 'Claude 3 Opus', description: 'Highest intelligence' },
      { value: 'haiku', label: 'Claude 3 Haiku', description: 'Fastest response' }
    ],
    thirdParty: [
      { value: 'gpt-4', label: 'GPT-4', description: 'OpenAI GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'OpenAI GPT-3.5' },
      { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google Gemini' },
      { value: 'custom', label: 'Custom Model', description: 'Custom endpoint' }
    ]
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for model changes from settings
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('claude-model-selection');
      if (saved) {
        setSelectedModel(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events from settings modal
    window.addEventListener('modelChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('modelChanged', handleStorageChange);
    };
  }, []);

  const handleModelSelect = (type, model) => {
    const newSelection = { type, model };
    setSelectedModel(newSelection);
    localStorage.setItem('claude-model-selection', JSON.stringify(newSelection));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('modelChanged', { detail: newSelection }));
    setIsOpen(false);
  };

  const getCurrentModelLabel = () => {
    if (!selectedModel.model) return 'Select Model';
    
    const models = modelOptions[selectedModel.type] || [];
    const currentModel = models.find(m => m.value === selectedModel.model);
    
    if (currentModel) {
      // Show shorter labels on mobile
      if (isMobile) {
        return currentModel.label.replace('Claude 3.5 ', '').replace('Claude 3 ', '');
      }
      return currentModel.label;
    }
    
    return selectedModel.model;
  };

  const getCurrentModelIcon = () => {
    if (selectedModel.type === 'claude') {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex-shrink-0">
          <div className="w-full h-full bg-white rounded-[2px] m-[1px] flex items-center justify-center">
            <div className="w-2 h-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[1px]"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm flex-shrink-0">
        <div className="w-full h-full bg-white rounded-[2px] m-[1px] flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[1px]"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
          isMobile ? 'min-w-0' : 'min-w-[140px]'
        }`}
        title={`Current model: ${getCurrentModelLabel()}`}
      >
        {getCurrentModelIcon()}
        <span className={`truncate ${isMobile ? 'max-w-[80px]' : 'max-w-[100px]'}`}>
          {getCurrentModelLabel()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Claude Models */}
          <div className="p-2">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Claude Models
            </div>
            {modelOptions.claude.map((model) => (
              <button
                key={model.value}
                onClick={() => handleModelSelect('claude', model.value)}
                className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-[2px] m-[1px] flex items-center justify-center">
                    <div className="w-2 h-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[1px]"></div>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{model.label}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
                {selectedModel.type === 'claude' && selectedModel.model === model.value && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
          </div>

          {/* Third Party Models */}
          <div className="border-t border-border p-2">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Third Party Models
            </div>
            {modelOptions.thirdParty.map((model) => (
              <button
                key={model.value}
                onClick={() => handleModelSelect('thirdParty', model.value)}
                className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-[2px] m-[1px] flex items-center justify-center">
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[1px]"></div>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{model.label}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
                {selectedModel.type === 'thirdParty' && selectedModel.model === model.value && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
          </div>

          {/* Settings Link */}
          <div className="border-t border-border p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onShowSettings();
              }}
              className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Model Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelSelector;