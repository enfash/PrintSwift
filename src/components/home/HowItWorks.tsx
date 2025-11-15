'use client';

import { Package, UploadCloud, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <Package className="w-8 h-8 text-primary" />,
    title: "Choose Your Product",
    desc: "Browse our collection and pick the perfect item for your needs."
  },
  {
    icon: <UploadCloud className="w-8 h-8 text-primary" />,
    title: "Upload Your Design",
    desc: "Upload your artwork or let us help you create a stunning design."
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-primary" />,
    title: "Receive Your Order",
    desc: "We print, process, and deliver your branded products on time."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="overflow-x-auto pb-4 -mx-4 px-4 md:overflow-visible md:px-0 md:-mx-0">
            <div className="flex md:grid md:grid-cols-3 gap-8 w-max md:w-auto">
            {steps.map((step, idx) => (
                <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 w-64 md:w-auto"
                >
                <div className="mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">{step.desc}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
}
