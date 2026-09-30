# DAFA Admin + Vendor System

This version provides role-based login and vendor-scoped workspaces while preserving the existing figures and IDs.

## Login
- Admin: `admin@dafa.local` / `admin123`
- Existing vendor (ABC Supplies): `vendor@abcsupplies.local` / `vendor123`

## Admin
- Can view all registered vendors.
- Can create additional vendor accounts from the Vendors page.
- New vendor accounts start with an empty workspace so they do not inherit ABC Supplies data.

## Vendor
- Can only log in to their own account.
- Vendor ID is bound to the session and the UI scope.
- Existing ABC Supplies data remains attached to `V-00124`.
- New vendors see no other vendor's figures until their own data is assigned.

## Important security note
This GitHub Pages version enforces the vendor scope in the browser. It is suitable as a working frontend/demo, but it is **not a security boundary** because GitHub Pages is static. For confidential real-world vendor data, the next step is to move authentication and data permissions to a backend/database with row-level security (for example Supabase or Firebase).
