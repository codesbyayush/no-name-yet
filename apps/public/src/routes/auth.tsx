import { LoginForm } from "@/components/login-form";
import SignUpForm from "@/components/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		typeof window !== "undefined"
			? new URLSearchParams(window.location.search)
			: null;
	const redirect = search?.get("redirect") || undefined;
	return (
		<div className="container mx-auto flex min-h-screen items-center justify-center py-8">
			<div className="w-full max-w-md">
				<Tabs defaultValue="login" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="login">Login</TabsTrigger>
						<TabsTrigger value="signup">Sign Up</TabsTrigger>
					</TabsList>
					<TabsContent value="login" className="mt-6">
						<LoginForm redirect={redirect} />
					</TabsContent>
					<TabsContent value="signup" className="mt-6">
						<SignUpForm />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
