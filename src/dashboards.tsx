import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Store,
  Package,
  Wallet,
  Plus,
  Check,
  Users,
  Layers3,
  Settings,
  MessageSquare,
  ClipboardList,
  ImagePlus,
  X,
  Copy,
  RefreshCw,
  LayoutDashboard,
  Search,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  Flower2,
  ExternalLink,
  Pencil,
  Coins,
  LogOut,
} from "lucide-react";
import {
  useStore,
  Link,
  navigate,
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
import { money, imageUrl } from "./catalog";
import { AccessPrompt } from "./pages";

function DashboardShell({ type, tab, setTab, tabs, children, actions }: any) {
  const { user, signOut } = useStore();
  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="workspace-label">
          <span className="workspace-icon">
            {type === "Administration" ? (
              <ShieldCheck size={20} />
            ) : (
              <Store size={20} />
            )}
          </span>
          <div>
            <p>ROSEVARA WORKSPACE</p>
            <h3>{type}</h3>
          </div>
        </div>
        <nav aria-label={`${type} navigation`}>
          {tabs.map(([id, label, Icon, count]: any) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {!!count && <i>{count}</i>}
            </button>
          ))}
        </nav>
        <div className="workspace-links">
          <Link to="/shop">
            <ArrowUpRight size={16} />
            Visit storefront
          </Link>
          <Link to="/account">
            <Users size={16} />
            My account
          </Link>
          {["seller-reseller", "admin"].includes(user.role) && (
            <Link to={type === "Seller dashboard" ? "/reseller" : "/seller"}>
              <Store size={16} />
              {type === "Seller dashboard"
                ? "Reseller workspace"
                : "Seller workspace"}
            </Link>
          )}
          <button onClick={signOut}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
        <div className="workspace-user">
          <span>{user.name.charAt(0)}</span>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
        </div>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-top">
          <span>
            <Flower2 size={16} />A little care in every detail.
          </span>
          <Link to="/">
            Back to Rosevara
            <ArrowUpRight size={14} />
          </Link>
        </div>
        {actions}
        {children}
      </div>
    </div>
  );
}
function Stats({ items }: any) {
  return (
    <div className="stats-grid">
      {items.map(([label, value, Icon, note]: any) => (
        <div className="stat-card" key={label}>
          <div>
            <span>{label}</span>
            <Icon size={18} />
          </div>
          <strong>{value}</strong>
          <small>{note}</small>
        </div>
      ))}
    </div>
  );
}
function PanelHeading({ eyebrow, title, children }: any) {
  return (
    <div className="dashboard-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
export function PartnerDashboard({ mode }: any) {
  const { user, catalog, notify } = useStore(),
    resource = useResource(
      "/api/dashboard",
      !!user &&
        ["seller", "reseller", "seller-reseller", "admin"].includes(user.role),
    ),
    [tab, setTab] = useState("overview"),
    [edit, setEdit] = useState<Product | null | undefined>(undefined);
  const task = useTask();
  const sellerMode = mode === "seller",
    allowed =
      user &&
      (sellerMode
        ? ["seller", "seller-reseller", "admin"]
        : ["reseller", "seller-reseller", "admin"]
      ).includes(user.role);
  if (!user)
    return (
      <div className="wrap page-space">
        <AccessPrompt partner />
      </div>
    );
  if (!allowed)
    return (
      <div className="wrap page-space">
        <Empty
          icon={Store}
          title={
            user.requestedRole
              ? "Your application is in good hands."
              : "Let’s grow something beautiful."
          }
          action={
            <Link to="/account" className="button">
              Manage your partner application
              <ArrowRight size={16} />
            </Link>
          }
        >
          {user.requestedRole
            ? `Your ${user.requestedRole} application is awaiting admin approval. Your customer account is ready to use.`
            : `An approved ${mode} account is needed for this workspace. Apply from your account to get started.`}
        </Empty>
      </div>
    );
  const data = resource.data,
    w = data?.wallet || {
      earned: 0,
      pending: 0,
      paid: 0,
      reserved: 0,
      available: 0,
    };
  const tabs = sellerMode
    ? [
        ["overview", "Overview", LayoutDashboard],
        ["products", "My products", Package, data?.products.length],
        ["orders", "Orders", ClipboardList],
        ["earnings", "Earnings & payouts", Wallet],
      ]
    : [
        ["overview", "Overview", LayoutDashboard],
        ["discover", "Discover products", Search],
        ["listings", "My selections", ShoppingBag, data?.listings.length],
        ["orders", "Orders", ClipboardList],
        ["earnings", "Profits & payouts", Wallet],
      ];
  const orders = (data?.orders || []).filter((r: any) =>
    sellerMode ? r.item.sellerId === user.id : r.item.resellerId === user.id,
  );
  const reload = () => {
    resource.reload();
  };
  return (
    <DashboardShell
      type={sellerMode ? "Seller dashboard" : "Reseller dashboard"}
      tab={tab}
      setTab={(t) => {
        setTab(t);
        setEdit(undefined);
      }}
      tabs={tabs}
    >
      <PanelHeading
        eyebrow={
          sellerMode
            ? "YOUR COLLECTION, YOUR COMMUNITY"
            : "SHARE THE PIECES YOU LOVE"
        }
        title={
          tab === "overview"
            ? `A beautiful day to ${sellerMode ? "create" : "grow"}, ${user.name.split(" ")[0]}.`
            : tabs.find((t) => t[0] === tab)?.[1]
        }
      >
        <button
          className="icon-button"
          aria-label="Refresh dashboard"
          onClick={reload}
        >
          <RefreshCw size={18} />
        </button>
        {sellerMode && (
          <button
            className="button"
            onClick={() => {
              setTab("products");
              setEdit(null);
            }}
          >
            <Plus size={16} />
            Add product
          </button>
        )}
      </PanelHeading>
      {resource.loading && !data ? (
        <Loading />
      ) : resource.error ? (
        <Alert>{resource.error}</Alert>
      ) : (
        data && (
          <>
            {(tab === "overview" || tab === "earnings") && (
              <Stats
                items={[
                  [
                    "Available for payout",
                    money(w.available),
                    Wallet,
                    "Delivered, paid, and not yet withdrawn",
                  ],
                  [
                    "Awaiting completion",
                    money(w.pending),
                    Package,
                    "Orders awaiting delivery or payment",
                  ],
                  [
                    "Total paid out",
                    money(w.paid),
                    Coins,
                    "Completed manual transfers",
                  ],
                  [
                    sellerMode ? "Your products" : "Your selections",
                    sellerMode
                      ? data.products.length
                      : data.listings.filter((x: any) => x.listing.active)
                          .length,
                    Store,
                    sellerMode
                      ? "Includes products in review"
                      : "Active reseller listings",
                  ],
                ]}
              />
            )}
            {tab === "overview" && (
              <>
                <div className="workspace-welcome">
                  <div>
                    <p className="eyebrow">
                      {sellerMode
                        ? "A COLLECTION WITH YOUR POINT OF VIEW"
                        : "YOUR MARGIN. CLEAR FROM THE START."}
                    </p>
                    <h2>
                      {sellerMode
                        ? "Bring something beautiful to the edit."
                        : "Pick a piece. Make it your own."}
                    </h2>
                    <p>
                      {sellerMode
                        ? "Upload your product photos, set a base price, and send each piece to our team for approval. Approved products appear in the store."
                        : "Select an approved product and set a price above its base price. Share your unique product link. Your profit is the difference, saved with each order."}
                    </p>
                    <button
                      className="button button-outline"
                      onClick={() => {
                        setTab(sellerMode ? "products" : "discover");
                        if (sellerMode) setEdit(null);
                      }}
                    >
                      {sellerMode
                        ? "Upload your first piece"
                        : "Discover approved products"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <Flower2 size={150} strokeWidth={0.5} />
                </div>
                <div className="data-panel">
                  <div className="panel-heading">
                    <h2>Recent order activity</h2>
                    <button
                      className="text-button"
                      onClick={() => setTab("orders")}
                    >
                      View all orders
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <PartnerOrders
                    orders={orders.slice(0, 5)}
                    sellerMode={sellerMode}
                    reload={reload}
                  />
                </div>
              </>
            )}
            {tab === "products" &&
              (edit !== undefined ? (
                <ProductEditor
                  initial={edit}
                  close={() => setEdit(undefined)}
                  saved={() => {
                    setEdit(undefined);
                    reload();
                  }}
                />
              ) : (
                <div className="data-panel">
                  <div className="panel-heading">
                    <h2>Your collection</h2>
                    <span className="muted small">
                      Every new piece and product edit needs admin approval.
                    </span>
                  </div>
                  {!data.products.length ? (
                    <Empty
                      icon={Package}
                      title="Your collection starts here."
                      action={
                        <button
                          className="button"
                          onClick={() => setEdit(null)}
                        >
                          Add a product
                          <Plus size={16} />
                        </button>
                      }
                    >
                      Upload your first product with photographs, pricing, and
                      stock.
                    </Empty>
                  ) : (
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Base price</th>
                            <th>Stock</th>
                            <th>Review status</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {data.products.map((p: Product) => (
                            <tr key={p.id}>
                              <td>
                                <div className="table-product">
                                  <img
                                    src={imageUrl(p.images[0], 100)}
                                    alt=""
                                  />
                                  <div>
                                    <b>{p.name}</b>
                                    <small>
                                      {p.adminNote ||
                                        catalog.categories.find(
                                          (c: any) => c.id === p.categoryId,
                                        )?.name}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{money(p.price)}</td>
                              <td>
                                <StockEditor product={p} reload={reload} />
                              </td>
                              <td>
                                <Status>{p.status}</Status>
                              </td>
                              <td>
                                <button
                                  className="small-button"
                                  onClick={() => setEdit(p)}
                                >
                                  <Pencil size={13} />
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            {tab === "discover" && (
              <ResellerDiscovery reload={reload} listings={data.listings} />
            )}
            {tab === "listings" && (
              <div className="data-panel">
                <div className="panel-heading">
                  <h2>Your selected pieces</h2>
                  <button
                    className="button small-button"
                    onClick={() => setTab("discover")}
                  >
                    <Plus size={15} />
                    Select products
                  </button>
                </div>
                <Alert>{task.error}</Alert>
                {!data.listings.length ? (
                  <Empty
                    icon={ShoppingBag}
                    title="A little curation goes a long way."
                  >
                    Choose approved products to build your own collection.
                  </Empty>
                ) : (
                  <div className="listing-grid">
                    {data.listings.map(({ listing: l, product: p }: any) => (
                      <div className="listing-card" key={l.id}>
                        <img src={imageUrl(p.images[0], 400)} alt={p.name} />
                        <div>
                          <Status>
                            {!l.active
                              ? "Paused"
                              : p.status !== "approved"
                                ? "Unavailable"
                                : l.price <= p.price
                                  ? "Reprice needed"
                                  : "Active"}
                          </Status>
                          <h3>{p.name}</h3>
                          <p>
                            Base price <b>{money(p.price)}</b>
                          </p>
                          <p>
                            Your price <b>{money(l.price)}</b>
                          </p>
                          <p className="profit-line">
                            Your profit per piece{" "}
                            <b>{money(l.price - p.price)}</b>
                          </p>
                          <div className="listing-actions">
                            <button
                              className="small-button"
                              disabled={
                                !l.active ||
                                p.status !== "approved" ||
                                l.price <= p.price ||
                                task.busy
                              }
                              onClick={() =>
                                task.run(async () => {
                                  await navigator.clipboard.writeText(
                                    `${location.origin}/product/${p.id}?listing=${l.id}`,
                                  );
                                  notify("Your reseller link is copied.");
                                })
                              }
                            >
                              <Copy size={13} />
                              Copy shop link
                            </button>
                            <button
                              className="text-button"
                              disabled={task.busy}
                              onClick={() =>
                                task.run(async () => {
                                  await api(
                                    `/api/reseller/listings/${l.id}`,
                                    json("PATCH", { active: !l.active }),
                                  );
                                  reload();
                                })
                              }
                            >
                              {l.active ? "Pause" : "Activate"}
                            </button>
                            <button
                              className="text-button"
                              onClick={() => setTab("discover")}
                            >
                              Edit price
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === "orders" && (
              <div className="data-panel">
                <div className="panel-heading">
                  <h2>
                    {sellerMode
                      ? "Your supplier orders"
                      : "Orders through your links"}
                  </h2>
                </div>
                <p className="panel-description">
                  Orders appear here after the admin team reviews them. The
                  admin team manages supplier ordering and customer status
                  updates.
                </p>
                <PartnerOrders
                  orders={orders}
                  sellerMode={sellerMode}
                  reload={reload}
                />
              </div>
            )}
            {tab === "earnings" && <Earnings wallet={w} reload={reload} />}
          </>
        )
      )}
    </DashboardShell>
  );
}
function StockEditor({ product: p, reload }: any) {
  const task = useTask(),
    [value, setValue] = useState(p.stock);
  useEffect(() => setValue(p.stock), [p.stock]);
  return (
    <form
      className="stock-editor"
      onSubmit={(e) => {
        e.preventDefault();
        task.run(async () => {
          await api(
            `/api/seller/products/${p.id}/stock`,
            json("PATCH", { stock: Number(value), expectedStock: p.stock }),
          );
          reload();
        });
      }}
    >
      <input
        aria-label={`Available stock for ${p.name}`}
        type="number"
        min="0"
        max="10000"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        className="icon-button"
        aria-label={`Save stock for ${p.name}`}
        disabled={task.busy}
      >
        <Check size={15} />
      </button>
      <Alert>{task.error}</Alert>
    </form>
  );
}
function ProductEditor({ initial: p, close, saved }: any) {
  const { catalog, notify } = useStore(),
    task = useTask(),
    upload = useTask(),
    [images, setImages] = useState<string[]>(p?.images || []);
  const uploadImages = (files: FileList | null) => {
    if (!files) return;
    upload.run(async () => {
      if (images.length + files.length > 6)
        throw new Error("Choose up to 6 photos for each product.");
      const next = [...images];
      for (const file of Array.from(files)) {
        if (file.size > 4 * 1024 * 1024)
          throw new Error("Each photo must be smaller than 4 MB.");
        const form = new FormData();
        form.append("image", file);
        const result = await api("/api/uploads", {
          method: "POST",
          body: form,
        });
        next.push(result.url);
      }
      setImages(next);
    });
  };
  const submit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    task.run(async () => {
      if (!images.length) throw new Error("Add at least one photograph.");
      const sizes = String(f.get("sizes"))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api(
        p ? `/api/seller/products/${p.id}` : "/api/seller/products",
        json(p ? "PUT" : "POST", {
          name: f.get("name"),
          description: f.get("description"),
          categoryId: f.get("categoryId"),
          price: Math.round(Number(f.get("price")) * 100),
          comparePrice: f.get("comparePrice")
            ? Math.round(Number(f.get("comparePrice")) * 100)
            : null,
          stock: Number(f.get("stock")),
          expectedStock: p?.stock,
          expectedVersion: p?.version,
          sizes,
          images,
        }),
      );
      notify("Your product is saved. Seller products enter admin review.");
      saved();
    });
  };
  return (
    <div className="data-panel product-editor">
      <div className="panel-heading">
        <h2>{p ? "Edit your piece" : "A new piece for your collection"}</h2>
        <button className="text-button" onClick={close}>
          <X size={16} />
          Close
        </button>
      </div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="span-two">
            <Field label="Product name">
              <input
                name="name"
                defaultValue={p?.name}
                minLength={3}
                maxLength={150}
                required
                placeholder="e.g. Aabha — Embroidered 3 Piece Suit"
              />
            </Field>
          </div>
          <div className="span-two">
            <Field label="The details">
              <textarea
                name="description"
                defaultValue={p?.description}
                rows={5}
                minLength={20}
                maxLength={5000}
                required
                placeholder="Describe the fabric, colour, embroidery, fit, and what is included."
              />
            </Field>
          </div>
          <Field label="Category">
            <select
              name="categoryId"
              defaultValue={p?.categoryId || catalog.categories[0]?.id}
              required
            >
              {catalog.categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Available sizes" hint="Separate sizes with commas.">
            <input
              name="sizes"
              defaultValue={p?.sizes.join(", ") || "S, M, L, XL"}
              required
              maxLength={200}
            />
          </Field>
          <Field
            label="Base price (PKR)"
            hint={`Platform commission: ${(catalog.settings.commissionBps ?? 1000) / 100}% of the base price, saved when each order is placed.`}
          >
            <input
              name="price"
              type="number"
              defaultValue={p ? p.price / 100 : ""}
              min="0.01"
              max="1000000"
              step="0.01"
              required
            />
          </Field>
          <Field label="Original price (optional, PKR)">
            <input
              name="comparePrice"
              type="number"
              defaultValue={p?.comparePrice ? p.comparePrice / 100 : ""}
              min="0.01"
              step="0.01"
            />
          </Field>
          <Field label="Available stock">
            <input
              name="stock"
              type="number"
              defaultValue={p?.stock || 0}
              min="0"
              max="10000"
              required
            />
          </Field>
        </div>
        <div className="photo-upload-section">
          <h4>Product photographs</h4>
          <p>
            Up to 6 JPG, PNG, or WebP photographs, 4 MB each. The first photo
            appears on your product card.
          </p>
          <div className="upload-previews">
            {images.map((src, i) => (
              <div key={src}>
                <img src={imageUrl(src, 200)} alt={`Product photo ${i + 1}`} />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => setImages(images.filter((_, j) => i !== j))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <label className="upload-tile">
                <ImagePlus size={24} />
                <span>{upload.busy ? "Uploading…" : "Add photos"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={upload.busy}
                  onChange={(e) => uploadImages(e.target.files)}
                />
              </label>
            )}
          </div>
          <Alert>{upload.error}</Alert>
        </div>
        <Alert>{task.error}</Alert>
        <div className="form-actions">
          <button
            type="button"
            className="button button-outline"
            onClick={close}
          >
            Cancel
          </button>
          <button className="button" disabled={task.busy || upload.busy}>
            Save product
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
function PartnerOrders({ orders, sellerMode, reload }: any) {
  return !orders.length ? (
    <Empty icon={Package} title="Good things are on their way.">
      Reviewed orders for your products appear here. Pending orders reach the
      admin first.
    </Empty>
  ) : (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order / Product</th>
            <th>Qty</th>
            <th>Status</th>
            <th>{sellerMode ? "Your earnings" : "Your profit"}</th>
            <th>Payment</th>
            {sellerMode && <th>Supplier update</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(({ item: i, order: o }: any) => (
            <tr key={i.id}>
              <td>
                <b>{o.id}</b>
                <small className="table-subtitle">
                  {i.name} · {i.size}
                </small>
              </td>
              <td>{i.quantity}</td>
              <td>
                <Status>{o.status}</Status>
              </td>
              <td>{money(sellerMode ? i.sellerEarning : i.resellerProfit)}</td>
              <td>
                <Status>{o.paymentStatus}</Status>
              </td>
              {sellerMode && (
                <td>
                  <SupplierNote item={i} reload={reload} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function SupplierNote({ item, reload }: any) {
  const task = useTask();
  return (
    <form
      className="supplier-note"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        task.run(async () => {
          await api(
            `/api/seller/order-items/${item.id}`,
            json("PATCH", { fulfillmentNote: f.get("note") }),
          );
          reload();
        });
      }}
    >
      <input
        name="note"
        aria-label="Update for admin"
        defaultValue={item.fulfillmentNote}
        placeholder="Update for admin…"
        maxLength={1000}
      />
      <button
        className="icon-button"
        aria-label="Save supplier update"
        disabled={task.busy}
      >
        <Check size={15} />
      </button>
      <Alert>{task.error}</Alert>
    </form>
  );
}
function ResellerDiscovery({ reload, listings }: any) {
  const { catalog } = useStore(),
    [q, setQ] = useState("");
  return (
    <div className="data-panel">
      <div className="panel-heading">
        <div>
          <h2>Choose your collection</h2>
          <p className="muted small">
            Set a selling price above the base price. Your margin belongs to
            you.
          </p>
        </div>
        <div className="inline-search">
          <Search size={16} />
          <input
            placeholder="Find a product…"
            aria-label="Search reseller catalog"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="reseller-product-grid">
        {catalog.products
          .filter((p: Product) =>
            p.name.toLowerCase().includes(q.toLowerCase()),
          )
          .map((p: Product) => (
            <ResellerProduct
              key={p.id}
              product={p}
              listing={
                listings.find((x: any) => x.product.id === p.id)?.listing
              }
              reload={reload}
            />
          ))}
      </div>
    </div>
  );
}
function ResellerProduct({ product: p, listing, reload }: any) {
  const [price, setPrice] = useState(
      listing ? String(listing.price / 100) : "",
    ),
    task = useTask(),
    { notify, user } = useStore();
  if (p.sellerId === user.id) return null;
  const margin = Math.round(Number(price) * 100) - p.price;
  return (
    <form
      className="reseller-product"
      onSubmit={(e) => {
        e.preventDefault();
        task.run(async () => {
          await api(
            "/api/reseller/listings",
            json("POST", {
              productId: p.id,
              price: Math.round(Number(price) * 100),
            }),
          );
          reload();
          notify("Your selection is saved. Copy its link from My selections.");
        });
      }}
    >
      <img src={imageUrl(p.images[0], 300)} alt={p.name} />
      <div>
        <h3>{p.name}</h3>
        <p>
          Base price <b>{money(p.price)}</b>
        </p>
        <Field label="Your selling price (PKR)">
          <input
            type="number"
            min={(p.price + 1) / 100}
            step="0.01"
            max="1000000"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
        <div className={`margin-preview ${margin > 0 ? "positive" : ""}`}>
          <span>Your profit / piece</span>
          <b>{price ? money(margin) : "—"}</b>
        </div>
        <p className="muted small">
          {p.stock > 0
            ? `${p.stock} available`
            : "Coming soon · links can be prepared now"}
        </p>
        <Alert>{task.error}</Alert>
        <button
          className="button small-button full"
          disabled={task.busy || margin <= 0}
        >
          {listing ? "Update selection" : "Add to my selections"}
          <Plus size={14} />
        </button>
      </div>
    </form>
  );
}
function Earnings({ wallet: w, reload }: any) {
  const task = useTask(),
    { user, notify, refreshUser } = useStore();
  return (
    <>
      <div className="earnings-layout">
        <div className="data-panel">
          <h2>Request a payout</h2>
          <p className="muted">
            Earnings become available after delivery and payment confirmation.
            Payouts are reviewed and transferred manually by the store team.
          </p>
          {w.available < 0 && (
            <Alert>
              Returns or refunds exceeded your remaining earnings. Your next
              earnings offset this balance before another payout.
            </Alert>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              task.run(async () => {
                await api(
                  "/api/payouts",
                  json("POST", {
                    amount: Math.round(Number(f.get("amount")) * 100),
                    method: f.get("method"),
                  }),
                );
                notify("Your payout request is with the admin team.");
                reload();
              });
            }}
          >
            <Field
              label="Amount (PKR)"
              hint={`Available: ${money(w.available)} · Reserved in requests: ${money(w.reserved)}`}
            >
              <input
                name="amount"
                type="number"
                required
                min="0.01"
                step="0.01"
                max={Math.max(0, w.available / 100)}
              />
            </Field>
            <Field
              label="Payment method & receiving details"
              hint="Only share the receiving account details needed for a transfer. Never share passwords or PINs."
            >
              <textarea
                name="method"
                required
                minLength={5}
                maxLength={1000}
                rows={3}
                defaultValue={user.payoutDetails}
                placeholder="JazzCash / Easypaisa / bank, account title, receiving number…"
              />
            </Field>
            <Alert>{task.error}</Alert>
            <button className="button" disabled={task.busy || w.available < 1}>
              Request payout
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
        <div className="data-panel earnings-explainer">
          <Coins size={28} strokeWidth={1.3} />
          <h2>Every rupee, accounted for.</h2>
          <p>Seller earnings = base price − platform commission.</p>
          <p>Reseller profit = selling price − base price.</p>
          <p>
            The commission rate is saved when each order is placed. Returns and
            refunds remove that order’s earnings from the available balance.
          </p>
          <p>
            Paid payouts remain in your history. A later return can create a
            negative balance that future earnings offset.
          </p>
        </div>
      </div>
      <div className="data-panel">
        <h2>Payout history</h2>
        {!w.payouts.length ? (
          <Empty icon={Wallet} title="Your first payout is ahead.">
            Payout requests and transfer references appear here.
          </Empty>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reference / Note</th>
                </tr>
              </thead>
              <tbody>
                {w.payouts.map((p: any) => (
                  <tr key={p.id}>
                    <td>{new Date(p.createdAt).toLocaleDateString("en-PK")}</td>
                    <td>{money(p.amount)}</td>
                    <td className="wrap-cell">{p.method}</td>
                    <td>
                      <Status>{p.status}</Status>
                    </td>
                    <td>{p.reference || p.note || "Awaiting review"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
export function AdminDashboard() {
  const { user, loadCatalog } = useStore(),
    resource = useResource("/api/admin", user?.role === "admin"),
    [tab, setTab] = useState("overview"),
    [edit, setEdit] = useState<Product | null | undefined>(undefined),
    [search, setSearch] = useState("");
  if (!user)
    return (
      <div className="wrap page-space">
        <AccessPrompt title="A little care behind every order." partner />
      </div>
    );
  if (user.role !== "admin")
    return (
      <div className="wrap page-space">
        <Empty
          icon={ShieldCheck}
          title="Reserved for the Rosevara team."
          action={
            <Link to="/account" className="button">
              Back to your account
              <ArrowRight size={16} />
            </Link>
          }
        >
          Administrator access is assigned by the store owner. Your customer and
          partner tools stay in their own workspaces.
        </Empty>
      </div>
    );
  const d = resource.data;
  const reload = () => {
    resource.reload();
    loadCatalog();
  };
  const tabs = [
    ["overview", "Overview", LayoutDashboard],
    [
      "orders",
      "Orders",
      ClipboardList,
      d?.orders.filter((o: any) => o.status === "Pending").length,
    ],
    [
      "products",
      "Products",
      Package,
      d?.products.filter((p: any) => p.status === "pending").length,
    ],
    [
      "users",
      "People & partners",
      Users,
      d?.users.filter((u: any) => u.requestedRole).length,
    ],
    ["categories", "Categories", Layers3],
    [
      "payouts",
      "Payouts",
      Wallet,
      d?.payouts.filter((p: any) => p.status === "Pending").length,
    ],
    [
      "reviews",
      "Reviews",
      MessageSquare,
      d?.reviews.filter((r: any) => r.review.status === "pending").length,
    ],
    ["settings", "Store settings", Settings],
  ];
  const delivered =
    d?.orders.filter(
      (o: any) => o.status === "Delivered" && o.paymentStatus === "Paid",
    ) || [];
  const revenue = delivered.reduce((a: number, o: any) => a + o.total, 0),
    commission = delivered.reduce(
      (a: number, o: any) =>
        a + o.items.reduce((b: number, i: any) => b + i.commission, 0),
      0,
    );
  return (
    <DashboardShell
      type="Administration"
      tab={tab}
      setTab={(t) => {
        setTab(t);
        setEdit(undefined);
        setSearch("");
      }}
      tabs={tabs}
    >
      <PanelHeading
        eyebrow="THE CARE BEHIND THE COLLECTION"
        title={
          tab === "overview"
            ? "Your marketplace, at a glance."
            : tabs.find((t) => t[0] === tab)?.[1]
        }
      >
        <button className="small-button" onClick={reload}>
          <RefreshCw size={15} />
          Refresh
        </button>
        {tab === "products" && (
          <button className="button" onClick={() => setEdit(null)}>
            <Plus size={15} />
            Add product
          </button>
        )}
      </PanelHeading>
      {resource.loading && !d ? (
        <Loading />
      ) : resource.error ? (
        <Alert>{resource.error}</Alert>
      ) : (
        d && (
          <>
            {tab === "overview" && (
              <>
                <Stats
                  items={[
                    [
                      "Collected revenue",
                      money(revenue),
                      TrendingUp,
                      "Delivered and paid, including delivery",
                    ],
                    [
                      "Platform earnings",
                      money(commission),
                      Coins,
                      "Commission and platform-owned products",
                    ],
                    [
                      "Orders to review",
                      d.orders.filter((o: any) => o.status === "Pending")
                        .length,
                      ClipboardList,
                      "Review before supplier ordering",
                    ],
                    [
                      "Products to review",
                      d.products.filter((p: any) => p.status === "pending")
                        .length,
                      Package,
                      "Approval required before publication",
                    ],
                  ]}
                />
                <div className="admin-queues">
                  <button onClick={() => setTab("orders")}>
                    <ClipboardList size={22} />
                    <h3>Order review</h3>
                    <p>
                      Confirm orders, place supplier orders manually, and manage
                      delivery.
                    </p>
                    <span>
                      Open order queue
                      <ArrowRight size={16} />
                    </span>
                  </button>
                  <button onClick={() => setTab("users")}>
                    <Users size={22} />
                    <h3>Partner applications</h3>
                    <p>
                      {d.users.filter((u: any) => u.requestedRole).length}{" "}
                      applications awaiting a decision.
                    </p>
                    <span>
                      Meet your partners
                      <ArrowRight size={16} />
                    </span>
                  </button>
                </div>
                <div className="data-panel">
                  <div className="panel-heading">
                    <h2>Recent orders</h2>
                    <button
                      className="text-button"
                      onClick={() => setTab("orders")}
                    >
                      Manage orders
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <AdminOrders
                    orders={d.orders.slice(0, 5)}
                    reload={reload}
                    compact
                  />
                </div>
                <div className="admin-launch-note">
                  <ShieldCheck size={20} />
                  <p>
                    <b>Your launch checklist lives in your data.</b> The starter
                    catalog has zero stock. Replace illustrative product details
                    and photos, confirm inventory, add payment receiving
                    instructions, and set a support email before taking live
                    orders.
                  </p>
                </div>
              </>
            )}
            {tab === "orders" && (
              <div className="data-panel">
                <div className="panel-heading">
                  <h2>Order management</h2>
                  <div className="inline-search">
                    <Search size={16} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search orders"
                      placeholder="Order ID, customer, or status…"
                    />
                  </div>
                </div>
                <AdminOrders
                  orders={d.orders.filter((o: any) =>
                    `${o.id} ${o.address.name} ${o.status}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )}
                  reload={reload}
                />
              </div>
            )}
            {tab === "products" &&
              (edit !== undefined ? (
                <ProductEditor
                  initial={edit}
                  close={() => setEdit(undefined)}
                  saved={() => {
                    setEdit(undefined);
                    reload();
                  }}
                />
              ) : (
                <div className="data-panel">
                  <div className="panel-heading">
                    <h2>Product approval & inventory</h2>
                    <div className="inline-search">
                      <Search size={16} />
                      <input
                        placeholder="Find a product…"
                        aria-label="Search products"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="panel-description">
                    Seller uploads and edits enter review. Approve only after
                    checking photos, description, pricing, and supplier stock.
                  </p>
                  <div className="admin-products">
                    {d.products
                      .filter((p: Product) =>
                        `${p.name} ${p.status}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((p: Product) => (
                        <AdminProduct
                          key={p.id}
                          product={p}
                          users={d.users}
                          reload={reload}
                          edit={() => setEdit(p)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            {tab === "users" && (
              <div className="data-panel">
                <div className="panel-heading">
                  <h2>Customers, sellers & resellers</h2>
                  <div className="inline-search">
                    <Search size={16} />
                    <input
                      placeholder="Search name or email…"
                      aria-label="Search users"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Person</th>
                        <th>Application</th>
                        <th>Current role</th>
                        <th>Account status</th>
                        <th>Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.users
                        .filter((u: any) =>
                          `${u.name} ${u.email}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                        )
                        .map((u: any) => (
                          <AdminUser key={u.id} person={u} reload={reload} />
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {tab === "categories" && (
              <AdminCategories categories={d.categories} reload={reload} />
            )}
            {tab === "payouts" && (
              <div className="data-panel">
                <h2>Manual partner payouts</h2>
                <p className="muted">
                  Review the receiving details and send funds manually. Record
                  the actual transfer reference before marking a payout paid.
                </p>
                {!d.payouts.length ? (
                  <Empty icon={Wallet} title="No payout requests yet.">
                    Partner requests appear here once delivered and paid orders
                    produce available earnings.
                  </Empty>
                ) : (
                  d.payouts.map((p: any) => (
                    <AdminPayout
                      key={p.id}
                      payout={p}
                      person={d.users.find((u: any) => u.id === p.userId)}
                      reload={reload}
                    />
                  ))
                )}
              </div>
            )}
            {tab === "reviews" && (
              <div className="data-panel">
                <h2>Customer review moderation</h2>
                <p className="muted">
                  Only customers with a delivered order can submit a review.
                  Approved reviews appear on product pages.
                </p>
                {!d.reviews.length ? (
                  <Empty
                    icon={MessageSquare}
                    title="A conversation waiting to begin."
                  >
                    Verified customer reviews appear here for moderation.
                  </Empty>
                ) : (
                  d.reviews.map((r: any) => (
                    <AdminReview key={r.review.id} data={r} reload={reload} />
                  ))
                )}
              </div>
            )}
            {tab === "settings" && (
              <AdminSettings settings={d.settings} reload={reload} />
            )}
          </>
        )
      )}
    </DashboardShell>
  );
}
function AdminProduct({ product: p, users, reload, edit }: any) {
  const task = useTask();
  return (
    <div className="admin-product">
      <img src={imageUrl(p.images[0], 240)} alt={p.name} />
      <div>
        <div className="row-between">
          <h3>{p.name}</h3>
          <Status>{p.status}</Status>
        </div>
        <p>
          {users.find((u: any) => u.id === p.sellerId)?.name ||
            "Rosevara preview collection"}{" "}
          · {money(p.price)} · {p.stock} in stock
        </p>
        <p className="line-clamp">{p.description}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const action =
              (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ||
              "pending";
            task.run(async () => {
              await api(
                `/api/admin/products/${p.id}`,
                json("PATCH", {
                  status: action,
                  adminNote: f.get("note"),
                  expectedVersion: p.version,
                }),
              );
              reload();
            });
          }}
        >
          <input
            name="note"
            aria-label={`Review note for ${p.name}`}
            defaultValue={p.adminNote}
            placeholder="Note to seller (optional)"
            maxLength={1000}
          />
          <div className="admin-product-actions">
            <button
              className="small-button approve-button"
              name="decision"
              value="approved"
              disabled={task.busy}
            >
              <Check size={13} />
              Approve
            </button>
            <button
              className="small-button"
              name="decision"
              value="rejected"
              disabled={task.busy}
            >
              Reject
            </button>
            <button
              className="text-button"
              name="decision"
              value="pending"
              disabled={task.busy}
            >
              Hold for review
            </button>
            <button className="text-button" type="button" onClick={edit}>
              <Pencil size={13} />
              Edit details & stock
            </button>
            <label className="check-label">
              <input
                type="checkbox"
                checked={p.featured}
                disabled={task.busy}
                onChange={(e) =>
                  task.run(async () => {
                    await api(
                      `/api/admin/products/${p.id}`,
                      json("PATCH", { featured: e.target.checked }),
                    );
                    reload();
                  })
                }
              />
              Featured
            </label>
          </div>
          <Alert>{task.error}</Alert>
        </form>
      </div>
    </div>
  );
}
function AdminUser({ person: u, reload }: any) {
  const { user } = useStore(),
    task = useTask(),
    [role, setRole] = useState(u.requestedRole || u.role),
    [status, setStatus] = useState(u.status);
  return (
    <tr>
      <td>
        <b>{u.name}</b>
        <small className="table-subtitle">{u.email}</small>
      </td>
      <td>{u.requestedRole ? <Status>{u.requestedRole}</Status> : "—"}</td>
      <td>
        <Status>{u.role}</Status>
      </td>
      <td>
        <Status>{u.status}</Status>
      </td>
      <td>
        <form
          className="user-actions"
          onSubmit={(e) => {
            e.preventDefault();
            task.run(async () => {
              await api(
                `/api/admin/users/${u.id}`,
                json("PATCH", { role, status }),
              );
              reload();
            });
          }}
        >
          <select
            aria-label={`Role for ${u.name}`}
            value={role}
            disabled={user.id === u.id || u.identityAdmin}
            onChange={(e) => setRole(e.target.value)}
          >
            {["customer", "seller", "reseller", "seller-reseller", "admin"].map(
              (r) => (
                <option key={r}>{r}</option>
              ),
            )}
          </select>
          <select
            aria-label={`Status for ${u.name}`}
            value={status}
            disabled={user.id === u.id || u.identityAdmin}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>active</option>
            <option>suspended</option>
          </select>
          <button
            className="small-button"
            disabled={task.busy || user.id === u.id || u.identityAdmin}
          >
            Save
          </button>
          {u.requestedRole && (
            <button
              type="button"
              className="text-button"
              disabled={task.busy}
              onClick={() =>
                task.run(async () => {
                  await api(
                    `/api/admin/users/${u.id}`,
                    json("PATCH", { role: u.role, status: u.status }),
                  );
                  reload();
                })
              }
            >
              Decline application
            </button>
          )}
          <Alert>{task.error}</Alert>
        </form>
      </td>
    </tr>
  );
}
function AdminOrders({ orders, reload, compact = false }: any) {
  return !orders.length ? (
    <Empty icon={ClipboardList} title="Every great order starts here.">
      New orders arrive pending review. Confirm them before manual supplier
      ordering.
    </Empty>
  ) : (
    <div className="admin-orders">
      {orders.map((o: any) => (
        <AdminOrder
          key={`${o.id}-${o.status}-${o.paymentStatus}`}
          order={o}
          reload={reload}
          compact={compact}
        />
      ))}
    </div>
  );
}
function AdminOrder({ order: o, reload, compact }: any) {
  const task = useTask(),
    [open, setOpen] = useState(false);
  const transitions: any = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Returned"],
    Delivered: ["Returned"],
    Cancelled: [],
    Returned: [],
  };
  const totals = o.items.reduce(
    (a: any, i: any) => ({
      seller: a.seller + i.sellerEarning,
      reseller: a.reseller + i.resellerProfit,
      platform: a.platform + i.commission,
    }),
    { seller: 0, reseller: 0, platform: 0 },
  );
  return (
    <div className="admin-order">
      <button
        className="admin-order-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div>
          <b>{o.id}</b>
          <span>
            {o.address.name} ·{" "}
            {new Date(o.createdAt).toLocaleDateString("en-PK")}
          </span>
        </div>
        <Status>{o.status}</Status>
        <Status>{o.paymentStatus}</Status>
        <strong>{money(o.total)}</strong>
        <span className={open ? "rotate" : ""}>
          <Plus size={17} />
        </span>
      </button>
      {open && (
        <div className="admin-order-details">
          <div className="order-info-grid">
            <div>
              <h4>Customer & delivery</h4>
              <p>
                {o.address.name}
                <br />
                {o.address.phone}
                <br />
                {o.address.address}
                <br />
                {o.address.city} {o.address.postal}
              </p>
            </div>
            <div>
              <h4>Payment details</h4>
              <p>
                {o.paymentMethod}
                <br />
                Reference: {o.paymentReference || "Not supplied"}
                <br />
                Delivery: {money(o.shipping)}
              </p>
            </div>
          </div>
          {o.items.map((i: any) => (
            <div className="admin-order-item" key={i.id}>
              <b>{i.name}</b>
              <span>
                {i.size} × {i.quantity} · {money(i.unitPrice * i.quantity)}
              </span>
              {i.fulfillmentNote && <p>Seller update: {i.fulfillmentNote}</p>}
            </div>
          ))}
          <div className="order-splits">
            <span>
              Seller earnings <b>{money(totals.seller)}</b>
            </span>
            <span>
              Reseller profit <b>{money(totals.reseller)}</b>
            </span>
            <span>
              Platform <b>{money(totals.platform)}</b>
            </span>
            <small>
              Commission at order time: {(o.commissionBps / 100).toFixed(2)}% ·
              Earnings settle after delivery and payment.
            </small>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              task.run(async () => {
                await api(
                  `/api/admin/orders/${o.id}`,
                  json("PATCH", {
                    status: f.get("status"),
                    paymentStatus: f.get("paymentStatus"),
                    supplierNote: f.get("supplierNote"),
                    tracking: f.get("tracking"),
                  }),
                );
                reload();
              });
            }}
          >
            <div className="form-grid">
              <Field label="Order status">
                <select name="status" defaultValue={o.status}>
                  <option>{o.status}</option>
                  {transitions[o.status]?.map((s: string) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Payment status">
                <select name="paymentStatus" defaultValue={o.paymentStatus}>
                  <option>Unpaid</option>
                  <option>Paid</option>
                  <option>Refunded</option>
                </select>
              </Field>
              <div className="span-two">
                <Field
                  label="Manual supplier ordering notes"
                  hint="Internal admin notes. Record the supplier, ordering reference, and any follow-up."
                >
                  <textarea
                    name="supplierNote"
                    maxLength={3000}
                    defaultValue={o.supplierNote}
                    rows={3}
                  />
                </Field>
              </div>
              <div className="span-two">
                <Field label="Courier & tracking reference">
                  <input
                    name="tracking"
                    maxLength={200}
                    defaultValue={o.tracking}
                    placeholder="Courier name and tracking number"
                  />
                </Field>
              </div>
            </div>
            {o.status === "Pending" && (
              <Alert type="info">
                Review the order and payment reference first. Confirm the order,
                then record your manual supplier purchase in the notes.
              </Alert>
            )}
            <Alert>{task.error}</Alert>
            <button className="button small-button" disabled={task.busy}>
              Save order updates
              <Check size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
function AdminCategories({ categories, reload }: any) {
  const task = useTask();
  return (
    <div className="data-panel">
      <h2>A place for every piece</h2>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          task.run(async () => {
            await api(
              "/api/admin/categories",
              json("POST", { name: f.get("name") }),
            );
            form.reset();
            reload();
          });
        }}
      >
        <input
          aria-label="New category name"
          name="name"
          required
          minLength={2}
          maxLength={60}
          placeholder="New category name"
        />
        <button className="button small-button" disabled={task.busy}>
          <Plus size={15} />
          Add category
        </button>
      </form>
      <Alert>{task.error}</Alert>
      <div className="category-admin-list">
        {categories.map((c: any) => (
          <CategoryRow key={c.id} category={c} reload={reload} />
        ))}
      </div>
    </div>
  );
}
function CategoryRow({ category: c, reload }: any) {
  const task = useTask();
  return (
    <form
      className="category-admin-row"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        task.run(async () => {
          await api(
            `/api/admin/categories/${c.id}`,
            json("PATCH", {
              name: f.get("name"),
              active: f.get("active") === "on",
            }),
          );
          reload();
        });
      }}
    >
      <img src={imageUrl(c.image, 100)} alt="" />
      <input
        name="name"
        aria-label="Category name"
        defaultValue={c.name}
        required
        minLength={2}
        maxLength={60}
      />
      <label className="check-label">
        <input name="active" type="checkbox" defaultChecked={c.active} />
        Active
      </label>
      <button className="small-button" disabled={task.busy}>
        Save
      </button>
      <Alert>{task.error}</Alert>
    </form>
  );
}
function AdminPayout({ payout: p, person, reload }: any) {
  const task = useTask();
  return (
    <div className="admin-payout">
      <div className="row-between">
        <div>
          <h3>
            {person?.name || "Partner"} <small>{person?.email}</small>
          </h3>
          <p>
            {new Date(p.createdAt).toLocaleDateString("en-PK")} ·{" "}
            <strong>{money(p.amount)}</strong>
          </p>
        </div>
        <Status>{p.status}</Status>
      </div>
      <p className="receiving-details">{p.method}</p>
      {p.status === "Pending" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const status = (
              e.nativeEvent as SubmitEvent
            ).submitter?.getAttribute("value");
            task.run(async () => {
              await api(
                `/api/admin/payouts/${p.id}`,
                json("PATCH", {
                  status,
                  reference: f.get("reference"),
                  note: f.get("note"),
                }),
              );
              reload();
            });
          }}
        >
          <div className="form-grid">
            <Field label="Actual transfer reference">
              <input
                name="reference"
                maxLength={200}
                placeholder="Required when marking paid"
              />
            </Field>
            <Field label="Note to partner">
              <input name="note" maxLength={1000} />
            </Field>
          </div>
          <Alert>{task.error}</Alert>
          <div className="form-actions">
            <button
              className="button small-button"
              value="Paid"
              disabled={task.busy}
            >
              <Check size={14} />
              Record paid transfer
            </button>
            <button
              className="small-button"
              value="Rejected"
              disabled={task.busy}
            >
              Reject request
            </button>
          </div>
        </form>
      ) : (
        <p className="muted small">
          {p.reference && `Transfer reference: ${p.reference}`}
          {p.note && ` · ${p.note}`}
        </p>
      )}
    </div>
  );
}
function AdminReview({ data: r, reload }: any) {
  const task = useTask();
  return (
    <div className="admin-review">
      <div className="row-between">
        <h3>
          {r.name} <small>on {r.product}</small>
        </h3>
        <Status>{r.review.status}</Status>
      </div>
      <span className="review-stars">
        {"★".repeat(r.review.rating)}
        {"☆".repeat(5 - r.review.rating)}
      </span>
      <p>{r.review.comment}</p>
      <Alert>{task.error}</Alert>
      <div className="form-actions">
        <button
          className="small-button approve-button"
          disabled={task.busy}
          onClick={() =>
            task.run(async () => {
              await api(
                `/api/admin/reviews/${r.review.id}`,
                json("PATCH", { status: "approved" }),
              );
              reload();
            })
          }
        >
          <Check size={13} />
          Approve
        </button>
        <button
          className="small-button"
          disabled={task.busy}
          onClick={() =>
            task.run(async () => {
              await api(
                `/api/admin/reviews/${r.review.id}`,
                json("PATCH", { status: "rejected" }),
              );
              reload();
            })
          }
        >
          Reject
        </button>
      </div>
    </div>
  );
}
function AdminSettings({ settings: s, reload }: any) {
  const task = useTask(),
    { notify } = useStore();
  return (
    <div className="data-panel settings-panel">
      <h2>The way your marketplace works</h2>
      <p className="muted">
        Payment instructions are displayed to customers at checkout. Add public
        receiving details only, never account passwords or PINs.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          task.run(async () => {
            await api(
              "/api/admin/settings",
              json("PUT", {
                storeName: f.get("storeName"),
                announcement: f.get("announcement"),
                supportEmail: f.get("supportEmail"),
                commissionBps: Math.round(Number(f.get("commission")) * 100),
                shippingFee: Math.round(Number(f.get("shipping")) * 100),
                freeShippingThreshold: Math.round(
                  Number(f.get("threshold")) * 100,
                ),
                jazzcash: f.get("jazzcash"),
                easypaisa: f.get("easypaisa"),
                bankTransfer: f.get("bankTransfer"),
              }),
            );
            notify("Your store settings are updated.");
            reload();
          });
        }}
      >
        <div className="form-grid">
          <Field label="Store name">
            <input
              name="storeName"
              defaultValue={s.storeName}
              required
              minLength={3}
              maxLength={100}
            />
          </Field>
          <Field label="Support email">
            <input
              name="supportEmail"
              type="email"
              defaultValue={s.supportEmail}
            />
          </Field>
          <div className="span-two">
            <Field label="Store announcement">
              <input
                name="announcement"
                defaultValue={s.announcement}
                required
                maxLength={200}
              />
            </Field>
          </div>
          <Field
            label="Platform commission (%)"
            hint="Applies to the seller’s base price. Existing orders keep their original rate."
          >
            <input
              name="commission"
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              defaultValue={s.commissionBps / 100}
            />
          </Field>
          <Field label="Delivery fee (PKR)">
            <input
              name="shipping"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={s.shippingFee / 100}
            />
          </Field>
          <Field label="Free delivery threshold (PKR)">
            <input
              name="threshold"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={s.freeShippingThreshold / 100}
            />
          </Field>
        </div>
        <div className="settings-divider" />
        <h3>Manual payment receiving instructions</h3>
        <p className="muted small">
          Leave a method blank to keep it disabled. Cash on Delivery is always
          available.
        </p>
        <Field label="JazzCash">
          <textarea
            name="jazzcash"
            defaultValue={s.jazzcash}
            maxLength={1000}
            rows={3}
            placeholder="Receiving mobile number and account title"
          />
        </Field>
        <Field label="Easypaisa">
          <textarea
            name="easypaisa"
            defaultValue={s.easypaisa}
            maxLength={1000}
            rows={3}
            placeholder="Receiving mobile number and account title"
          />
        </Field>
        <Field label="Bank transfer">
          <textarea
            name="bankTransfer"
            defaultValue={s.bankTransfer}
            maxLength={2000}
            rows={4}
            placeholder="Bank name, account title, account number / IBAN, and payment instructions"
          />
        </Field>
        <Alert>{task.error}</Alert>
        <button className="button" disabled={task.busy}>
          Save store settings
          <Check size={16} />
        </button>
      </form>
    </div>
  );
}
