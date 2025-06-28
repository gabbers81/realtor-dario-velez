// Cookie consent management system
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsentData {
  hasConsented: boolean;
  consentDate: string;
  preferences: CookiePreferences;
  version: string;
}

const CONSENT_STORAGE_KEY = 'dario-velez-cookie-consent';
const CONSENT_VERSION = '1.0';

// Default preferences - essential cookies are always required
const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

// Get current consent data from localStorage
export function getCookieConsent(): CookieConsentData | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as CookieConsentData;
    
    // Check if consent version is current
    if (data.version !== CONSENT_VERSION) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

// Save consent preferences
export function saveCookieConsent(preferences: CookiePreferences): void {
  const consentData: CookieConsentData = {
    hasConsented: true,
    consentDate: new Date().toISOString(),
    preferences,
    version: CONSENT_VERSION,
  };
  
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    
    // Trigger consent change event
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: consentData
    }));
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

// Accept all cookies
export function acceptAllCookies(): void {
  const allAccepted: CookiePreferences = {
    essential: true,
    analytics: true,
    marketing: true,
    preferences: true,
  };
  
  saveCookieConsent(allAccepted);
}

// Accept only essential cookies
export function acceptEssentialOnly(): void {
  saveCookieConsent(DEFAULT_PREFERENCES);
}

// Clear all consent data (for testing or reset)
export function clearCookieConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: null
    }));
  } catch (error) {
    console.error('Error clearing cookie consent:', error);
  }
}

// Check if user has consented
export function hasUserConsented(): boolean {
  const consent = getCookieConsent();
  return consent?.hasConsented || false;
}

// Check if specific cookie category is allowed
export function isCookieCategoryAllowed(category: keyof CookiePreferences): boolean {
  const consent = getCookieConsent();
  if (!consent) return false;
  
  return consent.preferences[category];
}

// Get consent banner display status
export function shouldShowConsentBanner(): boolean {
  return !hasUserConsented();
}

// Cookie category information for UI
export interface CookieCategoryInfo {
  key: keyof CookiePreferences;
  required: boolean;
  description: string;
  examples: string[];
}

export const COOKIE_CATEGORIES: CookieCategoryInfo[] = [
  {
    key: 'essential',
    required: true,
    description: 'Essential cookies are required for basic website functionality.',
    examples: ['Session management', 'Security', 'Language preferences']
  },
  {
    key: 'analytics',
    required: false,
    description: 'Analytics cookies help us understand how visitors use our website.',
    examples: ['Google Analytics', 'Page views', 'User behavior tracking']
  },
  {
    key: 'marketing',
    required: false,
    description: 'Marketing cookies track visitors across websites for advertising.',
    examples: ['Social media pixels', 'Advertising platforms', 'Remarketing']
  },
  {
    key: 'preferences',
    required: false,
    description: 'Preference cookies remember your choices and settings.',
    examples: ['Theme selection', 'Form preferences', 'UI customizations']
  }
];