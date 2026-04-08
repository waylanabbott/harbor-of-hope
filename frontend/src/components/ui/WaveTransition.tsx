import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Full-screen wave wipe transition between pages.
 *
 * How it works:
 * 1. On route change, a coral-colored wave rises from the bottom with a wavy SVG edge
 * 2. It fully covers the viewport
 * 3. Then it recedes downward, revealing the new page underneath
 *
 * The wave SVG has an organic, water-like shape that fits the Harbor/ocean theme.
 */

const WAVE_DURATION = 0.5; // seconds for each half (rise + recede)
const TOTAL_DURATION = WAVE_DURATION * 2 + 0.05; // small overlap

export default function WaveTransition() {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), TOTAL_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isAnimating && (
        <>
          {/* First wave — rises up to cover screen */}
          <motion.div
            key="wave-cover"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{
              duration: WAVE_DURATION,
              ease: [0.76, 0, 0.24, 1], // custom cubic-bezier for water feel
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {/* Wave SVG top edge */}
            <svg
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                top: -119,
                left: 0,
                width: '100%',
                height: 120,
              }}
            >
              <path
                d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,20 1440,60 L1440,120 L0,120 Z"
                fill="#D4603F"
              />
            </svg>
            {/* Solid fill below wave */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, #D4603F 0%, #C4533A 40%, #3A7D6A 100%)',
              }}
            />
          </motion.div>

          {/* Second wave — slightly delayed, creates depth */}
          <motion.div
            key="wave-depth"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{
              duration: WAVE_DURATION,
              delay: 0.06,
              ease: [0.76, 0, 0.24, 1],
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9998,
              pointerEvents: 'none',
            }}
          >
            <svg
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                top: -119,
                left: 0,
                width: '100%',
                height: 120,
              }}
            >
              <path
                d="M0,80 C240,0 480,120 720,40 C960,0 1200,100 1440,80 L1440,120 L0,120 Z"
                fill="#5B8C7A"
              />
            </svg>
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#5B8C7A',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
