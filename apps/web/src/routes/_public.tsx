import { BrandLogoIcon } from "@/components/svg/logo";
import { useSession } from "@/lib/auth-client";
import {
	Link,
	Outlet,
	createFileRoute,
	useLocation,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
	component: PublicLayout,
});

function PublicLayout() {
	const location = useLocation();

	const { data: session } = useSession();

	const publicLinks = [
		{ to: "/board", label: "Board" },
		{ to: "/roadmap", label: "Roadmap" },
		{ to: "/changelog", label: "Changelog" },
	];

	return (
		<div className="flex h-full min-h-screen flex-col items-center bg-background bg-noise">
			{/* Navigation Header */}
			<nav className="flex w-[60rem] items-center justify-between gap-4 p-4">
				{/* Logo and Navigation Links */}
				<div className="flex items-center justify-center gap-4">
					{/* Logo */}
					<Link
						to="/"
						className="flex size-10 items-center gap-3 transition-opacity hover:opacity-80"
					>
						{/* <div className="h-8 w-8 overflow-hidden rounded-lg bg-transparent">
							<span className="flex aspect-square size-5 items-center justify-center rounded bg-accent p-4 ">
								A
							</span>
						</div>
						<div className="xs:block hidden">
							<span className="font-medium text-gray-900 text-lg">A</span>
						</div> */}

						<BrandLogoIcon
							size={40}
							className="rounded-lg border border-muted/50 p-1 invert"
						/>
					</Link>

					{/* Separator */}
					<div className="hidden h-6 w-px bg-gray-300 sm:block"></div>

					{/* Navigation Links */}
					<div className="hidden items-center gap-1 sm:flex">
						<Link
							to="/board"
							className={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
								location.pathname.includes("/board")
									? "bg-gray-100 text-gray-900 shadow-sm"
									: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
							}`}
						>
							Feedback
						</Link>
					</div>
				</div>

				{/* Right Side Actions */}
				<div className="flex justify-end">
					<div className="flex items-center gap-2">
						{/* User Avatar Button */}
						<button className="rounded-full p-0.5 shadow-sm transition-colors">
							<div className="h-8 w-8 overflow-hidden rounded-full border border-accent-foreground">
								{session?.user?.image ? (
									<img
										src={session?.user?.image}
										alt="User Avatar"
										className="h-full w-full object-cover"
									/>
								) : (
									<span className="flex aspect-square size-5 items-center justify-center rounded-full bg-accent p-4 ">
										?
									</span>
								)}
							</div>
						</button>
					</div>
				</div>
			</nav>
			<main className="flex-1 p-6">
				<Outlet />
			</main>
		</div>
	);
}
