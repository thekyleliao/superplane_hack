# Linktree-style App Documentation

This Next.js web application provides a minimalist, single-page interface for users to claim a personalized subdomain and build a dynamic list of links. 

## Architecture

1. **Frontend (`app/page.tsx`)**:
   - A modern React component utilizing Tailwind CSS for styling (glassmorphism and gradient effects).
   - Manages state for the desired username, display name, and a dynamic array of links.
   - Provides client-side validation to ensure links have proper URL protocols.

2. **Backend API (`app/api/profile/route.ts`)**:
   - Accepts `POST` requests containing user profile data.
   - Connects to a remote **Render PostgreSQL database** securely (enforcing SSL).
   - Creates a profile record. If the `username` is already taken, it safely catches the Postgres unique constraint violation (`23505`) and returns a `409 Conflict`.
   - Triggers an external **Webhook** on successful insertion to register the newly claimed username as a subdomain via DNS.

3. **Database (`schema.sql`)**:
   - The application relies on a single `profiles` table.
   - `links` are stored effectively in a flexible `JSONB` column.
   - Utilizes PostgreSQL's `gen_random_uuid()` to safely generate unpredictable primary keys.

## Configuration & Environment Variables

The application relies on `.env.local` for sensitive credentials. Required variables include:

- `DATABASE_URL`: The PostgreSQL connection string to your Render database. Must point to the external URL for local development.
- `WEBHOOK_URL`: The API endpoint to call to update the DNS records.
- `BEARER_TOKEN`: The secure token injected into the `Authorization: Bearer` header of the webhook payload.
- `TARGET_DESTINATION`: The root target that the new subdomain CNAME should point to (e.g., `calhacked.tech`).

## Security Measures

- **SQL Injection Prevention**: All queries to the PostgreSQL database utilize parameterized variables via the `pg` driver.
- **XSS Mitigation**: React mitigates arbitrary script injection by default. Additionally, backend link validations strictly require `http://` or `https://` prefixes.
- **Secrets Isolation**: No database URIs, API keys, or webhooks are hardcoded in the codebase.
- **Database Connection Security**: `ssl: { rejectUnauthorized: false }` configuration ensures traffic to the Render Postgres instance over the public internet is encrypted.
