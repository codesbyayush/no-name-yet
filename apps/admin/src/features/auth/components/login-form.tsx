import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { useState } from 'react';

export default function SignIn({
  onSignIn,
}: {
  onSignIn: (provider: string) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSignIn(provider: string) {
    setLoading(true);
    try {
      await onSignIn(provider);
    } catch {
      // Todo: handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className='w-full max-w-md gap-4 border-none bg-transparent text-center'>
      <CardHeader>
        <CardTitle className='text-xs sm:text-base'>Continue with OF</CardTitle>
        <CardDescription className='sr-only text-xs md:text-sm'>
          Use any of the providers to create or get back into your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4'>
          <div
            className={cn(
              'flex w-full items-center gap-2',
              'flex-col justify-between',
            )}
          >
            <Button
              className={cn('w-full gap-2')}
              disabled={loading}
              onClick={() => handleSignIn('google')}
              variant='outline'
            >
              <svg
                height='1em'
                viewBox='0 0 256 262'
                width='0.98em'
                xmlns='http://www.w3.org/2000/svg'
              >
                <title>Sign in with Google</title>
                <path
                  d='M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027'
                  fill='#4285F4'
                />
                <path
                  d='M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1'
                  fill='#34A853'
                />
                <path
                  d='M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z'
                  fill='#FBBC05'
                />
                <path
                  d='M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251'
                  fill='#EB4335'
                />
              </svg>
              Sign in with Google
            </Button>
            <Button
              className={cn('w-full gap-2')}
              disabled={loading}
              onClick={() => handleSignIn('github')}
              variant='outline'
            >
              <svg
                height='1em'
                viewBox='0 0 24 24'
                width='1em'
                xmlns='http://www.w3.org/2000/svg'
              >
                <title>Sign in with GitHub</title>
                <path
                  d='M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2'
                  fill='currentColor'
                />
              </svg>
              Sign in with Github
            </Button>
            <Button
              className={cn('w-full gap-2')}
              disabled={loading}
              onClick={() => handleSignIn('gitlab')}
            >
              <svg
                height='1em'
                viewBox='0 0 24 24'
                width='1em'
                xmlns='http://www.w3.org/2000/svg'
              >
                <title>Sign in with GitLab</title>
                <path
                  d='m22.749 9.769l-.031-.08l-3.027-7.9a.79.79 0 0 0-.782-.495a.8.8 0 0 0-.456.17a.8.8 0 0 0-.268.408L16.14 8.125H7.865L5.822 1.872a.8.8 0 0 0-.269-.409a.81.81 0 0 0-.926-.05c-.14.09-.25.22-.312.376L1.283 9.684l-.03.08a5.62 5.62 0 0 0 1.864 6.496l.01.008l.028.02l4.61 3.453l2.282 1.726l1.39 1.049a.935.935 0 0 0 1.13 0l1.389-1.05l2.281-1.726l4.639-3.473l.011-.01A5.62 5.62 0 0 0 22.75 9.77'
                  fill='currentColor'
                />
              </svg>
              Sign in with Gitlab
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className='flex w-full justify-center border-t py-4'>
          <p className='text-center text-muted-foreground text-xs'>
            By signing in, you agree to our
            <a
              className='px-2 font-bold'
              href='https://openfeedback.tech/terms'
              rel='noopener noreferrer'
              target='_blank'
            >
              Terms of Service
            </a>
            and
            <a
              className='px-2 font-bold'
              href='https://openfeedback.tech/privacy'
              rel='noopener noreferrer'
              target='_blank'
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
