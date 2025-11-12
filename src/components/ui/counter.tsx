
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type CounterProps = {
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

function Counter({ value, setValue, min, max, className }: CounterProps) {
  const { toast } = useToast();

  const handleDecrement = () => {
    if (min !== undefined && value <= min) {
      toast({
        title: 'Minimum Reached',
        description: `The minimum value is ${min}.`,
      });
      return;
    }
    setValue(value - 1);
  };

  const handleIncrement = () => {
    if (max !== undefined && value >= max) {
      toast({
        title: 'Maximum Reached',
        description: `The maximum value is ${max}.`,
      });
      return;
    }
    setValue(value + 1);
  };

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
        onClick={handleDecrement}
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
        onClick={handleIncrement}
        className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition"
        variant="ghost"
      >
        <span className="text-xl font-light">+</span>
      </Button>
    </div>
  );
}

export { Counter };
