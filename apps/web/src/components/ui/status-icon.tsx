import { Check, Circle, X } from "lucide-react";

type Status = "open" | "in_progress" | "resolved" | "closed" | undefined;

interface StatusIconProps {
  status?: Status;
  className?: string;
  progress?: number;
}

const statusClasses = {
  open: "text-gray-500",
  in_progress: "text-yellow-500",
  resolved: "text-green-500",
  closed: "text-red-500",
};

export function StatusIcon({
  status,
  className,
  progress = 0.5,
}: StatusIconProps) {
  const color = status ? statusClasses[status] : "text-gray-500";

  if (status === "resolved") {
    return (
      <div
        className={`m-2 flex size-4 items-center justify-center rounded-full border-2 border-green-500 ${className}`}
      >
        <Check className="size-3 text-green-700" />
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div
        className={`m-2 flex size-4 items-center justify-center rounded-full border-2 border-red-500 ${className}`}
      >
        <X className="size-3 text-red-700" />
      </div>
    );
  }

  if (status === "in_progress") {
    const safeProgress = Math.max(0, Math.min(progress, 1));
    const radius = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - safeProgress * circumference;
    return (
      <div className={`p-2 ${className}`}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`size-4`}
        >
          {/* Background circle */}
          <circle
            cx="7"
            cy="7"
            r={radius}
            className="stroke-current text-yellow-200/50"
            strokeWidth="2"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="7"
            cy="7"
            r={radius}
            className="stroke-current text-yellow-500"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
            transform="rotate(-90 7 7)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`flex size-8 items-center justify-center rounded-full ${className}`}
    >
      <Circle className="size-4 rounded-full bg-white text-gray-400" />
    </div>
  );
}
