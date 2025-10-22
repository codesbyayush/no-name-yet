import type React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const NoPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    aria-label='No Priority'
    className={className}
    fill='currentColor'
    focusable='false'
    height='16'
    role='img'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <rect height='1.5' opacity='0.9' rx='0.5' width='3' x='1.5' y='7.25' />
    <rect height='1.5' opacity='0.9' rx='0.5' width='3' x='6.5' y='7.25' />
    <rect height='1.5' opacity='0.9' rx='0.5' width='3' x='11.5' y='7.25' />
  </svg>
);

const UrgentPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    aria-label='Urgent Priority'
    className={className}
    fill='currentColor'
    focusable='false'
    height='16'
    role='img'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M3 1C1.91067 1 1 1.91067 1 3V13C1 14.0893 1.91067 15 3 15H13C14.0893 15 15 14.0893 15 13V3C15 1.91067 14.0893 1 13 1H3ZM7 4L9 4L8.75391 8.99836H7.25L7 4ZM9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z' />
  </svg>
);

const HighPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    aria-label='High Priority'
    className={className}
    fill='currentColor'
    focusable='false'
    height='16'
    role='img'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <rect height='6' rx='1' width='3' x='1.5' y='8' />
    <rect height='9' rx='1' width='3' x='6.5' y='5' />
    <rect height='12' rx='1' width='3' x='11.5' y='2' />
  </svg>
);

const MediumPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    aria-label='Medium Priority'
    className={className}
    fill='currentColor'
    focusable='false'
    height='16'
    role='img'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <rect height='6' rx='1' width='3' x='1.5' y='8' />
    <rect height='9' rx='1' width='3' x='6.5' y='5' />
    <rect fillOpacity='0.4' height='12' rx='1' width='3' x='11.5' y='2' />
  </svg>
);

const LowPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    aria-label='Low Priority'
    className={className}
    fill='currentColor'
    focusable='false'
    height='16'
    role='img'
    viewBox='0 0 16 16'
    width='16'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <rect height='6' rx='1' width='3' x='1.5' y='8' />
    <rect fillOpacity='0.4' height='9' rx='1' width='3' x='6.5' y='5' />
    <rect fillOpacity='0.4' height='12' rx='1' width='3' x='11.5' y='2' />
  </svg>
);

export interface Priority {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const priorities: Priority[] = [
  { id: 'no-priority', name: 'No priority', icon: NoPriorityIcon },
  { id: 'urgent', name: 'Urgent', icon: UrgentPriorityIcon },
  { id: 'high', name: 'High', icon: HighPriorityIcon },
  { id: 'medium', name: 'Medium', icon: MediumPriorityIcon },
  { id: 'low', name: 'Low', icon: LowPriorityIcon },
];
