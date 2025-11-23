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
  const mountedRef = React.useRef(false);

  // cycle index every `interval` ms
  React.useEffect(() => {
    mountedRef.current = true;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [interval, words.length]);

  const current = words[index];

  return (
    // aria-live so screen readers announce changes politely
    <span aria-live="polite" aria-label={ariaLabel} className={cn('inline-block', className)}>
      <AnimatePresence
        mode="popLayout"
        onExitComplete={() => {
          /* placeholder - nothing required here */
        }}
      >
        <motion.span
          key={current + index} // ensure unique key even for same text repeated later
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
