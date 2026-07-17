import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  success: 'btn btn-success',
  outline: 'btn btn-outline',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? ' btn-sm' : '';
  return (
    <button
      className={`${variantClasses[variant]}${sizeClass} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
