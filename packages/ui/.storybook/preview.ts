import type { Preview } from '@storybook/react';
import { createCSSVariables } from '../src/utils';

// Apply CSS variables globally
const cssVariables = createCSSVariables();
const cssVariableString = Object.entries(cssVariables)
  .map(([key, value]) => `${key}: ${value};`)
  .join('\n  ');

// Add global styles
const globalStyles = `
  :root {
    ${cssVariableString}
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
  }

  * {
    box-sizing: border-box;
  }

  /* Animation keyframes for components */
  @keyframes progress-stripes {
    0% {
      background-position: 1rem 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  @keyframes scoreChange {
    0% {
      opacity: 0;
      transform: translateY(10px) scale(0.8);
    }
    20% {
      opacity: 1;
      transform: translateY(-5px) scale(1.1);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
    }
  }

  @keyframes scoreShimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes timerPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes timerShake {
    0%, 100% {
      transform: translate(-50%, -50%);
    }
    25% {
      transform: translate(-52%, -50%);
    }
    75% {
      transform: translate(-48%, -50%);
    }
  }

  @keyframes timerBlink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes timerAlert {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.5;
    }
  }
`;

// Inject global styles
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      description: {
        component:
          'CropSchool UI Components - Child-friendly design system for educational applications',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'gray',
          value: '#f8f9fa',
        },
        {
          name: 'dark',
          value: '#212121',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
      },
    },
  },
};

export default preview;
