import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getUser } from "@netlify/identity";
export type Product = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  sizes: string[];
  stock: number;
  status: string;
  badge: string;
  featured: boolean;
  sellerId: string | null;
  adminNote?: string;
  version?: number;
};
export type Category = {
  id: string;
  name: string;
  image: string;
  active?: boolean;
};
export const StoreContext = createContext<any>(null);
export const useStore = () => useContext(StoreContext);
export function navigate(url: string) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}
export function useLocation() {
  const [url, setUrl] = useState(() => location.pathname + location.search);
  useEffect(() => {
    const change = () => setUrl(location.pathname + location.search);
    window.addEventListener("popstate", change);
    return () => window.removeEventListener("popstate", change);
  }, []);
  return url;
}
export function Link({ to, children, className = "", onClick, ...props }: any) {
  return (
    <a
      href={to}
      className={className}
      {...props}
      onClick={(e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!path.startsWith("/api/catalog") && !path.startsWith("/api/products/"))
    await getUser();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  const data = await response
    .json()
    .catch(() => ({
      error: "The store is temporarily unavailable. Please try again.",
    }));
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}
export const json = (method: string, data?: any): RequestInit => ({
  method,
  ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
});
export function useResource<T = any>(url: string, enabled = true) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(enabled),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    api<T>(url)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, enabled, version]);
  return { data, loading, error, reload, setData };
}
export function useTask() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    setError("");
    try {
      return await fn();
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run, setError };
}
export function Alert({ children, type = "error" }: any) {
  return children ? (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`alert ${type}`}
    >
      {children}
    </div>
  ) : null;
}
export function Empty({ icon: Icon, title, children, action }: any) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={38} strokeWidth={1.2} />}
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="skeleton-grid" aria-label="Loading">
      <div />
      <div />
      <div />
    </div>
  );
}
export function Status({ children }: any) {
  return (
    <span
      className={`status status-${String(children).toLowerCase().replaceAll(" ", "-")}`}
    >
      {children}
    </span>
  );
}
export function Field({ label, children, hint }: any) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function PriceInput({ value, onChange, ...props }: any) {
  return (
    <input
      type="number"
      min="1"
      step="1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}
