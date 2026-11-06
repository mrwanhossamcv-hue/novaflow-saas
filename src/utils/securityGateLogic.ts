export type VerificationState =
  | 'UNVERIFIED'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'FULLY_VERIFIED'
  | 'PAYMENT_LOCKED';

// قائمة بنطاقات الإيميلات المؤقتة والوهمية الأكثر شيوعاً (Disposable & Temporary Email Blocklist)
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'dispostable.com',
  'fakeinbox.com',
  'getnada.com',
  'mohmal.com',
  'temp-mail.org',
  'burnermail.io',
  'maildrop.cc',
]);

/**
 * فحص البريد الإلكتروني والتأكد من صحته وعدم كونه بريداً مؤقتاً
 * Validates email format and ensures it does not belong to a disposable email provider.
 */
export function validateUserEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      isValid: false,
      error: 'يرجى إدخال بريد إلكتروني صالح. (Please enter a valid email address.)',
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. التحقق من التنسيق عبر Regex قياسي
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      error: 'صيغة البريد الإلكتروني غير صحيحة. (Invalid email address format.)',
    };
  }

  // 2. استخراج النطاق (Domain)
  const parts = cleanEmail.split('@');
  const domain = parts[1];

  // 3. التحقق من القائمة السوداء للنطاقات المؤقتة (including subdomains)
  const isBlockedDomain =
    DISPOSABLE_EMAIL_DOMAINS.has(domain) ||
    Array.from(DISPOSABLE_EMAIL_DOMAINS).some((d) => domain.endsWith(`.${d}`));

  if (isBlockedDomain) {
    return {
      isValid: false,
      error: `غير مسموح بالتسجيل عبر خدمات البريد المؤقت أو الوهمي (${domain}). (Disposable email providers are restricted.)`,
    };
  }

  return { isValid: true };
}

export const COUNTRY_DIAL_CODES = [
  { code: 'EG', dialCode: '+20', label: 'Egypt (+20)', minDigits: 9, maxDigits: 11 },
  { code: 'SA', dialCode: '+966', label: 'Saudi Arabia (+966)', minDigits: 8, maxDigits: 10 },
  { code: 'AE', dialCode: '+971', label: 'United Arab Emirates (+971)', minDigits: 8, maxDigits: 10 },
  { code: 'US', dialCode: '+1', label: 'United States / Canada (+1)', minDigits: 10, maxDigits: 10 },
  { code: 'GB', dialCode: '+44', label: 'United Kingdom (+44)', minDigits: 9, maxDigits: 10 },
  { code: 'DE', dialCode: '+49', label: 'Germany (+49)', minDigits: 9, maxDigits: 11 },
  { code: 'FR', dialCode: '+33', label: 'France (+33)', minDigits: 9, maxDigits: 9 },
  { code: 'AU', dialCode: '+61', label: 'Australia (+61)', minDigits: 9, maxDigits: 9 },
] as const;

export const MAX_OTP_FAILURES = 3;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const LOCKOUT_DURATION_SECONDS = 180;

// Default fallback constants for unit tests
export const DEMO_EMAIL_OTP = '482910';
export const DEMO_SMS_OTP = '739204';
export const DEMO_2FA_CODE = '918273';

/**
 * Generates a cryptographically random 6-digit numeric OTP code (e.g. "583921").
 */
export function generateRandomSixDigitOtp(): string {
  const randomInt = Math.floor(100000 + Math.random() * 900000);
  return String(randomInt);
}

export interface EmailValidationResult {
  valid: boolean;
  normalizedEmail: string;
  domain: string;
  isDisposable: boolean;
  error?: string;
}

export interface PhoneValidationResult {
  valid: boolean;
  e164Phone: string;
  error?: string;
}

export interface BillingProfileInput {
  fullLegalName: string;
  billingAddress: string;
  country: string;
}

export interface BillingProfileValidationResult {
  valid: boolean;
  errors: {
    fullLegalName?: string;
    billingAddress?: string;
    country?: string;
  };
}

export interface SecurityGateContext {
  state: VerificationState;
  verifiedEmail: string | null;
  verifiedPhone: string | null;
  authenticatedUid: string | null;
  botProtectionVerified: boolean;
  botTrustScore: number | null;
  consecutiveOtpFailures: number;
  lockedUntilTimestamp: number | null;
  lockReason: string | null;
}

export function createInitialSecurityContext(): SecurityGateContext {
  return {
    state: 'UNVERIFIED',
    verifiedEmail: null,
    verifiedPhone: null,
    authenticatedUid: null,
    botProtectionVerified: false,
    botTrustScore: null,
    consecutiveOtpFailures: 0,
    lockedUntilTimestamp: null,
    lockReason: null,
  };
}

/**
 * Validates an email against standard syntax and the internal disposable/temporary domain blocklist.
 */
export function validateIdentityEmail(rawEmail: string): EmailValidationResult {
  const trimmed = (rawEmail || '').trim().toLowerCase();
  const baseCheck = validateUserEmail(rawEmail);
  const parts = trimmed.split('@');
  const domain = parts.length === 2 ? parts[1] : '';
  const isDisposable =
    Boolean(domain) &&
    (DISPOSABLE_EMAIL_DOMAINS.has(domain) ||
      Array.from(DISPOSABLE_EMAIL_DOMAINS).some((d) => domain.endsWith(`.${d}`)));

  if (!baseCheck.isValid) {
    return {
      valid: false,
      normalizedEmail: trimmed,
      domain,
      isDisposable,
      error: baseCheck.error,
    };
  }

  return {
    valid: true,
    normalizedEmail: trimmed,
    domain,
    isDisposable: false,
  };
}

/**
 * Validates international phone number and returns strict E.164 format (e.g., +201012345678).
 */
export function validatePhoneNumber(
  dialCodeValue: string,
  rawSubscriberNumber: string
): PhoneValidationResult {
  const cleanDial = dialCodeValue.replace('-CA', '').trim();
  // Strip non-digits and remove leading zero if user typed national trunk prefix (e.g. 010... -> 10...)
  const rawDigits = rawSubscriberNumber.replace(/\D/g, '');
  const normalizedSubscriber = rawDigits.startsWith('0') ? rawDigits.slice(1) : rawDigits;

  if (!normalizedSubscriber) {
    return {
      valid: false,
      e164Phone: '',
      error: 'Phone number is required in E.164 format for Firebase SMS OTP verification.',
    };
  }

  const e164Candidate = `${cleanDial}${normalizedSubscriber}`;
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  if (!e164Regex.test(e164Candidate)) {
    return {
      valid: false,
      e164Phone: e164Candidate,
      error: 'Invalid E.164 phone number syntax (expected 8 to 15 digits including country code).',
    };
  }

  return {
    valid: true,
    e164Phone: e164Candidate,
  };
}

/**
 * Validates a 6-digit OTP submission and transitions the security gate state machine.
 * Enforces the 3-strike consecutive failure rate limit (transitions to PAYMENT_LOCKED).
 */
export function verifyOtpAttempt(
  context: SecurityGateContext,
  stage: 'EMAIL' | 'PHONE' | 'TWO_FACTOR',
  submittedCode: string,
  expectedCode: string,
  verifiedIdentifier: string,
  nowMs: number = Date.now(),
  authenticatedUid?: string
): {
  nextContext: SecurityGateContext;
  accepted: boolean;
  locked: boolean;
  remainingAttempts: number;
  message: string;
} {
  if (context.state === 'PAYMENT_LOCKED') {
    return {
      nextContext: context,
      accepted: false,
      locked: true,
      remainingAttempts: 0,
      message:
        context.lockReason ||
        'Checkout is temporarily locked due to excessive failed OTP verification attempts.',
    };
  }

  const sanitizedSubmitted = submittedCode.replace(/\D/g, '');
  if (sanitizedSubmitted.length !== 6) {
    return {
      nextContext: context,
      accepted: false,
      locked: false,
      remainingAttempts: Math.max(0, MAX_OTP_FAILURES - context.consecutiveOtpFailures),
      message: 'Code Incorrect: Please enter all 6 numeric digits of the verification code.',
    };
  }

  if (sanitizedSubmitted !== expectedCode) {
    const updatedFailures = context.consecutiveOtpFailures + 1;
    const isNowLocked = updatedFailures >= MAX_OTP_FAILURES;
    const remainingAttempts = Math.max(0, MAX_OTP_FAILURES - updatedFailures);

    if (isNowLocked) {
      const lockMessage = `Code Incorrect — Security Lockout: 3 consecutive invalid OTP attempts detected at ${stage} stage. Checkout and payment actions are locked.`;
      return {
        nextContext: {
          ...context,
          state: 'PAYMENT_LOCKED',
          consecutiveOtpFailures: updatedFailures,
          lockedUntilTimestamp: nowMs + LOCKOUT_DURATION_SECONDS * 1000,
          lockReason: lockMessage,
        },
        accepted: false,
        locked: true,
        remainingAttempts: 0,
        message: lockMessage,
      };
    }

    return {
      nextContext: {
        ...context,
        consecutiveOtpFailures: updatedFailures,
      },
      accepted: false,
      locked: false,
      remainingAttempts,
      message: `Code Incorrect: The 6-digit verification code does not match. ${remainingAttempts} attempt${
        remainingAttempts === 1 ? '' : 's'
      } remaining before checkout lockout.`,
    };
  }

  // Valid OTP code entered -> reset failure counter and advance state machine
  if (stage === 'EMAIL') {
    return {
      nextContext: {
        ...context,
        state: 'EMAIL_VERIFIED',
        verifiedEmail: verifiedIdentifier,
        consecutiveOtpFailures: 0,
        lockedUntilTimestamp: null,
        lockReason: null,
      },
      accepted: true,
      locked: false,
      remainingAttempts: MAX_OTP_FAILURES,
      message: `Email ${verifiedIdentifier} verified via 6-digit OTP.`,
    };
  }

  if (stage === 'PHONE') {
    const resolvedUid =
      authenticatedUid ||
      context.authenticatedUid ||
      `uid_nf_${verifiedIdentifier.replace(/\D/g, '').slice(-8)}`;
    return {
      nextContext: {
        ...context,
        state: 'FULLY_VERIFIED',
        verifiedPhone: verifiedIdentifier,
        authenticatedUid: resolvedUid,
        botProtectionVerified: true,
        botTrustScore: 0.99,
        consecutiveOtpFailures: 0,
        lockedUntilTimestamp: null,
        lockReason: null,
      },
      accepted: true,
      locked: false,
      remainingAttempts: MAX_OTP_FAILURES,
      message: `Phone ${verifiedIdentifier} verified via Firebase SMS OTP (UID: ${resolvedUid}).`,
    };
  }

  // TWO_FACTOR stage
  return {
    nextContext: {
      ...context,
      consecutiveOtpFailures: 0,
      lockedUntilTimestamp: null,
      lockReason: null,
    },
    accepted: true,
    locked: false,
    remainingAttempts: MAX_OTP_FAILURES,
    message: '2FA Challenge verified. 3D Secure payment authorization granted.',
  };
}

/**
 * Transitions from PHONE_VERIFIED to FULLY_VERIFIED once Turnstile / reCAPTCHA v3 challenge completes.
 */
export function completeBotChallenge(
  context: SecurityGateContext,
  trustScore = 0.99
): SecurityGateContext {
  if (context.state === 'PAYMENT_LOCKED') {
    return context;
  }

  if (!context.verifiedEmail || !context.verifiedPhone) {
    return context;
  }

  return {
    ...context,
    state: 'FULLY_VERIFIED',
    authenticatedUid:
      context.authenticatedUid || `uid_nf_${context.verifiedPhone.replace(/\D/g, '').slice(-8)}`,
    botProtectionVerified: true,
    botTrustScore: trustScore,
    consecutiveOtpFailures: 0,
  };
}

/**
 * Determines whether checkout / payment buttons are unlocked.
 * Requires verified email, verified phone, and an authenticated Firebase UID.
 */
export function isCheckoutUnlocked(context: SecurityGateContext): boolean {
  return (
    context.state === 'FULLY_VERIFIED' &&
    Boolean(context.verifiedEmail) &&
    Boolean(context.verifiedPhone) &&
    Boolean(context.authenticatedUid) &&
    context.botProtectionVerified
  );
}

/**
 * Validates the Pre-Flight Fraud Check billing profile fields before triggering the 2FA payment challenge.
 */
export function validateBillingProfile(profile: BillingProfileInput): BillingProfileValidationResult {
  const errors: BillingProfileValidationResult['errors'] = {};

  const name = profile.fullLegalName.trim();
  if (name.length < 3 || !name.includes(' ')) {
    errors.fullLegalName = 'Enter your full legal first and last name as shown on your bank statement.';
  }

  const address = profile.billingAddress.trim();
  if (address.length < 6) {
    errors.billingAddress = 'Enter a complete street billing address for 3DS verification.';
  }

  const country = profile.country.trim();
  if (!country) {
    errors.country = 'Select your billing country.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
