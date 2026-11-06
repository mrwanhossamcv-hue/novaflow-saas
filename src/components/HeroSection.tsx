import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCw,
  Terminal,
  Cpu,
  GitPullRequest,
  Clock,
} from 'lucide-react';
import { WORKFLOW_PRESETS, WorkflowPreset } from '../utils/novaflowLogic';

interface HeroSectionProps {
  onOpenTrialModal: (planName?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenTrialModal }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<WorkflowPreset['id']>('pipeline');
  const [simulationStep, setSimulationStep] = useState<number>(2);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(true);
  const heroRef = useRef<HTMLElement | null>(null);

  const activePreset =
    WORKFLOW_PRESETS.find((preset) => preset.id === selectedPresetId) || WORKFLOW_PRESETS[0];

  // Observe when the Hero section scrolls into view so entrance transitions replay smoothly if scrolled back
  useEffect(() => {
    const element = heroRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(0);

    setTimeout(() => setSimulationStep(1), 350);
    setTimeout(() => {
      setSimulationStep(2);
      setIsSimulating(false);
    }, 750);
  };

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80"
    >
      {/* Subtle Ambient Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 left-1/2 -z-10 h-[520px] w-[960px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/20 via-cyan-500/12 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-72 right-12 -z-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Animated Headline, Subheadline, CTAs, and Trust Proof */}
          <div className="flex flex-col justify-center lg:col-span-6">
            {/* Unboxed Metadata Kicker (Zero-Pill Discipline) */}
            <div className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium tracking-wide text-cyan-400">
              <span>Autonomous Workflow Engine</span>
              <span className="text-slate-400">· SOC 2 Type II Certified</span>
              <span className="font-mono tabular-nums text-slate-400">· Sub-50ms Trigger Latency</span>
            </div>

            {/* Hero Headline with Smooth Tailwind Entrance Animation & Transitions */}
            <h1
              id="hero-heading"
              data-testid="hero-headline"
              className={`text-balance font-extrabold tracking-tight text-white transition-all duration-700 ease-out [font-size:clamp(2.35rem,4.2vw,3.75rem)] leading-[1.08] ${
                inView
                  ? 'animate-hero-headline opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              Supercharge Your{' '}
              <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                Workflow with AI
              </span>
            </h1>

            {/* Hero Subheadline with Staggered Entrance Animation & Transitions */}
            <p
              data-testid="hero-subheadline"
              className={`mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300 transition-all duration-700 delay-150 ease-out ${
                inView
                  ? 'animate-hero-subheadline opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              NovaFlow connects your GitHub repositories, issue trackers, and customer channels into
              self-driving operational pipelines—eliminating manual triage and shipping production
              releases in half the time.
            </p>

            {/* Primary & Secondary CTA Buttons */}
            <div
              className={`mt-8 flex flex-wrap items-center gap-4 transition-all duration-700 delay-200 ease-out ${
                inView ? 'animate-hero-actions opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                type="button"
                onClick={() => onOpenTrialModal('Pro')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all duration-150 hover:brightness-110 active:scale-[0.99] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/75 px-5 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-colors duration-150 hover:border-slate-600 hover:bg-slate-800/80 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                <Play className="h-4 w-4 text-cyan-400" />
                <span>Explore Live Architecture</span>
              </a>
            </div>

            {/* Trust Badges / Proof Section */}
            <div className="mt-10 pt-8 border-t border-slate-800/80">
              <p className="text-xs font-medium text-slate-400">
                5,000+ Teams Trust Us across high-velocity engineering and product organizations
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold tracking-tight text-slate-300">
                <span>Vercel Labs</span>
                <span>LinearOps</span>
                <span>Raycast Core</span>
                <span>ScaleGrid</span>
                <span>Chronicle Cloud</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mock Application Dashboard UI Preview Card */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="relative rounded-2xl border border-slate-800/90 bg-slate-900/65 p-5 sm:p-6 shadow-2xl shadow-violet-950/30 backdrop-blur-xl animate-hero-preview">
              {/* Top Window Header & Interactive Preset Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-semibold text-white">
                    NovaFlow Orchestrator Studio
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRunSimulation}
                  className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors duration-150 hover:bg-cyan-500/20 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Executing Pipeline...' : 'Simulate Execution'}</span>
                </button>
              </div>

              {/* Interactive Segmented Workflow Switcher */}
              <div
                role="tablist"
                aria-label="Workflow Pipeline Presets"
                className="mt-4 grid grid-cols-3 gap-1.5 rounded-lg bg-slate-950/90 p-1 border border-slate-800/80"
              >
                {WORKFLOW_PRESETS.map((preset) => {
                  const isActive = preset.id === selectedPresetId;
                  const shortTitle =
                    preset.id === 'pipeline'
                      ? 'PR Triage'
                      : preset.id === 'synthesis'
                      ? 'Customer Sync'
                      : 'Sprint Forecast';
                  return (
                    <button
                      key={preset.id}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setSimulationStep(2);
                      }}
                      className={`rounded-md px-2.5 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 truncate cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600/90 to-cyan-600/90 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {shortTitle}
                    </button>
                  );
                })}
              </div>

              {/* Active CLI Trigger Line */}
              <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-slate-950/80 px-3.5 py-2.5 border border-slate-800/80 font-mono text-xs text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{activePreset.activeCommand}</span>
                </div>
                <span className="text-emerald-400 shrink-0 tabular-nums">
                  {activePreset.automationRate} automated
                </span>
              </div>

              {/* Pipeline Execution Nodes */}
              <div className="mt-4 space-y-3" data-testid="hero-pipeline-nodes">
                {activePreset.nodes.map((node, index) => {
                  const isCompleted = index <= simulationStep;
                  return (
                    <div
                      key={node.id}
                      className={`rounded-xl border p-3.5 transition-all duration-200 ${
                        isCompleted
                          ? 'border-slate-800 bg-slate-950/75'
                          : 'border-slate-800/40 bg-slate-950/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${
                              index < simulationStep
                                ? 'text-emerald-400'
                                : index === simulationStep
                                ? 'text-cyan-400'
                                : 'text-slate-600'
                            }`}
                          />
                          <span className="text-xs font-mono text-violet-300">{node.stage}</span>
                          <span aria-hidden="true" className="text-slate-600">
                            ·
                          </span>
                          <h2 className="text-sm font-semibold text-white">{node.title}</h2>
                        </div>
                        <span className="font-mono text-xs tabular-nums text-slate-400 shrink-0">
                          {node.latency}
                        </span>
                      </div>
                      <p className="mt-1.5 pl-6 text-xs leading-relaxed text-slate-400">
                        {node.summary}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Live Telemetry Strip inside Preview Card */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Cycle Time</span>
                  </div>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">
                    {activePreset.metrics.cycleTime}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <GitPullRequest className="h-3.5 w-3.5 text-violet-400" />
                    <span>Throughput</span>
                  </div>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">
                    {activePreset.metrics.tasksAutomated}
                  </p>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Time Saved</div>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-cyan-300">
                    {activePreset.timeSavedPerWeek}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
