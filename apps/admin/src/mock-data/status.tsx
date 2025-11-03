import type React from 'react';

export interface Status {
  id: string;
  key: string;
  name: string;
  color: string;
  icon: React.FC;
}

export const BacklogIcon: React.FC = () => (
  <svg fill='none' height='14' viewBox='0 0 14 14' width='14'>
    <title>Backlog status</title>
    <circle
      cx='7'
      cy='7'
      fill='none'
      r='6'
      stroke='#bec2c8'
      strokeDasharray='1.4 1.74'
      strokeDashoffset='0.65'
      strokeWidth='2'
    />
    <circle
      className='progress'
      cx='7'
      cy='7'
      fill='none'
      r='2'
      stroke='#bec2c8'
      strokeDasharray='0 100'
      strokeDashoffset='0'
      strokeWidth='4'
      transform='rotate(-90 7 7)'
    />
  </svg>
);

export const PausedIcon: React.FC = () => (
  <svg fill='none' height='14' viewBox='0 0 14 14' width='14'>
    <title>Paused status</title>
    <circle
      cx='7'
      cy='7'
      fill='none'
      r='6'
      stroke='#0ea5e9'
      strokeDasharray='3.14 0'
      strokeDashoffset='-0.7'
      strokeWidth='2'
    />
    <circle
      className='progress'
      cx='7'
      cy='7'
      fill='none'
      r='2'
      stroke='#0ea5e9'
      strokeDasharray='6.2517693806436885 100'
      strokeDashoffset='0'
      strokeWidth='4'
      transform='rotate(-90 7 7)'
    />
  </svg>
);

export const ToDoIcon: React.FC = () => (
  <svg fill='none' height='14' viewBox='0 0 14 14' width='14'>
    <title>To-do status</title>
    <circle
      cx='7'
      cy='7'
      fill='none'
      r='6'
      stroke='#e2e2e2'
      strokeDasharray='3.14 0'
      strokeDashoffset='-0.7'
      strokeWidth='2'
    />
    <circle
      className='progress'
      cx='7'
      cy='7'
      fill='none'
      r='2'
      stroke='#e2e2e2'
      strokeDasharray='0 100'
      strokeDashoffset='0'
      strokeWidth='4'
      transform='rotate(-90 7 7)'
    />
  </svg>
);

export const InProgressIcon: React.FC = () => (
  <svg fill='none' height='14' viewBox='0 0 14 14' width='14'>
    <title>In progress status</title>
    <circle
      cx='7'
      cy='7'
      fill='none'
      r='6'
      stroke='#facc15'
      strokeDasharray='3.14 0'
      strokeDashoffset='-0.7'
      strokeWidth='2'
    />
    <circle
      className='progress'
      cx='7'
      cy='7'
      fill='none'
      r='2'
      stroke='#facc15'
      strokeDasharray='2.0839231268812295 100'
      strokeDashoffset='0'
      strokeWidth='4'
      transform='rotate(-90 7 7)'
    />
  </svg>
);

export const TechnicalReviewIcon: React.FC = () => (
  <svg fill='none' height='14' viewBox='0 0 14 14' width='14'>
    <title>Technical review status</title>
    <circle
      cx='7'
      cy='7'
      fill='none'
      r='6'
      stroke='#22c55e'
      strokeDasharray='3.14 0'
      strokeDashoffset='-0.7'
      strokeWidth='2'
    />
    <circle
      className='progress'
      cx='7'
      cy='7'
      fill='none'
      r='2'
      stroke='#22c55e'
      strokeDasharray='4.167846253762459 100'
      strokeDashoffset='0'
      strokeWidth='4'
      transform='rotate(-90 7 7)'
    />
  </svg>
);

export const CompletedIcon: React.FC = () => (
  <svg fill='none' height='14' viewBox='0 0 14 14' width='14'>
    <title>Completed status</title>
    <circle
      cx='7'
      cy='7'
      fill='none'
      r='6'
      stroke='#8b5cf6'
      strokeDasharray='3.14 0'
      strokeDashoffset='-0.7'
      strokeWidth='2'
    />
    <path
      d='M4.5 7L6.5 9L9.5 5'
      stroke='#8b5cf6'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
  </svg>
);

export const status: Status[] = [
  {
    key: 'in-progress',
    id: 'in-progress',
    name: 'In Progress',
    color: '#facc15',
    icon: InProgressIcon,
  },
  {
    key: 'technical-review',
    id: 'technical-review',
    name: 'Technical Review',
    color: '#22c55e',
    icon: TechnicalReviewIcon,
  },
  {
    id: 'completed',
    key: 'completed',
    name: 'Completed',
    color: '#8b5cf6',
    icon: CompletedIcon,
  },
  {
    id: 'paused',
    key: 'paused',
    name: 'Paused',
    color: '#0ea5e9',
    icon: PausedIcon,
  },
  { id: 'to-do', key: 'to-do', name: 'Todo', color: '#f97316', icon: ToDoIcon },
  {
    id: 'backlog',
    key: 'backlog',
    name: 'Backlog',
    color: '#ec4899',
    icon: BacklogIcon,
  },
];

export const StatusIcon: React.FC<{ statusId: string }> = ({ statusId }) => {
  const currentStatus = status.find((s) => s.id === statusId);
  if (!currentStatus) {
    return null;
  }

  const IconComponent = currentStatus.icon;
  return <IconComponent />;
};

export const StatusIconWithKey: React.FC<{ statusKey: string }> = ({
  statusKey,
}) => {
  const currentStatus = status.find((s) => s.key === statusKey);

  const IconComponent = currentStatus?.icon || ToDoIcon;
  return <IconComponent />;
};
