import { DISPOSABLE_EMAIL_DOMAINS } from './securityGateLogic';

export type BillingCycle = 'monthly' | 'annual';

export interface PricingTier {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPricePerMonth: number;
  popular?: boolean;
  ctaLabel: string;
  limits: string;
  features: string[];
}

export interface WorkflowNode {
  id: string;
  stage: string;
  title: string;
  owner: string;
  latency: string;
  confidence: string;
  status: 'Completed' | 'Running' | 'Queued';
  summary: string;
}

export interface WorkflowPreset {
  id: 'pipeline' | 'synthesis' | 'forecasting';
  label: string;
  description: string;
  timeSavedPerWeek: string;
  throughputDelta: string;
  automationRate: string;
  activeCommand: string;
  nodes: WorkflowNode[];
  metrics: {
    cycleTime: string;
    tasksAutomated: string;
    accuracyScore: string;
  };
}

export interface FaqItem {
  id: string;
  category: 'Architecture' | 'Security' | 'Billing' | 'Integrations';
  question: string;
  answer: string;
}

export interface SubscriptionResult {
  ok: boolean;
  email: string;
  message: string;
  error?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For early-stage product squads automating recurring triage and release rituals.',
    monthlyPrice: 19,
    annualPricePerMonth: 15,
    ctaLabel: 'Start Starter Trial',
    limits: 'Up to 5 builders · 10,000 workflow runs/mo',
    features: [
      '10,000 autonomous workflow runs per month',
      'GitHub, Linear, Slack & Notion two-way sync',
      'Automated PR context summaries & changelog drafts',
      'Standard webhook triggers & sub-second execution',
      '7-day execution history & audit trail',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For scaling engineering and operations teams orchestrating cross-stack pipelines.',
    monthlyPrice: 36,
    annualPricePerMonth: 29,
    popular: true,
    ctaLabel: 'Start 14-Day Free Trial',
    limits: 'Up to 25 builders · 100,000 workflow runs/mo',
    features: [
      '100,000 autonomous workflow runs per month',
      'Multi-step conditional branching & human-in-the-loop approvals',
      'Custom AI model routing with deterministic JSON schemas',
      'Real-time bottleneck detection & sprint velocity forecasting',
      '90-day execution replay & role-based access control',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For multi-org enterprises requiring dedicated VPC deployment and custom SLAs.',
    monthlyPrice: 99,
    annualPricePerMonth: 79,
    ctaLabel: 'Book Architecture Review',
    limits: 'Unlimited builders · Custom volume & dedicated VPC',
    features: [
      'Unlimited workflow runs with dedicated execution workers',
      'SOC 2 Type II, HIPAA & ISO 27001 compliance controls',
      'Zero-data-retention AI inference & custom private endpoints',
      'SAML SSO, SCIM provisioning & granular policy engine',
      '99.98% uptime SLA with dedicated forward-deployed engineer',
    ],
  },
];

export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: 'pipeline',
    label: '01. Autonomous Triage & PR Routing',
    description:
      'Ingests incoming customer bug reports, correlates stack traces against recent commits, and assigns scoped tickets with reproduction tests.',
    timeSavedPerWeek: '14.5 hrs / engineer',
    throughputDelta: '+310% faster PR merge cycle',
    automationRate: '94.2%',
    activeCommand: 'novaflow trigger --pipeline="incident-to-pr" --verify-schema',
    metrics: {
      cycleTime: '18m 40s',
      tasksAutomated: '1,420 / wk',
      accuracyScore: '99.4%',
    },
    nodes: [
      {
        id: 'node-1',
        stage: 'Ingest',
        title: 'Sentry + Linear Webhook Listener',
        owner: 'Trigger Engine',
        latency: '42ms',
        confidence: '100%',
        status: 'Completed',
        summary: 'Parsed stack trace from checkout-service v4.12 and matched 3 related tickets.',
      },
      {
        id: 'node-2',
        stage: 'Synthesize',
        title: 'Root-Cause Diff & Spec Generation',
        owner: 'NovaFlow Context Graph',
        latency: '310ms',
        confidence: '98.9%',
        status: 'Completed',
        summary: 'Isolated null pointer in stripeWebhookHandler.ts lines 142–158 and drafted patch.',
      },
      {
        id: 'node-3',
        stage: 'Execute',
        title: 'Dispatch Scoped PR & Notify On-Call',
        owner: 'GitHub + Slack Action',
        latency: '128ms',
        confidence: '99.4%',
        status: 'Running',
        summary: 'Opened PR #849 with unit test suite and routed review request to @platform-core.',
      },
    ],
  },
  {
    id: 'synthesis',
    label: '02. Cross-Channel Customer Synthesis',
    description:
      'Consolidates Zendesk tickets, Gong call transcripts, and Slack feedback channels into prioritized roadmap briefs linked to ARR impact.',
    timeSavedPerWeek: '11.2 hrs / PM',
    throughputDelta: '+240% faster spec alignment',
    automationRate: '91.8%',
    activeCommand: 'novaflow run --pipeline="voice-of-customer" --window="7d"',
    metrics: {
      cycleTime: '6m 15s',
      tasksAutomated: '890 / wk',
      accuracyScore: '98.7%',
    },
    nodes: [
      {
        id: 'node-1',
        stage: 'Aggregate',
        title: 'Multi-Source Transcript Indexer',
        owner: 'Connector Mesh',
        latency: '85ms',
        confidence: '100%',
        status: 'Completed',
        summary: 'Indexed 412 customer conversations and extracted 28 recurring feature requests.',
      },
      {
        id: 'node-2',
        stage: 'Quantify',
        title: 'Salesforce ARR Attribution Join',
        owner: 'Revenue Enricher',
        latency: '215ms',
        confidence: '99.1%',
        status: 'Completed',
        summary: 'Mapped top 4 RBAC permission requests to $1.84M in active expansion pipeline.',
      },
      {
        id: 'node-3',
        stage: 'Publish',
        title: 'PRD Draft & Roadmap Sync',
        owner: 'Notion + Linear Sync',
        latency: '164ms',
        confidence: '98.5%',
        status: 'Running',
        summary: 'Published structured PRD with acceptance criteria and linked 14 enterprise accounts.',
      },
    ],
  },
  {
    id: 'forecasting',
    label: '03. Sprint Capacity & Risk Forecasting',
    description:
      'Continuously evaluates open pull requests, dependency chains, and reviewer load to predict delivery slippage 10 days before deadline.',
    timeSavedPerWeek: '9.8 hrs / EM',
    throughputDelta: '+185% on-time release rate',
    automationRate: '96.0%',
    activeCommand: 'novaflow audit --sprint="Q4-W6" --rebalance-reviewers',
    metrics: {
      cycleTime: '3m 50s',
      tasksAutomated: '2,150 / wk',
      accuracyScore: '99.1%',
    },
    nodes: [
      {
        id: 'node-1',
        stage: 'Scan',
        title: 'Dependency Graph & Blocker Audit',
        owner: 'Graph Analyzer',
        latency: '64ms',
        confidence: '100%',
        status: 'Completed',
        summary: 'Scanned 68 active branches across 6 repositories; flagged 2 circular dependencies.',
      },
      {
        id: 'node-2',
        stage: 'Simulate',
        title: 'Monte Carlo Delivery Projection',
        owner: 'Forecasting Engine',
        latency: '290ms',
        confidence: '97.8%',
        status: 'Completed',
        summary: 'Calculated 94% probability of on-time release after re-routing 3 bottlenecked PRs.',
      },
      {
        id: 'node-3',
        stage: 'Rebalance',
        title: 'Automated Reviewer Load Balancing',
        owner: 'GitHub Codeowners Bot',
        latency: '95ms',
        confidence: '99.2%',
        status: 'Running',
        summary: 'Reassigned 3 high-priority reviews to available staff engineers with <2 open queues.',
      },
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Architecture',
    question: 'How does NovaFlow connect to our existing tools without custom glue code?',
    answer:
      'NovaFlow ships with 85+ pre-authenticated, schema-validated connectors for GitHub, GitLab, Linear, Jira, Slack, Notion, Sentry, Datadog, and Postgres. You authenticate via OAuth or scoped API tokens in under two minutes, and NovaFlow automatically maps entities across your stack.',
  },
  {
    id: 'faq-2',
    category: 'Security',
    question: 'Is our proprietary source code or customer data ever used to train AI models?',
    answer:
      'Never. NovaFlow enforces strict zero-data-retention agreements with all underlying model providers. All payloads are encrypted in transit (TLS 1.3) and at rest (AES-256), and Enterprise workspaces can run inside an isolated VPC or connect to self-hosted endpoints.',
  },
  {
    id: 'faq-3',
    category: 'Architecture',
    question: 'Can we require human approval before an automated workflow executes a write action?',
    answer:
      'Yes. Every workflow node supports deterministic guardrails and human-in-the-loop checkpoints. You can configure one-click Slack or Linear approval gates for high-impact actions like merging pull requests, mutating production records, or messaging customers.',
  },
  {
    id: 'faq-4',
    category: 'Billing',
    question: 'How are workflow runs metered, and what happens if we spike during a product launch?',
    answer:
      'A workflow run is counted only when a trigger condition passes filter validation and executes downstream steps—filtered no-op events are 100% free. If you exceed your monthly allocation, workflows never halt abruptly; we provide a 15% burst buffer and notify your workspace admin.',
  },
  {
    id: 'faq-5',
    category: 'Integrations',
    question: 'Can we trigger NovaFlow pipelines from our own internal microservices or CI/CD runners?',
    answer:
      'Absolutely. Every workflow exposes a strongly-typed REST webhook endpoint and a CLI trigger command with HMAC signature verification, idempotency keys, and real-time streaming status callbacks.',
  },
];

export function calculateDisplayedPrice(tier: PricingTier, billing: BillingCycle): {
  pricePerMonth: number;
  annualBilledTotal: number;
  annualSavings: number;
  discountPercent: number;
} {
  const pricePerMonth = billing === 'annual' ? tier.annualPricePerMonth : tier.monthlyPrice;
  const annualBilledTotal = pricePerMonth * 12;
  const monthlyFullYear = tier.monthlyPrice * 12;
  const annualSavings = billing === 'annual' ? monthlyFullYear - annualBilledTotal : 0;
  const discountPercent = Math.round(
    ((tier.monthlyPrice - tier.annualPricePerMonth) / tier.monthlyPrice) * 100
  );

  return {
    pricePerMonth,
    annualBilledTotal,
    annualSavings,
    discountPercent,
  };
}

export function validateNewsletterEmail(rawEmail: string): SubscriptionResult {
  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return {
      ok: false,
      email: '',
      message: '',
      error: 'Please enter your work email address to subscribe.',
    };
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  const match = trimmed.match(emailPattern);
  if (!match) {
    return {
      ok: false,
      email: trimmed,
      message: '',
      error: 'Please enter a valid email address (for example, alex@company.com).',
    };
  }

  const normalized = trimmed.toLowerCase();
  const domain = match[1].toLowerCase();
  const isDisposable =
    DISPOSABLE_EMAIL_DOMAINS.has(domain) ||
    Array.from(DISPOSABLE_EMAIL_DOMAINS).some((d) => domain.endsWith(`.${d}`));

  if (isDisposable) {
    return {
      ok: false,
      email: normalized,
      message: '',
      error: `غير مسموح بالتسجيل عبر خدمات البريد المؤقت أو الوهمي (${domain}). Disposable emails are not permitted.`,
    };
  }

  return {
    ok: true,
    email: normalized,
    message: `Thank you for subscribing! We have sent the NovaFlow Weekly Architecture Digest to ${normalized}.`,
  };
}

export function toggleFaqId(currentOpenId: string | null, clickedId: string): string | null {
  return currentOpenId === clickedId ? null : clickedId;
}
