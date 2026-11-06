import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS, FaqItem, toggleFaqId } from '../utils/novaflowLogic';

export const FaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<'All' | FaqItem['category']>('All');

  const categories: Array<'All' | FaqItem['category']> = [
    'All',
    'Architecture',
    'Security',
    'Billing',
    'Integrations',
  ];

  const visibleFaqs =
    selectedCategory === 'All'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-20 lg:py-28 border-b border-slate-800/80 bg-slate-950/50"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-violet-400">
              Technical & Commercial FAQ
            </p>
            <h2
              id="faq-heading"
              className="mt-2 text-balance text-2xl sm:text-4xl font-bold tracking-tight text-white"
            >
              Answers for engineering & security leaders
            </h2>
          </div>

          {/* Interactive Category Filter Control */}
          <div
            role="group"
            aria-label="Filter FAQ by category"
            className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Accordion List */}
        <div className="mt-10 divide-y divide-slate-800/80 rounded-2xl border border-slate-800/90 bg-slate-900/45 backdrop-blur-md">
          {visibleFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-btn-${faq.id}`;

            return (
              <div key={faq.id} className="p-6">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqId((prev) => toggleFaqId(prev, faq.id))}
                    className="flex w-full items-center justify-between gap-4 text-left text-base sm:text-lg font-semibold text-white transition-colors duration-150 hover:text-cyan-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={`mt-3 text-sm sm:text-base leading-relaxed text-slate-300 transition-opacity duration-200 ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <p>{faq.answer}</p>
                  <p className="mt-2.5 text-xs font-medium text-slate-500">
                    Topic · {faq.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
