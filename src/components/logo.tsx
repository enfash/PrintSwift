import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="BOMedia Logo"
    >
      <rect width="36" height="36" rx="8" fill="hsl(var(--primary))" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))"
        fontFamily="Space Grotesk, sans-serif"
      >
        BM
      </text>
    </svg>
  );
}
