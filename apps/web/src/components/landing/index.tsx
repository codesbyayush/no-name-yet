import { FloatingNav } from "../ui/floating-navbar";
import { LucideHome, LucideMessageCircle, LucideUser } from "lucide-react";
import { motion } from "motion/react";
import { Spotlight } from "../ui/spotlight-new";

const LandingPage = () => {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <LucideHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "About",
      link: "/about",
      icon: <LucideUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: (
        <LucideMessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" />
      ),
    },
  ];

  return (
    <div className="min-h-screen relative bg-zinc-900 bg-noise overflow-x-hidden">
      {/* Content */}
      <div className="relative z-10 py-10">
        {/* {isLoading && <LoadingAnimation />} */}
        <FloatingNav navItems={navItems} />

        <div className="relative mx-auto py-16 flex max-w-7xl flex-col items-center justify-center">
          <FloatingNav navItems={navItems} />
          <div className="px-4 py-12 md:py-28">
            <Spotlight />
            <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold md:text-4xl lg:text-7xl">
              {"Build better with customer feedback"
                .split(" ")
                .map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1,
                      ease: "easeInOut",
                    }}
                    className="mr-2 inline-block bg-clip-text  bg-gradient-to-r from-white via-yellow-100 to-stone-100 text-transparent"
                  >
                    {word}
                  </motion.span>
                ))}
            </h1>
            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.3,
                delay: 0.8,
              }}
              className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
            >
              Collect feedback to guide your product decisions
            </motion.p>
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.3,
                delay: 1,
              }}
              className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 bg-noise dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
                Explore Now
              </button>
              <button className="w-60 transform rounded-lg bg-zinc-700/75 px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-white bg-noise dark:text-black dark:hover:bg-gray-200">
                Connect with us
              </button>
            </motion.div>
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 1.2,
              }}
              className="relative z-10 mt-44 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                <img
                  src="https://assets.aceternity.com/pro/aceternity-landing.webp"
                  alt="Landing page preview"
                  className="aspect-[16/9] h-auto w-full object-cover"
                  height={1000}
                  width={1000}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
