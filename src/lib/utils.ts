import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string consistently across the app
 * @param dateString - ISO date string (e.g., "2023-10-26")
 * @param formatStr - date-fns format string (default: "MMM dd, yyyy")
 * @returns Formatted date string (e.g., "Oct 26, 2023")
 */
export function formatDate(dateString: string, formatStr = "MMM dd, yyyy"): string {
  return format(new Date(dateString), formatStr);
}

/**
 * Formats a date for long-form display (e.g., article headers)
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "October 26, 2023")
 */
export function formatDateLong(dateString: string): string {
  return format(new Date(dateString), "MMMM d, yyyy");
}
