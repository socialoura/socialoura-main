# Admin Dashboard — Spécification fonctionnelle & technique (copiable par une IA)

Ce document décrit **toutes les fonctionnalités** du dashboard admin, **comment il marche**, et les **points techniques** (UI, routes API, base de données, auth) nécessaires pour qu’une IA puisse **le reconstruire**.

## 1) Vue d’ensemble

- **Frontend**: Next.js (App Router) + React Client Components
- **UI Admin**: `src/app/admin/dashboard/page.tsx`
- **Analytics**: `src/components/admin/AnalyticsDashboard.tsx` (charts Recharts)
- **Backend**: Next.js API Routes sous `src/app/api/admin/*`
- **DB**: Vercel Postgres via `@vercel/postgres` + helpers `src/lib/db.ts`
- **Auth**: token admin stocké en `localStorage` et envoyé via header `Authorization: Bearer <token>`

## 2) Authentification admin

### 2.1 Login
- **Route**: `POST /api/admin/login`
- **Fichier**: `src/app/api/admin/login/route.ts`
- **Entrée**: `{ username, password }`
- **Source des identifiants**: variables d’env
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- **Token émis**: base64 de JSON 
  - `{ username, role: 'admin', exp: Date.now() + 24h }`
- **Sortie**: `{ token, success: true }` ou `{ error }`

### 2.2 Vérification du token
- Les endpoints admin lisent `Authorization`.
- Ils décodent le token (base64 → JSON) et vérifient:
  - `decoded.exp > Date.now()`
  - `decoded.role === 'admin'`

### 2.3 Côté UI (dashboard)
- Le token est lu via `localStorage.getItem('adminToken')`.
- Si absent: redirection vers `/admin`.
- Bouton Logout: supprime `adminToken` et redirige `/admin`.

## 3) Structure du dashboard admin (UI)

### 3.1 Page principale
- **Fichier**: `src/app/admin/dashboard/page.tsx`
- **Onglets** (`activeTab`):
  - `pricing`
  - `settings`
  - `orders`
  - `analytics`
  - `promo`

### 3.2 Chargements et fetch
La page déclenche des fetchs selon l’onglet:
- `pricing` → `fetchPricing()`
- `orders` → `fetchOrders()`
- `analytics` → `fetchOrders()` + `fetchGoogleAdsExpenses()`
- `settings` → `fetchStripeSettings()`
- `promo` → `fetchPromoCodes()` + `fetchPromoFieldEnabled()`

## 4) Fonctionnalités par onglet

## 4.A Onglet “Social Media Pricing” (pricing)

### Objectif
Gérer les grilles de prix par paliers de followers pour:
- Instagram
- TikTok

### UI
- 2 sections séparées (Instagram / TikTok)
- Ajout d’un palier (`followers`, `price`)
- Suppression avec confirmation
- Bouton “Save All Changes” pour persister

### API
- **GET** `GET /api/admin/pricing`
  - retourne la grille de prix.
- **PUT** `PUT /api/admin/pricing`
  - nécessite token admin
  - body: `{ instagram: Goal[], tiktok: Goal[] }`

### Stockage
- Table `pricing` (clé `pricing-data`, colonne `data` en JSONB)
- Fonctions DB:
  - `getPricing()`
  - `setPricing()`

## 4.B Onglet “Admin Settings” (settings)

### 4.B.1 Changement mot de passe admin
- UI: formulaire (current / new / repeat)
- Validation UI:
  - champs requis
  - new == repeat
  - longueur >= 8

#### API
- **POST** `POST /api/admin/password`
  - nécessite token admin
  - met à jour le mot de passe en DB (table `admin_users`)

#### Stockage
- Table `admin_users`
- Fonction DB: `updateAdminPassword(username, newPassword)`

### 4.B.2 Stripe API Keys
- UI: champs secret/publishable
- Validation API:
  - secret commence par `sk_`
  - publishable commence par `pk_`

#### API
- **GET** `GET /api/admin/stripe-settings`
- **PUT** `PUT /api/admin/stripe-settings`

#### Stockage
- Table `settings`:
  - key `stripe_secret_key`
  - key `stripe_publishable_key`
- Fonctions DB:
  - `getStripeSettings()`
  - `updateStripeSettings(secretKey, publishableKey)`

## 4.C Onglet “Orders”

### Objectif
Lister, filtrer et administrer les commandes.

### UI
- Tableau des commandes avec:
  - ID, username/email, platform, followers, price
  - **Cost** (editable)
  - order_status (select)
  - date
  - notes (editable)
  - delete

### Filtres
- Recherche `username`/`email`
- Filtre platform (all/instagram/tiktok)
- Filtre status (all/pending/processing/completed/cancelled)
- Filtre date (all/today/week/month)

### Actions
1) **Update order status**
- Select “pending/processing/completed/cancelled”
- Appelle `PUT /api/admin/orders/update` avec `{ orderId, orderStatus }`

2) **Edit notes**
- Inline input + Save
- Appelle `PUT /api/admin/orders/update` avec `{ orderId, notes }`

3) **Edit cost (coût réel)**
- Inline input (number) + Save
- Appelle `PUT /api/admin/orders/update` avec `{ orderId, cost }`

4) **Delete order**
- Appelle `DELETE /api/orders/delete/:id` (hors namespace `admin`)

### API
- **GET** `GET /api/admin/orders`
  - nécessite token admin
  - retourne la liste des commandes
- **PUT** `PUT /api/admin/orders/update`
  - nécessite token admin
  - body: `{ orderId, orderStatus?, notes?, cost? }`
  - validation status et `cost >= 0`

### Stockage
- Table `orders`:
  - `order_status` (string)
  - `notes` (text)
  - `cost` (decimal)
  - `price` / `amount` (decimal)
- Fonctions DB:
  - `getAllOrders()`
  - `updateOrderStatus(orderId, orderStatus)`
  - `updateOrderNotes(orderId, notes)`
  - `updateOrderCost(orderId, cost)`

## 4.D Onglet “Analytics”

### Objectif
Afficher des métriques de revenus + profits + distribution, et gérer les dépenses Google Ads.

### 4.D.1 Dépenses Google Ads par mois
- UI:
  - input `type="month"` (format `YYYY-MM`)
  - input montant (EUR)
  - bouton Save
  - tableau listant les mois et montants

#### API
- **GET** `GET /api/admin/google-ads-expenses`
- **PUT** `PUT /api/admin/google-ads-expenses`
  - body: `{ month: 'YYYY-MM', amount }`
  - validations:
    - `month` regex `^\d{4}-\d{2}$`
    - `amount` nombre >= 0

#### Stockage
- Table `google_ads_expenses`:
  - `month` (PK, `YYYY-MM`)
  - `amount` (decimal)

### 4.D.2 Composant AnalyticsDashboard
- **Fichier**: `src/components/admin/AnalyticsDashboard.tsx`
- **Lib**: Recharts
- **Props**:
  - `orders: Order[]`
  - `totalVisitors?: number` (actuellement fixé à `1000` dans le dashboard)
  - `googleAdsExpenses?: { month, amount }[]`

#### Calculs principaux
- **Revenue** (revenu) utilise `order.price` sinon `order.amount`.
- **Profit** (profit commandes) = `(revenue - order.cost)`.
- **Net Profit mensuel** (incluant ads) = `sum(profit commandes du mois) - googleAdsSpend(mois)`.

#### Graphiques / blocs
- Revenue Summary: today / 7 days / 30 days / all time
- Stat cards: total revenue, total orders, average cart, conversion rate
- Charts:
  - Revenue last 7 days (Line)
  - Revenue last 30 days (Bar)
  - Profit last 30 days (Line)
  - **Net Profit by Month (incl. Google Ads)** (Bar, sur 12 mois)
- Platform distribution (Pie)
- Top packages (top 5 par followers)

## 4.E Onglet “Promo Codes”

### Objectif
Créer et gérer des codes promo et activer/désactiver l’affichage du champ promo côté checkout.

### 4.E.1 Toggle champ promo (promo settings)
- UI: switch
- API:
  - **GET** `/api/admin/promo-settings`
  - **PUT** `/api/admin/promo-settings` body `{ enabled: boolean }`
- Stockage:
  - table `settings`, key `promo_enabled`

### 4.E.2 CRUD promo codes
- UI:
  - liste des promo codes
  - bouton New
  - edit
  - delete
  - toggle Active/Inactive

#### API
- **GET** `/api/admin/promo-codes`
- **POST** `/api/admin/promo-codes`
- **PUT** `/api/admin/promo-codes`
- **DELETE** `/api/admin/promo-codes?id=...`

#### Stockage
- table `promo_codes`:
  - `code`, `discount_type`, `discount_value`, `max_uses`, `current_uses`, `expires_at`, `is_active`

## 5) Base de données (init & migrations)

### Initialisation
- `initDatabase()` est appelé au chargement des modules API (pattern: `initDatabase().catch(console.error)`)
- DB: `@vercel/postgres`

### Tables principales
- `admin_users`
- `pricing`
- `orders` (inclut `order_status`, `notes`, `cost`, `promo_code`, `discount_amount`)
- `settings` (stripe keys, promo_enabled, etc.)
- `promo_codes`
- `google_ads_expenses`

## 6) Points importants pour “copier” le dashboard

### Invariants de flux
- Le dashboard est un **client component** (utilise `localStorage`).
- Tous les endpoints admin doivent:
  - vérifier `Authorization: Bearer <token>`
  - refuser si token invalide / expiré.

### Conventions de données
- `month` Google Ads: **string `YYYY-MM`**.
- `Order.cost`: **nombre >= 0**, défaut 0.

### Librairies clés
- `lucide-react` (icônes)
- `recharts` (charts)
- `@vercel/postgres` (DB)

## 7) Checklist de reproduction (résumé)

1) Recréer `AdminDashboard` avec les onglets et l’état.
2) Implémenter `initDatabase` + tables.
3) Implémenter routes API admin:
   - login
   - pricing
   - orders (+ update)
   - stripe-settings
   - promo-settings
   - promo-codes
   - google-ads-expenses
4) Implémenter `AnalyticsDashboard` avec les calculs:
   - revenue
   - profit (revenue - cost)
   - net profit monthly (profit month - ads month)

---

**Fichiers clés**
- `src/app/admin/dashboard/page.tsx`
- `src/components/admin/AnalyticsDashboard.tsx`
- `src/lib/db.ts`
- `src/app/api/admin/*`
