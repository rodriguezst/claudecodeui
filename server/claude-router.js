import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

let activeRouterProcesses = new Map(); // Track active router processes by session ID

async function spawnWithRouter(command, options = {}, ws) {
  return new Promise(async (resolve, reject) => {
    const { sessionId, projectPath, cwd, resume, toolsSettings, permissionMode, images, modelConfig } = options;
    let capturedSessionId = sessionId;
    let sessionCreatedSent = false;
    
    console.log('🔀 Using claude-code-router for model:', modelConfig?.model);
    
    try {
      // Set up environment variables for the router
      const env = {
        ...process.env,
      };
      
      // Configure router based on model
      if (modelConfig?.apiKey) {
        switch (modelConfig.model) {
          case 'gpt-4':
          case 'gpt-3.5-turbo':
            env.OPENAI_API_KEY = modelConfig.apiKey;
            if (modelConfig.customEndpoint) {
              env.OPENAI_BASE_URL = modelConfig.customEndpoint;
            }
            break;
          case 'gemini-pro':
            env.GOOGLE_API_KEY = modelConfig.apiKey;
            if (modelConfig.customEndpoint) {
              env.GOOGLE_API_BASE_URL = modelConfig.customEndpoint;
            }
            break;
          default:
            // For custom models, use generic environment variables
            env.LLM_API_KEY = modelConfig.apiKey;
            if (modelConfig.customEndpoint) {
              env.LLM_BASE_URL = modelConfig.customEndpoint;
            }
            break;
        }
      }
      
      // Use the claude-code-router CLI tool
      const routerArgs = [
        '--model', modelConfig.model,
        '--output-format', 'stream-json',
        '--verbose'
      ];
      
      // Add command if provided
      if (command && command.trim()) {
        routerArgs.push('--print', command);
      }
      
      // Add resume flag if resuming
      if (resume && sessionId) {
        routerArgs.push('--resume', sessionId);
      }
      
      // Add tools settings if provided
      if (toolsSettings) {
        if (toolsSettings.skipPermissions && permissionMode !== 'plan') {
          routerArgs.push('--dangerously-skip-permissions');
        } else {
          if (toolsSettings.allowedTools && toolsSettings.allowedTools.length > 0) {
            for (const tool of toolsSettings.allowedTools) {
              routerArgs.push('--allowedTools', tool);
            }
          }
          if (toolsSettings.disallowedTools && toolsSettings.disallowedTools.length > 0) {
            for (const tool of toolsSettings.disallowedTools) {
              routerArgs.push('--disallowedTools', tool);
            }
          }
        }
      }
      
      // Add permission mode if specified
      if (permissionMode && permissionMode !== 'default') {
        routerArgs.push('--permission-mode', permissionMode);
      }
      
      console.log('🔀 Starting claude-code-router with args:', routerArgs);
      
      // Spawn the router process
      const routerProcess = spawn('ccr', routerArgs, {
        cwd: cwd || process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: env
      });
      
      // Store process reference for potential abort
      const processKey = capturedSessionId || sessionId || Date.now().toString();
      activeRouterProcesses.set(processKey, routerProcess);
      
      // Handle stdout (streaming JSON responses)
      routerProcess.stdout.on('data', (data) => {
        const rawOutput = data.toString();
        console.log('🔀 Router stdout:', rawOutput);
        
        const lines = rawOutput.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            console.log('📄 Router parsed JSON response:', response);
            
            // Capture session ID if it's in the response
            if (response.session_id && !capturedSessionId) {
              capturedSessionId = response.session_id;
              console.log('📝 Captured session ID from router:', capturedSessionId);
              
              // Update process key with captured session ID
              if (processKey !== capturedSessionId) {
                activeRouterProcesses.delete(processKey);
                activeRouterProcesses.set(capturedSessionId, routerProcess);
              }
              
              // Send session-created event only once for new sessions
              if (!sessionId && !sessionCreatedSent) {
                sessionCreatedSent = true;
                ws.send(JSON.stringify({
                  type: 'session-created',
                  sessionId: capturedSessionId
                }));
              }
            }
            
            // Send parsed response to WebSocket
            ws.send(JSON.stringify({
              type: 'claude-response',
              data: response
            }));
          } catch (parseError) {
            console.log('📄 Router non-JSON response:', line);
            // If not JSON, send as raw text
            ws.send(JSON.stringify({
              type: 'claude-output',
              data: line
            }));
          }
        }
      });
      
      // Handle stderr
      routerProcess.stderr.on('data', (data) => {
        console.error('🔀 Router stderr:', data.toString());
        ws.send(JSON.stringify({
          type: 'claude-error',
          error: data.toString()
        }));
      });
      
      // Handle process completion
      routerProcess.on('close', (code) => {
        console.log(`🔀 Router process exited with code ${code}`);
        
        // Clean up process reference
        const finalSessionId = capturedSessionId || sessionId || processKey;
        activeRouterProcesses.delete(finalSessionId);
        
        ws.send(JSON.stringify({
          type: 'claude-complete',
          exitCode: code,
          isNewSession: !sessionId && !!command
        }));
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Router process exited with code ${code}`));
        }
      });
      
      // Handle process errors
      routerProcess.on('error', (error) => {
        console.error('🔀 Router process error:', error);
        
        // Clean up process reference on error
        const finalSessionId = capturedSessionId || sessionId || processKey;
        activeRouterProcesses.delete(finalSessionId);
        
        ws.send(JSON.stringify({
          type: 'claude-error',
          error: `Router error: ${error.message}`
        }));
        
        reject(error);
      });
      
      // Handle stdin for interactive mode
      if (command) {
        // For --print mode with arguments, we don't need to write to stdin
        routerProcess.stdin.end();
      }
      
    } catch (error) {
      console.error('❌ Error setting up router:', error);
      reject(error);
    }
  });
}

function abortRouterSession(sessionId) {
  const process = activeRouterProcesses.get(sessionId);
  if (process) {
    console.log(`🛑 Aborting router session: ${sessionId}`);
    process.kill('SIGTERM');
    activeRouterProcesses.delete(sessionId);
    return true;
  }
  return false;
}

export {
  spawnWithRouter,
  abortRouterSession
};