import { supabase } from "./supabase";
import React, { useMemo, useState } from "react";

const products = [
  { id: 1, name: "Elegant Pink 3-Piece Suit", category: "Women's Fashion", price: 3499, old: 4999, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700" },
  { id: 2, name: "Luxury Women's Handbag", category: "Bags", price: 2499, old: 3299, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700" },
  { id: 3, name: "Premium Beauty Essentials", category: "Beauty", price: 1899, old: 2599, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700" },
  { id: 4, name: "Classic Ladies Shoes", category: "Shoes", price: 2999, old: 3999, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700" },
  { id: 5, name: "Stylish Wrist Watch", category: "Accessories", price: 2199, old: 2999, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=700" },
  { id: 6, name: "Beautiful Home Decor", category: "Home & Living", price: 1599, old: 2199, image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=700" },
  { id: 7, name: "Modern Fashion Outfit", category: "Women's Fashion", price: 3999, old: 5499, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700" },
  { id: 8, name: "Skincare Collection", category: "Beauty", price: 1799, old: 2399, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700" }
];

const categories = [
  "All Products", "Women's Fashion", "Beauty", "Bags",
  "Shoes", "Accessories", "Home & Living"
];

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [cart, setCart] = useState<number[]>([]);
  const [menu, setMenu] = useState(false);

  const filtered = useMemo(() => products.filter(p =>
    (category === "All Products" || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [category, search]);

  const money = (n: number) => "Rs. " + n.toLocaleString("en-PK");

  return (
    <div className="site">
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;font-family:Arial,sans-serif;color:#34232b}
        button,input{font:inherit}
        button{cursor:pointer}
        .site{background:#fffafa;min-height:100vh}
        .top{background:#542b3b;color:white;text-align:center;padding:9px;font-size:12px;letter-spacing:1px}
        header{background:white;padding:17px 6%;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;border-bottom:1px solid #f2e5e9}
        .logo{font-family:Georgia,serif;font-size:30px;letter-spacing:4px;color:#9c526c;font-weight:bold}
        .tag{font-size:10px;letter-spacing:3px;color:#98717e;text-align:center;margin-top:3px}
        .nav{display:flex;gap:22px;align-items:center;flex-wrap:wrap}
        .nav a{color:#513743;text-decoration:none;font-size:13px}
        .nav a:hover{color:#b65c7e}
        .cart{background:#9c526c;color:white;border:0;border-radius:25px;padding:11px 18px}
        .hero{margin:24px auto;width:90%;min-height:340px;border-radius:18px;overflow:hidden;background:linear-gradient(90deg,rgba(48,19,32,.78),rgba(48,19,32,.05)),url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600') center/cover;display:flex;align-items:center;padding:45px;color:white}
        .heroContent{max-width:480px}
        .eyebrow{letter-spacing:4px;font-size:11px}
        .hero h1{font:48px Georgia,serif;margin:15px 0}
        .hero p{line-height:1.7;font-size:15px}
        .primary{background:#b66b83;color:white;border:0;padding:14px 23px;border-radius:5px;margin-top:12px}
        .section{width:90%;margin:48px auto}
        .heading{text-align:center;font:32px Georgia,serif;color:#633849;margin-bottom:8px}
        .sub{text-align:center;color:#987d86;font-size:13px;margin-bottom:27px}
        .categories{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .chip{border:1px solid #e8cbd5;background:white;color:#75485a;border-radius:25px;padding:10px 16px;font-size:12px}
        .chip.active,.chip:hover{background:#9c526c;color:white;border-color:#9c526c}
        .search{display:block;width:min(500px,100%);margin:25px auto;padding:14px 18px;border:1px solid #ead8df;border-radius:30px;outline:none;background:white}
        .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
        .product{background:white;border:1px solid #f0e5e9;border-radius:12px;overflow:hidden;transition:.2s}
        .product:hover{transform:translateY(-4px);box-shadow:0 10px 25px #67354b12}
        .product img{width:100%;height:220px;object-fit:cover;background:#f5e9ed}
        .details{padding:14px}
        .details small{color:#a16c80}
        .details h3{font-size:14px;min-height:34px;margin:8px 0}
        .price{font-weight:bold;color:#9c526c;font-size:16px}
        .old{color:#aaa;text-decoration:line-through;font-size:12px;margin-left:7px}
        .add{width:100%;margin-top:13px;padding:11px;border:0;background:#9c526c;color:white;border-radius:5px}
        .add:hover,.primary:hover{background:#713c51}
        .empty{text-align:center;color:#987d86;padding:35px;grid-column:1/-1}
        .banner{background:#f6e8ed;border-radius:16px;padding:35px;text-align:center}
        .banner h2{font:30px Georgia,serif;color:#713c51}
        .banner p{color:#795d68;line-height:1.7}
        .features{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:25px}
        .feature{background:white;padding:22px;border-radius:12px;text-align:center;border:1px solid #f0e5e9}
        .feature b{display:block;color:#713c51;margin-bottom:8px}
        footer{background:#38232d;color:#f8eaf0;padding:35px 6%;margin-top:50px}
        .footgrid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:25px}
        footer h3{font:22px Georgia,serif}
        footer p,footer a{font-size:12px;line-height:1.9;color:#e6cbd5;text-decoration:none}
        .copy{text-align:center;border-top:1px solid #654653;margin-top:25px;padding-top:18px;font-size:11px;color:#d7b8c4}
        @media(max-width:850px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.nav{gap:12px}.hero h1{font-size:38px}}
        @media(max-width:520px){header{justify-content:center;text-align:center}.nav{justify-content:center}.hero{min-height:300px;padding:25px}.hero h1{font-size:34px}.section{width:92%}.product img{height:175px}.features{grid-template-columns:1fr}.footgrid{grid-template-columns:1fr}.heading{font-size:27px}}
      `}</style>

      <div className="top">WELCOME TO ROSEVARA — STYLE, BEAUTY & MORE</div>

      <header>
        <div>
          <div className="logo">ROSEVARA</div>
          <div className="tag">BEAUTY • FASHION • LIFESTYLE</div>
        </div>
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#sell">Sell with us</a>
          <button className="cart" onClick={() => alert("Your cart has " + cart.length + " item(s).")}>
            Cart ({cart.length})
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="heroContent">
            <div className="eyebrow">THE ROSEVARA COLLECTION</div>
            <h1>Elegance in Every Detail</h1>
            <p>Discover fashion, beauty and lifestyle essentials. Find something beautiful for every day.</p>
            <a href="#shop"><button className="primary">Explore Collection</button></a>
          </div>
        </section>

        <section className="section" id="categories">
          <h2 className="heading">Shop by Category</h2>
          <p className="sub">Explore our collections</p>
          <div className="categories">
            {categories.map(c => (
              <button key={c} className={"chip " + (category === c ? "active" : "")}
                onClick={() => { setCategory(c); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>
                {c}
              </button>
            ))}
          </div>
        </section>

        <section className="section" id="shop">
          <h2 className="heading">Our Collection</h2>
          <p className="sub">Beautiful finds, thoughtfully selected</p>
          <input className="search" placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <div className="grid">
            {filtered.map(p => (
              <article className="product" key={p.id}>
                <img src={p.image} alt={p.name} />
                <div className="details">
                  <small>{p.category}</small>
                  <h3>{p.name}</h3>
                  <span className="price">{money(p.price)}</span>
                  <span className="old">{money(p.old)}</span>
                  <button className="add" onClick={() => setCart(old => [...old, p.id])}>
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <div className="empty">No products found. Try another search.</div>}
          </div>
        </section>

        <section className="section" id="sell">
          <div className="banner">
            <h2>Grow With Rosevara</h2>
            <p>Are you a seller or reseller? Rosevara is building a marketplace where businesses and promoters can grow together.</p>
            <div className="features">
              <div className="feature"><b>Seller Community</b><span>Showcase your products</span></div>
              <div className="feature"><b>Reseller Community</b><span>Promote products and earn</span></div>
              <div className="feature"><b>Customer Shopping</b><span>Discover new collections</span></div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footgrid">
          <div><h3>ROSEVARA</h3><p>Your beautiful shopping destination for fashion, beauty and lifestyle.</p></div>
          <div><h4>Explore</h4><p><a href="#home">Home</a><br/><a href="#shop">Shop</a><br/><a href="#categories">Categories</a></p></div>
          <div><h4>Information</h4><p>About Us<br/>Terms & Conditions<br/>Privacy Policy<br/>Shipping & Returns</p></div>
        </div>
        <div className="copy">© 2026 Rosevara. All rights reserved.</div>
      </footer>
    </div>
  );
   }
     
