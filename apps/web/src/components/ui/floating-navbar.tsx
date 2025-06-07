"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";

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

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const scrollPosition = scrollYProgress.get();
      let direction = current! - scrollYProgress.getPrevious()!;

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
        initial={{
          opacity: 1,
          y: 0,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-white/20 rounded-full bg-zinc-900/80 backdrop-blur-md shadow-2xl shadow-black/20 z-[5000] pr-2 pl-2 py-1.5 items-center justify-center space-x-4 min-w-xs",
          className,
        )}
      >
        <button className="border text-sm font-medium relative border-white/20 text-white px-4 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 mr-16">
          <span>AP</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-white/50 to-transparent h-px" />
        </button>
        {navItems.map((navItem: any, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative text-white/80 items-center flex space-x-1 hover:text-white transition-colors duration-300",
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
        <button className="border text-sm font-medium relative border-white/20 text-white px-4 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 ml-16">
          <span>Login</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-white/50 to-transparent h-px" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
