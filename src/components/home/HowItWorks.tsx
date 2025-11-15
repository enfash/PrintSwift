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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start gap-4 p-2">
              <div className="flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold font-heading">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {step.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
