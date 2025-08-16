// import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import React from "react";

const menuItems: any[] = [
	// { name: "Features", to: "/about" },
	// { name: "Solution", to: "/board" },
	// { name: "Pricing", to: "/contact" },
	// { name: "About", to: "/about" },
];

export const HeroHeader = () => {
	const [menuState, setMenuState] = React.useState(false);
	const [isScrolled, setIsScrolled] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	return (
		<header>
			<nav
				data-state={menuState && "active"}
				className="fixed z-20 w-full px-2"
			>
				<div
					className={cn(
						"mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
						isScrolled &&
							"max-w-4xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5",
					)}
				>
					<div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
						<div className="flex w-full justify-between lg:w-auto">
							<Link
								to="/"
								aria-label="home"
								className="flex items-center space-x-2"
							>
								{/* <Logo /> */}
								<span className="inline-block rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-800/50">
									AP
								</span>
							</Link>

							<button
								onClick={() => setMenuState(!menuState)}
								aria-label={menuState === true ? "Close Menu" : "Open Menu"}
								className="-m-2.5 -mr-4 relative z-20 block cursor-pointer p-2.5 lg:hidden"
							>
								<Menu className="m-auto size-6 in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 duration-200" />
								<X className="-rotate-180 absolute inset-0 m-auto size-6 in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 scale-0 in-data-[state=active]:opacity-100 opacity-0 duration-200" />
							</button>
						</div>

						<div className="absolute inset-0 m-auto hidden size-fit lg:block">
							<ul className="flex gap-8 text-sm">
								{menuItems.map((item, index) => (
									<li key={index}>
										<Link
											to={item.to}
											className="block text-muted-foreground duration-150 hover:text-accent-foreground"
										>
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="mb-6 in-data-[state=active]:block hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:in-data-[state=active]:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
							<div className="lg:hidden">
								<ul className="space-y-6 text-base">
									{menuItems.map((item, index) => (
										<li key={index}>
											<Link
												to={item.to}
												className="block text-muted-foreground duration-150 hover:text-accent-foreground"
											>
												<span>{item.name}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
								<Button
									asChild
									size="sm"
									className={cn(isScrolled && "lg:hidden")}
								>
									<a href={`${import.meta.env.PUBLIC_ADMIN_ROOT_URL}/auth`}>
										<span>Sign Up</span>
									</a>
								</Button>
								<Button
									asChild
									size="sm"
									className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
								>
									<a href={`${import.meta.env.PUBLIC_ADMIN_ROOT_URL}/auth`}>
										<span>Get Started</span>
									</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};
