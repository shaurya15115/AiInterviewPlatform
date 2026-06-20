import { motion } from 'framer-motion';

const VoiceVisualizer = ({ volume, isRecording }) => {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((_, i) => {
        // Use a deterministic calculation based on bar index i and volume to generate height.
        // This is pure and doesn't use Math.random() during render.
        const factor = 0.5 + 0.1 * ((i * 3) % 5);
        const height = isRecording ? Math.max(8, (volume / 255) * 64 * factor) : 8;

        return (
          <motion.div
            key={i}
            className="w-2 bg-primary rounded-full"
            animate={{
              height: height,
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
        );
      })}
    </div>
  );
};

export default VoiceVisualizer;
