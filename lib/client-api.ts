export async function fetchArray<T = any>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    if (!response.ok) {
      console.error(`[CLIENT API] ${url} -> HTTP ${response.status}`, data);
      return [];
    }
    if (!Array.isArray(data)) {
      console.error(`[CLIENT API] ${url} expected array but received`, data);
      return [];
    }
    return data as T[];
  } catch (error) {
    console.error(`[CLIENT API] ${url} request failed`, error);
    return [];
  }
}

export async function fetchObject<T extends Record<string, any> = Record<string, any>>(
  url: string,
  fallback: T = {} as T,
): Promise<T> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    if (!response.ok) {
      console.error(`[CLIENT API] ${url} -> HTTP ${response.status}`, data);
      return fallback;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      console.error(`[CLIENT API] ${url} expected object but received`, data);
      return fallback;
    }
    return data as T;
  } catch (error) {
    console.error(`[CLIENT API] ${url} request failed`, error);
    return fallback;
  }
}
