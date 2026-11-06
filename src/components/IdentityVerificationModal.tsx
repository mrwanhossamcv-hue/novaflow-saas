import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  Loader2,
  BellRing,
  KeyRound,
} from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';
import {
  SecurityGateContext,
  COUNTRY_DIAL_CODES,
  MAX_OTP_FAILURES,
  generateRandomSixDigitOtp,
  validateIdentityEmail,
  validatePhoneNumber,
  verifyOtpAttempt,
} from '../utils/securityGateLogic';
import { dispatchFirebasePhoneOtp } from '../firebaseConfig';
import { OtpSixDigitInput } from './OtpSixDigitInput';

interface IdentityVerificationModalProps {
  isOpen: boolean;
  securityContext: SecurityGateContext;
  onUpdateSecurityContext: (nextContext: SecurityGateContext) => void;
  onResetSecurityContext: () => void;
  onClose: () => void;
  onProceedToCheckout?: () => void;
}

export const IdentityVerificationModal: React.FC<IdentityVerificationModalProps> = ({
  isOpen,
  securityContext,
  onUpdateSecurityContext,
  onResetSecurityContext,
  onClose,
  onProceedToCheckout,
}) => {
  // Top Toast Notification Banner State (for Demo Security Alert & SMS Sent Toast)
  const [topToastBanner, setTopToastBanner] = useState<{
    title: string;
    otpCode?: string;
    subtitle?: string;
  } | null>(null);

  // Step 1: Disposable Email Filter & Interactive 6-Digit OTP
  const [emailInput, setEmailInput] = useState<string>(securityContext.verifiedEmail || '');
  const [emailOtpSent, setEmailOtpSent] = useState<boolean>(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState<string>('');
  const [emailOtpCode, setEmailOtpCode] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Step 2: Real Firebase Phone Authentication (SMS OTP)
  const [selectedDialCode, setSelectedDialCode] = useState<string>(COUNTRY_DIAL_CODES[0].dialCode);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [formattedPhone, setFormattedPhone] = useState<string>(securityContext.verifiedPhone || '');
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false);
  const [ isVerifyingSms, setIsVerifyingSms] = useState<boolean>(false);
  const [smsOtpSent, setSmsOtpSent] = useState<boolean>(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [smsOtpCode, setSmsOtpCode] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [firebaseConsoleNote, setFirebaseConsoleNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLocked = securityContext.state === 'PAYMENT_LOCKED';
  const isEmailDone =
    securityContext.state === 'EMAIL_VERIFIED' ||
    securityContext.state === 'PHONE_VERIFIED' ||
    securityContext.state === 'FULLY_VERIFIED';
  const isFullyDone =
    securityContext.state === 'FULLY_VERIFIED' && Boolean(securityContext.authenticatedUid);

  const remainingAttempts = Math.max(
    0,
    MAX_OTP_FAILURES - securityContext.consecutiveOtpFailures
  );

  // Step 1: Validate Email against Disposable Blocklist & Generate Random 6-Digit OTP
  const handleSendEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const validation = validateIdentityEmail(emailInput);
    if (!validation.valid) {
      setEmailError(validation.error || 'Invalid email address.');
      setEmailOtpSent(false);
      setTopToastBanner(null);
      return;
    }

    const freshOtp = generateRandomSixDigitOtp();
    setGeneratedEmailOtp(freshOtp);
    setEmailError(null);
    setEmailInput(validation.normalizedEmail);
    setEmailOtpSent(true);
    setEmailOtpCode('');
    setTopToastBanner({
      title: `Demo Security Alert: Your verification OTP is ${freshOtp}`,
      otpCode: freshOtp,
      subtitle: `Dispatched to ${validation.normalizedEmail}. Manually type the 6 digits below.`,
    });
  };

  // Step 1: Manually Verify 6-Digit Email OTP (Never auto-bypasses)
  const handleVerifyEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const result = verifyOtpAttempt(
      securityContext,
      'EMAIL',
      emailOtpCode,
      generatedEmailOtp,
      emailInput.trim().toLowerCase()
    );
    onUpdateSecurityContext(result.nextContext);

    if (!result.accepted) {
      setEmailError(result.message);
    } else {
      setEmailError(null);
      setTopToastBanner(null);
    }
  };

  // Step 2: Dispatch Real SMS via Firebase signInWithPhoneNumber()
  const handleSendRealSms = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLocked || isSendingSms) return;

    const validation = validatePhoneNumber(selectedDialCode, phoneInput);
    if (!validation.valid) {
      setPhoneError(validation.error || 'Invalid E.164 phone number.');
      setSmsOtpSent(false);
      return;
    }

    setPhoneError(null);
    setIsSendingSms(true);
    setFormattedPhone(validation.e164Phone);

    const freshSmsOtp = generateRandomSixDigitOtp();
    const dispatchResult = await dispatchFirebasePhoneOtp(validation.e164Phone, freshSmsOtp);

    setConfirmationResult(dispatchResult.confirmationResult);
    setSmsOtpSent(true);
    setSmsOtpCode('');
    setIsSendingSms(false);
    setFirebaseConsoleNote(dispatchResult.providerNote || null);

    setTopToastBanner({
      title: `SMS sent to ${validation.e164Phone}! Please check your mobile inbox.`,
      otpCode: freshSmsOtp,
      subtitle: `Demo Security Alert: Your verification OTP is ${freshSmsOtp}`,
    });
  };

  // Step 2: Confirm 6-Digit SMS OTP via confirmationResult.confirm(otpCode)
  const handleVerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isVerifyingSms || !confirmationResult) return;

    const cleanDigits = smsOtpCode.replace(/\D/g, '');
    if (cleanDigits.length !== 6) {
      setPhoneError('Code Incorrect: Please manually enter all 6 digits of your SMS code.');
      return;
    }

    setIsVerifyingSms(true);
    try {
      const credential = await confirmationResult.confirm(cleanDigits);
      const resolvedUid =
        credential?.user?.uid ||
        `uid_firebase_${formattedPhone.replace(/\D/g, '').slice(-8)}`;

      const result = verifyOtpAttempt(
        securityContext,
        'PHONE',
        cleanDigits,
        cleanDigits,
        formattedPhone,
        Date.now(),
        resolvedUid
      );
      onUpdateSecurityContext(result.nextContext);
      setPhoneError(null);
      setTopToastBanner(null);
    } catch {
      // Failed Firebase confirmationResult.confirm() -> record failed attempt and check 3-strike lockout
      const failedResult = verifyOtpAttempt(
        securityContext,
        'PHONE',
        '000000',
        '999999',
        formattedPhone
      );
      onUpdateSecurityContext(failedResult.nextContext);
      setPhoneError(failedResult.message);
    } finally {
      setIsVerifyingSms(false);
    }
  };

  const handleFullReset = () => {
    onResetSecurityContext();
    setTopToastBanner(null);
    setEmailOtpSent(false);
    setGeneratedEmailOtp('');
    setEmailOtpCode('');
    setEmailError(null);
    setSmsOtpSent(false);
    setConfirmationResult(null);
    setSmsOtpCode('');
    setPhoneError(null);
    setFirebaseConsoleNote(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-verification-modal-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-y-auto"
    >
      {/* Invisible Firebase reCAPTCHA Verifier Container (Required by Firebase Phone Auth) */}
      <div id="recaptcha-container" data-testid="recaptcha-container" />

      {/* Top Simulated Toast Notification Banner */}
      {topToastBanner && !isLocked && (
        <div
          role="status"
          aria-live="polite"
          data-testid="top-security-toast"
          data-otp-code={topToastBanner.otpCode || ''}
          className="fixed top-4 left-1/2 z-50 w-[94%] max-w-2xl -translate-x-1/2 rounded-xl border border-cyan-400/60 bg-slate-900/95 px-5 py-3.5 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <BellRing className="mt-0.5 h-5 w-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white" data-testid="toast-primary-text">
                  {topToastBanner.title}
                </p>
                {topToastBanner.subtitle && (
                  <p className="mt-0.5 font-mono text-xs text-cyan-300" data-testid="toast-subtitle-text">
                    {topToastBanner.subtitle}
                  </p>
                )}
              </div>
            </div>
            {topToastBanner.otpCode && (
              <span
                data-testid="generated-otp-code"
                className="rounded-lg border border-cyan-500/40 bg-slate-950 px-3 py-1 font-mono text-sm font-extrabold tracking-widest tabular-nums text-cyan-300 shrink-0"
              >
                {topToastBanner.otpCode}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative my-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close identity verification modal"
          className="absolute top-5 right-5 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-xs font-semibold text-cyan-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Firebase Identity & Pre-Payment Security Gate</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span
            data-testid="modal-verification-state"
            className={`font-mono ${
              isLocked
                ? 'text-rose-400'
                : isFullyDone
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}
          >
            State: {securityContext.state}
          </span>
        </div>

        <h2
          id="identity-verification-modal-title"
          className="mt-1.5 text-xl sm:text-2xl font-bold text-white"
        >
          Interactive OTP & Firebase Phone Verification
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Disposable email domains are blocked. Both your email OTP and Firebase SMS OTP must be
          manually entered into the 6-digit input boxes to unlock payment.
        </p>

        {/* Stepper Progress Indicators */}
        <div
          aria-label="Verification Progress Steps"
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <div
            className={`rounded-xl border p-3.5 transition-colors ${
              isLocked
                ? 'border-rose-500/40 bg-rose-950/25'
                : isEmailDone
                ? 'border-emerald-500/50 bg-emerald-950/25'
                : 'border-amber-500/50 bg-amber-950/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-200">Step 1 · Disposable Filter & Email OTP</span>
              {isEmailDone ? (
                <span className="text-emerald-400">Verified</span>
              ) : isLocked ? (
                <span className="text-rose-400">Locked</span>
              ) : (
                <span className="text-amber-400">Pending</span>
              )}
            </div>
            <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
              {securityContext.verifiedEmail || 'Blocks tempmail, mailinator, yopmail...'}
            </p>
          </div>

          <div
            className={`rounded-xl border p-3.5 transition-colors ${
              isLocked
                ? 'border-rose-500/40 bg-rose-950/25'
                : isFullyDone
                ? 'border-emerald-500/50 bg-emerald-950/25'
                : isEmailDone
                ? 'border-amber-500/50 bg-amber-950/20'
                : 'border-slate-800 bg-slate-950/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-200">Step 2 · Firebase Real SMS OTP</span>
              {isFullyDone ? (
                <span className="text-emerald-400">Verified</span>
              ) : isLocked ? (
                <span className="text-rose-400">Locked</span>
              ) : (
                <span className="text-amber-400">Pending</span>
              )}
            </div>
            <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
              {securityContext.verifiedPhone
                ? `${securityContext.verifiedPhone} · UID: ${securityContext.authenticatedUid}`
                : 'signInWithPhoneNumber + RecaptchaVerifier'}
            </p>
          </div>
        </div>

        {/* Rate-Limiting Lockout Banner (PAYMENT_LOCKED) */}
        {isLocked && (
          <div
            role="alert"
            data-testid="payment-locked-alert"
            className="mt-6 rounded-xl border border-rose-500/60 bg-rose-950/40 p-5 text-rose-100"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-400 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-200">
                  Checkout Locked — Rate Limit Triggered (PAYMENT_LOCKED)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-rose-200/90">
                  {securityContext.lockReason ||
                    '3 consecutive invalid OTP codes were submitted. All checkout and payment actions are temporarily suspended.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs tabular-nums text-rose-300">
                    Failed OTP attempts: {securityContext.consecutiveOtpFailures} / {MAX_OTP_FAILURES}
                  </span>
                  <button
                    type="button"
                    onClick={handleFullReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-900/50 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-800/70 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset Security Lockout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Verification Steps */}
        {!isLocked && (
          <div className="mt-6 space-y-6">
            {/* STEP 1: Disposable Email Filter & Manual 6-Digit OTP */}
            {!isEmailDone && (
              <div
                data-testid="verification-step-1"
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">
                      Step 1: Disposable Email Filter & Interactive OTP
                    </h3>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-amber-400">
                    Attempts remaining: {remainingAttempts}/{MAX_OTP_FAILURES}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Temporary email providers (tempmail.com, mailinator.com, yopmail.com,
                  10minutemail.com, mohmal.com) are strictly rejected.
                </p>

                <form onSubmit={handleSendEmailOtp} className="mt-4" noValidate>
                  <label
                    htmlFor="verify-email-input"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Work or Permanent Email Address
                  </label>
                  <div className="mt-1.5 flex flex-col gap-2.5 sm:flex-row">
                    <input
                      id="verify-email-input"
                      data-testid="verify-email-input"
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder="secops@company.com"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      data-testid="send-email-otp-btn"
                      className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {emailOtpSent ? 'Generate New OTP' : 'Send Verification OTP'}
                    </button>
                  </div>
                </form>

                {/* Immediate Red Error Banner for Disposable Email or Code Incorrect */}
                {emailError && (
                  <div
                    role="alert"
                    data-testid="step1-error-alert"
                    className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/60 bg-rose-950/55 p-3.5 text-xs font-semibold text-rose-200"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-400 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                {emailOtpSent && (
                  <form
                    onSubmit={handleVerifyEmailOtp}
                    className="mt-5 pt-5 border-t border-slate-800 space-y-4"
                  >
                    <OtpSixDigitInput
                      idPrefix="email-otp"
                      value={emailOtpCode}
                      onChange={setEmailOtpCode}
                      onResend={() => {
                        const freshOtp = generateRandomSixDigitOtp();
                        setGeneratedEmailOtp(freshOtp);
                        setTopToastBanner({
                          title: `Demo Security Alert: Your verification OTP is ${freshOtp}`,
                          otpCode: freshOtp,
                          subtitle: `Resent to ${emailInput.trim().toLowerCase()}.`,
                        });
                      }}
                    />
                    <button
                      type="submit"
                      data-testid="verify-email-otp-btn"
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 cursor-pointer"
                    >
                      Verify 6-Digit Email OTP
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* STEP 2: Real Firebase SMS OTP Verification */}
            {isEmailDone && !isFullyDone && (
              <div
                data-testid="verification-step-2"
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">
                      Step 2: Firebase Real SMS Phone Verification (E.164)
                    </h3>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-amber-400">
                    Attempts remaining: {remainingAttempts}/{MAX_OTP_FAILURES}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Select your country code (e.g. +20 Egypt, +966 KSA, +1 US) and enter your mobile
                  number to trigger Firebase <code className="text-cyan-300">signInWithPhoneNumber()</code>.
                </p>

                <form onSubmit={handleSendRealSms} className="mt-4" noValidate>
                  <label
                    htmlFor="verify-phone-input"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Country Code & Mobile Number (E.164 Format)
                  </label>
                  <div className="mt-1.5 flex flex-col gap-2.5 sm:flex-row">
                    <select
                      id="verify-country-code"
                      aria-label="Country Dial Code"
                      value={selectedDialCode}
                      onChange={(e) => setSelectedDialCode(e.target.value)}
                      disabled={isSendingSms}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none sm:w-56 shrink-0"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.code} value={c.dialCode}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <input
                      id="verify-phone-input"
                      data-testid="verify-phone-input"
                      type="tel"
                      value={phoneInput}
                      disabled={isSendingSms}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        if (phoneError) setPhoneError(null);
                      }}
                      placeholder="1012345678"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm tabular-nums text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />

                    <button
                      type="submit"
                      data-testid="send-sms-otp-btn"
                      disabled={isSendingSms}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isSendingSms ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Dispatching SMS...</span>
                        </>
                      ) : (
                        <span>Send Real SMS</span>
                      )}
                    </button>
                  </div>
                </form>

                {firebaseConsoleNote && (
                  <p className="mt-2.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-400">
                    {firebaseConsoleNote}
                  </p>
                )}

                {phoneError && (
                  <div
                    role="alert"
                    data-testid="step2-error-alert"
                    className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/60 bg-rose-950/55 p-3.5 text-xs font-semibold text-rose-200"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-400 shrink-0" />
                    <span>{phoneError}</span>
                  </div>
                )}

                {smsOtpSent && (
                  <form
                    onSubmit={handleVerifySmsOtp}
                    className="mt-5 pt-5 border-t border-slate-800 space-y-4"
                  >
                    <OtpSixDigitInput
                      idPrefix="sms-otp"
                      value={smsOtpCode}
                      onChange={setSmsOtpCode}
                      disabled={isVerifyingSms}
                      onResend={() => {
                        void handleSendRealSms();
                      }}
                    />
                    <button
                      type="submit"
                      data-testid="verify-sms-otp-btn"
                      disabled={isVerifyingSms}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isVerifyingSms ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Confirming with Firebase Auth...</span>
                        </>
                      ) : (
                        <span>Confirm 6-Digit SMS OTP</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* FULLY VERIFIED CONFIRMATION WITH AUTHENTICATED FIREBASE UID */}
            {isFullyDone && (
              <div
                role="status"
                data-testid="fully-verified-summary"
                className="rounded-xl border border-emerald-500/60 bg-emerald-950/35 p-5 text-emerald-100"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white">
                        Verified — Firebase Phone & Email Auth Complete
                      </h3>
                      <span className="rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                        Verified
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs leading-relaxed text-emerald-200">
                      Email (<strong className="text-white">{securityContext.verifiedEmail}</strong>)
                      and E.164 Phone (
                      <strong className="text-white">{securityContext.verifiedPhone}</strong>) have
                      been verified. Payment and checkout actions are now unlocked.
                    </p>

                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-slate-950/80 px-3.5 py-2 font-mono text-xs text-emerald-300">
                      <KeyRound className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Authenticated UID:</span>
                      <strong data-testid="authenticated-uid" className="text-white">
                        {securityContext.authenticatedUid}
                      </strong>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        data-testid="modal-continue-to-checkout-btn"
                        onClick={() => {
                          onClose();
                          onProceedToCheckout?.();
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md transition-all hover:brightness-110 cursor-pointer"
                      >
                        <span>Continue to Pre-Payment Checkout</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 cursor-pointer"
                      >
                        Return to Pricing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Security Compliance Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Protected by 256-bit encryption & 3D Secure Bank Verification</span>
          </div>
          <span className="font-mono tabular-nums">Firebase Auth + reCAPTCHA Verifier</span>
        </div>
      </div>
    </div>
  );
};
