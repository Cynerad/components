function oldSchoolCopy(text: string): boolean {
  const tempTextArea = document.createElement("textarea");

  tempTextArea.value = text;
  tempTextArea.style.position = "fixed";
  tempTextArea.style.left = "-999999px";
  tempTextArea.style.top = "-999999px";
  tempTextArea.setAttribute("readonly", "");
  tempTextArea.setAttribute("aria-hidden", "true");

  document.body.appendChild(tempTextArea);

  tempTextArea.focus();
  tempTextArea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch (error) {
    console.error("Failed to copy using execCommand:", error);
  } finally {
    document.body.removeChild(tempTextArea);
  }

  return success;
}

async function copyToClipboard(text: string) {
  if (!text || typeof text !== "string") {
    console.warn("copyToClipboard: Invalid text provided");
    return false;
  }

  if (navigator?.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("Clipboard API failed, falling back to execCommand:", error);
    }
  }

  return oldSchoolCopy(text);
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;

  if (typeof value === "object") return Object.keys(value).length === 0;

  return false;
}

function dd(...args: unknown[]) {
  for (const arg of args) {
    console.dir(arg, { depth: null, colors: true });
  }
}

async function sleep(time: number) {
  return await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function debounce(callback: CallableFunction, delay: number = 200) {
  return () => {
    window.setTimeout(() => {
      callback();
    }, delay);
  };
}

function throttle(callback: () => void, time: number = 200) {
  let lastTime = 0;
  return () => {
    const now = Date.now();
    if (now - lastTime >= time) {
      callback();
      lastTime = now;
    }
  };
}

function once<T extends (...args: Parameters<T>) => ReturnType<T>>(callback: T): T {
  let result: ReturnType<T>;
  let hasBeenCalled = false;

  function wrapped(...args: Parameters<T>): ReturnType<T> {
    if (!hasBeenCalled) {
      result = callback(...args);
      hasBeenCalled = true;
    }
    return result;
  }

  return wrapped as T;
}

async function promise<TReturn, TError = never>(
  callback: () => TReturn | Promise<TReturn>,
  errorCallback?: (error: unknown) => TError | Promise<TError>,
): Promise<TReturn | TError> {
  try {
    return await callback();
  } catch (error: unknown) {
    if (errorCallback) {
      return await errorCallback(error);
    }
    throw error;
  }
}

function throwError(error: unknown): never {
  console.error("Error occurred:", error);

  if (error instanceof Error) {
    throw error;
  }

  const message =
    typeof error === "string" ? error : error && typeof error === "object" && "message" in error ? String(error.message) : String(error);

  throw new Error(message);
}

function after<T extends (...args: Parameters<T>) => ReturnType<T>>(n: number, func: T): T {
  let callCount = 0;
  let result: ReturnType<T>;

  function wrapper(...args: Parameters<T>): ReturnType<T> {
    callCount++;
    if (callCount >= n) {
      result = func(...args);
    }
    return result;
  }

  return wrapper as T;
}

function before<T extends (...args: Parameters<T>) => ReturnType<T>>(n: number, func: T): T {
  let callCount = 0;
  let result: ReturnType<T>;

  function wrapped(...args: Parameters<T>): ReturnType<T> {
    if (callCount < n) {
      result = func(...args);
    }
    callCount++;
    return result;
  }

  return wrapped as T;
}

export { after, before, copyToClipboard, dd, debounce, isEmpty, once, promise, sleep, throttle, throwError };
