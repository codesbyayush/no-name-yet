import React from "react";

interface MoreDotsIconProps {
	className?: string;
	size?: number;
}

export const MoreDotsIcon = ({
	className = "",
	size = 16,
}: MoreDotsIconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<circle cx="5" cy="12" r="1.5" fill="currentColor" />
			<circle cx="12" cy="12" r="1.5" fill="currentColor" />
			<circle cx="19" cy="12" r="1.5" fill="currentColor" />
		</svg>
	);
};
