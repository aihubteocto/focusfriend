import { createRoot } from 'react-dom/client';
import { FloatingMenu } from '../components/FloatingMenu';
import '../index.css';

// Add for debugging
console.log('Focus Flow: Content script loaded');

const init = () => {
  // Check if container already exists
  const existingContainer = document.getElementById('focus-flow-extension-root');
  if (existingContainer) return;

  const container = document.createElement('div');
  container.id = 'focus-flow-extension-root';
  document.body.appendChild(container);

  // Create shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' });
  const shadowContainer = document.createElement('div');
  shadowContainer.id = 'focus-flow-shadow-container';
  shadowRoot.appendChild(shadowContainer);

  // Add debug message
  console.log('Focus Flow: Initializing floating menu');

  // Inject Tailwind styles
  const style = document.createElement('style');
  style.textContent = `
    .floating-menu-container {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    }
    
    /* Add any additional styles needed */
  `;
  shadowRoot.appendChild(style);

  try {
    createRoot(shadowContainer).render(
      <div className="floating-menu-container">
        <FloatingMenu />
      </div>
    );
    console.log('Focus Flow: Floating menu rendered successfully');
  } catch (error) {
    console.error('Focus Flow: Error rendering floating menu:', error);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
