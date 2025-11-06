import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import type React from 'react';

interface NameFieldProps {
  value: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NameField({ value, disabled, onChange }: NameFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='name'>Organization Name</Label>
      <Input
        disabled={disabled}
        id='name'
        onChange={onChange}
        placeholder='OpenFeedback'
        required
        type='text'
        value={value}
      />
    </div>
  );
}
