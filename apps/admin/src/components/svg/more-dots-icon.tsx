interface MoreDotsIconProps {
  className?: string;
  size?: number;
}

export const MoreDotsIcon = ({
  className = '',
  size = 16,
}: MoreDotsIconProps) => (
  <svg
    className={className}
    fill='none'
    height={size}
    viewBox='0 0 24 24'
    width={size}
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='5' cy='12' fill='currentColor' r='1.5' />
    <circle cx='12' cy='12' fill='currentColor' r='1.5' />
    <circle cx='19' cy='12' fill='currentColor' r='1.5' />
  </svg>
);
