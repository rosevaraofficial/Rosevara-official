import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  getUser,
  login,
  signup,
  logout,
  handleAuthCallback,
  requestPasswordRecovery,
  updateUser,
  acceptInvite,
  onAuthChange,
} from "@netlify/identity";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Truck,
  ShieldCheck,
  Store,
  Banknote,
  Check,
  Instagram,
  Minus,
  Plus,
  LoaderCircle,
  LogOut,
  LayoutDashboard,
  Mail,
  Flower2,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import {
  StoreContext,
  useStore,
  useLocation,
  navigate,
  Link,
  api,
  json,
  Alert,
  Field,
  useTask,
  Loading,
} from "./store";
import { categorySeed, productSeed, money, imageUrl } from "./catalog";
import {
  Home,
  Shop,
  ProductPage,
  CartPage,
  CheckoutPage,
  AccountPage,
  WishlistPage,
} from "./pages";
import { PartnerDashboard, AdminDashboard } from "./dashboards";
import { siteName, siteDescription } from "./site";
import "./styles.css";

function App() {
  const url = useLocation(),
    path = url.split("?")[0].replace(/\/+$/, "") || "/";
  const [catalog, setCatalog] = useState<any>({
      products: productSeed,
      categories: categorySeed,
      settings: {
        announcement: "A little elegance, delivered to your doorstep.",
        shippingFee: 25000,
        freeShippingThreshold: 500000,
      },
    }),
    [catalogError, setCatalogError] = useState(""),
    [catalogLoading, setCatalogLoading] = useState(true);
  const [user, setUser] = useState<any>(null),
    [authLoading, setAuthLoading] = useState(true),
    [cart, setCart] = useState<any[]>([]),
    [wishlist, setWishlist] = useState<any[]>([]),
    [auth, setAuth] = useState<string | null>(null),
    [authRole, setAuthRole] = useState("customer"),
    [drawer, setDrawer] = useState(false),
    [mobile, setMobile] = useState(false),
    [info, setInfo] = useState<string | null>(null),
    [toast, setToast] = useState("");
  const toastTimer = useRef<any>(null);
  const sessionId = useRef<string | null>(null);
  const [cartError, setCartError] = useState(""),
    [cartLoading, setCartLoading] = useState(false),
    [wishlistError, setWishlistError] = useState(""),
    [wishlistLoading, setWishlistLoading] = useState(false);
  const notify = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  };
  const loadCatalog = async () => {
    setCatalogLoading(true);
    try {
      setCatalog(await api("/api/catalog"));
      setCatalogError("");
    } catch (e: any) {
      setCatalogError(e.message);
    } finally {
      setCatalogLoading(false);
    }
  };
  const refreshCart = async () => {
    const expected = sessionId.current;
    if (!expected) return;
    setCartLoading(true);
    try {
      const rows = await api("/api/cart");
      if (sessionId.current === expected) {
        setCart(rows);
        setCartError("");
      }
    } catch (e: any) {
      if (sessionId.current === expected) setCartError(e.message);
    } finally {
      if (sessionId.current === expected) setCartLoading(false);
    }
  };
  const refreshWishlist = async () => {
    const expected = sessionId.current;
    if (!expected) return;
    setWishlistLoading(true);
    try {
      const rows = await api("/api/wishlist");
      if (sessionId.current === expected) {
        setWishlist(rows);
        setWishlistError("");
      }
    } catch (e: any) {
      if (sessionId.current === expected) setWishlistError(e.message);
    } finally {
      if (sessionId.current === expected) setWishlistLoading(false);
    }
  };
  const clearSession = () => {
    sessionId.current = null;
    setUser(null);
    setCart([]);
    setWishlist([]);
    setCartError("");
    setWishlistError("");
    setCartLoading(false);
    setWishlistLoading(false);
  };
  const refreshUser = async () => {
    const identity = await getUser();
    if (identity) {
      sessionId.current = identity.id;
      const profile = await api("/api/me");
      if (sessionId.current !== identity.id) return null;
      setUser(profile);
      await Promise.all([refreshCart(), refreshWishlist()]);
      return profile;
    }
    clearSession();
    return null;
  };
  useEffect(() => {
    loadCatalog();
    (async () => {
      try {
        const cb = await handleAuthCallback();
        if (cb?.type === "recovery") setAuth("reset");
        if (cb?.type === "invite") {
          setInviteToken(cb.token || "");
          setAuth("invite");
        }
        if (cb?.type === "confirmation")
          notify("Your email is confirmed. Welcome to Rosevara.");
        await refreshUser();
      } catch (e: any) {
        notify(e.message);
      } finally {
        setAuthLoading(false);
      }
    })();
    const unsubscribe = onAuthChange((event) => {
      if (event === "logout") clearSession();
    });
    return () => {
      unsubscribe();
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    setMobile(false);
    setDrawer(false);
    const name = catalog.settings.storeName || siteName;
    document.title =
      path === "/"
        ? "Rosevara — Women Fashion Store"
        : `${path.startsWith("/product/") ? "The collection" : path.slice(1).charAt(0).toUpperCase() + path.slice(2)} | ${name}`;
    document
      .querySelector('meta[property="og:site_name"]')
      ?.setAttribute("content", name);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", siteDescription);
  }, [url, catalog.settings.storeName]);
  const [inviteToken, setInviteToken] = useState("");
  const openAuth = (mode = "login", role = "customer") => {
    setAuthRole(role);
    setAuth(mode);
    setMobile(false);
  };
  const toggleWish = async (id: string) => {
    if (!user) {
      openAuth();
      return;
    }
    try {
      await api(`/api/wishlist/${id}`, json("POST"));
      await refreshWishlist();
    } catch (e: any) {
      notify(e.message);
    }
  };
  const addToCart = async (
    product: any,
    size: string,
    quantity = 1,
    listingId: string | null = null,
  ) => {
    if (!user) {
      openAuth();
      return false;
    }
    await api(
      "/api/cart",
      json("POST", { productId: product.id, size, quantity, listingId }),
    );
    await refreshCart();
    setDrawer(true);
    return true;
  };
  const signOut = async () => {
    try {
      await logout();
      clearSession();
      navigate("/");
      notify("You have been signed out.");
    } catch (e: any) {
      notify(e.message);
    }
  };
  const ctx = {
    catalog,
    catalogError,
    catalogLoading,
    loadCatalog,
    user,
    authLoading,
    refreshUser,
    cart,
    cartError,
    cartLoading,
    refreshCart,
    wishlist,
    wishlistError,
    wishlistLoading,
    refreshWishlist,
    toggleWish,
    addToCart,
    openAuth,
    notify,
    setInfo,
    setDrawer,
    signOut,
  };
  let page;
  if (path === "/") page = <Home />;
  else if (path === "/shop") page = <Shop />;
  else if (path.startsWith("/product/"))
    page = (
      <ProductPage
        key={url}
        id={decodeURIComponent(path.split("/")[2] || "")}
      />
    );
  else if (path === "/cart") page = <CartPage />;
  else if (path === "/checkout") page = <CheckoutPage />;
  else if (path === "/account") page = <AccountPage />;
  else if (path === "/wishlist") page = <WishlistPage />;
  else if (path === "/seller" || path === "/reseller")
    page = <PartnerDashboard mode={path.slice(1)} />;
  else if (path === "/admin") page = <AdminDashboard />;
  else
    page = (
      <div className="not-found">
        <h1>A little off the beaten path.</h1>
        <Link className="button" to="/">
          Back to Rosevara <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <StoreContext.Provider value={ctx}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        <span>{catalog.settings.announcement}</span>
        <span className="announcement-main">
          Free delivery on orders of{" "}
          {money(catalog.settings.freeShippingThreshold)}+{" "}
          <ArrowRight size={13} />
        </span>
        <span>
          Pakistan <span className="gold-dot" /> PKR
        </span>
      </div>
      <Header mobile={mobile} setMobile={setMobile} />
      <main id="main">{page}</main>
      <Footer />
      {auth && (
        <AuthModal
          mode={auth}
          setMode={setAuth}
          role={authRole}
          inviteToken={inviteToken}
          close={() => setAuth(null)}
        />
      )}
      {drawer && <BagDrawer close={() => setDrawer(false)} />}
      {info && <InfoModal title={info} close={() => setInfo(null)} />}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </StoreContext.Provider>
  );
}
function Header({ mobile, setMobile }: any) {
  const { user, cart, wishlist, openAuth, setDrawer, catalog } = useStore();
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState(false);
  const url = useLocation();
  useEffect(() => setSearch(false), [url]);
  const count = cart.reduce((n: number, x: any) => n + x.item.quantity, 0);
  const submit = (e: any) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(query)}`);
    setSearch(false);
  };
  return (
    <header className="site-header">
      <div className="main-header wrap">
        <button
          className="icon-button mobile-menu-button"
          aria-label={mobile ? "Close menu" : "Open menu"}
          aria-expanded={mobile}
          aria-controls="main-navigation"
          onClick={() => {
            setSearch(false);
            setMobile(!mobile);
          }}
        >
          {mobile ? <X /> : <Menu />}
        </button>
        <Link to="/" className="brand" aria-label="Rosevara home">
          <span className="brand-name">
            ROSEVARA<span className="brand-spark">✧</span>
          </span>
          <span className="brand-subtitle">WOMEN FASHION STORE</span>
        </Link>
        <form
          className={`header-search ${search ? "search-open" : ""}`}
          onSubmit={submit}
        >
          <Search size={18} />
          <input
            aria-label="Search products"
            placeholder="Find something beautiful…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Submit search">
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="header-actions">
          <button
            className="icon-button mobile-search"
            aria-label="Search store"
            aria-expanded={search}
            onClick={() => {
              setMobile(false);
              setSearch(!search);
            }}
          >
            <Search size={21} />
          </button>
          <button
            className="account-button"
            onClick={() => (user ? navigate("/account") : openAuth())}
          >
            <UserRound size={21} />
            <span>{user ? user.name.split(" ")[0] : "My account"}</span>
          </button>
          <Link
            to="/wishlist"
            className="icon-button counter-icon"
            aria-label={`Wishlist, ${wishlist.length} pieces`}
          >
            <Heart size={21} />
            {wishlist.length > 0 && <i>{wishlist.length}</i>}
          </Link>
          <button
            className="icon-button counter-icon"
            aria-label={`Open shopping bag, ${count} items`}
            onClick={() => setDrawer(true)}
          >
            <ShoppingBag size={21} />
            <i>{count}</i>
          </button>
        </div>
      </div>
      <nav
        id="main-navigation"
        className={`main-nav ${mobile ? "mobile-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="wrap nav-inner">
          <Link to="/" className={url === "/" ? "active" : ""}>
            Home
          </Link>
          <Link
            to="/shop?sort=new"
            className={url.includes("sort=new") ? "active" : ""}
          >
            New arrivals <span className="tiny-new">NEW</span>
          </Link>
          <Link to="/shop?category=ready-to-wear">Ready to wear</Link>
          <Link to="/shop?category=unstitched">Unstitched</Link>
          <Link to="/shop?category=formal-wear">Formal & festive</Link>
          <Link to="/shop?category=accessories">Accessories</Link>
          <Link to="/shop?sale=true" className="sale-link">
            The sale edit
          </Link>
          <span className="nav-divider" />
          <button
            className="partner-link"
            onClick={() =>
              user ? navigate("/seller") : openAuth("signup", "seller")
            }
          >
            <Store size={15} />
            Become a seller
            <ArrowUpRight size={13} />
          </button>
        </div>
      </nav>
    </header>
  );
}
export function Modal({ children, close, className = "", title }: any) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = ref.current;
    el?.querySelector<HTMLElement>(
      "button,input,select,textarea,a[href]",
    )?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const focus = el?.querySelectorAll<HTMLElement>(
          "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]",
        );
        if (!focus?.length) return;
        const first = focus[0],
          last = focus[focus.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      prior?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Rosevara dialog"}
        className={`modal ${className}`}
        tabIndex={-1}
      >
        <button
          className="modal-close icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={21} />
        </button>
        {children}
      </div>
    </div>
  );
}
function AuthModal({ mode, setMode, role, inviteToken, close }: any) {
  const { refreshUser, notify } = useStore();
  const task = useTask();
  const [message, setMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState(role);
  const titles: any = {
    login: "Welcome back.",
    signup: "Your Rosevara story starts here.",
    forgot: "A fresh start.",
    reset: "Choose a new password.",
    invite: "Welcome to Rosevara.",
  };
  const submit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    task.run(async () => {
      setMessage("");
      const email = String(f.get("email") || ""),
        password = String(f.get("password") || "");
      if (mode === "forgot") {
        await requestPasswordRecovery(email);
        setMessage("Check your inbox for a password reset link.");
        return;
      }
      if (mode === "signup") {
        const u = await signup(email, password, {
          full_name: String(f.get("name")),
          requested_role: selectedRole,
        });
        if (!u.confirmedAt) {
          setMessage(
            "Your account is created. Check your email to confirm your address, then sign in.",
          );
          return;
        }
      } else if (mode === "reset") await updateUser({ password });
      else if (mode === "invite") await acceptInvite(inviteToken, password);
      else await login(email, password);
      await refreshUser();
      close();
      notify(
        mode === "signup"
          ? "Welcome to Rosevara."
          : "You’re signed in. Make yourself at home.",
      );
    });
  };
  return (
    <Modal close={close} title={titles[mode]} className="auth-modal">
      <Flower2 className="auth-flower" size={30} strokeWidth={1} />
      <p className="eyebrow">THE WORLD OF ROSEVARA</p>
      <h2>{titles[mode]}</h2>
      <p className="muted">
        {mode === "signup"
          ? "Beautiful finds, independent sellers, and a wardrobe that feels like you."
          : mode === "login"
            ? "Sign in for saved favourites, your shopping bag, and order updates."
            : "A little help getting you back to beautiful things."}
      </p>
      <form onSubmit={submit} key={mode}>
        {mode === "signup" && (
          <Field label="Your name">
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Full name"
            />
          </Field>
        )}
        {["login", "signup", "forgot"].includes(mode) && (
          <Field label="Email address">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </Field>
        )}
        {mode !== "forgot" && (
          <Field
            label={mode === "login" ? "Password" : "Create a password"}
            hint={mode !== "login" ? "Use at least 10 characters." : null}
          >
            <input
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={mode === "login" ? 1 : 10}
              required
            />
          </Field>
        )}
        {mode === "signup" && (
          <Field label="I’d like to">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="customer">Shop beautiful finds</option>
              <option value="seller">Sell my own products</option>
              <option value="reseller">Become a reseller</option>
              <option value="seller-reseller">Sell and resell</option>
            </select>
            {selectedRole !== "customer" && (
              <small>
                Partner access starts after the store team approves your
                application.
              </small>
            )}
          </Field>
        )}
        <Alert>{task.error}</Alert>
        <Alert type="success">{message}</Alert>
        <button className="button full" disabled={task.busy}>
          {task.busy ? (
            <LoaderCircle className="spin" size={18} />
          ) : mode === "login" ? (
            "Sign in"
          ) : mode === "signup" ? (
            "Create account"
          ) : mode === "forgot" ? (
            "Send reset link"
          ) : (
            "Save password"
          )}
          <ArrowRight size={17} />
        </button>
      </form>
      {mode === "login" && (
        <button
          className="text-button forgot"
          onClick={() => {
            setMode("forgot");
            setMessage("");
            task.setError("");
          }}
        >
          Forgot your password?
        </button>
      )}
      {["login", "signup", "forgot"].includes(mode) && (
        <p className="auth-switch">
          {mode === "login" ? "New to Rosevara?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
              task.setError("");
            }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      )}
    </Modal>
  );
}
function BagDrawer({ close }: any) {
  const { user, cart, cartError, cartLoading, refreshCart, catalog, openAuth } =
      useStore(),
    task = useTask();
  const total = cart.reduce(
      (a: number, x: any) =>
        a + (x.listing?.price || x.product.price) * x.item.quantity,
      0,
    ),
    remaining = Math.max(0, catalog.settings.freeShippingThreshold - total);
  const qty = (id: string, quantity: number) =>
    task.run(async () => {
      await api(`/api/cart/${id}`, json("PATCH", { quantity }));
      await refreshCart();
    });
  return (
    <Modal close={close} className="bag-drawer" title="Your shopping bag">
      <div className="drawer-heading">
        <p className="eyebrow">A FEW BEAUTIFUL THINGS</p>
        <h2>
          Your shopping bag <small>({cart.length})</small>
        </h2>
      </div>
      <Alert>{cartError}</Alert>
      {cartLoading && !cart.length ? (
        <Loading />
      ) : !cart.length ? (
        <div className="drawer-empty">
          <ShoppingBag size={50} strokeWidth={1} />
          <h3>
            {cartError
              ? "Your bag is taking a little longer."
              : "Room for something lovely."}
          </h3>
          <p>
            {cartError
              ? "Please try loading your saved pieces again."
              : user
                ? "Your next favourite is waiting to be discovered."
                : "Sign in to save your shopping bag across visits."}
          </p>
          <button
            className="button"
            onClick={() => {
              if (cartError) {
                refreshCart();
                return;
              }
              close();
              user ? navigate("/shop") : openAuth();
            }}
          >
            {cartError
              ? "Try again"
              : user
                ? "Explore the collection"
                : "Sign in to shop"}
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="shipping-progress">
            <p>
              {remaining
                ? `You’re ${money(remaining)} away from free delivery.`
                : "A little treat: your delivery is on us."}
            </p>
            <div>
              <i
                style={{
                  transform: `scaleX(${Math.min(1, total / (catalog.settings.freeShippingThreshold || 1))})`,
                }}
              />
            </div>
          </div>
          <div className="drawer-items">
            {cart.map(({ item, product, listing }: any) => (
              <div className="bag-item" key={item.id}>
                <Link to={`/product/${product.id}`}>
                  <img
                    src={imageUrl(product.images[0], 220)}
                    alt={product.name}
                  />
                </Link>
                <div>
                  <h4>{product.name}</h4>
                  <p>Size: {item.size}</p>
                  <b>{money(listing?.price || product.price)}</b>
                  <div className="quantity-control">
                    <button
                      aria-label={`Decrease ${product.name}`}
                      disabled={task.busy}
                      onClick={() => qty(item.id, item.quantity - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase ${product.name}`}
                      disabled={task.busy}
                      onClick={() => qty(item.id, item.quantity + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <button
                  className="remove-item"
                  aria-label={`Remove ${product.name}`}
                  disabled={task.busy}
                  onClick={() => qty(item.id, 0)}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
          <Alert>{task.error}</Alert>
          <div className="bag-total">
            <div>
              <span>Subtotal</span>
              <b>{money(total)}</b>
            </div>
            <p>Delivery is calculated at checkout.</p>
            <Link to="/checkout" className="button full" onClick={close}>
              Continue to checkout
              <ArrowRight size={17} />
            </Link>
            <Link to="/cart" className="text-link" onClick={close}>
              View shopping bag
            </Link>
          </div>
        </>
      )}
    </Modal>
  );
}
function InfoModal({ title, close }: any) {
  const { catalog, openAuth } = useStore();
  return (
    <Modal title={title} close={close} className="info-modal">
      <p className="eyebrow">HERE TO HELP</p>
      <h2>{title}</h2>
      {title === "Delivery & returns" ? (
        <>
          <p>
            We currently deliver within Pakistan. Delivery is{" "}
            {money(catalog.settings.shippingFee)}, with free delivery on orders
            of {money(catalog.settings.freeShippingThreshold)} or more.
          </p>
          <p>
            Every order is reviewed by the Rosevara team before supplier
            ordering. You can follow confirmation, processing, shipping, and
            delivery in your account.
          </p>
          <p>
            To request a cancellation or return, contact the store team with
            your order number. Returns are reviewed individually; delivery dates
            and return eligibility are confirmed by the team.
          </p>
        </>
      ) : title === "Our story" ? (
        <>
          <p>
            Rosevara brings independent fashion sellers and thoughtful shoppers
            together. Our edit celebrates elegant eastern wear, everyday
            favourites, and the small details that make a look your own.
          </p>
          <p>
            Every seller product is reviewed before it reaches the storefront.
            Every order begins with our team, with care at each step.
          </p>
        </>
      ) : title === "Sell with Rosevara" ? (
        <>
          <p>
            Choose a seller, reseller, or combined account. Sellers upload their
            own products for approval. Resellers choose approved products, add a
            margin, and share their personal product links.
          </p>
          <p>
            There is no subscription. The platform commission is deducted from
            the base price; reseller profit is the amount above the base price.
            Delivered and paid orders become available for payout.
          </p>
          <button
            className="button"
            onClick={() => {
              close();
              openAuth("signup", "seller");
            }}
          >
            Join our community
            <ArrowRight size={17} />
          </button>
        </>
      ) : title === "Payment options" ? (
        <>
          <p>
            Pay with Cash on Delivery or an available manual transfer option:
            JazzCash, Easypaisa, or bank transfer.
          </p>
          <p>
            Transfer instructions appear at checkout once configured by the
            store. Add your transaction reference after payment; the admin team
            verifies it manually. Payment and order status are tracked
            separately.
          </p>
        </>
      ) : (
        <>
          <p>
            For help with a product, payment, delivery, or return, include your
            order number when contacting the Rosevara team.
          </p>
          {catalog.settings.supportEmail ? (
            <a
              className="text-link"
              href={`mailto:${catalog.settings.supportEmail}`}
            >
              <Mail size={17} />
              {catalog.settings.supportEmail}
            </a>
          ) : (
            <p>
              Support contact details are being prepared. Existing customers can
              find the latest order updates in their account.
            </p>
          )}
        </>
      )}
    </Modal>
  );
}
function Footer() {
  const { setInfo, openAuth, user } = useStore();
  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-name">
              ROSEVARA<span className="brand-spark">✧</span>
            </span>
            <span className="brand-subtitle">WOMEN FASHION STORE</span>
          </Link>
          <p>
            A little elegance. A lot of you.
            <br />
            Discover fashion that feels like home.
          </p>
          <span className="footer-origin">
            <Flower2 size={16} />
            Thoughtfully curated in Pakistan
          </span>
        </div>
        <div>
          <h4>Explore Rosevara</h4>
          <Link to="/shop?sort=new">New arrivals</Link>
          <Link to="/shop">The collection</Link>
          <Link to="/shop?sale=true">The sale edit</Link>
          <button onClick={() => setInfo("Our story")}>Our story</button>
        </div>
        <div>
          <h4>Here to help</h4>
          <button onClick={() => setInfo("Delivery & returns")}>
            Delivery & returns
          </button>
          <button onClick={() => setInfo("Payment options")}>
            Payment options
          </button>
          <Link to="/account">Track your order</Link>
          <button onClick={() => setInfo("Contact us")}>Contact us</button>
        </div>
        <div className="footer-partner">
          <h4>Grow with us</h4>
          <p>
            Your products. Your passion.
            <br />A beautiful new beginning.
          </p>
          <button
            className="text-link"
            onClick={() =>
              user ? navigate("/seller") : openAuth("signup", "seller")
            }
          >
            Become a seller
            <ArrowUpRight size={16} />
          </button>
          <button
            className="text-link"
            onClick={() =>
              user ? navigate("/reseller") : openAuth("signup", "reseller")
            }
          >
            Become a reseller
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>© {new Date().getFullYear()} Rosevara. All rights reserved.</span>
        <div className="payment-logos">
          <span>Cash on delivery</span>
          <b>JazzCash</b>
          <b>easypaisa</b>
          <span>BANK TRANSFER</span>
        </div>
        <Link to="/admin" className="admin-footer">
          Store administration
        </Link>
      </div>
    </footer>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
