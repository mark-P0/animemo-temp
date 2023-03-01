/**
 * Random floating number from `from` up to, but excluding, `to`.
 */
export function float(from: number, to: number): number {
  const range = to - from;
  return Math.random() * range + from;
}

/**
 * Random integer from `from` up to, but excluding, `to`.
 */
export function integer(from: number, to: number): number {
  return Math.floor(float(from, to));
}

/**
 * Random item from given `items` array.
 */
export function choice<T>(items: readonly T[]): T {
  const idx = integer(0, items.length);
  return items[idx];
}

/**
 * Shuffles the given `items` **in-place**,
 * and returns (a reference to) the same array.
 *
 * https://stackoverflow.com/a/12646864
 * https://blog.codinghorror.com/the-danger-of-naivete/
 * https://softwareonastring.com/1135/perils-of-copy-paste-programming
 */
export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Selects `n` **unique** items from the given `items`.
 *
 * i.e. sampling **WITHOUT** replacement
 *
 * Naive:
 * - Create a `copy` of `items`
 * - Shuffle `copy`
 * - Return first `n` elements of `copy`
 */
export function sample<T>(items: T[], n: number): T[] {
  if (n > items.length) {
    throw new RangeError(
      `Received \`n = ${n}\`; must be smaller than ${items.length} (\`items\`' count)`
    );
  }
  if (n === items.length) {
    console.warn(`Given \`items\` already has \`n = ${n}\` items; just shuffle instead?`);
    return [...items];
  }
  if (n === 0) {
    console.warn('Getting nothing?');
    return [];
  }
  if (n < 0) {
    throw new RangeError(`Received negative \`n = ${n}\` is not countable!`);
  }

  const copy = shuffle([...items]);
  return copy.slice(0, n);
}

/**
 * Chooses `n` items from the given `items`,
 * with each choice being exclusive from another.
 *
 * i.e. sampling **WITH** replacement
 *
 * Naive:
 * - Call the `choice()` function `n` times and build an array from its results
 */
export function choices<T>(items: T[], n: number): T[] {
  if (n === items.length) {
    console.warn(`Given \`items\` already has \`n = ${n}\` items; just shuffle instead?`);
    return [...items];
  }
  if (n === 0) {
    console.warn('Getting nothing?');
    return [];
  }
  if (n < 0) {
    throw new RangeError(`Received negative \`n = ${n}\` is not countable!`);
  }

  return Array.from({ length: n }, () => choice(items));
}
