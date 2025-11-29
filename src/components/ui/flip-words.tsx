
'use client';
import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type FlipWordsProps = {
  words: string[];
  interval?: number;       // ms between word swaps (default 5000)
  letterDelay?: number;    // delay per letter (seconds)
  wordDelay?: number;      // delay between words when splitting multi-word phrases (seconds)
  className?: string;
  ariaLabel?: string;
};

export function FlipWords({
  words,
  interval = 5000,
  letterDelay = 0.05,
  wordDelay = 0.25,
  className,
  ariaLabel = 'rotating words',
}: FlipWordsProps) {
  const [index, setIndex] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;
    let max = 0;
    const spans = words.map((word) => {
      const span = document.createElement('span');
      // Hide the span but keep it in the layout to measure
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'nowrap';
      span.style.font = 'inherit';
      span.style.fontWeight = 'inherit';
      span.style.letterSpacing = 'inherit';
      span.innerText = word;
      document.body.appendChild(span);
      return span;
    });

    spans.forEach((span) => {
      max = Math.max(max, span.offsetWidth);
    });
    setContainerWidth(max);

    spans.forEach((span) => document.body.removeChild(span));

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [words, interval]);


  const current = words[index];

  return (
    <span 
      aria-live="polite" 
      aria-label={ariaLabel}
      className={cn('inline-block align-middle', className)}
      style={{
        width: containerWidth ? `${containerWidth}px` : 'auto',
        minHeight: '1.2em'
      }}
    >
      <AnimatePresence
        mode="popLayout"
        onExitComplete={() => {
          /* placeholder - nothing required here */
        }}
      >
        <motion.span
          key={current + index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            y: -36,
            x: 36,
            filter: 'blur(8px)',
            scale: 1.9,
            position: 'absolute',
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="inline-block relative px-1 will-change-transform will-change-opacity will-change-filter"
        >
          {current.split(' ').map((word, wIdx) => (
            <motion.span
              key={word + wIdx}
              initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: wIdx * wordDelay, duration: 0.28 }}
              className="inline-block whitespace-nowrap"
            >
              {word.split('').map((char, cIdx) => (
                <motion.span
                  key={`${char}-${cIdx}`}
                  initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: wIdx * wordDelay + cIdx * letterDelay,
                    duration: 0.18,
                  }}
                  className="inline-block will-change-transform will-change-opacity will-change-filter"
                >
                  {char}
                </motion.span>
              ))}
              {/* keep space between words */}
              {wIdx < current.split(' ').length - 1 ? '\u00A0' : ''}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
