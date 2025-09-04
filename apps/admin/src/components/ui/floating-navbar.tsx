import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
import { type JSX, useState } from 'react';
import { cn } from '@/lib/utils';

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(true);
  const [hasScrolledOut, setHasScrolledOut] = useState(false);

  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === 'number') {
      const scrollPosition = scrollYProgress.get();
      const direction = current! - scrollYProgress.getPrevious()!;

      // Track if we've scrolled past the initial viewport
      if (scrollPosition > 0.1 && !hasScrolledOut) {
        setHasScrolledOut(true);
      }

      if (scrollPosition < 0.05) {
        // Always show when at top
        setVisible(true);
        setHasScrolledOut(false);
      } else if (hasScrolledOut) {
        // Use floating behavior only after scrolling out
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      } else {
        // Keep visible until we scroll out
        setVisible(true);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        className={cn(
          'fixed inset-x-0 top-10 z-[5000] mx-auto flex min-w-xs max-w-fit items-center justify-center space-x-4 rounded-full border border-white/20 bg-zinc-900/80 py-1.5 pr-2 pl-2 shadow-2xl shadow-black/20 backdrop-blur-md',
          className
        )}
        initial={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.2,
        }}
      >
        <button className="relative mr-16 rounded-full border border-white/20 bg-white/10 px-4 py-1 font-medium text-sm text-white transition-all duration-300 hover:bg-white/20">
          <span>AP</span>
          <span className="-bottom-px absolute inset-x-0 mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </button>
        {navItems.map((navItem: any, idx: number) => (
          <a
            className={cn(
              'relative flex items-center space-x-1 text-white/80 transition-colors duration-300 hover:text-white'
            )}
            href={navItem.link}
            key={`link=${idx}`}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden text-sm sm:block">{navItem.name}</span>
          </a>
        ))}
        <button className="relative ml-16 rounded-full border border-white/20 bg-white/10 px-4 py-1 font-medium text-sm text-white transition-all duration-300 hover:bg-white/20">
          <span>Login</span>
          <span className="-bottom-px absolute inset-x-0 mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
