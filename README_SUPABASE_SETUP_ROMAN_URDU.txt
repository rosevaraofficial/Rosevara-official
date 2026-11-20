ROSEVARA - SUPABASE SETUP PACK (IMPORTANT)

Owner email for the initial admin account:
rosevarafashion@gmail.com

Supabase project URL:
https://vorqqthhmoyqszfwymgw.supabase.co

Publishable key was supplied in chat. It is intentionally NOT embedded here.
Never put a Supabase service_role/secret key in browser code or share it in chat.

WHAT THIS ZIP CONTAINS
- Original Rosevara React storefront source and public image assets.
- Original Drizzle schema reference.
- sql/001_rosevara_schema.sql: PostgreSQL table schema matching the original marketplace data model.

IMPORTANT LIMITATION
This is a database setup/migration pack, NOT yet a fully converted Cloudflare Pages application.
The supplied original application calls Netlify Identity, Netlify Database, Netlify Blobs and Netlify server API routes. Those calls still need a complete backend rewrite to Supabase Auth + Supabase database/storage + Cloudflare Pages Functions. Uploading this source as-is to Cloudflare will NOT make login, admin, seller/reseller dashboards, orders, or uploads work. The SQL file creates the data tables only; it does not convert the Netlify API routes or migrate existing live Netlify data.

NEXT STEPS
1. In Supabase dashboard, open SQL Editor.
2. Review sql/001_rosevara_schema.sql and run it once in the separate Rosevara project.
3. In Supabase Authentication > Users, create the owner account using rosevarafashion@gmail.com. Set a strong password privately; do not send it to anyone.
4. Do not assign admin access by editing public user metadata from the browser. The secure admin bootstrap must be added by the server-side conversion, using trusted server credentials and authorization checks.
5. Keep Netlify project live until the converted Cloudflare backend is tested.

No production deployment or working Cloudflare conversion is claimed by this package.
