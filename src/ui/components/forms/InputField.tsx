/**
 * Input Field Component
 * Text/number/date input with icon prefix
 */

import React from 'react';
import MaterialIcon from '../MaterialIcon';
import { InputFieldProps } from '../../types/components';

export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  error,
  disabled = false,
  required = false,
}) => {
  const id = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className={`
            font-caption text-caption
            ${error ? 'text-error' : 'text-on-surface-variant'}
          `}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <MaterialIcon
            icon={icon}
            className="absolute left-4 text-outline pointer-events-none"
          />
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full bg-surface-container-lowest
            border rounded-xl
            h-touch-target-min
            font-body-md text-body-md text-on-surface
            placeholder:text-on-surface-variant/50
            focus:border-primary focus:ring-1 focus:ring-primary
            outline-none transition-colors
            ${icon ? 'pl-12' : 'pl-4'}
            pr-4
            ${error ? 'border-error' : 'border-outline-variant/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ paddingInlineStart: icon ? '3rem' : '1rem' }}
        />
      </div>

      {error && (
        <p id={`${id}-error`} className="font-caption text-caption text-error mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
