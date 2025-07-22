# Model Selection Feature

This implementation adds comprehensive model selection functionality to Claude Code UI, allowing users to switch between different Claude models and third-party LLM providers.

## Features Implemented

### 1. Model Settings Panel
- Added a new "Models" tab in the Settings interface
- Supports both Claude (Anthropic) models and third-party models
- Configuration for custom API endpoints and API keys
- Persistent storage in localStorage

### 2. Quick Model Selector
- Added a dropdown model selector in the chat interface
- Shows current model with visual indicators
- Quick switching between models during conversations
- Mobile-responsive design

### 3. Server-Side Integration
- Modified `claude-cli.js` to accept model configuration
- Integration with `@musistudio/claude-code-router` for third-party models
- Environment variable handling for API keys
- Fallback mechanism to standard Claude when router fails

### 4. Model Support

#### Claude Models (Native)
- Claude 3.5 Sonnet (default)
- Claude 3 Opus
- Claude 3 Haiku

#### Third-Party Models (via claude-code-router)
- GPT-4 (OpenAI)
- GPT-3.5 Turbo (OpenAI)
- Gemini Pro (Google)
- Custom models (any OpenAI-compatible API)

## Usage

### Basic Model Selection
1. Click the gear icon to open Settings
2. Go to the "Models" tab
3. Select your desired model provider and model
4. Click "Save Settings"

### Third-Party Model Setup
1. Select "Third Party Models" as the provider
2. Choose your desired model (GPT-4, GPT-3.5 Turbo, etc.)
3. Enter your API key for the chosen provider
4. Optionally enter a custom endpoint URL
5. Save settings

### Quick Model Switching
- Use the model selector dropdown above the chat input
- Click on the current model to see available options
- Select a new model to switch immediately
- Access "Model Settings" from the dropdown for detailed configuration

## API Key Configuration

### OpenAI Models
- Set `OPENAI_API_KEY` environment variable, or
- Enter API key in the third-party configuration section

### Google Gemini
- Set `GOOGLE_API_KEY` environment variable, or
- Enter API key in the third-party configuration section

### Custom Models
- Set `LLM_API_KEY` and optionally `LLM_BASE_URL` environment variables, or
- Enter API key and endpoint in the configuration section

## Technical Implementation

### Frontend Components
- `ModelSelector.jsx` - Quick model selector component
- Extended `ToolsSettings.jsx` - Model configuration interface
- Updated `ChatInterface.jsx` - Integration with chat interface

### Backend Integration
- `claude-router.js` - Third-party model routing logic
- Modified `claude-cli.js` - Model configuration handling
- Updated WebSocket message handling to include model config

### Data Storage
- Model selection: `localStorage['claude-model-selection']`
- Custom endpoint: `localStorage['claude-custom-endpoint']`
- API key: `localStorage['claude-custom-api-key']`

## Dependencies
- `@musistudio/claude-code-router` - Third-party model routing
- Existing Claude Code UI dependencies

## Security Considerations
- API keys are stored in localStorage (client-side only)
- No API keys are transmitted to the server unnecessarily
- Environment variables take precedence over UI configuration
- Secure handling of sensitive credentials

## Future Enhancements
- Model-specific parameter tuning
- Usage tracking and cost estimation
- Model comparison features
- Automatic model fallback on errors
- Support for additional model providers