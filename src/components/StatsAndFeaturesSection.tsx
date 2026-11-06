import React, { useState } from 'react';
import {
  Workflow,
  ShieldCheck,
  Zap,
  GitBranch,
  BarChart3,
  Sliders,
  Check,
  Code2,
} from 'lucide-react';

interface FeatureCardItem {
  id: string;
  number: string;
  title: string;
  description: string;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FEATURES_LIST: FeatureCardItem[] = [
  {
    id: 'feat-orchestration',
    number: '01.',
    title: 'Multi-Agent DAG Orchestration',
    description:
      'Chain deterministic API steps with context-aware reasoning nodes that branch, retry, and self-heal when upstream schemas shift.',
    metric: 'Sub-50ms step dispatch latency',
    icon: Workflow,
  },
  {
    id: 'feat-context',
    number: '02.',
    title: 'Live Codebase & Ticket Graph',
    description:
      'Automatically indexes pull requests, Linear issues, and production logs so every workflow operates on real-time architectural context.',
    metric: '99.4% root-cause attribution accuracy',
    icon: GitBranch,
  },
  {
    id: 'feat-guardrails',
    number: '03.',
    title: 'Deterministic Schema Guardrails',
    description:
      'Enforce strict JSON Schema validation and human-in-the-loop Slack approvals before any write operation hits your production stack.',
    metric: 'Zero unverified production mutations',
    icon: ShieldCheck,
  },
  {
    id: 'feat-triggers',
    number: '04.',
    title: 'Event-Driven Webhook Mesh',
    description:
      'Ingest high-volume webhooks from GitHub, Stripe, Sentry, and Datadog with automatic deduplication and idempotency keys.',
    metric: '100,000+ concurrent events/sec',
    icon: Zap,
  },
  {
    id: 'feat-forecasting',
    number: '05.',
    title: 'Predictive Velocity Telemetry',
    description:
      'Detect review bottlenecks and scope creep 10 days before sprint close with automated load-balancing across engineering squads.',
    metric: '+185% on-time sprint delivery',
    icon: BarChart3,
  },
  {
    id: 'feat-routing',
    number: '06.',
    title: 'Adaptive Model & Cost Routing',
    description:
      'Route classification tasks to ultra-fast low-latency models and reserve deep reasoning models strictly for complex synthesis steps.',
    metric: '62% lower inference spend',
    icon: Sliders,
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01. Connect Your Stack',
    title: 'Authenticate GitHub, Linear, Slack & Sentry in 90 Seconds',
    description:
      'Select from 85+ pre-built OAuth integrations or point NovaFlow at your internal REST and GraphQL endpoints with zero boilerplate.',
    codeTitle: 'novaflow.config.ts',
    codeSnippet: `export default defineWorkspace({
  connectors: ['github', 'linear', 'slack', 'sentry'],
  security: { zeroDataRetention: true, vpcRegion: 'eu-west-1' },
  concurrencyLimit: 250,
});`,
    outcome: 'Verified OAuth scopes · TLS 1.3 encrypted tunnel active',
  },
  {
    step: '02. Compose Autonomous Pipelines',
    title: 'Combine Event Triggers, Context Queries & Guardrailed Actions',
    description:
      'Define workflows visually in the studio or as version-controlled TypeScript specs that live right inside your repository.',
    codeTitle: 'workflows/incident-triage.ts',
    codeSnippet: `export const incidentPipeline = createWorkflow({
  trigger: onSentryAlert({ severity: 'fatal' }),
  steps: [
    correlateRecentCommits({ lookbackHours: 24 }),
    draftReproductionTest({ strictSchema: true }),
    requireSlackApproval({ channel: '#eng-oncall' }),
  ],
});`,
    outcome: 'Deterministic type-checked execution graph ready',
  },
  {
    step: '03. Observe, Replay & Scale',
    title: 'Audit Every Execution Trace with Time-Travel Debugging',
    description:
      'Inspect token-level latency, replay failed webhook payloads with a single click, and track hours saved across every squad.',
    codeTitle: 'execution-trace-8492.json',
    codeSnippet: `{
  "traceId": "nf_tr_01J9X8K2M4",
  "status": "COMPLETED",
  "durationMs": 480,
  "actionsDispatched": ["github.createPullRequest#849", "linear.updateState#ENG-412"]
}`,
    outcome: '99.98% uptime SLA · Full 90-day immutable audit log',
  },
];

export const StatsAndFeaturesSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const currentStep = HOW_IT_WORKS_STEPS[activeStepIndex];

  const stats = [
    {
      value: '99.98%',
      label: 'Guaranteed Uptime SLA',
      detail: 'Multi-region active-active failover across 6 global edge zones',
    },
    {
      value: '10.4x',
      label: 'Faster Incident-to-PR',
      detail: 'Measured across 1.8M production workflows in Q3–Q4',
    },
    {
      value: '52,400+',
      label: 'Active Daily Builders',
      detail: 'Engineering, product, and RevOps teams running NovaFlow daily',
    },
    {
      value: '14.5 hrs',
      label: 'Saved Per Engineer / Wk',
      detail: 'Verified reduction in manual ticket triage and release prep',
    },
  ];

  return (
    <>
      {/* 4 Clean Quantified Social Proof / Stats Counters */}
      <section
        aria-label="Platform Performance Metrics"
        className="border-b border-slate-800/80 bg-slate-950/60 py-14"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-md transition-colors duration-150 hover:border-slate-700"
              >
                <p className="font-mono text-3xl sm:text-4xl font-bold tracking-tight tabular-nums bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{stat.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section (3-column responsive grid with interactive hover effects) */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="py-20 lg:py-28 border-b border-slate-800/80"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-cyan-400">
              Platform Capabilities
            </p>
            <h2
              id="features-heading"
              className="mt-2 text-balance text-2xl sm:text-4xl font-bold tracking-tight text-white"
            >
              Engineered for deterministic speed and enterprise control
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Unlike brittle prompt wrappers, NovaFlow pairs schema-validated execution graphs with
              deep codebase awareness so every automated workflow is auditable and reliable.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES_LIST.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <article
                  key={feature.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/50 p-7 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-slate-900/80"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-cyan-400 transition-colors duration-200 group-hover:border-violet-500/40 group-hover:text-violet-300">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-500 group-hover:text-cyan-400 transition-colors">
                        {feature.number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-bold tracking-tight text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono tabular-nums text-cyan-300">
                    <span>{feature.metric}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Interactive Section */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="py-20 lg:py-28 border-b border-slate-800/80 bg-slate-950/40"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-violet-400">
              How NovaFlow Works
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-2 text-balance text-2xl sm:text-4xl font-bold tracking-tight text-white"
            >
              From raw webhook to merged pull request in three steps
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Step Selector Column */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-5">
              {HOW_IT_WORKS_STEPS.map((item, idx) => {
                const isSelected = idx === activeStepIndex;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`text-left rounded-xl border p-5 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-violet-500/60 bg-slate-900/90 shadow-lg shadow-violet-950/20'
                        : 'border-slate-800/80 bg-slate-900/35 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <p className="font-mono text-xs font-semibold text-cyan-400">{item.step}</p>
                    <h3 className="mt-1.5 text-base font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Code & Execution Inspector Column */}
            <div className="lg:col-span-7 flex">
              <div className="flex w-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/75 p-6 backdrop-blur-xl">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-violet-400" />
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {currentStep.codeTitle}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">TypeScript SDK v2.4</span>
                  </div>

                  <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-5 border border-slate-800/90 font-mono text-xs sm:text-sm leading-relaxed text-cyan-200">
                    <code>{currentStep.codeSnippet}</code>
                  </pre>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-slate-800/90 bg-slate-950/70 px-4 py-3.5">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-emerald-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{currentStep.outcome}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-slate-400 shrink-0">
                    Step {activeStepIndex + 1} of 3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
