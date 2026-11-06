import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { validateNewsletterEmail } from '../utils/novaflowLogic';

export const FooterSection: React.FC = () => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateNewsletterEmail(emailInput);

    if (!validation.ok) {
      setErrorMessage(validation.error || 'Please enter a valid email address.');
      setSuccessMessage(null);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(validation.message);
    setSubscribedEmails((prev) =>
      prev.includes(validation.email) ? prev : [validation.email, ...prev]
    );
    setEmailInput('');

    // Trigger browser JavaScript alert as requested while safely guarding against sandboxed iframe restrictions
    try {
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(validation.message);
      }
    } catch {
      // Fallback handled by the accessible role="alert" banner below
    }
  };

  return (
    <footer className="bg-slate-950 pt-16 pb-14 text-slate-400">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 pb-14 border-b border-slate-800/80 lg:grid-cols-12">
          {/* Brand & Newsletter Subscription Column */}
          <div className="lg:col-span-5">
            <a href="#" className="text-xl font-bold tracking-tight text-white">
              NovaFlow
            </a>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Autonomous workflow orchestration for high-velocity engineering, product, and
              operations squads.
            </p>

            {/* Dark-Theme Styled Newsletter Subscription Form */}
            <form
              onSubmit={handleNewsletterSubmit}
              noValidate
              aria-label="Newsletter Subscription"
              className="mt-6 max-w-md"
            >
              <label
                htmlFor="footer-newsletter-email"
                className="block text-xs font-semibold tracking-wide text-slate-200"
              >
                Subscribe to the Weekly Architecture Digest
              </label>
              <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
                <input
                  id="footer-newsletter-email"
                  name="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="you@company.com"
                  required
                  aria-invalid={Boolean(errorMessage)}
                  aria-describedby={
                    errorMessage
                      ? 'newsletter-error'
                      : successMessage
                      ? 'newsletter-success'
                      : undefined
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 shadow-inner transition-colors duration-150 focus:border-cyan-400 focus:bg-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition-all duration-150 hover:brightness-110 active:scale-[0.99] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                >
                  <span>Subscribe</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Validation Error Feedback */}
              {errorMessage && (
                <div
                  id="newsletter-error"
                  role="alert"
                  data-testid="newsletter-error-alert"
                  className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs font-medium text-rose-200"
                >
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Accessible Success Alert Notification */}
              {successMessage && (
                <div
                  id="newsletter-success"
                  role="alert"
                  data-testid="newsletter-success-alert"
                  className="mt-3 flex items-start gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2.5 text-xs font-medium text-emerald-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <p>{successMessage}</p>
                    {subscribedEmails.length > 0 && (
                      <p className="mt-1 font-mono text-[11px] text-emerald-300/80 tabular-nums">
                        Active digest recipient: {subscribedEmails[0]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-white">Platform</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    DAG Orchestrator
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Context Graph
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing & Tiers
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Security & SOC 2
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-white">Integrations</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    GitHub & GitLab
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Linear & Jira Sync
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Slack Approval Gates
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Sentry & Datadog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-white">Governance</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Zero-Data-Retention Policy
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Dedicated VPC Guide
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Enterprise SLA (99.98%)
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Subprocessor List
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} NovaFlow Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Security Advisories</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
