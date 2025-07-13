import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod/v4";
import Loader from "./loader";

export function LoginForm({
  className,
  redirect,
  ...props
}: React.ComponentProps<"div"> & { redirect?: string }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending, data } = authClient.useSession();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/",
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const callbackURL = redirect
        ? redirect.startsWith("http")
          ? redirect
          : `${window.location.origin}${redirect}`
        : window.location.origin + "/";
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      toast.success("Redirecting to Google...");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <form.Field name="email">
                  {(field) => (
                    <>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                      />
                      {field.state.meta.errors.map((error) => (
                        <p
                          key={error?.message}
                          className="text-red-500 text-sm"
                        >
                          {error?.message}
                        </p>
                      ))}
                    </>
                  )}
                </form.Field>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <form.Field name="password">
                  {(field) => (
                    <>
                      <Input
                        id="password"
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                      />
                      {field.state.meta.errors.map((error) => (
                        <p
                          key={error?.message}
                          className="text-red-500 text-sm"
                        >
                          {error?.message}
                        </p>
                      ))}
                    </>
                  )}
                </form.Field>
              </div>
              <div className="flex flex-col gap-3">
                <form.Subscribe>
                  {(state) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        !state.canSubmit ||
                        state.isSubmitting ||
                        isGoogleLoading
                      }
                    >
                      {state.isSubmitting ? "Submitting..." : "Login"}
                    </Button>
                  )}
                </form.Subscribe>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={handleGoogleLogin}
                >
                  {isGoogleLoading
                    ? "Connecting to Google..."
                    : "Login with Google"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
