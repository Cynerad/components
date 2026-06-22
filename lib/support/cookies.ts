type CookieValue = string | number | boolean | object | null | undefined;

type CookieOptions = {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

class CookieManager {
  set(name: string, value: CookieValue, options: CookieOptions = {}): void {
    const stringValue = typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(stringValue)}`;

    if (options.expires) {
      const expires = options.expires instanceof Date
        ? options.expires
        : new Date(Date.now() + options.expires * 1000);
      cookie += `; expires=${expires.toUTCString()}`;
    }

    if (options.path) {
      cookie += `; path=${options.path}`;
    }

    if (options.domain) {
      cookie += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookie += "; secure";
    }

    if (options.sameSite) {
      cookie += `; SameSite=${options.sameSite}`;
    }

    document.cookie = cookie;
  }

  get(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        const value = cookie.substring(nameEQ.length);
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  has(name: string): boolean {
    return this.get(name) !== null;
  }

  remove(name: string, options: Omit<CookieOptions, "expires"> = {}): void {
    this.set(name, "", {
      ...options,
      expires: new Date(0),
    });
  }

  clear(): void {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const name = cookie.split("=")?.[0]?.trim();
      if (name) {
        this.remove(name);
      }
    }
  }

  all(): Record<string, string> {
    const result: Record<string, string> = {};
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie) {
        const [name, ...valueParts] = cookie.split("=");
        const value = valueParts.join("=");
        if (name) {
          result[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      }
    }

    return result;
  }

  mapped(): Map<string, string> {
    const map = new Map<string, string>();
    const all = this.all();

    for (const [key, value] of Object.entries(all)) {
      map.set(key, value);
    }

    return map;
  }
}

const cookies = new CookieManager();

export { CookieManager, cookies };
export type { CookieOptions, CookieValue };
