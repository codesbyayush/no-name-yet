import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import type React from 'react';

interface SlugFieldProps {
  value: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  domainSuffix: string;
}

export function SlugField({
  value,
  disabled,
  onChange,
  domainSuffix,
}: SlugFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='slug'>Public url</Label>
      <div className='flex items-center space-x-2'>
        <Input
          className='flex-1'
          disabled={disabled}
          id='slug'
          onChange={onChange}
          onPaste={(e) =>
            onChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
          }
          placeholder='openfeedback'
          required
          type='text'
          value={value}
        />
        <span className='text-muted-foreground text-sm'>{domainSuffix}</span>
      </div>
    </div>
  );
}
