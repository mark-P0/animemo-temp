export * as Random from './random.js';

/**
 * Wait for `duration` seconds **asynchronously**.
 */
export async function sleep(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function* range(from: number, to: number): Generator<number> {
  let n = from;
  while (n < to) yield n++;
}
