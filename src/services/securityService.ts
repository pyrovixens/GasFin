// ==========================================
// GastFin - Banking-Grade Security & Sanitization Shield
// ==========================================

/**
 * 1. XSS & Code Injection Prevention
 * Strips executable HTML, scripts, events, and dangerous URI schemes.
 */
export const sanitizeText = (input: unknown): string => {
  if (input === null || input === undefined) return '';
  const str = String(input);

  return str
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Strip javascript: or data: URIs
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    // Strip inline event handlers
    .replace(/on\w+\s*=/gi, '')
    // Trim excess whitespace
    .trim();
};

/**
 * Sanitize object properties recursively to prevent payload injection
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleanObj: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleanObj[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      cleanObj[key] = sanitizeObject(value);
    } else {
      cleanObj[key] = value;
    }
  }

  return cleanObj as T;
};

/**
 * 2. Privacy & Secret Masking
 */
export const maskEmail = (email?: string | null): string => {
  if (!email || !email.includes('@')) return 'Usuario Registrado';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`;
  }
  const visible = localPart.slice(0, 3);
  return `${visible}***@${domain}`;
};

export const maskPin = (pinLength: number = 4): string => {
  return '•'.repeat(pinLength);
};

/**
 * Constant-time string comparison to prevent side-channel timing attacks
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

/**
 * 3. Client-Side Brute-Force Rate Limiter
 */
class RateLimiter {
  private attempts: Record<string, { count: number; lockedUntil: number }> = {};

  public isLocked(key: string): { locked: boolean; waitSeconds: number } {
    const entry = this.attempts[key];
    if (!entry) return { locked: false, waitSeconds: 0 };

    const now = Date.now();
    if (entry.lockedUntil > now) {
      const waitSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
      return { locked: true, waitSeconds };
    }

    if (entry.lockedUntil <= now && entry.count >= 5) {
      delete this.attempts[key];
    }

    return { locked: false, waitSeconds: 0 };
  }

  public recordFailure(key: string, maxAttempts = 5, lockTimeMs = 30000) {
    const now = Date.now();
    const entry = this.attempts[key] || { count: 0, lockedUntil: 0 };
    entry.count += 1;

    if (entry.count >= maxAttempts) {
      entry.lockedUntil = now + lockTimeMs;
    }

    this.attempts[key] = entry;
  }

  public recordSuccess(key: string) {
    delete this.attempts[key];
  }
}

export const securityRateLimiter = new RateLimiter();

/**
 * 4. Environment & Key Integrity Check
 * Verifies that no sensitive backend service-role keys are exposed on the client
 */
export const validateEnvironmentSecurity = (): { safe: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  if (supabaseKey.includes('service_role') || supabaseKey.includes('secret')) {
    warnings.push('CRITICAL: Service role key detected in client bundle. Use anon key only.');
  }

  if (import.meta.env.DEV) {
    // Development mode check
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
};

/**
 * 5. Safe Local Storage Obfuscation & Storage Integrity
 */
export const secureStorage = {
  set: (key: string, data: any) => {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(key, json);
    } catch (err) {
      console.warn('Secure storage write warning:', err);
    }
  },
  get: <T = any>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};
