import dayjs from "dayjs";

function now() {
  return dayjs();
}

function today() {
  return now().startOf("day");
}

function tomorrow() {
  return now().add(1, "day");
}

function yesterday() {
  return now().subtract(1, "day");
}

function year() {
  return now().year();
}

function month() {
  return now().month();
}

function dayOfMonth() {
  return now().date();
}

function dayOfWeak() {
  return now().day();
}

function hour() {
  return now().hour();
}

function second() {
  return now().second();
}

function minute() {
  return now().minute();
}

function startOfWeak() {
  return now().startOf("week");
}

function endOfWeak() {
  return now().endOf("week");
}

function startOfMonth() {
  return now().startOf("month");
}

function endOfMonth() {
  return now().endOf("month");
}

function isBefore(date1: dayjs.ConfigType, date2: dayjs.ConfigType): boolean {
  return dayjs(date1).isBefore(dayjs(date2));
}

function isAfter(date1: dayjs.ConfigType, date2: dayjs.ConfigType): boolean {
  return dayjs(date1).isAfter(dayjs(date2));
}

function isSame(
  date1: dayjs.ConfigType,
  date2: dayjs.ConfigType,
  unit: dayjs.OpUnitType = "day",
): boolean {
  return dayjs(date1).isSame(dayjs(date2), unit);
}

function diff(
  date1: dayjs.ConfigType,
  date2: dayjs.ConfigType,
  unit: dayjs.OpUnitType = "day",
): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), unit));
}

export {
  dayOfMonth,
  dayOfWeak,
  diff,
  endOfMonth,
  endOfWeak,
  hour,
  isAfter,
  isBefore,
  isSame,
  minute,
  month,
  now,
  second,
  startOfMonth,
  startOfWeak,
  today,
  tomorrow,
  year,
  yesterday,
};
