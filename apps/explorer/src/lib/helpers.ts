export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

export function getInitials(
  name: string | null | undefined,
  count?: number,
): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => (part[0] ?? '').toUpperCase());

  return count && count > 0
    ? initials.slice(0, count).join('')
    : initials.join('');
}

export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = import.meta.env.BASE_URL;

  if (baseUrl && baseUrl !== '/') {
    return import.meta.env.BASE_URL + pathname;
  } else {
    return pathname;
  }
}
