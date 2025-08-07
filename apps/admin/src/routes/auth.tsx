import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		typeof window !== "undefined"
			? new URLSearchParams(window.location.search)
			: null;
	const redirect = search?.get("redirect") || "/boards";
	return (
		<div className="mx-auto flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue-800/20 to-card py-8">
			<div className="mx-auto flex w-full max-w-2xs flex-col items-center justify-center gap-3">
				<p className="rounded-full bg-primary-foreground/50 px-3.5 py-2 font-bold text-4xl">
					A
				</p>
				<p className="font-semibold text-foreground text-sm">
					Create your account
				</p>
				<GoogleLoginButton redirect={redirect} />
			</div>
		</div>
	);
}
