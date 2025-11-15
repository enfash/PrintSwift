'use client';

import { Package, UploadCloud, Truck } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    icon: <Package className="w-8 h-8 text-primary" />,
    title: "Choose Your Product",
    subtitle: "Pick the perfect item for your branding needs.",
  },
  {
    id: 2,
    icon: <UploadCloud className="w-8 h-8 text-primary" />,
    title: "Upload Your Design",
    subtitle: "Upload your artwork or design using our tools.",
  },
  {
    id: 3,
    icon: <Truck className="w-8 h-8 text-primary" />,
    title: "Receive Your Order",
    subtitle: "We print, pack & deliver fast — right to your doorstep.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-8 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:overflow-visible">
            <div className="flex flex-row md:grid md:grid-cols-3 gap-4 md:gap-10 w-max md:w-auto">
            {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center text-center gap-2 p-2 w-36 md:w-auto">
                <div className="flex-shrink-0">
                    {step.icon}
                </div>
                <div>
                    <h3 className="text-sm font-semibold font-heading">
                    {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {step.subtitle}
                    </p>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
}
