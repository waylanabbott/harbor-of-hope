import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Harbor-themed page transitions.
 *
 * Cycles through different nautical transition styles:
 * 1. Wave Rise   — water rises from the bottom with wavy SVG edge, then drops
 * 2. Sail Cut    — diagonal wipe like a sail cutting across
 * 3. Ripple      — circular reveal expanding from center
 */

type TransitionStyle = 'waveRise' | 'sailCut' | 'ripple';
const STYLES: TransitionStyle[] = ['waveRise', 'sailCut', 'ripple'];

const DURATION = 1.2; // total seconds

export default function WaveTransition() {
  const location = useLocation();
  const [animating, setAnimating] = useState(false);
  const prevPath = useRef(location.pathname);
  const styleIndex = useRef(0);
  const [currentStyle, setCurrentStyle] = useState<TransitionStyle>('waveRise');

  const triggerTransition = useCallback(() => {
    setCurrentStyle(STYLES[styleIndex.current % STYLES.length]);
    styleIndex.current += 1;
    setAnimating(true);
  }, []);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      triggerTransition();
    }
  }, [location.pathname, triggerTransition]);

  if (!animating) return null;

  return (
    <>
      {currentStyle === 'waveRise' && (
        <WaveRise onComplete={() => setAnimating(false)} />
      )}
      {currentStyle === 'sailCut' && (
        <SailCut onComplete={() => setAnimating(false)} />
      )}
      {currentStyle === 'ripple' && (
        <Ripple onComplete={() => setAnimating(false)} />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Wave Rise — water rises up, pauses, drops down                  */
/* ------------------------------------------------------------------ */
function WaveRise({ onComplete }: { onComplete: () => void }) {
  return (
    <>
      {/* Primary wave — coral */}
      <motion.div
        initial={{ y: '100vh' }}
        animate={{ y: [  '100vh', '0vh', '0vh', '-100vh'] }}
        transition={{
          duration: DURATION,
          times: [0, 0.4, 0.6, 1],
          ease: [0.76, 0, 0.24, 1],
        }}
        onAnimationComplete={onComplete}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, #D4603F 0%, #B84A30 100%)',
        }}
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: -118, left: 0, width: '100%', height: 120 }}
        >
          <path
            d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,20 1440,60 L1440,120 L0,120 Z"
            fill="#D4603F"
          />
        </svg>
      </motion.div>
      {/* Secondary wave — sage, slightly delayed */}
      <motion.div
        initial={{ y: '100vh' }}
        animate={{ y: ['100vh', '0vh', '0vh', '-100vh'] }}
        transition={{
          duration: DURATION,
          times: [0, 0.4, 0.6, 1],
          ease: [0.76, 0, 0.24, 1],
          delay: 0.07,
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9998,
          pointerEvents: 'none',
          backgroundColor: '#5B8C7A',
        }}
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: -118, left: 0, width: '100%', height: 120 }}
        >
          <path
            d="M0,80 C240,0 480,120 720,40 C960,-20 1200,100 1440,60 L1440,120 L0,120 Z"
            fill="#5B8C7A"
          />
        </svg>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Sail Cut — diagonal wipe like a sail                            */
/* ------------------------------------------------------------------ */
function SailCut({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }}
      animate={{
        clipPath: [
          'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',       // start: nothing
          'polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)',    // full cover (diagonal)
          'polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)',    // hold
          'polygon(120% 0%, 120% 0%, 120% 100%, 100% 100%)',// exit right
        ],
      }}
      transition={{
        duration: DURATION,
        times: [0, 0.4, 0.6, 1],
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #D4603F 0%, #E8935A 50%, #5B8C7A 100%)',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  4. Ripple — circle expanding from center                           */
/* ------------------------------------------------------------------ */
function Ripple({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{
        clipPath: [
          'circle(0% at 50% 50%)',
          'circle(75% at 50% 50%)',
          'circle(75% at 50% 50%)',
          'circle(150% at 50% 50%)',
        ],
        opacity: [1, 1, 1, 0],
      }}
      transition={{
        duration: DURATION,
        times: [0, 0.4, 0.55, 1],
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 50%, #D4603F 0%, #5B8C7A 70%, #3A7D6A 100%)',
      }}
    />
  );
}
