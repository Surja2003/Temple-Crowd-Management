/**
 * Enhanced Accessibility System
 * Implements WCAG 2.1 AA/AAA compliance features
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AccessibilityConfig } from '@/types/i18n';
import { DEFAULT_ACCESSIBILITY_CONFIG } from '@/lib/locale-manager';

interface AccessibilityContextType {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (selector: string | HTMLElement) => void;
  trapFocus: (container: HTMLElement) => () => void;
  skipToContent: () => void;
  adjustFontSize: (direction: 'increase' | 'decrease' | 'reset') => void;
  toggleReducedMotion: () => void;
  isKeyboardUser: boolean;
  setKeyboardUser: (isKeyboard: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AccessibilityConfig>(DEFAULT_ACCESSIBILITY_CONFIG);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Initialize accessibility features
  useEffect(() => {
    const initializeAccessibility = () => {
      // Add skip links
      addSkipLinks();
      
      // Setup keyboard shortcuts
      setupKeyboardShortcuts();
      
      // Apply initial accessibility settings
      applyAccessibilitySettings();
      
      // Setup focus indicators
      setupFocusIndicators();
    };

    const loadUserPreferences = () => {
      try {
        const savedConfig = localStorage.getItem('accessibility-config');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setConfig(prev => ({ ...prev, ...parsed }));
        }
        
        // Check for system preferences
        checkSystemPreferences();
      } catch (error) {
        console.warn('Failed to load accessibility preferences:', error);
      }
    };

    const setupFocusManagement = () => {
      // Add focus indicators for keyboard users
      document.addEventListener('focusin', (e) => {
        if (isKeyboardUser && e.target instanceof HTMLElement) {
          e.target.classList.add('keyboard-focus');
        }
      });

      document.addEventListener('focusout', (e) => {
        if (e.target instanceof HTMLElement) {
          e.target.classList.remove('keyboard-focus');
        }
      });
    };

    const setupScreenReaderAnnouncer = () => {
      // Create live region for screen reader announcements
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.id = 'screen-reader-announcer';
      document.body.appendChild(announcer);

      // Create assertive announcer for urgent messages
      const assertiveAnnouncer = document.createElement('div');
      assertiveAnnouncer.setAttribute('aria-live', 'assertive');
      assertiveAnnouncer.setAttribute('aria-atomic', 'true');
      assertiveAnnouncer.className = 'sr-only';
      assertiveAnnouncer.id = 'screen-reader-announcer-assertive';
      document.body.appendChild(assertiveAnnouncer);
    };

    initializeAccessibility();
    loadUserPreferences();
    setupKeyboardDetection();
    setupFocusManagement();
    setupScreenReaderAnnouncer();
    
    return () => {
      cleanupAccessibility();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKeyboardUser]);

  // Update CSS custom properties when config changes
  useEffect(() => {
    const updateCSSProperties = () => {
      const root = document.documentElement;
      
      // Update contrast ratio
      root.style.setProperty('--min-contrast-ratio', config.colors.contrastRatio.toString());
      
      // Update minimum target size
      root.style.setProperty('--min-target-size', `${config.interactive.minimumTargetSize}px`);
      
      // Update focus color based on contrast requirements
      const focusColor = config.colors.contrastRatio >= 7 ? '#000000' : '#0066cc';
      root.style.setProperty('--focus-color', focusColor);
    };

    const updateDocumentClasses = () => {
      const root = document.documentElement;
      
      // Large text
      root.classList.toggle('large-text', config.visual.largeText);
      
      // Reduced motion
      root.classList.toggle('reduced-motion', config.visual.reducedMotion);
      
      // Touch friendly
      root.classList.toggle('touch-friendly', config.interactive.touchFriendly);
    };

    updateCSSProperties();
    updateDocumentClasses();
  }, [config]);

  const checkSystemPreferences = () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setConfig(prev => ({
        ...prev,
        visual: { ...prev.visual, reducedMotion: true }
      }));
    }
    
    // Check for color scheme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  };

  const setupKeyboardDetection = () => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  };

  const addSkipLinks = () => {
    if (document.getElementById('skip-links')) return;

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.id = 'skip-links';
    skipLinksContainer.className = 'skip-links';
    
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#footer', text: 'Skip to footer' }
    ];

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipLinksContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  };

  const setupKeyboardShortcuts = () => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if (!config.keyboard.enabled) return;

      const shortcuts = config.keyboard.shortcuts;
      const key = e.altKey ? `alt+${e.key.toLowerCase()}` : 
                  e.ctrlKey ? `ctrl+${e.key.toLowerCase()}` : 
                  e.shiftKey && e.key === 'Tab' ? 'shift+tab' :
                  e.key.toLowerCase();

      if (shortcuts[key]) {
        e.preventDefault();
        handleShortcut(shortcuts[key]);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
  };

  const handleShortcut = (action: string) => {
    switch (action) {
      case 'home':
        window.location.href = '/';
        break;
      case 'menu':
        const menuButton = document.querySelector('[aria-label*="menu"]') as HTMLElement;
        menuButton?.click();
        break;
      case 'search':
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]') as HTMLElement;
        searchInput?.focus();
        break;
      case 'help':
        // Open help modal or navigate to help page
        announceToScreenReader('Help information opened');
        break;
      case 'close':
        const closeButton = document.querySelector('[aria-label*="close"], .modal [data-close]') as HTMLElement;
        closeButton?.click();
        break;
    }
  };

  const setupFocusIndicators = () => {
    if (!config.visual.focusIndicators) return;

    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--focus-color, #0066cc) !important;
        outline-offset: 2px !important;
        border-radius: 2px !important;
      }
      
      .keyboard-focus {
        box-shadow: 0 0 0 3px var(--focus-color, #0066cc) !important;
        outline: none !important;
      }
      
      .skip-links {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1000;
      }
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--background-color, #000);
        color: var(--text-color, #fff);
        padding: 8px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 0;
      }
      
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
    `;
    document.head.appendChild(style);
  };

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // Apply large text
    if (config.visual.largeText) {
      root.classList.add('large-text');
    }
    
    // Apply reduced motion
    if (config.visual.reducedMotion) {
      root.classList.add('reduced-motion');
    }
  };

  const updateConfig = useCallback((updates: Partial<AccessibilityConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Save to localStorage
      try {
        localStorage.setItem('accessibility-config', JSON.stringify(newConfig));
      } catch (error) {
        console.warn('Failed to save accessibility preferences:', error);
      }
      
      return newConfig;
    });
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!config.screenReader.enabled) return;

    const announcer = priority === 'assertive' 
      ? document.getElementById('screen-reader-announcer-assertive')
      : document.getElementById('screen-reader-announcer');
      
    if (announcer) {
      announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  }, [config.screenReader.enabled]);

  const focusElement = useCallback((selector: string | HTMLElement) => {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
      
    if (element) {
      element.focus();
      
      // Scroll into view if needed
      element.scrollIntoView({
        behavior: config.visual.reducedMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    }
  }, [config.visual.reducedMotion]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      focusElement(mainContent);
      announceToScreenReader('Skipped to main content');
    }
  }, [focusElement, announceToScreenReader]);

  const adjustFontSize = useCallback((direction: 'increase' | 'decrease' | 'reset') => {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize) || 16;
    
    let newSize: number;
    switch (direction) {
      case 'increase':
        newSize = Math.min(currentSize * 1.1, 24);
        break;
      case 'decrease':
        newSize = Math.max(currentSize * 0.9, 12);
        break;
      case 'reset':
        newSize = 16;
        break;
    }
    
    root.style.fontSize = `${newSize}px`;
    
    const action = direction === 'increase' ? 'increased' : 
                   direction === 'decrease' ? 'decreased' : 'reset';
    announceToScreenReader(`Font size ${action}`);
  }, [announceToScreenReader]);

  const toggleReducedMotion = useCallback(() => {
    updateConfig({
      visual: {
        ...config.visual,
        reducedMotion: !config.visual.reducedMotion
      }
    });
    announceToScreenReader(
      config.visual.reducedMotion ? 'Animations enabled' : 'Animations reduced'
    );
  }, [config.visual, updateConfig, announceToScreenReader]);

  const cleanupAccessibility = () => {
    // Remove added elements
    const skipLinks = document.getElementById('skip-links');
    const announcer = document.getElementById('screen-reader-announcer');
    const assertiveAnnouncer = document.getElementById('screen-reader-announcer-assertive');
    
    skipLinks?.remove();
    announcer?.remove();
    assertiveAnnouncer?.remove();
  };

  const contextValue: AccessibilityContextType = {
    config,
    updateConfig,
    announceToScreenReader,
    focusElement,
    trapFocus,
    skipToContent,
    adjustFontSize,
    toggleReducedMotion,
    isKeyboardUser,
    setKeyboardUser: setIsKeyboardUser,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Higher-order component for accessibility features
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AccessibleComponent(props: P) {
    const accessibility = useAccessibility();
    
    return (
      <Component 
        {...props} 
        accessibility={accessibility}
      />
    );
  };
}

// Custom hook for focus management
export function useFocusManagement() {
  const { focusElement, trapFocus } = useAccessibility();
  
  return {
    focusElement,
    trapFocus,
    focusFirst: (container: HTMLElement) => {
      const firstFocusable = container.querySelector(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        focusElement(firstFocusable);
      }
    },
    restoreFocus: (element: HTMLElement) => {
      setTimeout(() => focusElement(element), 0);
    }
  };
}

// Custom hook for screen reader announcements
export function useScreenReader() {
  const { announceToScreenReader, config } = useAccessibility();
  
  return {
    announce: announceToScreenReader,
    isEnabled: config.screenReader.enabled,
    announcePageChange: (pageName: string) => {
      if (config.screenReader.announcePageChanges) {
        announceToScreenReader(`Navigated to ${pageName}`);
      }
    },
    announceFormError: (error: string) => {
      if (config.screenReader.announceFormErrors) {
        announceToScreenReader(`Error: ${error}`, 'assertive');
      }
    },
    announceStatusUpdate: (status: string) => {
      if (config.screenReader.announceStatusUpdates) {
        announceToScreenReader(status);
      }
    }
  };
}

// Custom hook for keyboard navigation
export function useKeyboardNavigation() {
  const { config, isKeyboardUser } = useAccessibility();
  
  return {
    isKeyboardUser,
    isEnabled: config.keyboard.enabled,
    shortcuts: config.keyboard.shortcuts,
    
    handleKeyDown: (handler: (key: string, event: KeyboardEvent) => void) => {
      return (e: KeyboardEvent) => {
        if (!config.keyboard.enabled) return;
        
        const key = e.altKey ? `alt+${e.key.toLowerCase()}` : 
                    e.ctrlKey ? `ctrl+${e.key.toLowerCase()}` : 
                    e.key.toLowerCase();
        
        handler(key, e);
      };
    }
  };
}