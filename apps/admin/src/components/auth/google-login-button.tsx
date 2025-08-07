import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function GoogleLoginButton({ redirect }: { redirect: string }) {
	const { isPending, data } = authClient.useSession();

	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const handleGoogleLogin = async () => {
		setIsGoogleLoading(true);

		try {
			const callbackURL = redirect
				? redirect.startsWith("http")
					? redirect
					: `${window.location.origin}${redirect}`
				: `${window.location.origin}/`;
			await authClient.signIn.social({
				provider: "google",
				callbackURL,
			});
			toast.success("Redirecting to Google...");
		} catch (error) {
			toast.error("Google login failed. Please try again.");
		} finally {
			setIsGoogleLoading(false);
		}
	};

	if (isPending) {
		return <Loader />;
	}

	return (
		<Button
			variant="default"
			className="my-1 w-full"
			type="button"
			disabled={isGoogleLoading}
			onClick={handleGoogleLogin}
		>
			Login with Google
		</Button>
	);
}
