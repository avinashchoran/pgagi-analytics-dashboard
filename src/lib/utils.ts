import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, type: string = 'default') => {
  const placeholderImageMap: Record<string, string> = {
    news: '/placeholder.svg',
    default: '/placeholder.svg'
  };
  e.currentTarget.src = placeholderImageMap[type] || placeholderImageMap.default;
};
