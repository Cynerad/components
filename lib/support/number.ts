function between(number: number, start: number, end: number) {
  return number <= end && number >= start;
}

function random(start: number, end?: number): number {
  if (!end) {
    end = start;
    start = 0;
  }

  return Math.floor(Math.random() * (end - start));
}

function abbreviate(value: number | bigint, options?: Intl.NumberFormatOptions, locale: Intl.LocalesArgument = "en-US") {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  if (value <= min)
    return min;

  if (value >= max)
    return max;

  return value;
}

function currency(value: number | bigint, options?: Intl.NumberFormatOptions, locale: Intl.LocalesArgument = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    ...options,
  }).format(value);
}

function fileSize(value: number | bigint, options?: Intl.NumberFormatOptions, locale: Intl.LocalesArgument = "en-US") {
  return Intl.NumberFormat(locale, {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
    ...options,
  }).format(value);
}

function forHumans(value: number | bigint, options?: Intl.NumberFormatOptions, locale: Intl.LocalesArgument = "en-US") {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "long",
    ...options,
  }).format(value);
};

function ordinal(value: number) {
  const englishOrdinalRules = new Intl.PluralRules("en-US", { type: "ordinal" }).select(value) as "one" | "two" | "few" | "other";

  const suffix = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th",
  };

  return value + suffix[englishOrdinalRules];
}

function percentage(value: number, options?: Intl.NumberFormatOptions, locale: Intl.LocalesArgument = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    ...options,
  }).format(value / 100);
}

export { abbreviate, between, clamp, currency, fileSize, forHumans, ordinal, percentage, random };
