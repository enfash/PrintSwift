'use client';

import { Star, Clock, BadgeDollarSign, Headphones } from "lucide-react";

const features = [
  {
    icon: <Star className="w-8 h-8 text-primary" />,
    title: "High-Quality Printing",
    desc: "Sharp, vibrant, professional prints produced with modern technology."
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Fast Turnaround",
    desc: "Most orders are completed within 24–48 hours, depending on product."
  },
  {
    icon: <BadgeDollarSign className="w-8 h-8 text-primary" />,
    title: "Affordable Pricing",
    desc: "Highly competitive pricing designed for SMEs and bulk buyers."
  },
  {
    icon: <Headphones className="w-8 h-8 text-primary" />,
    title: "Expert Support",
    desc: "Real human assistance for artwork, orders, and product questions."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-16 bg-card">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 font-heading">Why Choose Us?</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-muted-foreground text-sm mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
