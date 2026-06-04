// https://github.com/solidjs-community/solid-primitives/blob/main/packages/props/src/combineProps.ts

import type { JSX } from 'solid-js';

const extractCSSregex = /((?:--)?\w+(?:-\w+)*)\s*:\s*([^;]*)/gu;

export function stringStyleToObject(style: string): JSX.CSSProperties {
  const object: Record<string, string> = {};
  let match: RegExpExecArray | null;
  match = extractCSSregex.exec(style);
  while (match) {
    object[match[1]] = match[2];
    match = extractCSSregex.exec(style);
  }
  return object;
}

export function combineStyle(a: string, b: string): string;
export function combineStyle(
  a: JSX.CSSProperties | undefined,
  b: JSX.CSSProperties | undefined,
): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string | undefined,
  b: JSX.CSSProperties | string | undefined,
): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string | undefined,
  b: JSX.CSSProperties | string | undefined,
): JSX.CSSProperties | string {
  let aString = a;
  let bString = b;
  if (typeof aString === 'string') {
    if (typeof bString === 'string') {
      return `${aString};${bString}`;
    }

    aString = stringStyleToObject(aString);
  } else if (typeof bString === 'string') {
    bString = stringStyleToObject(bString);
  }

  return { ...aString, ...bString };
}
