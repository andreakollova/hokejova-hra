# Nastavenie databazy

## 1. Spusti SQL migraciu

Otvor [Supabase SQL Editor](https://supabase.com/dashboard/project/lsyhcskvizaxcaxzofng/sql/new)
a vloz obsah suboru `supabase/migrations/001_initial.sql`.

## 2. Nastav anon kluc

Otvor [API nastavenia](https://supabase.com/dashboard/project/lsyhcskvizaxcaxzofng/settings/api)
a skopiruj `anon` / `public` kluc do `.env.local`:

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvoj_anon_kluc
```

## 3. Over

```bash
npm run dev
```

Otvor http://localhost:3000, skus registraciu a trening.
