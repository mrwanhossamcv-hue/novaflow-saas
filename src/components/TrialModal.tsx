import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ArrowRight,
  Lock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  BellRing,
} from 'lucide-react';
import { BillingCycle } from '../utils/novaflowLogic';
import {
  SecurityGateContext,
  MAX_OTP_FAILURES,
  generateRandomSixDigitOtp,
  isCheckoutUnlocked,
  validateBillingProfile,
  verifyOtpAttempt,
} from '../utils/securityGateLogic';
import { OtpSixDigitInput } from './OtpSixDigitInput';

interface TrialModalProps {
  isOpen: boolean;
  initialPlan: string;
  initialBilling: BillingCycle;
  securityContext: SecurityGateContext;
  onUpdateSecurityContext: (nextContext: SecurityGateContext) => void;
  onOpenVerificationModal: () => void;
  onClose: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  initialPlan,
  initialBilling,
  securityContext,
  onUpdateSecurityContext,
  onOpenVerificationModal,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || 'Pro');
  const [fullLegalName, setFullLegalName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [country, setCountry] = useState('United States');
  const [fieldErrors, setFieldErrors] = useState<{
    fullLegalName?: string;
    billingAddress?: string;
    country?: string;
  }>({});

  // Pre-Flight 2FA Challenge State
  const [show2faChallenge, setShow2faChallenge] = useState(false);
  const [generated2faCode, setGenerated2faCode] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  if (!isOpen) return null;

  const checkoutUnlocked = isCheckoutUnlocked(securityContext);
  const isLocked = securityContext.state === 'PAYMENT_LOCKED';
  const remainingAttempts = Math.max(
    0,
    MAX_OTP_FAILURES - securityContext.consecutiveOtpFailures
  );

  // Step A: Validate Pre-Flight Billing Profile & Immediately Trigger 2FA Challenge
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutUnlocked || isLocked) return;

    const profileValidation = validateBillingProfile({
      fullLegalName,
      billingAddress,
      country,
    });

    if (!profileValidation.valid) {
      setFieldErrors(profileValidation.errors);
      return;
    }

    const fresh2fa = generateRandomSixDigitOtp();
    setGenerated2faCode(fresh2fa);
    setFieldErrors({});
    setTwoFaError(null);
    setTwoFaCode('');
    setShow2faChallenge(true);
  };

  // Step B: Verify Final 2FA Challenge Code before authorizing payment
  const handleConfirm2faPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const result = verifyOtpAttempt(
      securityContext,
      'TWO_FACTOR',
      twoFaCode,
      generated2faCode,
      securityContext.verifiedEmail || 'verified-user'
    );
    onUpdateSecurityContext(result.nextContext);

    if (!result.accepted) {
      setTwoFaError(result.message);
      return;
    }

    setTwoFaError(null);
    setPaymentCompleted(true);
  };

  const handleResetAndClose = () => {
    setShow2faChallenge(false);
    setPaymentCompleted(false);
    setTwoFaError(null);
    setFieldErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-y-auto"
    >
      {/* Top Simulated Toast Banner for 2FA Challenge Code */}
      {show2faChallenge && !paymentCompleted && !isLocked && generated2faCode && (
        <div
          role="status"
          aria-live="polite"
          data-testid="checkout-2fa-toast"
          data-otp-code={generated2faCode}
          className="fixed top-4 left-1/2 z-50 w-[94%] max-w-xl -translate-x-1/2 rounded-xl border border-cyan-400/60 bg-slate-900/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BellRing className="h-5 w-5 text-cyan-400 shrink-0" />
              <p className="text-sm font-bold text-white">
                Demo Security Alert: Your verification OTP is {generated2faCode}
              </p>
            </div>
            <span
              data-testid="generated-2fa-code"
              className="rounded-lg border border-cyan-500/40 bg-slate-950 px-3 py-1 font-mono text-sm font-extrabold tracking-widest tabular-nums text-cyan-300"
            >
              {generated2faCode}
            </span>
          </div>
        </div>
      )}

      <div className="relative my-auto w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Close checkout modal"
          className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Case 1: User is not FULLY_VERIFIED or is PAYMENT_LOCKED */}
        {!checkoutUnlocked ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              {isLocked ? (
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              ) : (
                <Lock className="h-4 w-4 text-amber-400" />
              )}
              <span>Pre-Payment Security Gate Enforcement</span>
            </div>

            <h2 id="checkout-modal-title" className="text-xl font-bold text-white">
              {isLocked ? 'Checkout Locked (Rate Limit)' : 'Identity Verification Required'}
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              {isLocked
                ? securityContext.lockReason ||
                  'Payment access has been temporarily suspended due to 3 consecutive failed OTP attempts.'
                : 'To protect against unauthorized transactions and automated bots, you must complete Email OTP and Firebase SMS OTP verification before proceeding to payment.'}
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300 space-y-1.5 font-mono">
              <div>Current State: {securityContext.state}</div>
              <div>Email OTP: {securityContext.verifiedEmail || 'Pending'}</div>
              <div>Phone SMS OTP: {securityContext.verifiedPhone || 'Pending'}</div>
              <div>Authenticated UID: {securityContext.authenticatedUid || 'Pending'}</div>
            </div>

            <button
              type="button"
              data-testid="launch-identity-gate-from-checkout"
              onClick={() => {
                handleResetAndClose();
                onOpenVerificationModal();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Open Multi-Step Identity Verification</span>
            </button>
          </div>
        ) : !paymentCompleted ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>
                Firebase UID Verified ({securityContext.authenticatedUid}) ·{' '}
                {initialBilling === 'annual' ? 'Annual' : 'Monthly'}
              </span>
            </div>

            <h2 id="checkout-modal-title" className="mt-1 text-xl font-bold text-white">
              {show2faChallenge
                ? 'Final 2FA Payment Challenge'
                : 'Complete Pre-Flight Billing Profile'}
            </h2>

            {!show2faChallenge ? (
              <form
                onSubmit={handleProceedToPayment}
                className="mt-5 space-y-4"
                noValidate
                data-testid="preflight-profile-form"
              >
                <div>
                  <label
                    htmlFor="checkout-plan-select"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Subscription Tier
                  </label>
                  <select
                    id="checkout-plan-select"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Starter">Starter ($15/mo billed annually)</option>
                    <option value="Pro">Pro ($29/mo billed annually — Most Popular)</option>
                    <option value="Enterprise">Enterprise ($79/mo billed annually)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="checkout-legal-name"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Full Legal Name
                  </label>
                  <input
                    id="checkout-legal-name"
                    data-testid="checkout-legal-name"
                    type="text"
                    value={fullLegalName}
                    onChange={(e) => setFullLegalName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  {fieldErrors.fullLegalName && (
                    <p role="alert" className="mt-1 text-xs text-rose-400">
                      {fieldErrors.fullLegalName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-billing-address"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Billing Street Address
                  </label>
                  <input
                    id="checkout-billing-address"
                    data-testid="checkout-billing-address"
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="548 Market St, Suite 400, San Francisco, CA"
                    className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  {fieldErrors.billingAddress && (
                    <p role="alert" className="mt-1 text-xs text-rose-400">
                      {fieldErrors.billingAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-country"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Billing Country
                  </label>
                  <select
                    id="checkout-country"
                    data-testid="checkout-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="United States">United States</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                  {fieldErrors.country && (
                    <p role="alert" className="mt-1 text-xs text-rose-400">
                      {fieldErrors.country}
                    </p>
                  )}
                </div>

                {/* 3D Secure (3DS) Compliance Indicator */}
                <div
                  data-testid="three-ds-indicator"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-200"
                >
                  <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Protected by 256-bit encryption & 3D Secure Bank Verification</span>
                </div>

                <button
                  type="submit"
                  data-testid="proceed-to-payment-btn"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:brightness-110 cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              /* 2FA Challenge Step Immediately Triggered on Proceed to Payment */
              <form
                onSubmit={handleConfirm2faPayment}
                className="mt-5 space-y-5"
                data-testid="two-fa-challenge-form"
              >
                <div className="rounded-xl border border-violet-500/40 bg-violet-950/25 p-4 text-xs text-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-cyan-400" />
                      <span>Mandatory Pre-Payment 2FA Challenge</span>
                    </span>
                    <span className="font-mono text-amber-300 tabular-nums">
                      Attempts left: {remainingAttempts}/{MAX_OTP_FAILURES}
                    </span>
                  </div>
                  <p className="text-slate-300">
                    Manually enter the 6-digit verification code from the top security banner to
                    authorize 3D Secure billing for{' '}
                    <strong className="text-white">{fullLegalName}</strong>.
                  </p>
                </div>

                <OtpSixDigitInput
                  idPrefix="two-fa-otp"
                  value={twoFaCode}
                  onChange={setTwoFaCode}
                  onResend={() => {
                    const fresh2fa = generateRandomSixDigitOtp();
                    setGenerated2faCode(fresh2fa);
                  }}
                />

                {twoFaError && (
                  <p
                    role="alert"
                    data-testid="two-fa-error-alert"
                    className="rounded-lg border border-rose-500/50 bg-rose-950/40 p-3 text-xs font-medium text-rose-200"
                  >
                    {twoFaError}
                  </p>
                )}

                <div
                  data-testid="three-ds-indicator"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-200"
                >
                  <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Protected by 256-bit encryption & 3D Secure Bank Verification</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShow2faChallenge(false)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    Back to Billing Info
                  </button>
                  <button
                    type="submit"
                    data-testid="confirm-2fa-payment-btn"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify 2FA & Authorize Payment</span>
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="py-4 text-center" data-testid="payment-authorized-receipt">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 id="checkout-modal-title" className="mt-4 text-xl font-bold text-white">
              3D Secure Payment Authorized
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Subscription for <strong className="text-white">{fullLegalName}</strong> on the{' '}
              <strong className="text-cyan-300">{selectedPlan}</strong> plan is active. Verified
              receipt sent to{' '}
              <strong className="text-white">{securityContext.verifiedEmail}</strong> (UID:{' '}
              <strong className="font-mono text-emerald-300">
                {securityContext.authenticatedUid}
              </strong>
              ).
            </p>
            <p className="mt-3 font-mono text-xs text-emerald-300">
              Protected by 256-bit encryption & 3D Secure Bank Verification
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-6 w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 cursor-pointer"
            >
              Return to NovaFlow
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
