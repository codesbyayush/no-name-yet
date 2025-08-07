import { GoogleLoginButton } from "@/components/auth/google-login-button";
import SignIn from "@/components/auth/login-form";
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

	const callbackURL = redirect
		? redirect.startsWith("http")
			? redirect
			: `${window.location.origin}${redirect}`
		: `${window.location.origin}/`;

	return (
		<div className="mx-auto flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-card via-90% to-black py-8">
			<div className="mx-auto flex w-full max-w-2xs flex-col items-center justify-center">
				<p className="relative top-2 rounded-full bg-primary-foreground/50 px-3.5 py-2 font-bold text-4xl">
					A
				</p>
				<SignIn redirect={callbackURL} />
			</div>
		</div>
	);
}
