import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Banknote,
  Store,
  Flower2,
  Search,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
  Package,
  Check,
  CheckCircle2,
  ArrowLeft,
  Star,
  LockKeyhole,
  UserRound,
  LogOut,
  LayoutDashboard,
  Wallet,
  Copy,
  RefreshCw,
  MapPin,
} from "lucide-react";
import {
  useStore,
  useLocation,
  navigate,
  Link,
  api,
  json,
  useResource,
  useTask,
  Alert,
  Empty,
  Loading,
  Status,
  Field,
  Product,
} from "./store";
import { money, imageUrl, statuses } from "./catalog";

export function ProductCard({ product: p }: { product: Product }) {
  const { wishlist, toggleWish } = useStore();
  const saved = wishlist.some((x: any) => x.product.id === p.id),
    discount = p.comparePrice
      ? Math.round((1 - p.price / p.comparePrice) * 100)
      : 0;
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${p.id}`} aria-label={`View ${p.name}`}>
          <img src={imageUrl(p.images[0], 650)} alt={p.name} loading="lazy" />
        </Link>
        <div className="product-tags">
          {discount > 0 ? (
            <span className="discount-tag">−{discount}%</span>
          ) : (
            p.badge && <span className="new-tag">NEW</span>
          )}
        </div>
        <button
          className={`wish-button ${saved ? "saved" : ""}`}
          aria-label={
            saved
              ? `Remove ${p.name} from wishlist`
              : `Save ${p.name} to wishlist`
          }
          onClick={() => toggleWish(p.id)}
        >
          <Heart
            size={18}
            fill={saved ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
        <Link to={`/product/${p.id}`} className="quick-view">
          Discover this piece <ArrowUpRight size={15} />
        </Link>
        {p.stock === 0 && <span className="coming-soon-tag">COMING SOON</span>}
      </div>
      <div className="product-meta">
        <span className="product-kicker">
          {p.badge || "THE ROSEVARA COLLECTION"}
        </span>
        <Link to={`/product/${p.id}`} className="product-name">
          {p.name}
        </Link>
        <div className="product-price">
          <strong>{money(p.price)}</strong>
          {p.comparePrice && <del>{money(p.comparePrice)}</del>}
          <Link
            to={`/product/${p.id}`}
            aria-label={`Choose options for ${p.name}`}
            className="product-bag"
          >
            <ShoppingBag size={17} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="product-swatches" aria-label="Colour as shown">
          <i
            style={{
              background:
                p.categoryId === "formal-wear"
                  ? "#763d4b"
                  : p.id.includes("sage")
                    ? "#939b82"
                    : p.id.includes("ivory")
                      ? "#e9ddcb"
                      : "#c9979d",
            }}
          />
          <span>{p.sizes.join(" · ")}</span>
        </div>
      </div>
    </article>
  );
}
export function CatalogNotice() {
  const { catalogError, loadCatalog } = useStore();
  return catalogError ? (
    <div className="catalog-notice wrap" role="alert">
      Live stock is temporarily unavailable. You can browse the preview
      collection.{" "}
      <button onClick={loadCatalog}>
        Try again <RefreshCw size={13} />
      </button>
    </div>
  ) : null;
}
export function Home() {
  const { catalog, openAuth, user, setInfo } = useStore(),
    [slide, setSlide] = useState(0),
    [tab, setTab] = useState("The Rosevara edit");
  const slides = [
    {
      eyebrow: "A NEW SEASON. A BEAUTIFUL YOU.",
      line1: "Everyday elegance.",
      line2: "Beautifully yours.",
      description:
        "Thoughtfully chosen styles for every version of you.\nFrom everyday moments to unforgettable occasions.",
      url: "/shop",
      button: "Explore the collection",
      image: "/img/hero.png",
    },
    {
      eyebrow: "THE OCCASION EDIT",
      line1: "For the moments",
      line2: "you’ll remember.",
      description:
        "Soft shimmer, delicate details, and a little celebration.\nDiscover something as special as the occasion.",
      url: "/shop?category=formal-wear",
      button: "Discover occasion wear",
      image: "/img/hero.png",
    },
    {
      eyebrow: "YOUR EVERYDAY, REIMAGINED",
      line1: "A softer kind",
      line2: "of statement.",
      description:
        "Easy silhouettes. Beautiful fabrics. Thoughtful details.\nMeet the pieces you’ll reach for again and again.",
      url: "/shop?category=ready-to-wear",
      button: "Find your everyday",
      image: "/img/hero.png",
    },
  ];
  const hero = slides[slide];
  const products = catalog.products
    .filter((p: Product) =>
      tab === "Under Rs. 5,000"
        ? p.price < 500000
        : tab === "New arrivals"
          ? true
          : p.featured,
    )
    .slice(0, 4);
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={imageUrl(hero.image, 1800)}
          alt="Rose embroidered suit in a sunlit ivory courtyard"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="wrap hero-inner" key={slide}>
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> {hero.eyebrow}
            </p>
            <h1>
              {hero.line1}
              <br />
              <em>{hero.line2}</em>
            </h1>
            <p className="hero-description">{hero.description}</p>
            <Link className="button" to={hero.url}>
              {hero.button}
              <ArrowRight size={17} />
            </Link>
            <div className="hero-caption">
              <span className="fine-line" />
              <span>Made for your kind of beautiful.</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom wrap">
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={i === slide ? "active" : ""}
                aria-label={`Show collection banner ${i + 1}`}
                aria-pressed={i === slide}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
          <span className="hero-edition">THE ROSEVARA COLLECTION / 2026</span>
          <div className="hero-arrows">
            <button
              aria-label="Previous banner"
              onClick={() => setSlide((slide + 2) % 3)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              0{slide + 1}
              <i>/</i>03
            </span>
            <button
              aria-label="Next banner"
              onClick={() => setSlide((slide + 1) % 3)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
        <div className="hero-side-note">A LITTLE ELEGANCE, EVERY DAY</div>
      </section>
      <div className="promise-strip">
        <div className="wrap promise-grid">
          <div>
            <Truck />
            <p>
              <b>Delivered with care</b>
              <span>Across Pakistan, to your doorstep</span>
            </p>
          </div>
          <div>
            <ShieldCheck />
            <p>
              <b>Thoughtfully reviewed</b>
              <span>Every product, approved by our team</span>
            </p>
          </div>
          <div>
            <Banknote />
            <p>
              <b>Your way to pay</b>
              <span>Cash on delivery & local payments</span>
            </p>
          </div>
          <div>
            <Store />
            <p>
              <b>Independent finds</b>
              <span>Discover sellers with a point of view</span>
            </p>
          </div>
        </div>
      </div>
      <CatalogNotice />
      <section className="categories-section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A STYLE FOR EVERY STORY</p>
            <h2>
              Find your kind of <em>beautiful.</em>
            </h2>
          </div>
          <Link to="/shop" className="text-link">
            Explore all categories
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {catalog.categories.map((c: any) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="category-card"
            >
              <div>
                <img src={imageUrl(c.image, 400)} alt={c.name} loading="lazy" />
                <span>
                  <ArrowUpRight size={19} />
                </span>
              </div>
              <h3>{c.name}</h3>
              <p>
                Explore the edit <ArrowRight size={12} />
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="featured-section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CURATED WITH LOVE, JUST FOR YOU</p>
              <h2>
                Pieces to fall in <em>love with.</em>
              </h2>
            </div>
            <Link to="/shop" className="text-link">
              View the collection
              <ArrowRight size={16} />
            </Link>
          </div>
          <div
            className="collection-tabs"
            role="tablist"
            aria-label="Featured collections"
          >
            {["The Rosevara edit", "New arrivals", "Under Rs. 5,000"].map(
              (t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={t === tab}
                  className={t === tab ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ),
            )}
            <span>Little details. Lasting impressions.</span>
          </div>
          <div className="product-grid">
            {products.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {!products.length && (
            <Empty icon={Flower2} title="Something lovely is on its way.">
              This edit is being prepared. Explore our other collections.
            </Empty>
          )}
          <p className="preview-note">
            A first look at our launch collection. Preview photography and
            prices are illustrative; availability is confirmed before sale.
          </p>
        </div>
      </section>
      <section className="editorial-grid wrap">
        <Link to="/shop?category=formal-wear" className="occasion-banner">
          <img
            src={imageUrl("/img/burgundy.jpg", 800)}
            alt="Burgundy embroidered occasion wear"
            loading="lazy"
          />
          <div>
            <p className="eyebrow">THE OCCASION EDIT</p>
            <h2>
              Some moments
              <br />
              deserve a little
              <br />
              <em>extra beautiful.</em>
            </h2>
            <span className="text-link">
              Dress for the occasion
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>
        <div className="community-banner">
          <Flower2 className="community-flower" size={190} strokeWidth={0.4} />
          <div>
            <p className="eyebrow">LET’S GROW SOMETHING BEAUTIFUL</p>
            <h2>
              Your passion.
              <br />
              Our marketplace.
              <br />
              <em>Endless possibilities.</em>
            </h2>
            <p>
              Bring your collection to Rosevara, or share
              <br />
              the styles you love as a reseller.
            </p>
            <button
              className="button button-outline"
              onClick={() =>
                user ? navigate("/seller") : openAuth("signup", "seller")
              }
            >
              Become a partner
              <ArrowUpRight size={17} />
            </button>
            <button
              className="community-learn text-button"
              onClick={() => setInfo("Sell with Rosevara")}
            >
              A little more about partnering with us
            </button>
          </div>
        </div>
      </section>
      <section className="brand-note wrap">
        <Flower2 size={26} strokeWidth={1} />
        <p>
          More than what you wear.
          <br />
          <em>It’s how you feel.</em>
        </p>
        <span>Considered styles. Independent voices. A little Rosevara.</span>
      </section>
    </>
  );
}
export function Shop() {
  const { catalog } = useStore(),
    url = useLocation(),
    params = new URLSearchParams(url.split("?")[1] || "");
  const category = params.get("category") || "",
    q = params.get("q") || "",
    sort = params.get("sort") || "featured",
    sale = params.get("sale") === "true";
  const [mobileFilters, setMobileFilters] = useState(false),
    [maxPrice, setMaxPrice] = useState(""),
    [inStock, setInStock] = useState(false);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    navigate(`/shop?${next.toString()}`);
  };
  const products = catalog.products
    .filter(
      (p: Product) =>
        (!category || p.categoryId === category) &&
        (!q ||
          `${p.name} ${p.description}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!sale || (p.comparePrice && p.comparePrice > p.price)) &&
        (!maxPrice || p.price <= Number(maxPrice) * 100) &&
        (!inStock || p.stock > 0),
    )
    .sort((a: Product, b: Product) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "featured"
              ? Number(b.featured) - Number(a.featured)
              : 0,
    );
  const title = q
    ? `A little search for “${q}”`
    : category
      ? catalog.categories.find((c: any) => c.id === category)?.name ||
        "The collection"
      : sale
        ? "The sale edit"
        : sort === "new"
          ? "Fresh arrivals. Beautiful beginnings."
          : "The Rosevara collection";
  return (
    <>
      <div className="page-intro">
        <div className="wrap">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <span>The collection</span>
          </div>
          <p className="eyebrow">YOUR NEXT FAVOURITE IS HERE</p>
          <h1>{title}</h1>
          <p>
            Considered pieces. Beautiful details. Discover something that feels
            like you.
          </p>
        </div>
      </div>
      <CatalogNotice />
      <div className="wrap shop-layout">
        <aside className={`shop-filters ${mobileFilters ? "show" : ""}`}>
          <div className="filter-heading">
            <h3>Refine your edit</h3>
            <button
              className="icon-button"
              aria-label="Close filters"
              onClick={() => setMobileFilters(false)}
            >
              <X size={18} />
            </button>
          </div>
          <h4>Collections</h4>
          <button
            className={`filter-category ${!category ? "active" : ""}`}
            onClick={() => update("category", "")}
          >
            All pieces <span>{catalog.products.length}</span>
          </button>
          {catalog.categories.map((c: any) => (
            <button
              key={c.id}
              className={`filter-category ${category === c.id ? "active" : ""}`}
              onClick={() => update("category", c.id)}
            >
              {c.name}
              <span>
                {
                  catalog.products.filter((p: Product) => p.categoryId === c.id)
                    .length
                }
              </span>
            </button>
          ))}
          <div className="filter-block">
            <h4>Price range</h4>
            <Field label="Maximum price (PKR)">
              <input
                type="number"
                min="0"
                placeholder="Any price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Field>
          </div>
          <div className="filter-block">
            <h4>A few preferences</h4>
            <label className="check-label">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              Available now
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={sale}
                onChange={(e) => update("sale", e.target.checked ? "true" : "")}
              />
              The sale edit
            </label>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setMaxPrice("");
              setInStock(false);
              navigate("/shop");
            }}
          >
            Clear all filters
          </button>
          <button
            className="button mobile-filter-apply"
            onClick={() => setMobileFilters(false)}
          >
            Show {products.length} pieces
          </button>
        </aside>
        <section className="shop-results">
          <div className="results-bar">
            <span>
              {products.length} beautiful{" "}
              {products.length === 1 ? "piece" : "pieces"}
            </span>
            <button
              className="filter-mobile-button text-button"
              onClick={() => setMobileFilters(!mobileFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <label>
              Sort by{" "}
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
              >
                <option value="featured">Our favourites</option>
                <option value="new">Newest arrivals</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
          {products.length ? (
            <div className="product-grid shop-product-grid">
              {products.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <Empty icon={Search} title="Still looking for your kind of lovely.">
              Try another collection or a wider price range.
              <button
                className="text-link"
                onClick={() => {
                  setMaxPrice("");
                  setInStock(false);
                  navigate("/shop");
                }}
              >
                Explore all pieces
                <ArrowRight size={15} />
              </button>
            </Empty>
          )}
          <p className="preview-note">
            Preview collection pieces are marked “Coming soon” until final
            details and stock are confirmed.
          </p>
        </section>
      </div>
    </>
  );
}
export function ProductPage({ id }: any) {
  const { data, loading, error, reload } = useResource(
      `/api/products/${encodeURIComponent(id)}${location.search}`,
    ),
    { catalog, addToCart, toggleWish, wishlist, setInfo } = useStore();
  const [size, setSize] = useState(""),
    [quantity, setQuantity] = useState(1),
    [photo, setPhoto] = useState(0),
    task = useTask();
  if (loading)
    return (
      <div className="wrap page-space">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="wrap page-space">
        <Alert>{error}</Alert>
        <button className="button" onClick={reload}>
          Try again
        </button>
      </div>
    );
  if (!data) return null;
  const p = data.product,
    listing = data.listing,
    price = listing?.price || p.price,
    category = catalog.categories.find((c: any) => c.id === p.categoryId),
    saved = wishlist.some((x: any) => x.product.id === id);
  return (
    <div className="wrap product-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop">The collection</Link>
        <ChevronRight size={12} />
        <span>{p.name}</span>
      </div>
      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="detail-photo">
            <img src={imageUrl(p.images[photo], 1100)} alt={p.name} />
            {p.stock === 0 && (
              <span className="gallery-label">COMING SOON</span>
            )}
          </div>
          {p.images.length > 1 && (
            <div className="photo-thumbs">
              {p.images.map((src: string, i: number) => (
                <button
                  key={src}
                  className={photo === i ? "active" : ""}
                  aria-label={`Photograph ${i + 1}`}
                  onClick={() => setPhoto(i)}
                >
                  <img
                    src={imageUrl(src, 150)}
                    alt={`${p.name}, view ${i + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {category?.name || "THE ROSEVARA COLLECTION"}
          </p>
          <h1>{p.name}</h1>
          {listing && <p className="listing-by">Selected by {listing.shop}</p>}
          <div className="detail-price">
            <strong>{money(price)}</strong>
            {!listing && p.comparePrice && <del>{money(p.comparePrice)}</del>}
          </div>
          <p className="detail-description">{p.description}</p>
          <div className="detail-size">
            <div>
              <b>Select your size</b>
              <span>{size || "Choose a size"}</span>
            </div>
            <div className="size-options">
              {p.sizes.map((s: string) => (
                <button
                  key={s}
                  className={size === s ? "active" : ""}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="detail-buy">
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                disabled={quantity === 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= Math.min(10, p.stock || 1)}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              className="button"
              disabled={task.busy || p.stock < 1}
              onClick={() =>
                task.run(async () => {
                  if (!size)
                    throw new Error(
                      "Choose your size before adding this piece.",
                    );
                  await addToCart(p, size, quantity, listing?.id || null);
                })
              }
            >
              <ShoppingBag size={18} />
              {p.stock < 1
                ? "Coming soon"
                : task.busy
                  ? "Adding…"
                  : "Add to shopping bag"}
            </button>
            <button
              className={`button button-outline detail-wish ${saved ? "saved" : ""}`}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              onClick={() => toggleWish(id)}
            >
              <Heart size={20} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <Alert>{task.error}</Alert>
          <p className="stock-note">
            {p.stock > 0
              ? `${p.stock} available · Stock is reserved when your order is placed.`
              : "A first look at this piece. Save it to your wishlist while availability is confirmed."}
          </p>
          <div className="detail-promises">
            <span>
              <ShieldCheck size={17} />
              Reviewed by our team
            </span>
            <span>
              <Banknote size={17} />
              Cash on delivery available
            </span>
          </div>
          <details open>
            <summary>The details</summary>
            <p>
              Colour and styling are shown in the product photographs. Please
              review the description and selected size before ordering. Every
              order reaches our team for confirmation before supplier ordering.
            </p>
          </details>
          <details>
            <summary>Delivery & returns</summary>
            <p>
              Delivery across Pakistan is {money(catalog.settings.shippingFee)}.
              Orders of {money(catalog.settings.freeShippingThreshold)} or more
              qualify for free delivery.{" "}
              <button
                className="text-button"
                onClick={() => setInfo("Delivery & returns")}
              >
                Read more
              </button>
            </p>
          </details>
          <details>
            <summary>Reviews ({data.reviews.length})</summary>
            {data.reviews.length ? (
              data.reviews.map((r: any) => (
                <div className="review" key={r.id}>
                  <b>{r.name.split(" ")[0]}</b>
                  <span className="review-stars">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                  <p>{r.comment}</p>
                </div>
              ))
            ) : (
              <p>
                No reviews yet. Verified customers can share their thoughts once
                their order is delivered.
              </p>
            )}
          </details>
        </div>
      </div>
      <div className="related-products">
        <div className="section-heading">
          <h2>
            A little more to <em>love.</em>
          </h2>
          <Link to="/shop" className="text-link">
            Explore the collection
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="product-grid">
          {catalog.products
            .filter((x: Product) => x.id !== p.id)
            .slice(0, 4)
            .map((x: Product) => (
              <ProductCard product={x} key={x.id} />
            ))}
        </div>
      </div>
    </div>
  );
}
export function AccessPrompt({
  title = "Your own little corner of Rosevara.",
  partner = false,
}: any) {
  const { openAuth, authLoading } = useStore();
  if (authLoading) return <Loading />;
  return (
    <Empty icon={partner ? Store : UserRound} title={title}>
      Sign in to manage your account and pick up where you left off.
      <button className="button" onClick={() => openAuth()}>
        Sign in
        <ArrowRight size={17} />
      </button>
    </Empty>
  );
}
export function CartPage() {
  const {
      user,
      cart,
      cartError,
      cartLoading,
      refreshCart,
      catalog,
      loadCatalog,
    } = useStore(),
    task = useTask();
  useEffect(() => {
    if (user) {
      refreshCart();
      loadCatalog();
    }
  }, [user?.id]);
  const subtotal = cart.reduce(
      (a: number, x: any) =>
        a + (x.listing?.price || x.product.price) * x.item.quantity,
      0,
    ),
    shipping =
      subtotal >= catalog.settings.freeShippingThreshold
        ? 0
        : catalog.settings.shippingFee;
  const qty = (id: string, quantity: number) =>
    task.run(async () => {
      await api(`/api/cart/${id}`, json("PATCH", { quantity }));
      await refreshCart();
    });
  if (user && cartLoading && !cart.length)
    return (
      <div className="wrap page-space">
        <Loading />
      </div>
    );
  if (user && cartError && !cart.length)
    return (
      <div className="wrap page-space">
        <Alert>{cartError}</Alert>
        <button className="button" onClick={refreshCart}>
          Reload your shopping bag
          <RefreshCw size={16} />
        </button>
      </div>
    );
  return (
    <div className="wrap page-space">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <span>Your shopping bag</span>
      </div>
      <p className="eyebrow">YOUR BEAUTIFUL FINDS</p>
      <h1 className="page-title">
        A bag full of <em>lovely.</em>
      </h1>
      <Alert>{cartError}</Alert>
      {!user ? (
        <AccessPrompt />
      ) : !cart.length ? (
        <Empty
          icon={ShoppingBag}
          title="Room for something beautiful."
          action={
            <Link to="/shop" className="button">
              Explore the collection
              <ArrowRight size={17} />
            </Link>
          }
        >
          Your bag is empty. Find a piece that feels like you.
        </Empty>
      ) : (
        <div className="cart-layout">
          <div>
            <Alert>{task.error}</Alert>
            {cart.map(({ item, product, listing }: any) => (
              <div className="cart-row" key={item.id}>
                <Link to={`/product/${product.id}`}>
                  <img
                    src={imageUrl(product.images[0], 240)}
                    alt={product.name}
                  />
                </Link>
                <div className="cart-row-info">
                  <Link to={`/product/${product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p>
                    Size {item.size} · {money(listing?.price || product.price)}{" "}
                    each
                  </p>
                  {(product.stock < item.quantity ||
                    product.status !== "approved") && (
                    <p className="error-text">
                      This piece is no longer available in the selected
                      quantity.
                    </p>
                  )}
                  <button
                    className="text-button"
                    disabled={task.busy}
                    onClick={() => qty(item.id, 0)}
                  >
                    Remove
                  </button>
                </div>
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
                <b>
                  {money((listing?.price || product.price) * item.quantity)}
                </b>
              </div>
            ))}
            <Link to="/shop" className="text-link">
              <ArrowLeft size={16} />A little more browsing
            </Link>
          </div>
          <div className="order-summary">
            <p className="eyebrow">THE BEAUTIFUL DETAILS</p>
            <h2>Order summary</h2>
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div>
              <span>Delivery</span>
              <span>{shipping ? money(shipping) : "Complimentary"}</span>
            </div>
            <div className="summary-total">
              <b>Total</b>
              <strong>{money(subtotal + shipping)}</strong>
            </div>
            <Link className="button full" to="/checkout">
              Continue to checkout
              <ArrowRight size={17} />
            </Link>
            <p className="secure-note">
              <LockKeyhole size={14} />
              Your order is reviewed before fulfillment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
export function CheckoutPage() {
  const {
      user,
      cart,
      cartError,
      cartLoading,
      refreshCart,
      catalog,
      loadCatalog,
      catalogLoading,
      catalogError,
    } = useStore(),
    task = useTask(),
    [payment, setPayment] = useState("COD"),
    [order, setOrder] = useState<any>(null);
  const key = useRef(crypto.randomUUID());
  useEffect(() => {
    if (user) {
      refreshCart();
      loadCatalog();
    }
  }, [user?.id]);
  const subtotal = cart.reduce(
      (a: number, x: any) =>
        a + (x.listing?.price || x.product.price) * x.item.quantity,
      0,
    ),
    shipping =
      subtotal >= catalog.settings.freeShippingThreshold
        ? 0
        : catalog.settings.shippingFee;
  const paymentData: any = {
    COD: {
      label: "Cash on Delivery",
      description: "Pay when your order arrives.",
      enabled: true,
    },
    JazzCash: {
      label: "JazzCash",
      description: catalog.settings.jazzcash,
      enabled: !!catalog.settings.jazzcash,
    },
    Easypaisa: {
      label: "Easypaisa",
      description: catalog.settings.easypaisa,
      enabled: !!catalog.settings.easypaisa,
    },
    "Bank transfer": {
      label: "Bank transfer",
      description: catalog.settings.bankTransfer,
      enabled: !!catalog.settings.bankTransfer,
    },
  };
  const submit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    task.run(async () => {
      const placed = await api(
        "/api/orders",
        json("POST", {
          address: {
            name: f.get("name"),
            phone: f.get("phone"),
            address: f.get("address"),
            city: f.get("city"),
            postal: f.get("postal"),
          },
          paymentMethod: payment,
          paymentReference: f.get("reference") || "",
          expectedTotal: subtotal + shipping,
          idempotencyKey: key.current,
        }),
      );
      setOrder(placed);
      await refreshCart();
    });
  };
  if (order)
    return (
      <div className="wrap page-space">
        <div className="order-success">
          <div className="success-icon">
            <Check size={32} />
          </div>
          <p className="eyebrow">A LITTLE SOMETHING TO LOOK FORWARD TO</p>
          <h1>Your order is with our team.</h1>
          <p>
            Thank you, {order.address.name}. Order <b>{order.id}</b> is pending
            admin review. We confirm the details before manually placing your
            supplier order.
          </p>
          <div className="success-receipt">
            <span>
              Total <b>{money(order.total)}</b>
            </span>
            <span>
              Payment{" "}
              <b>
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </b>
            </span>
            <span>
              Status <Status>{order.status}</Status>
            </span>
          </div>
          <Link to="/account" className="button">
            Follow your order
            <ArrowRight size={17} />
          </Link>
          <Link to="/shop" className="text-link">
            Continue exploring
          </Link>
        </div>
      </div>
    );
  if (!user)
    return (
      <div className="wrap page-space">
        <AccessPrompt title="A little closer to your favourites." />
      </div>
    );
  if (cartLoading && !cart.length)
    return (
      <div className="wrap page-space">
        <Loading />
      </div>
    );
  if (cartError && !cart.length)
    return (
      <div className="wrap page-space">
        <Alert>{cartError}</Alert>
        <button className="button" onClick={refreshCart}>
          Reload your shopping bag
          <RefreshCw size={16} />
        </button>
      </div>
    );
  if (!cart.length)
    return (
      <div className="wrap page-space">
        <Empty
          icon={ShoppingBag}
          title="Your shopping bag is waiting."
          action={
            <Link to="/shop" className="button">
              Explore the collection
              <ArrowRight size={17} />
            </Link>
          }
        >
          Add a few beautiful pieces before checking out.
        </Empty>
      </div>
    );
  return (
    <div className="wrap page-space">
      <div className="breadcrumb">
        <Link to="/cart">Shopping bag</Link>
        <ChevronRight size={12} />
        <span>Checkout</span>
      </div>
      <p className="eyebrow">ALMOST YOURS</p>
      <h1 className="page-title">
        The finishing <em>touches.</em>
      </h1>
      <Alert>{cartError || catalogError}</Alert>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-form">
          <section className="form-panel">
            <h2>
              <span>01</span>Where shall we send your order?
            </h2>
            <div className="form-grid">
              <Field label="Full name">
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  defaultValue={user.name}
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone number">
                <input
                  name="phone"
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  pattern="(\+92|0)[0-9\s\-]{9,14}"
                  required
                  autoComplete="tel"
                />
              </Field>
              <div className="span-two">
                <Field label="Street address">
                  <textarea
                    name="address"
                    required
                    minLength={10}
                    maxLength={500}
                    autoComplete="street-address"
                    placeholder="House, street, area"
                    rows={3}
                  />
                </Field>
              </div>
              <Field label="City">
                <input
                  name="city"
                  required
                  minLength={2}
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="Postal code (optional)">
                <input
                  name="postal"
                  maxLength={20}
                  autoComplete="postal-code"
                />
              </Field>
            </div>
            <p className="muted small">
              <MapPin size={14} />
              We currently deliver within Pakistan.
            </p>
          </section>
          <section className="form-panel">
            <h2>
              <span>02</span>Your way to pay
            </h2>
            <div className="payment-options">
              {Object.entries(paymentData).map(([value, p]: any) => (
                <label
                  key={value}
                  className={`payment-option ${payment === value ? "selected" : ""} ${!p.enabled ? "unavailable" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={payment === value}
                    disabled={!p.enabled}
                    onChange={() => setPayment(value)}
                  />
                  <div>
                    <b>{p.label}</b>
                    <small>
                      {value === "COD"
                        ? "Pay when your order arrives."
                        : p.enabled
                          ? "Manual transfer · verified by our team"
                          : "Available once store details are added"}
                    </small>
                  </div>
                  {value === "COD" ? (
                    <Banknote size={21} />
                  ) : (
                    <Wallet size={21} />
                  )}
                </label>
              ))}
            </div>
            {payment !== "COD" && (
              <div className="transfer-instructions">
                <h4>Transfer instructions</h4>
                <p>{paymentData[payment].description}</p>
                <Field
                  label="Transaction reference"
                  hint="Complete your transfer, then add the reference. Our team verifies it manually."
                >
                  <input
                    name="reference"
                    required
                    minLength={3}
                    maxLength={200}
                  />
                </Field>
              </div>
            )}
          </section>
        </div>
        <aside className="order-summary checkout-summary">
          <p className="eyebrow">YOUR CAREFULLY CHOSEN FINDS</p>
          <h2>In your bag</h2>
          {cart.map(({ item, product, listing }: any) => (
            <div className="checkout-item" key={item.id}>
              <img src={imageUrl(product.images[0], 150)} alt={product.name} />
              <p>
                <b>{product.name}</b>
                <span>
                  Size {item.size} · Qty {item.quantity}
                </span>
              </p>
              <strong>
                {money((listing?.price || product.price) * item.quantity)}
              </strong>
            </div>
          ))}
          <div>
            <span>Subtotal</span>
            <b>{money(subtotal)}</b>
          </div>
          <div>
            <span>Delivery</span>
            <span>{shipping ? money(shipping) : "Complimentary"}</span>
          </div>
          <div className="summary-total">
            <b>Total</b>
            <strong>{money(subtotal + shipping)}</strong>
          </div>
          <Alert>{task.error}</Alert>
          <p className="checkout-consent">
            Your order first reaches Rosevara for review and manual supplier
            ordering. A transfer reference does not confirm payment until our
            team verifies it.
          </p>
          <button
            className="button full"
            disabled={task.busy || cartLoading || catalogLoading}
          >
            {task.busy ? "Placing your order…" : "Place order"}
            <ArrowRight size={17} />
          </button>
          <Link to="/cart" className="text-link">
            Back to your bag
          </Link>
        </aside>
      </form>
    </div>
  );
}
export function WishlistPage() {
  const { user, wishlist, wishlistError, wishlistLoading, refreshWishlist } =
    useStore();
  useEffect(() => {
    if (user) refreshWishlist();
  }, [user?.id]);
  return (
    <div className="wrap page-space">
      <p className="eyebrow">SAVED FOR A LITTLE LATER</p>
      <h1 className="page-title">
        Your beautiful <em>favourites.</em>
      </h1>
      <Alert>{wishlistError}</Alert>
      {!user ? (
        <AccessPrompt />
      ) : wishlistLoading && !wishlist.length ? (
        <Loading />
      ) : wishlistError && !wishlist.length ? (
        <button className="button" onClick={refreshWishlist}>
          Reload your favourites
          <RefreshCw size={16} />
        </button>
      ) : !wishlist.length ? (
        <Empty
          icon={Heart}
          title="Keep a little lovely close."
          action={
            <Link to="/shop" className="button">
              Find your favourites
              <ArrowRight size={17} />
            </Link>
          }
        >
          Tap the heart on a piece to save it here.
        </Empty>
      ) : (
        <div className="product-grid">
          {wishlist.map((x: any) => (
            <ProductCard key={x.product.id} product={x.product} />
          ))}
        </div>
      )}
    </div>
  );
}
export function AccountPage() {
  const { user, authLoading, signOut, refreshUser, notify } = useStore(),
    [tab, setTab] = useState("orders"),
    orders = useResource<any[]>("/api/orders", !!user),
    task = useTask();
  if (!user)
    return (
      <div className="wrap page-space">
        <AccessPrompt />
      </div>
    );
  const partner = ["seller", "reseller", "seller-reseller", "admin"].includes(
    user.role,
  );
  return (
    <div className="wrap page-space">
      <p className="eyebrow">YOUR LITTLE CORNER OF ROSEVARA</p>
      <h1 className="page-title">
        Hello, <em>{user.name.split(" ")[0]}.</em>
      </h1>
      <div className="account-layout">
        <aside className="account-nav">
          <span className="account-avatar">{user.name.charAt(0)}</span>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <Status>{user.role}</Status>
          <button
            className={tab === "orders" ? "active" : ""}
            onClick={() => setTab("orders")}
          >
            <Package size={17} />
            My orders
          </button>
          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            <UserRound size={17} />
            My profile
          </button>
          <Link to="/wishlist">
            <Heart size={17} />
            My wishlist
          </Link>
          {["seller", "seller-reseller", "admin"].includes(user.role) && (
            <Link to="/seller">
              <Store size={17} />
              Seller dashboard
            </Link>
          )}
          {["reseller", "seller-reseller", "admin"].includes(user.role) && (
            <Link to="/reseller">
              <Wallet size={17} />
              Reseller dashboard
            </Link>
          )}
          {user.role === "admin" && (
            <Link to="/admin">
              <LayoutDashboard size={17} />
              Administration
            </Link>
          )}
          <button
            className={tab === "partner" ? "active" : ""}
            onClick={() => setTab("partner")}
          >
            <Flower2 size={17} />
            Partner with us
          </button>
          <button onClick={signOut}>
            <LogOut size={17} />
            Sign out
          </button>
        </aside>
        <section className="account-content">
          {tab === "orders" && (
            <>
              <div className="panel-heading">
                <h2>Your orders</h2>
                <button
                  className="icon-button"
                  aria-label="Refresh orders"
                  onClick={orders.reload}
                >
                  <RefreshCw size={17} />
                </button>
              </div>
              {orders.loading ? (
                <Loading />
              ) : orders.error ? (
                <Alert>{orders.error}</Alert>
              ) : !orders.data?.length ? (
                <Empty
                  icon={Package}
                  title="Your next story starts with a piece you love."
                  action={
                    <Link to="/shop" className="button">
                      Explore the collection
                      <ArrowRight size={16} />
                    </Link>
                  }
                >
                  Placed orders and their updates appear here.
                </Empty>
              ) : (
                orders.data.map((o) => <OrderCard key={o.id} order={o} />)
              )}
            </>
          )}
          {tab === "profile" && (
            <div className="form-panel">
              <h2>A little about you</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  task.run(async () => {
                    await api(
                      "/api/me",
                      json("PATCH", { name: f.get("name") }),
                    );
                    await refreshUser();
                    notify("Your profile is updated.");
                  });
                }}
              >
                <Field label="Full name">
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    defaultValue={user.name}
                  />
                </Field>
                <Field label="Email address">
                  <input value={user.email} disabled />
                </Field>
                <Alert>{task.error}</Alert>
                <button className="button" disabled={task.busy}>
                  Save profile
                  <Check size={16} />
                </button>
              </form>
            </div>
          )}
          {tab === "partner" && (
            <div className="form-panel">
              <p className="eyebrow">A BEAUTIFUL NEW BEGINNING</p>
              <h2>Your passion has a place here.</h2>
              <p>
                Upload your own collection as a seller, share approved products
                as a reseller, or do both. Your application reaches our team for
                review.
              </p>
              {user.requestedRole && (
                <Alert type="success">
                  Your {user.requestedRole} application is with the admin team.
                </Alert>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  task.run(async () => {
                    await api(
                      "/api/me",
                      json("PATCH", { requestedRole: f.get("requestedRole") }),
                    );
                    await refreshUser();
                    notify("Your partner application has been submitted.");
                  });
                }}
              >
                <Field label="Choose your partner role">
                  <select
                    name="requestedRole"
                    defaultValue={user.requestedRole || "seller"}
                  >
                    <option value="seller">Seller — my own products</option>
                    <option value="reseller">
                      Reseller — select and share products
                    </option>
                    <option value="seller-reseller">
                      Seller-Reseller — the best of both
                    </option>
                  </select>
                </Field>
                <Alert>{task.error}</Alert>
                <button className="button" disabled={task.busy}>
                  Submit for review
                  <ArrowRight size={17} />
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
function OrderCard({ order: o }: any) {
  const [review, setReview] = useState<string | null>(null),
    task = useTask(),
    { notify } = useStore();
  const step = statuses.indexOf(o.status);
  return (
    <article className="customer-order">
      <div className="order-card-heading">
        <div>
          <b>{o.id}</b>
          <p>
            {new Date(o.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Status>{o.status}</Status>
        <strong>{money(o.total)}</strong>
      </div>
      {!["Cancelled", "Returned"].includes(o.status) && (
        <div className="order-progress">
          {statuses.slice(0, 5).map((s, i) => (
            <div key={s} className={i <= step ? "complete" : ""}>
              <span>{i < step ? <Check size={12} /> : i + 1}</span>
              <small>{s}</small>
            </div>
          ))}
        </div>
      )}
      {o.items.map((item: any) => (
        <div className="order-line" key={item.id}>
          <img src={imageUrl(item.image, 160)} alt={item.name} />
          <div>
            <Link to={`/product/${item.productId}`}>
              <b>{item.name}</b>
            </Link>
            <p>
              Size {item.size} · Qty {item.quantity}
            </p>
            {o.status === "Delivered" && (
              <button
                className="text-button"
                onClick={() => {
                  setReview(review === item.productId ? null : item.productId);
                  task.setError("");
                }}
              >
                Write a review
                <Star size={12} />
              </button>
            )}
          </div>
          <strong>{money(item.unitPrice * item.quantity)}</strong>
        </div>
      ))}
      <div className="order-payment">
        <span>
          {o.paymentMethod === "COD" ? "Cash on Delivery" : o.paymentMethod}
        </span>
        <Status>{o.paymentStatus}</Status>
        {o.tracking && <span>Tracking: {o.tracking}</span>}
      </div>
      {o.status === "Pending" && (
        <p className="order-explainer">
          Your order is with our team for review before supplier ordering.
        </p>
      )}
      {o.status === "Returned" && (
        <p className="order-explainer">
          Your return has been recorded. Payment refunds are reviewed
          separately; check the payment status above.
        </p>
      )}
      {review && (
        <form
          className="review-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            task.run(async () => {
              await api(
                "/api/reviews",
                json("POST", {
                  productId: review,
                  rating: Number(f.get("rating")),
                  comment: f.get("comment"),
                }),
              );
              setReview(null);
              notify("Thank you. Your review is awaiting moderation.");
            });
          }}
        >
          <h4>Share your thoughts</h4>
          <Field label="Your rating">
            <select name="rating">
              <option value="5">5 — Loved it</option>
              <option value="4">4 — Beautiful</option>
              <option value="3">3 — As expected</option>
              <option value="2">2 — Could be better</option>
              <option value="1">1 — Disappointed</option>
            </select>
          </Field>
          <Field label="Your review">
            <textarea
              name="comment"
              required
              minLength={10}
              maxLength={2000}
              rows={3}
            />
          </Field>
          <Alert>{task.error}</Alert>
          <button className="button" disabled={task.busy}>
            Submit review
            <ArrowRight size={15} />
          </button>
        </form>
      )}
    </article>
  );
}
