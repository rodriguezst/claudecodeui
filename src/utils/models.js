// Utility functions for fetching and managing models
import { authenticatedFetch } from './api.js';

export const fetchModelsFromAPI = async () => {
  try {
    const response = await authenticatedFetch('/api/models');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.warn('Failed to fetch models from server, using fallback:', error);
    // Fallback to hardcoded list if server call fails
    return [
      // Anthropic Models
      { id: 'sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'haiku', name: 'Claude 3.5 Haiku' },
      { id: 'opus', name: 'Claude 3 Opus' },
      
      // OpenAI Models
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      
      // Google Models
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-flash', name: 'Gemini Flash' },
      
      // Meta Models
      { id: 'llama-2-70b-chat', name: 'Llama 2 70B Chat' },
      { id: 'llama-3-8b-instruct', name: 'Llama 3 8B Instruct' },
      
      // Mistral Models
      { id: 'mistral-large', name: 'Mistral Large' },
      { id: 'mistral-medium', name: 'Mistral Medium' },
      
      // Custom option
      { id: 'custom', name: 'Custom Model' }
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

export const getCustomModelId = () => {
  const saved = localStorage.getItem('customModelId');
  return saved || '';
};

export const setCustomModelId = (modelId) => {
  localStorage.setItem('customModelId', modelId);
};