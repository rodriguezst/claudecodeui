// Utility functions for fetching and managing models

export const fetchModelsFromAPI = async () => {
  try {
    const response = await fetch('https://models.dev/api.json');
    if (!response.ok) {
      throw new Error('Failed to fetch models from models.dev');
    }
    const data = await response.json();
    
    // Extract model IDs from the response
    // The API returns an object where keys are model IDs
    const models = Object.keys(data).map(modelId => ({
      id: modelId,
      name: data[modelId].name || modelId,
      provider: data[modelId].provider || 'Unknown'
    }));
    
    // Sort models by provider and name
    models.sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider);
      }
      return a.name.localeCompare(b.name);
    });
    
    // Add custom option
    models.push({
      id: 'custom',
      name: 'Custom Model',
      provider: 'Custom'
    });
    
    return models;
  } catch (error) {
    console.error('Error fetching models:', error);
    
    // Return comprehensive fallback models
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
  }
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