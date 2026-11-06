/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsAndFeaturesSection } from './components/StatsAndFeaturesSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { FooterSection } from './components/FooterSection';
import { TrialModal } from './components/TrialModal';
import { IdentityVerificationModal } from './components/IdentityVerificationModal';
import { BillingCycle } from './utils/novaflowLogic';
import {
  SecurityGateContext,
  createInitialSecurityContext,
  isCheckoutUnlocked,
} from './utils/securityGateLogic';

export default function App() {
  const [securityContext, setSecurityContext] = useState<SecurityGateContext>(() =>
    createInitialSecurityContext()
  );
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>('annual');

  const handleOpenTrialOrGate = (planName = 'Pro', billing: BillingCycle = 'annual') => {
    setSelectedPlan(planName);
    setSelectedBilling(billing);
    if (!isCheckoutUnlocked(securityContext)) {
      setVerificationModalOpen(true);
    } else {
      setCheckoutModalOpen(true);
    }
  };

  const handleResetSecurityContext = () => {
    setSecurityContext(createInitialSecurityContext());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenTrialModal={(plan) => handleOpenTrialOrGate(plan, 'annual')} />

      <main className="flex-1">
        <HeroSection onOpenTrialModal={(plan) => handleOpenTrialOrGate(plan, 'annual')} />
        <StatsAndFeaturesSection />
        <PricingSection
          securityContext={securityContext}
          onOpenVerificationModal={() => setVerificationModalOpen(true)}
          onResetSecurityContext={handleResetSecurityContext}
          onSelectPlan={(planName, billingCycle) => {
            setSelectedPlan(planName);
            setSelectedBilling(billingCycle);
            setCheckoutModalOpen(true);
          }}
        />
        <FaqSection />
      </main>

      <FooterSection />

      <IdentityVerificationModal
        isOpen={verificationModalOpen}
        securityContext={securityContext}
        onUpdateSecurityContext={setSecurityContext}
        onResetSecurityContext={handleResetSecurityContext}
        onClose={() => setVerificationModalOpen(false)}
        onProceedToCheckout={() => setCheckoutModalOpen(true)}
      />

      <TrialModal
        isOpen={checkoutModalOpen}
        initialPlan={selectedPlan}
        initialBilling={selectedBilling}
        securityContext={securityContext}
        onUpdateSecurityContext={setSecurityContext}
        onOpenVerificationModal={() => setVerificationModalOpen(true)}
        onClose={() => setCheckoutModalOpen(false)}
      />
    </div>
  );
}
