import React, { useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../utils/securityGateLogic';

interface OtpSixDigitInputProps {
  idPrefix: string;
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  onResend?: () => void;
}

export const OtpSixDigitInput: React.FC<OtpSixDigitInputProps> = ({
  idPrefix,
  value,
  onChange,
  disabled = false,
  onResend,
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [cooldown, setCooldown] = useState<number>(OTP_RESEND_COOLDOWN_SECONDS);

  // Convert string value into 6-element array
  const digits = Array.from({ length: 6 }, (_, idx) => value[idx] || '');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, rawChar: string) => {
    if (disabled) return;
    const numeric = rawChar.replace(/\D/g, '');

    if (!numeric) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    // Full 6-digit code pasted or typed in sequence
    if (numeric.length >= 6) {
      const sixCode = numeric.slice(0, 6);
      onChange(sixCode);
      inputRefs.current[5]?.focus();
      return;
    }

    const nextDigits = [...digits];

    // If box already had 1 digit and user typed 1 new digit into it, replace with new digit and shift focus
    if (numeric.length === 2 && digits[index] && numeric[0] === digits[index]) {
      nextDigits[index] = numeric[1];
      onChange(nextDigits.join(''));
      inputRefs.current[Math.min(5, index + 1)]?.focus();
      return;
    }

    // Distribute characters across slots starting at current index and transfer focus automatically
    for (let i = 0; i < numeric.length && index + i < 6; i++) {
      nextDigits[index + i] = numeric[i];
    }
    onChange(nextDigits.join(''));

    const focusIndex = Math.min(5, index + numeric.length);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        onChange(nextDigits.join(''));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        onChange(nextDigits.join(''));
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pastedDigits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedDigits) return;
    onChange(pastedDigits);
    const focusIndex = Math.min(5, Math.max(0, pastedDigits.length - 1));
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResendClick = () => {
    if (cooldown > 0 || disabled) return;
    setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    onChange('');
    onResend?.();
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-200">
          Manually Enter 6-Digit Verification Code
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Auto-focuses next box on digit entry
        </span>
      </div>

      {/* 6 Auto-Focus Shifting Digit Boxes (Strictly manual input, no auto-bypass button) */}
      <div
        role="group"
        aria-label="6-Digit Verification Code"
        className="grid grid-cols-6 gap-2 sm:gap-3"
      >
        {digits.map((digit, index) => (
          <input
            key={`${idPrefix}-digit-${index}`}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`${idPrefix}-digit-${index}`}
            data-testid={`${idPrefix}-digit-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={digit}
            disabled={disabled}
            aria-label={`Verification digit ${index + 1} of 6`}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="h-12 w-full rounded-xl border border-slate-700/90 bg-slate-950 text-center font-mono text-lg font-bold tabular-nums text-white shadow-inner transition-colors duration-150 focus:border-cyan-400 focus:bg-slate-900 focus:outline-none disabled:opacity-50"
          />
        ))}
      </div>

      {/* Resend Cooldown Timer Row */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono tabular-nums">
          {cooldown > 0
            ? `Resend Code cooldown: ${cooldown}s`
            : 'Code expired or not received?'}
        </span>
        <button
          type="button"
          onClick={handleResendClick}
          disabled={cooldown > 0 || disabled}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-300 transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>{cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}</span>
        </button>
      </div>
    </div>
  );
};
