import { random } from "@/lib/support/number";

function range(start: number = 0, end?: number, step: number = 1) {
  if (end === undefined) {
    end = start;
    start = 0;
  }

  if (step === 0) step = 1;

  step = start > end && step > 0 ? step * -1 : step;

  const length = Math.floor((end - start) / step) + 1;

  return Array.from({ length }, (_, i) => start + i * step);
}

function unique<TArray>(array: TArray[]) {
  return [...new Set(array)];
}

function replace<TArray>(array: TArray[], index: number, value: TArray) {
  array[index] = value;
  return array;
}

function sample<TArray>(array: TArray[]) {
  return array[random(array.length)];
}

function sum(array: number[]) {
  let total = 0;
  array.forEach((e) => (total += e));
  return total;
}

function chunk<TArray>(array: TArray[], size: number) {
  let chunkedNumber = 0;
  const chunkedArray: unknown[] = [];
  array.forEach(() => {
    if (chunkedNumber === array.length) return;

    const slicedArray = array.slice(chunkedNumber, chunkedNumber + size);
    if (slicedArray.length === 0) return;
    chunkedArray.push(slicedArray);
    chunkedNumber += size;
  });

  return chunkedArray;
}

function compact<TArray>(array: TArray[]) {
  return array.filter((e) => e);
}

function difference<TFirstArray, TSecondArray>(firstArray: TFirstArray[], secondArray: TSecondArray[]) {
  return firstArray.filter((f) => !secondArray.includes(f));
}

function remove<TArray>(array: TArray[], value: TArray) {
  const index = array.indexOf(value);
  if (index === -1) return array;
  array.splice(index, 1);
  return array;
}

function shuffle<TArray>(array: TArray[]) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = random(0, currentIndex);
    currentIndex--;

    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex]!;
    array[randomIndex] = temp!;
  }
  return array;
}

function head<TArray>(array: TArray[]) {
  return array[0];
}

function last<TArray>(array: TArray[]) {
  return array[array.length - 1];
}

function nth<TArray>(array: TArray[], n: number) {
  return array[n];
}

function intersection<TFirstArray, TSecondArray>(firstArray: TFirstArray[], secondArray: TSecondArray[]) {
  return firstArray.filter((e) => secondArray.includes(e));
}

function tail<TArray>(array: TArray[]) {
  array.shift();
  return array;
}

function take<TArray>(array: TArray[], n: number = 0) {
  return array.slice(0, n);
}

function union<TFirstArray, TSecondArray>(firstArray: TFirstArray[], secondArray: TSecondArray[]) {
  return [...new Set([...firstArray, ...secondArray])];
}

export {
  chunk,
  compact,
  difference,
  head,
  intersection,
  last,
  nth,
  range,
  remove,
  replace,
  sample,
  shuffle,
  sum,
  tail,
  take,
  union,
  unique,
};
