type colorType
  = | "red"
    | "green"
    | "yellow"
    | "blue"
    | "magenta"
    | "cyan"
    | "white"
    | "brightRed"
    | "brightGreen"
    | "brightYellow"
    | "brightBlue"
    | "brightMagenta"
    | "brightCyan"
    | "gray"
    | "orange";

const COLOR_MAP: Record<colorType, string> = {
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  gray: "\x1B[90m",
  brightRed: "\x1B[91m",
  brightGreen: "\x1B[92m",
  brightYellow: "\x1B[93m",
  brightBlue: "\x1B[94m",
  brightMagenta: "\x1B[95m",
  brightCyan: "\x1B[96m",
  orange: "\x1B[38;5;208m",
};

const RESET = "\x1B[0m";

function getColorString(colorName: colorType) {
  return COLOR_MAP[colorName];
}

function log<T>(message: T, colorName: colorType = "white") {
  const color = getColorString(colorName);
  process.stdout.write(`${color}`);
  console.dir(message, { depth: null, colors: true });
  process.stdout.write(`${RESET}\n`);
}

export { log };
