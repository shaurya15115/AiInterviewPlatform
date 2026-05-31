import React from 'react';
import { motion } from 'framer-motion';

const VoiceVisualizer = ({ volume, isRecording }) => {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-primary rounded-full"
          animate={{
            height: isRecording ? Math.max(8, (volume / 255) * 64 * (Math.random() * 0.5 + 0.5)) : 8,
            opacity: isRecording ? 1 : 0.5,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 0.5,
          }}
          style={{ minHeight: '8px' }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
