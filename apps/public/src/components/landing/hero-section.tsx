import { Link } from '@tanstack/react-router';
import { AnimatedGroup } from '@workspace/ui/components/animated-group';
import { Button } from '@workspace/ui/components/button';
import { TextEffect } from '@workspace/ui/components/text-effect';
import { ChevronRight } from 'lucide-react';
import AdminShowcase from '../../../assets/admin-showcase.png';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HeroSection() {
  return (
    <main className='overflow-hidden'>
      <div
        aria-hidden
        className='absolute inset-0 isolate hidden opacity-65 contain-strict lg:block'
      >
        <div className='-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]' />
        <div className='-rotate-45 absolute top-0 left-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]' />
        <div className='-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-60 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]' />
      </div>
      <section>
        <div className='relative pt-24 md:pt-36'>
          <AnimatedGroup
            className='-z-20 absolute inset-0'
            variants={{
              container: {
                visible: {
                  transition: {
                    delayChildren: 1,
                  },
                },
              },
              item: {
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: 'spring',
                    bounce: 0.3,
                    duration: 2,
                  },
                },
              },
            }}
          >
            <img
              alt='background'
              className='-z-20 absolute inset-x-0 top-56 hidden lg:top-32 dark:block'
              height='4095'
              src='https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120'
              width='3276'
            />
          </AnimatedGroup>
          <div className='-z-10 absolute inset-0 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]' />
          <div className='mx-auto max-w-7xl px-6'>
            <div className='text-center sm:mx-auto lg:mt-0 lg:mr-auto'>
              {/* <AnimatedGroup variants={transitionVariants}>
									<Link
										to="/"
										className="group mx-auto flex w-fit items-center gap-4 rounded-full border bg-muted p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 hover:bg-background dark:border-t-white/5 dark:shadow-zinc-950 dark:hover:border-t-border"
									>
										<span className="text-foreground text-sm">
											Introducing Support for AI Models
										</span>
										<span className="block h-4 w-0.5 border-l bg-white dark:border-background dark:bg-zinc-700" />

										<div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
											<div className="-translate-x-1/2 flex w-12 duration-500 ease-in-out group-hover:translate-x-0">
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
											</div>
										</div>
									</Link>
								</AnimatedGroup> */}

              <TextEffect
                as='h1'
                className='mt-8 text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]'
                preset='fade-in-blur'
                speedSegment={0.3}
              >
                Modern Solutions for Customer Feedback
              </TextEffect>
              <TextEffect
                as='p'
                className='mx-auto mt-8 max-w-2xl text-balance text-lg'
                delay={0.5}
                per='line'
                preset='fade-in-blur'
                speedSegment={0.3}
              >
                Transform how your team collects, manages, and acts on customer
                feedback with our comprehensive platform designed for modern
                product development
              </TextEffect>

              <AnimatedGroup
                className='mt-12 flex flex-col items-center justify-center gap-2 md:flex-row'
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
              >
                <div
                  className='rounded-[calc(var(--radius-xl)+0.125rem)] border bg-foreground/10 p-0.5'
                  key={1}
                >
                  <Button
                    asChild
                    className='rounded-xl px-5 text-base'
                    size='lg'
                  >
                    <a href={`${import.meta.env.PUBLIC_ADMIN_ROOT_URL}/auth`}>
                      <span className='text-nowrap'>Start Building</span>
                    </a>
                  </Button>
                </div>
                <Button
                  asChild
                  className='h-10.5 rounded-xl px-5'
                  key={2}
                  size='lg'
                  variant='ghost'
                >
                  <Link to='/contact'>
                    <span className='text-nowrap'>Request a demo</span>
                  </Link>
                </Button>
              </AnimatedGroup>
            </div>
          </div>

          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            <div className='-mr-56 relative mt-8 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20'>
              <div
                aria-hidden
                className='absolute inset-0 z-10 bg-linear-to-b from-35% from-transparent to-background'
              />
              <div className='relative inset-shadow-2xs mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-1 shadow-lg shadow-zinc-950/15 ring-1 ring-background dark:inset-shadow-white/20'>
                {/* <img
										className="relative hidden aspect-15/8 rounded-2xl bg-background dark:block"
										src="/mail2.png"
										alt="app screen"
										width="2700"
										height="1440"
									/>
									<img
										className="relative z-2 aspect-15/8 rounded-2xl border border-border/25 dark:hidden"
										src="/mail2-light.png"
										alt="app screen"
										width="2700"
										height="1440"
									/> */}
                <img
                  alt='app screen'
                  className='relative hidden aspect-15/8 rounded-2xl bg-background dark:block'
                  height='1440'
                  src={AdminShowcase}
                  width='2700'
                />
                <img
                  alt='app screen'
                  className='relative z-2 aspect-15/8 rounded-2xl border border-border/25 dark:hidden'
                  height='1440'
                  src={AdminShowcase}
                  width='2700'
                />
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>
      <section className='bg-background pt-16 pb-16 md:pb-32'>
        <div className='group relative m-auto max-w-5xl px-6'>
          <div className='absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100'>
            <Link
              className='block text-sm duration-150 hover:opacity-75'
              to='/'
            >
              <span> Meet Our Customers</span>

              <ChevronRight className='ml-1 inline-block size-3' />
            </Link>
          </div>
          {/* TODO: Add examples */}
          {/* <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14">
							<div className="flex">
								<img
									className="mx-auto h-5 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/nvidia.svg"
									alt="Nvidia Logo"
									height="20"
									width="auto"
								/>
							</div>

							<div className="flex">
								<img
									className="mx-auto h-4 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/column.svg"
									alt="Column Logo"
									height="16"
									width="auto"
								/>
							</div>
							<div className="flex">
								<img
									className="mx-auto h-4 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/github.svg"
									alt="GitHub Logo"
									height="16"
									width="auto"
								/>
							</div>
							<div className="flex">
								<img
									className="mx-auto h-5 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/nike.svg"
									alt="Nike Logo"
									height="20"
									width="auto"
								/>
							</div>
							<div className="flex">
								<img
									className="mx-auto h-5 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
									alt="Lemon Squeezy Logo"
									height="20"
									width="auto"
								/>
							</div>
							<div className="flex">
								<img
									className="mx-auto h-4 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/laravel.svg"
									alt="Laravel Logo"
									height="16"
									width="auto"
								/>
							</div>
							<div className="flex">
								<img
									className="mx-auto h-7 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/lilly.svg"
									alt="Lilly Logo"
									height="28"
									width="auto"
								/>
							</div>

							<div className="flex">
								<img
									className="mx-auto h-6 w-fit dark:invert"
									src="https://html.tailus.io/blocks/customers/openai.svg"
									alt="OpenAI Logo"
									height="24"
									width="auto"
								/>
							</div>
						</div> */}
        </div>
      </section>
    </main>
  );
}
