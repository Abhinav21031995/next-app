'use client';

import React from 'react';

interface FallbackComponentProps {
  microFrontendName: string;
  expectedPort: number;
  remoteUrl: string;
}

export const FallbackComponent: React.FC<FallbackComponentProps> = ({
  microFrontendName,
  expectedPort,
  remoteUrl
}) => {
  return (
    <div className="remote-component__error">
      <div className="remote-component__error-header">
        <span className="remote-component__error-icon">⚠️</span>
        <h3 className="remote-component__error-title">
          {microFrontendName} Development Error
        </h3>
      </div>
      
      <div className="remote-component__error-troubleshooting">
        <p>The {microFrontendName} micro frontend is not responding.</p>
        <p><strong>Expected URL:</strong> {remoteUrl}</p>
        <p><strong>Required Steps:</strong></p>
        <ol>
          <li>Ensure the micro frontend project is running on port {expectedPort}</li>
          <li>Check for any build or compilation errors</li>
          <li>Verify the webpack configuration is correct</li>
        </ol>
        
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Quick Fix:</strong></p>
          <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
            cd ../micro-frontend-directory{'\n'}
            npm start
          </pre>
        </div>
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        className="remote-component__retry-btn"
      >
        Retry Connection
      </button>
    </div>
  );
};
