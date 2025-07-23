// Utility functions for fetching and managing models

export const fetchModelsFromAPI = async () => {
  // Return comprehensive models list directly to avoid CORS issues
  // Previously tried to fetch from models.dev but it's blocked by CORS policy
  return [
    // Anthropic Models
    { id: 'sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
    { id: 'opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
    
    // OpenAI Models
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    
    // Google Models
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    { id: 'gemini-flash', name: 'Gemini Flash', provider: 'Google' },
    
    // Meta Models
    { id: 'llama-2-70b-chat', name: 'Llama 2 70B Chat', provider: 'Meta' },
    { id: 'llama-3-8b-instruct', name: 'Llama 3 8B Instruct', provider: 'Meta' },
    
    // Mistral Models
    { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral' },
    { id: 'mistral-medium', name: 'Mistral Medium', provider: 'Mistral' },
    
    // Custom option
    { id: 'custom', name: 'Custom Model', provider: 'Custom' }
  ];
};

export const getDefaultModel = () => {
  const saved = localStorage.getItem('defaultModel');
  return saved || 'sonnet';
};

export const setDefaultModel = (modelId) => {
  localStorage.setItem('defaultModel', modelId);
};

export const getAnthropicBaseUrl = () => {
  const saved = localStorage.getItem('anthropicBaseUrl');
  return saved || '';
};

export const setAnthropicBaseUrl = (url) => {
  localStorage.setItem('anthropicBaseUrl', url);
};

export const getCustomModelId = () => {
  const saved = localStorage.getItem('customModelId');
  return saved || '';
};

export const setCustomModelId = (modelId) => {
  localStorage.setItem('customModelId', modelId);
};