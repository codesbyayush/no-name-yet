import { Button } from '@workspace/ui/components/button';

interface SubmitButtonProps {
  disabled: boolean;
  isSubmitting: boolean;
  buttonText?: string;
}

export function SubmitButton({
  disabled,
  isSubmitting,
  buttonText,
}: SubmitButtonProps) {
  return (
    <Button className='w-full' disabled={disabled} type='submit'>
      {isSubmitting ? (
        <>
          <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
          <span className='ml-2'>Creating...</span>
        </>
      ) : (
        buttonText || 'Create Organization'
      )}
    </Button>
  );
}
