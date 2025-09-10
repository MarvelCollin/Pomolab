import type { ILoadingSpinner } from '../../interfaces/ILoadingSpinner';

export default function LoadingSpinner({ size = 'md', color = 'blue-500' }: ILoadingSpinner) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    'blue-500': 'border-blue-500',
    'white': 'border-white',
    'red-500': 'border-red-500',
    'green-500': 'border-green-500'
  };

  const borderColorClass = colorClasses[color as keyof typeof colorClasses] || 'border-blue-500';

  return (
    <div className={`${sizeClasses[size]} ${borderColorClass} border-t-transparent rounded-full animate-spin`}></div>
  );
}
