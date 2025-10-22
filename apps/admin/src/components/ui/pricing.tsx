import { CheckCircleIcon, StarIcon } from 'lucide-react';
import { motion, type Transition } from 'motion/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

interface Plan {
  name: string;
  info: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    text: string;
    tooltip?: string;
  }[];
  btn: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
  plans: Plan[];
  heading: string;
  description?: string;
}

export function PricingSection({
  plans,
  heading,
  description,
  ...props
}: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<'monthly' | 'yearly'>(
    'monthly'
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center space-y-5 p-4',
        props.className
      )}
      {...props}
    >
      <div className='mx-auto max-w-xl space-y-2'>
        <h2 className='text-center font-bold text-2xl tracking-tight md:text-3xl lg:text-4xl'>
          {heading}
        </h2>
        {description && (
          <p className='text-center text-muted-foreground text-sm md:text-base'>
            {description}
          </p>
        )}
      </div>
      <PricingFrequencyToggle
        frequency={frequency}
        setFrequency={setFrequency}
      />
      <div className='mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3'>
        {plans.map((plan) => (
          <PricingCard frequency={frequency} key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}

type PricingFrequencyToggleProps = React.ComponentProps<'div'> & {
  frequency: FREQUENCY;
  setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({
  frequency,
  setFrequency,
  ...props
}: PricingFrequencyToggleProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-fit rounded-full border bg-muted/30 p-1',
        props.className
      )}
      {...props}
    >
      {frequencies.map((freq) => (
        <button
          className='relative px-4 py-1 text-sm capitalize'
          key={freq}
          onClick={() => setFrequency(freq)}
          type='button'
        >
          <span className='relative z-10'>{freq}</span>
          {frequency === freq && (
            <motion.span
              className='absolute inset-0 z-10 rounded-full bg-foreground mix-blend-difference'
              layoutId='frequency'
              transition={{ type: 'spring', duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

type PricingCardProps = React.ComponentProps<'div'> & {
  plan: Plan;
  frequency?: FREQUENCY;
};

export function PricingCard({
  plan,
  className,
  frequency = frequencies[0],
  ...props
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col rounded-lg border',
        className
      )}
      key={plan.name}
      {...props}
    >
      {plan.highlighted && (
        <BorderTrail
          size={100}
          style={{
            boxShadow:
              '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
          }}
        />
      )}
      <div
        className={cn(
          'rounded-t-lg border-b bg-muted/20 p-4',
          plan.highlighted && 'bg-muted/40'
        )}
      >
        <div className='absolute top-2 right-2 z-10 flex items-center gap-2'>
          {plan.highlighted && (
            <p className='flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs'>
              <StarIcon className='h-3 w-3 fill-current' />
              Popular
            </p>
          )}
          {frequency === 'yearly' && (
            <p className='flex items-center gap-1 rounded-md border bg-primary px-2 py-0.5 text-primary-foreground text-xs'>
              {Math.round(
                ((plan.price.monthly * 12 - plan.price.yearly) /
                  plan.price.monthly /
                  12) *
                  100
              )}
              % off
            </p>
          )}
        </div>

        <div className='font-medium text-lg'>{plan.name}</div>
        <p className='font-normal text-muted-foreground text-sm'>{plan.info}</p>
        <h3 className='mt-2 flex items-end gap-1'>
          <span className='font-bold text-3xl'>${plan.price[frequency]}</span>
          <span className='text-muted-foreground'>
            {plan.name !== 'Free'
              ? `/${frequency === 'monthly' ? 'month' : 'year'}`
              : ''}
          </span>
        </h3>
      </div>
      <div
        className={cn(
          'space-y-4 px-4 py-6 text-muted-foreground text-sm',
          plan.highlighted && 'bg-muted/10'
        )}
      >
        {plan.features.map((feature, index) => (
          <div className='flex items-center gap-2' key={index}>
            <CheckCircleIcon className='h-4 w-4 text-foreground' />
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <p
                    className={cn(
                      feature.tooltip && 'cursor-pointer border-b border-dashed'
                    )}
                  >
                    {feature.text}
                  </p>
                </TooltipTrigger>
                {feature.tooltip && (
                  <TooltipContent>
                    <p>{feature.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'mt-auto w-full border-t p-3',
          plan.highlighted && 'bg-muted/40'
        )}
      >
        <Button
          asChild
          className='w-full'
          variant={plan.highlighted ? 'default' : 'outline'}
        >
          <a href={plan.btn.href}>{plan.btn.text}</a>
        </Button>
      </div>
    </div>
  );
}

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const BASE_TRANSITION = {
    repeat: Number.POSITIVE_INFINITY,
    duration: 5,
    ease: (t: number) => t,
  };

  return (
    <div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
      <motion.div
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        className={cn('absolute aspect-square bg-zinc-500', className)}
        onAnimationComplete={onAnimationComplete}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        transition={{
          ...(transition ?? BASE_TRANSITION),
          delay,
        }}
      />
    </div>
  );
}
