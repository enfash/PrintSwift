
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CounterProps = {
  value: number;
  setValue: (value: number) => void;
  className?: string;
};

function Counter({ value, setValue, className }: CounterProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center bg-white rounded-md shadow-sm p-1 border border-gray-100',
        className
      )}
    >
      <Button
        type="button"
        aria-label="decrement"
        onClick={() => setValue(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition"
        variant="ghost"
      >
        <span className="text-xl font-light">−</span>
      </Button>

      <div className="mx-1 w-10 text-center font-medium text-gray-800">
        {value}
      </div>

      <Button
        type="button"
        aria-label="increment"
        onClick={() => setValue(value + 1)}
        className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition"
        variant="ghost"
      >
        <span className="text-xl font-light">+</span>
      </Button>
    </div>
  );
}

export { Counter };
