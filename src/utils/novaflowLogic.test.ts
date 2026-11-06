import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRICING_TIERS,
  WORKFLOW_PRESETS,
  FAQ_ITEMS,
  calculateDisplayedPrice,
  validateNewsletterEmail,
  toggleFaqId,
} from './novaflowLogic';

test('calculateDisplayedPrice returns correct monthly and annual pricing with savings', () => {
  const proTier = PRICING_TIERS.find((t) => t.id === 'pro');
  assert.ok(proTier, 'Pro tier must exist');

  const monthly = calculateDisplayedPrice(proTier, 'monthly');
  assert.equal(monthly.pricePerMonth, 36);
  assert.equal(monthly.annualSavings, 0);

  const annual = calculateDisplayedPrice(proTier, 'annual');
  assert.equal(annual.pricePerMonth, 29);
  assert.equal(annual.annualBilledTotal, 29 * 12);
  assert.equal(annual.annualSavings, (36 - 29) * 12);
  assert.ok(annual.discountPercent >= 19 && annual.discountPercent <= 20);
});

test('validateNewsletterEmail rejects empty and malformed emails and accepts valid emails', () => {
  const emptyResult = validateNewsletterEmail('   ');
  assert.equal(emptyResult.ok, false);
  assert.ok(emptyResult.error?.includes('enter your work email'));

  const invalidResult = validateNewsletterEmail('not-an-email@bad');
  assert.equal(invalidResult.ok, false);
  assert.ok(invalidResult.error?.includes('valid email address'));

  const validResult = validateNewsletterEmail('  Founder@NovaFlow.io ');
  assert.equal(validResult.ok, true);
  assert.equal(validResult.email, 'founder@novaflow.io');
  assert.ok(validResult.message.includes('founder@novaflow.io'));
});

test('toggleFaqId opens a closed item and closes an already open item', () => {
  assert.equal(toggleFaqId('faq-1', 'faq-2'), 'faq-2');
  assert.equal(toggleFaqId('faq-1', 'faq-1'), null);
  assert.equal(toggleFaqId(null, 'faq-3'), 'faq-3');
});

test('WORKFLOW_PRESETS and FAQ_ITEMS contain complete data structures', () => {
  assert.equal(WORKFLOW_PRESETS.length, 3);
  for (const preset of WORKFLOW_PRESETS) {
    assert.equal(preset.nodes.length, 3);
    assert.ok(preset.activeCommand.startsWith('novaflow '));
  }
  assert.ok(FAQ_ITEMS.length >= 5);
});
