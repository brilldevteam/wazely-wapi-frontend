"use client";

import React from "react";

interface StepItem {
  title: string;
  description: string;
}

interface CtwaWizardProps {
  stepsLaunch: {
    badge?: string;
    title?: string;
    description?: string;
    steps: StepItem[];
  };
  primaryColor: string;
}

export default function CtwaWizard({ stepsLaunch, primaryColor }: CtwaWizardProps) {
  const steps = Array.isArray(stepsLaunch.steps) ? stepsLaunch.steps : [];

  const stepGradients = [
    { from: "from-indigo-500", to: "to-indigo-600", shadow: "shadow-indigo-500/25" },
    { from: "from-violet-500", to: "to-violet-600", shadow: "shadow-violet-500/25" },
    { from: "from-fuchsia-500", to: "to-fuchsia-600", shadow: "shadow-fuchsia-500/25" },
    { from: "from-sky-500", to: "to-sky-600", shadow: "shadow-sky-500/25" },
  ];

  return (
    <section className="py-[calc(20px+(50-20)*((100vw-320px)/(1920-320)))]">
      <div className="container mx-auto px-[calc(8px+(24-8)*((100vw-320px)/(1920-320)))] md:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-[calc(18px+(56-18)*((100vw-320px)/(1920-320)))]">
            <span className="text-xs bg-emerald-100 px-4 py-1.5 rounded-full uppercase tracking-wide font-bold text-primary font-mono" style={{ color: primaryColor }}>
              {stepsLaunch.badge || "Wizard"}
            </span>
            <h2 className="text-[calc(20px+(30-20)*((100vw-320px)/(1920-320)))] font-black text-slate-900 tracking-tight mt-2">
              {stepsLaunch.title || "Three simple steps to launch"}
            </h2>
            {stepsLaunch.description && (
              <p className="text-[15px] text-slate-500 mt-2 font-medium font-sans">
                {stepsLaunch.description}
              </p>
            )}
          </div>

          <div className="relative text-left">
            <div className="absolute left-[23px] top-0 bottom-0 w-px hidden md:block" style={{ backgroundColor: primaryColor + '40' }} />
            <div className="space-y-10">
              {steps.map((step, i) => {
                const g = stepGradients[i % stepGradients.length];
                return (
                  <div key={i} className="relative md:pl-20 mb-[calc(14px+(40-14)*((100vw-320px)/(1920-320)))]">
                    <div className={`hidden md:flex absolute left-0 w-[46px] h-[46px] rounded-lg text-white items-center justify-center font-mono font-black text-lg shadow-lg ${g.shadow} z-10`} style={{ backgroundColor: primaryColor }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-lg p-[calc(10px+(28-10)*((100vw-320px)/(1920-320)))] shadow-sm hover:shadow-md transition-all">
                      <h3 className="text-[calc(14px+(18-14)*((100vw-320px)/(1920-320)))] font-bold text-slate-900 mb-2 break-all whitespace-normal">{step.title}</h3>
                      <p className="text-[14px] text-slate-500 font-semibold leading-relaxed font-sans">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
