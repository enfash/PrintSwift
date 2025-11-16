
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus } from 'lucide-react';

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
        variant: 'destructive',
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
        variant: 'destructive',
      });
      return;
    }
    setValue(value + 1);
  };

  return (
    <div
      className={cn(
        'flex items-center rounded-md border',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-r-none"
        onClick={handleDecrement}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="w-12 border-l border-r text-center text-sm font-medium">
        {value}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-l-none"
        onClick={handleIncrement}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export { Counter };
