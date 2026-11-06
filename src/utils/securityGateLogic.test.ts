import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISPOSABLE_EMAIL_DOMAINS,
  validateUserEmail,
  createInitialSecurityContext,
  validateIdentityEmail,
  validatePhoneNumber,
  verifyOtpAttempt,
  completeBotChallenge,
  isCheckoutUnlocked,
  validateBillingProfile,
  generateRandomSixDigitOtp,
  DEMO_EMAIL_OTP,
  DEMO_SMS_OTP,
  DEMO_2FA_CODE,
} from './securityGateLogic';

test('generateRandomSixDigitOtp produces a 6-digit numeric string', () => {
  for (let i = 0; i < 20; i++) {
    const code = generateRandomSixDigitOtp();
    assert.match(code, /^\d{6}$/);
  }
});

test('validateUserEmail matches exact user specification for valid, disposable, and malformed emails', () => {
  const validGmail = validateUserEmail('test@gmail.com');
  assert.equal(validGmail.isValid, true);
  assert.equal(validGmail.error, undefined);

  const disposableTempMail = validateUserEmail('user@tempmail.com');
  assert.equal(disposableTempMail.isValid, false);
  assert.ok(
    disposableTempMail.error?.includes('غير مسموح بالتسجيل عبر خدمات البريد المؤقت أو الوهمي')
  );

  const disposableMohmal = validateUserEmail('anon@mohmal.com');
  assert.equal(disposableMohmal.isValid, false);
  assert.ok(DISPOSABLE_EMAIL_DOMAINS.has('mohmal.com'));

  const invalidSyntax = validateUserEmail('invalid-email@');
  assert.equal(invalidSyntax.isValid, false);
  assert.ok(invalidSyntax.error?.includes('صيغة البريد الإلكتروني غير صحيحة'));
});

test('Disposable email filter blocks known temporary domains and allows corporate domains', () => {
  const mailinator = validateIdentityEmail('attacker@mailinator.com');
  assert.equal(mailinator.valid, false);
  assert.equal(mailinator.isDisposable, true);

  const tempMailSubdomain = validateIdentityEmail('user@sub.10minutemail.com');
  assert.equal(tempMailSubdomain.valid, false);
  assert.equal(tempMailSubdomain.isDisposable, true);

  const malformed = validateIdentityEmail('invalid-email-format');
  assert.equal(malformed.valid, false);
  assert.equal(malformed.isDisposable, false);

  const validCorp = validateIdentityEmail('secops@novaflow.io');
  assert.equal(validCorp.valid, true);
  assert.equal(validCorp.isDisposable, false);
  assert.equal(validCorp.normalizedEmail, 'secops@novaflow.io');
});

test('OTP retry limits return Code Incorrect and lock checkout into PAYMENT_LOCKED after 3 consecutive wrong attempts', () => {
  let ctx = createInitialSecurityContext();
  assert.equal(ctx.state, 'UNVERIFIED');
  assert.equal(isCheckoutUnlocked(ctx), false);

  // Attempt 1 (wrong)
  const r1 = verifyOtpAttempt(ctx, 'EMAIL', '111111', DEMO_EMAIL_OTP, 'secops@novaflow.io');
  assert.equal(r1.accepted, false);
  assert.equal(r1.locked, false);
  assert.equal(r1.remainingAttempts, 2);
  assert.ok(r1.message.includes('Code Incorrect'));
  ctx = r1.nextContext;

  // Attempt 2 (wrong)
  const r2 = verifyOtpAttempt(ctx, 'EMAIL', '222222', DEMO_EMAIL_OTP, 'secops@novaflow.io');
  assert.equal(r2.accepted, false);
  assert.equal(r2.locked, false);
  assert.equal(r2.remainingAttempts, 1);
  assert.ok(r2.message.includes('Code Incorrect'));
  ctx = r2.nextContext;

  // Attempt 3 (wrong -> triggers PAYMENT_LOCKED)
  const r3 = verifyOtpAttempt(ctx, 'EMAIL', '333333', DEMO_EMAIL_OTP, 'secops@novaflow.io');
  assert.equal(r3.accepted, false);
  assert.equal(r3.locked, true);
  assert.equal(r3.remainingAttempts, 0);
  assert.equal(r3.nextContext.state, 'PAYMENT_LOCKED');
  assert.equal(isCheckoutUnlocked(r3.nextContext), false);

  // Subsequent valid OTP while locked is still rejected
  const r4 = verifyOtpAttempt(
    r3.nextContext,
    'EMAIL',
    DEMO_EMAIL_OTP,
    DEMO_EMAIL_OTP,
    'secops@novaflow.io'
  );
  assert.equal(r4.accepted, false);
  assert.equal(r4.locked, true);
});

test('Multi-step verification transitions UNVERIFIED -> EMAIL_VERIFIED -> FULLY_VERIFIED with E.164 phone and UID', () => {
  let ctx = createInitialSecurityContext();
  assert.equal(isCheckoutUnlocked(ctx), false);

  // Step 1: Verify Email OTP
  const emailStep = verifyOtpAttempt(
    ctx,
    'EMAIL',
    DEMO_EMAIL_OTP,
    DEMO_EMAIL_OTP,
    'alex@novaflow.io'
  );
  assert.equal(emailStep.accepted, true);
  ctx = emailStep.nextContext;
  assert.equal(ctx.state, 'EMAIL_VERIFIED');
  assert.equal(isCheckoutUnlocked(ctx), false);

  // Step 2: Verify Phone SMS OTP in E.164 format (+201012345678)
  const phoneValid = validatePhoneNumber('+20', '01012345678');
  assert.equal(phoneValid.valid, true);
  assert.equal(phoneValid.e164Phone, '+201012345678');

  const phoneStep = verifyOtpAttempt(
    ctx,
    'PHONE',
    DEMO_SMS_OTP,
    DEMO_SMS_OTP,
    phoneValid.e164Phone,
    Date.now(),
    'firebase_uid_99481'
  );
  assert.equal(phoneStep.accepted, true);
  ctx = phoneStep.nextContext;
  assert.equal(ctx.state, 'FULLY_VERIFIED');
  assert.equal(ctx.authenticatedUid, 'firebase_uid_99481');
  assert.equal(isCheckoutUnlocked(ctx), true);

  // Pre-Flight 2FA verification check
  const twoFaStep = verifyOtpAttempt(
    ctx,
    'TWO_FACTOR',
    DEMO_2FA_CODE,
    DEMO_2FA_CODE,
    'alex@novaflow.io'
  );
  assert.equal(twoFaStep.accepted, true);
  ctx = completeBotChallenge(ctx, 0.99);
  assert.equal(isCheckoutUnlocked(ctx), true);
});

test('validateBillingProfile enforces Full Legal Name, Billing Address, and Country', () => {
  const incomplete = validateBillingProfile({
    fullLegalName: 'Alex',
    billingAddress: '123',
    country: '',
  });
  assert.equal(incomplete.valid, false);
  assert.ok(incomplete.errors.fullLegalName);
  assert.ok(incomplete.errors.billingAddress);
  assert.ok(incomplete.errors.country);

  const complete = validateBillingProfile({
    fullLegalName: 'Alex Rivera',
    billingAddress: '548 Market St, Suite 400, San Francisco, CA',
    country: 'United States',
  });
  assert.equal(complete.valid, true);
  assert.deepEqual(complete.errors, {});
});
