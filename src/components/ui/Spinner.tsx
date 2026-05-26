import { cn } from '../../lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-primary',
          {
            'h-4 w-4': size === 'sm',
            'h-8 w-8': size === 'md',
            'h-12 w-12': size === 'lg',
          }
        )}
      />
    </div>
  );
}
