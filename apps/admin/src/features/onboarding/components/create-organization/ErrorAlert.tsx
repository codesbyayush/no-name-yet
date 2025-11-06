import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant='destructive'>
      <AlertTitle className='sr-only'>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
