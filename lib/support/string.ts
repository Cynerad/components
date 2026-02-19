const SPECIAL_CHARTERS = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;
const SPECIAL_CHARTERS_REGEX = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\s]+/g;

function after(text: string, value: string): string {
  const index = text.indexOf(value);

  if (index === -1) return "";
  return text.slice(index + value.length);
}

function append(text: string, appendedString: string) {
  if (appendedString.length === 0) return text;

  return text + appendedString;
}

function before(text: string, value: string): string {
  const index = text.indexOf(value);

  if (index === -1) return "";
  return text.slice(0, index);
}

function between(text: string, firstValue: string, secondValue: string): string {
  return text.slice(text.indexOf(firstValue) + firstValue.length, text.indexOf(secondValue));
}

function trim(text: string, characters: string): string {
  if (!text || !characters) return text;
  const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^[${escaped}]+|[${escaped}]+$`, "g");

  return text.replace(regex, "");
}

function camel(text: string): string {
  return text
    .split(SPECIAL_CHARTERS_REGEX)
    .map((str, index) => (index === 0 ? str.toLowerCase() : capitalize(str)))
    .join("");
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function headline(text: string): string {
  return text
    .split(/(?<!^)(?=[A-Z])|[_\-\s]+/g)
    .map((str) => capitalize(str))
    .join(" ");
}

function kebab(text: string): string {
  return text.replace(/([a-z0-9])([A-Z])|[_\s]+/g, (_, a, b) => (a && b ? `${a}-${b}` : "-")).toLowerCase();
}

function lowerCaseFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function limit(text: string, length: number, appendedString: string = "..."): string {
  return text.length > length ? text.slice(0, length).concat(appendedString) : text;
}

function mask(text: string, paddingCharacter: string = "*", length: number) {
  return text.slice(0, length) + paddingCharacter.repeat(text.length - length);
}

function pad(
  text: string,
  length: number,
  paddingCharacter: string = " ",
  direction: "pad-center" | "pad-left" | "pad-right" = "pad-center",
) {
  const textLength = text.length;

  if (text.length >= length) return text;

  const totalPadding = length - textLength;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;

  switch (direction) {
    case "pad-center":
      return paddingCharacter.repeat(leftPadding) + text + paddingCharacter.repeat(rightPadding);
    case "pad-left":
      return paddingCharacter.repeat(totalPadding) + text;
    case "pad-right":
      return text + paddingCharacter.repeat(totalPadding);
  }
}

function random(length: number, characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

function slug(text: string, character: string = "-") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, character)
    .replace(/-+/g, "-");
}

function squish(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function snake(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function studly(text: string): string {
  return text.replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (c) => c.toUpperCase());
}

function swap(object: Record<string, string>, text: string): string {
  let result = text;

  for (const [key, value] of Object.entries(object)) {
    result = result.replaceAll(key, value);
  }

  return result;
}

function uuid(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");

  const random = crypto.getRandomValues(new Uint8Array(10));
  const randomHex = [...random].map((b) => b.toString(16).padStart(2, "0")).join("");

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-7${randomHex.slice(0, 3)}-${(
    (Number.parseInt(randomHex.charAt(3), 16) & 0x3) |
    0x8
  ).toString(16)}${randomHex.slice(4, 7)}-${randomHex.slice(7)}`;
}

function title(text: string): string {
  return text.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

function upperCaseFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function truncate(text: string, length: number = 20, omission: string = "...") {
  return text.length > length ? `${text.slice(0, length)}${omission}` : text;
}

const str = {
  after,
  append,
  before,
  between,
  trim,
  camel,
  capitalize,
  headline,
  kebab,
  lowerCaseFirst,
  limit,
  pad,
  mask,
  random,
  slug,
  snake,
  squish,
  studly,
  swap,
  title,
  upperCaseFirst,
  uuid,
  wordCount,
  truncate,
};

export default str;
export {
  after,
  append,
  before,
  between,
  camel,
  capitalize,
  headline,
  kebab,
  limit,
  lowerCaseFirst,
  mask,
  pad,
  random,
  slug,
  snake,
  SPECIAL_CHARTERS,
  SPECIAL_CHARTERS_REGEX,
  squish,
  studly,
  swap,
  title,
  trim,
  truncate,
  upperCaseFirst,
  uuid,
  wordCount,
};
