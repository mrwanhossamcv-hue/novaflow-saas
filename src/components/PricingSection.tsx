import React, { useState } from 'react';
import {
  Check,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  BillingCycle,
  PRICING_TIERS,
  calculateDisplayedPrice,
} from '../utils/novaflowLogic';
import {
  SecurityGateContext,
  isCheckoutUnlocked,
} from '../utils/securityGateLogic';

interface PricingSectionProps {
  securityContext: SecurityGateContext;
  onOpenVerificationModal: () => void;
  onResetSecurityContext: () => void;
  onSelectPlan: (planName: string, billingCycle: BillingCycle) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  securityContext,
  onOpenVerificationModal,
  onResetSecurityContext,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  const checkoutUnlocked = isCheckoutUnlocked(securityContext);
  const isLocked = securityContext.state === 'PAYMENT_LOCKED';
  const isEmailDone =
    securityContext.state === 'EMAIL_VERIFIED' ||
    securityContext.state === 'PHONE_VERIFIED' ||
    securityContext.state === 'FULLY_VERIFIED';
  const isPhoneDone =
    securityContext.state === 'PHONE_VERIFIED' || securityContext.state === 'FULLY_VERIFIED';
  const isBotDone =
    securityContext.state === 'FULLY_VERIFIED' && securityContext.botProtectionVerified;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="py-20 lg:py-28 border-b border-slate-800/80"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              Transparent Usage & Seat Pricing
            </p>
            <h2
              id="pricing-heading"
              className="mt-2 text-balance text-2xl sm:text-4xl font-bold tracking-tight text-white"
            >
              Predictable pricing that scales with your workflow velocity
            </h2>
            <p className="mt-3 text-base text-slate-300">
              All subscriptions are protected by our Pre-Payment Identity & Fraud Gate. Complete
              verification below to unlock plan checkout.
            </p>
          </div>

          {/* Interactive Monthly / Annual Billing Toggle */}
          <div
            role="group"
            aria-label="Billing Cycle Toggle"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1.5"
          >
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              aria-pressed={billingCycle === 'monthly'}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              aria-pressed={billingCycle === 'annual'}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annual Billing · Save 20%
            </button>
          </div>
        </div>

        {/* Pre-Payment Security Gate Checklist Banner */}
        <div
          data-testid="security-gate-banner"
          className={`mt-10 rounded-2xl border p-6 backdrop-blur-xl transition-colors ${
            isLocked
              ? 'border-rose-500/60 bg-rose-950/30'
              : checkoutUnlocked
              ? 'border-emerald-500/60 bg-emerald-950/25'
              : 'border-amber-500/50 bg-slate-900/80'
          }`}
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                {isLocked ? (
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                ) : checkoutUnlocked ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4 text-amber-400" />
                )}
                <span
                  className={
                    isLocked
                      ? 'text-rose-300'
                      : checkoutUnlocked
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                  }
                >
                  {isLocked
                    ? 'Checkout Locked — Security Rate Limit Triggered'
                    : checkoutUnlocked
                    ? 'Identity Verified — Pre-Payment Gate Unlocked'
                    : 'Verification Required — Pre-Payment Security Gate Locked'}
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span
                  data-testid="banner-verification-state"
                  className="font-mono text-slate-300"
                >
                  State: {securityContext.state}
                </span>
              </div>

              <p className="mt-1.5 text-sm text-slate-300">
                {isLocked
                  ? securityContext.lockReason ||
                    'Too many consecutive invalid OTP attempts. Reset lockout or wait for cooldown.'
                  : checkoutUnlocked
                  ? 'All three identity layers passed. Select a subscription tier below to complete Pre-Flight Fraud Checks and 2FA payment authorization.'
                  : 'All payment buttons are locked by default. Complete Email OTP, SMS OTP, and Turnstile Bot Protection to enable checkout.'}
              </p>

              {/* Checklist Row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  {isEmailDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isLocked ? (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                  <span className={isEmailDone ? 'text-emerald-300' : 'text-slate-300'}>
                    1. Email Filter & OTP ({isEmailDone ? 'Verified' : 'Pending'})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isPhoneDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isLocked ? (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                  <span className={isPhoneDone ? 'text-emerald-300' : 'text-slate-300'}>
                    2. Phone SMS OTP ({isPhoneDone ? 'Verified' : 'Pending'})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isBotDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isLocked ? (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                  <span className={isBotDone ? 'text-emerald-300' : 'text-slate-300'}>
                    3. Bot Protection ({isBotDone ? 'Verified Human' : 'Pending'})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isLocked && (
                <button
                  type="button"
                  data-testid="banner-reset-lockout-btn"
                  onClick={onResetSecurityContext}
                  className="rounded-lg border border-rose-400/50 bg-rose-900/50 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-800/70 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset Lockout
                </button>
              )}
              <button
                type="button"
                data-testid="open-verification-modal-btn"
                onClick={onOpenVerificationModal}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  checkoutUnlocked
                    ? 'border border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900/70'
                    : 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {checkoutUnlocked
                    ? 'Identity Verified · View Details'
                    : 'Verify Identity to Unlock Checkout'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Protected by 256-bit encryption & 3D Secure Bank Verification</span>
            {securityContext.authenticatedUid ? (
              <span className="font-mono tabular-nums text-emerald-300" data-testid="banner-authenticated-uid">
                Verified Firebase UID: {securityContext.authenticatedUid}
              </span>
            ) : (
              <span className="font-mono tabular-nums">
                Firebase Phone Auth + Pre-Flight Fraud Gate
              </span>
            )}
          </div>
        </div>

        {/* 3 Pricing Tiers Grid */}
        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => {
            const pricing = calculateDisplayedPrice(tier, billingCycle);
            const isHighlighted = Boolean(tier.popular);
            const actionLabel =
              tier.id === 'starter'
                ? 'Subscribe to Starter'
                : tier.id === 'pro'
                ? 'Upgrade to Pro'
                : 'Buy Enterprise Plan';

            return (
              <div
                key={tier.id}
                data-testid={`pricing-card-${tier.id}`}
                className={`relative flex flex-col justify-between rounded-2xl border p-8 backdrop-blur-xl transition-all duration-200 ${
                  isHighlighted
                    ? 'border-violet-500/80 bg-slate-900/90 shadow-2xl shadow-violet-950/40'
                    : 'border-slate-800/90 bg-slate-900/45 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    {isHighlighted && (
                      <span className="text-xs font-semibold text-cyan-300">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{tier.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span
                      data-testid={`price-value-${tier.id}`}
                      className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums text-white"
                    >
                      ${pricing.pricePerMonth}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      / builder / month
                    </span>
                  </div>

                  <p className="mt-2 font-mono text-xs tabular-nums text-slate-400">
                    {billingCycle === 'annual'
                      ? `Billed annually ($${pricing.annualBilledTotal}/yr · saves $${pricing.annualSavings}/yr)`
                      : 'Billed monthly · Switch to annual to save 20%'}
                  </p>

                  <p className="mt-5 pt-5 border-t border-slate-800/80 text-xs font-medium text-cyan-300">
                    {tier.limits}
                  </p>

                  <ul className="mt-5 space-y-3.5 text-sm text-slate-200">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strictly Locked Payment Button until Firebase Auth Promise & Email OTP Resolve */}
                <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
                  <button
                    type="button"
                    data-testid={`checkout-btn-${tier.id}`}
                    disabled={!checkoutUnlocked}
                    onClick={() => onSelectPlan(tier.name, billingCycle)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                      !checkoutUnlocked
                        ? 'border border-slate-800 bg-slate-950/90 text-slate-400'
                        : isHighlighted
                        ? 'cursor-pointer bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/25 hover:brightness-110'
                        : 'cursor-pointer border border-emerald-500/40 bg-slate-950/90 text-white hover:border-emerald-400 hover:bg-slate-800'
                    }`}
                  >
                    {!checkoutUnlocked ? (
                      <>
                        <Lock className="h-4 w-4 text-amber-500/80" />
                        <span>{actionLabel} (Locked)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>{actionLabel}</span>
                      </>
                    )}
                  </button>

                  {!checkoutUnlocked && (
                    <p className="text-center text-[11px] text-amber-400/90">
                      Requires Verified Email & Firebase SMS OTP
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
