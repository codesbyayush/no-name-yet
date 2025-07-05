import { useEffect, useState } from "react";

const LoadingAnimation = () => {
	const [progress, setProgress] = useState(0);
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setTimeout(() => setIsVisible(false), 500);
					return 100;
				}
				return prev + Math.random() * 15 + 5;
			});
		}, 200);

		return () => clearInterval(interval);
	}, []);

	if (!isVisible) return null;

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-opacity duration-500 ${
				progress === 100 ? "pointer-events-none opacity-0" : "opacity-100"
			}`}
		>
			{/* Animated background particles */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter"></div>
				<div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-cyan-500 opacity-20 mix-blend-multiply blur-xl filter delay-1000"></div>
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-64 w-64 transform animate-pulse rounded-full bg-pink-500 opacity-20 mix-blend-multiply blur-xl filter delay-2000"></div>
			</div>

			<div className="relative z-10 text-center">
				{/* Logo animation */}
				<div className="mb-8">
					<h1 className="mb-4 animate-pulse bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text font-bold text-6xl text-transparent">
						Better T-App
					</h1>
					<p className="text-gray-400 text-lg">Loading your experience...</p>
				</div>

				{/* Progress bar */}
				<div className="mx-auto mb-8 w-80">
					<div className="relative h-2 overflow-hidden rounded-full bg-slate-700">
						<div
							className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 ease-out"
							style={{ width: `${Math.min(progress, 100)}%` }}
						>
							<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
						</div>
					</div>
					<div className="mt-2 flex justify-between text-gray-500 text-sm">
						<span>0%</span>
						<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-semibold text-transparent">
							{Math.round(Math.min(progress, 100))}%
						</span>
						<span>100%</span>
					</div>
				</div>

				{/* Loading dots */}
				<div className="flex justify-center space-x-2">
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="h-3 w-3 animate-bounce rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
							style={{ animationDelay: `${i * 0.2}s` }}
						></div>
					))}
				</div>

				{/* Loading messages */}
				<div className="mt-8 h-6">
					<p className="animate-fade-in-out text-gray-400 text-sm">
						{progress < 25 && "Initializing components..."}
						{progress >= 25 && progress < 50 && "Loading animations..."}
						{progress >= 50 && progress < 75 && "Preparing interface..."}
						{progress >= 75 && progress < 100 && "Almost ready..."}
						{progress >= 100 && "Welcome!"}
					</p>
				</div>
			</div>

			<style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fade-in-out {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-fade-in-out {
          animation: fade-in-out 2s infinite;
        }
      `}</style>
		</div>
	);
};

export default LoadingAnimation;
