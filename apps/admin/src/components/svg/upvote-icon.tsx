import type React from "react";

interface UpvoteIconProps {
	className?: string;
	size?: number;
	filled?: boolean;
}

export const UpvoteIcon: React.FC<UpvoteIconProps> = ({
	className = "",
	size = 16,
	filled = false,
}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 16 16"
			className={className}
		>
			<path
				d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</svg>
	);
};
