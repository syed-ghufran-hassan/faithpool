/**
 * Array Utility Functions
 * 
 * Comprehensive array manipulation utilities.
 */

/**
 * Remove duplicates from an array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Remove duplicates based on a key function
 */
export function uniqueBy<T, K>(arr: T[], keyFn: (item: T) => K): T[] {
  const seen = new Map<K, T>();
  for (const item of arr) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
}

/**
 * Group array items by a key
 */
export function groupBy<T, K extends string | number | symbol>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/**
 * Chunk an array into smaller arrays of a specified size
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Flatten a nested array one level deep
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.flat() as T[];
}

/**
 * Flatten a deeply nested array
 */
export function flattenDeep<T>(arr: unknown[]): T[] {
  return arr.flat(Infinity) as T[];
}

/**
 * Get the first n items from an array
 */
export function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

/**
 * Get the last n items from an array
 */
export function takeLast<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

/**
 * Skip the first n items and return the rest
 */
export function skip<T>(arr: T[], n: number): T[] {
  return arr.slice(n);
}

/**
 * Get the first item or undefined
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

/**
 * Get the last item or undefined
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get a random item from an array
 */
export function sample<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get n random items from an array
 */
export function sampleSize<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/**
 * Partition array into two based on a predicate
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  for (const item of arr) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  return [truthy, falsy];
}

/**
 * Find the intersection of two arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter(item => set2.has(item));
}

/**
 * Find the difference between two arrays (items in arr1 not in arr2)
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter(item => !set2.has(item));
}

/**
 * Find the union of two arrays
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return unique([...arr1, ...arr2]);
}

/**
 * Zip two arrays together
 */
export function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  const length = Math.min(arr1.length, arr2.length);
  const result: [T, U][] = [];
  for (let i = 0; i < length; i++) {
    result.push([arr1[i], arr2[i]]);
  }
  return result;
}

/**
 * Unzip an array of pairs into two arrays
 */
export function unzip<T, U>(pairs: [T, U][]): [T[], U[]] {
  const arr1: T[] = [];
  const arr2: U[] = [];
  for (const [a, b] of pairs) {
    arr1.push(a);
    arr2.push(b);
  }
  return [arr1, arr2];
}

/**
 * Create an array of numbers from start to end
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  return result;
}

/**
 * Count occurrences of each item in an array
 */
export function countBy<T, K extends string | number | symbol>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, number> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<K, number>);
}

/**
 * Sort array by a key function
 */
export function sortBy<T, K>(
  arr: T[],
  keyFn: (item: T) => K,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...arr].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    const comparison = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Find index of an item that matches a predicate
 */
export function findIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if all items satisfy a predicate
 */
export function every<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.every(predicate);
}

/**
 * Check if any item satisfies a predicate
 */
export function some<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.some(predicate);
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(arr: T[]): boolean {
  return arr.length === 0;
}

/**
 * Check if array is not empty
 */
export function isNotEmpty<T>(arr: T[]): boolean {
  return arr.length > 0;
}

/**
 * Move an item from one index to another
 */
export function move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

/**
 * Remove an item at a specific index
 */
export function removeAt<T>(arr: T[], index: number): T[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

/**
 * Insert an item at a specific index
 */
export function insertAt<T>(arr: T[], index: number, item: T): T[] {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}

/**
 * Update an item at a specific index
 */
export function updateAt<T>(arr: T[], index: number, item: T): T[] {
  return arr.map((v, i) => (i === index ? item : v));
}

export default {
  unique,
  uniqueBy,
  groupBy,
  chunk,
  flatten,
  flattenDeep,
  take,
  takeLast,
  skip,
  first,
  last,
  shuffle,
  sample,
  sampleSize,
  partition,
  intersection,
  difference,
  union,
  zip,
  unzip,
  range,
  countBy,
  sortBy,
  findIndex,
  every,
  some,
  isEmpty,
  isNotEmpty,
  move,
  removeAt,
  insertAt,
  updateAt,
};
