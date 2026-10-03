export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

/**
 * Concatenates and joins multiple CSS class names with conditional flags.
 * A lightweight and clean alternative to classnames / clsx libraries.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const arg = inputs[i];
    if (!arg) continue;

    const argType = typeof arg;

    if (argType === 'string' || argType === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = cn(...arg);
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (argType === 'object' && arg !== null) {
      if ((arg as any).toString === Object.prototype.toString) {
        const obj = arg as Record<string, any>;
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key]) {
            classes.push(key);
          }
        }
      } else {
        classes.push((arg as any).toString());
      }
    }
  }

  return classes.join(' ');
}
