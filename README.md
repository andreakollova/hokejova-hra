# Hokejovy Trener

Webova aplikacia na individualny trening pozemneho hokeja. Hrac ovlada realnu farebnu lopticku hokejkou pred kamerou a jej pohyb sa v realnom case prenasa do hry na obrazovke.

## Spustenie

```bash
npm install
cp .env.example .env.local
# Vyplnit Supabase kluce v .env.local
npm run dev
```

## Nastavenie Supabase

1. Vytvor novy projekt na [supabase.com](https://supabase.com)
2. V SQL editore spusti obsah suboru `supabase/migrations/001_initial.sql`
3. Z nastaveni projektu (Settings > API) skopiruj:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL projektu
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon/public kluc
   - `SUPABASE_SERVICE_ROLE_KEY` - service role kluc (len server)

## Nasadenie na Vercel

1. Pripoj repozitar na [vercel.com](https://vercel.com)
2. Nastav environmentalne premenne (rovnake ako v `.env.local`)
3. Framework preset: Next.js

## Nastavenie kamery

- **Kamera**: Bezna USB webkamera alebo vstavanej notebook kamera. Preferuj 720p+, 30+ fps.
- **Poloha**: Kameru poloz nizsie (na stol, cca 50-80 cm nad zemou) a nasmeruj nadol na treningovu plochu. Uhol cca 45-60 stupnov.
- **Osvetlenie**: Rovnomerne svetlo bez silnych odleskov. Vyhnout sa priamemu slnku na podlahe.
- **Lopticka**: Pouzi vyrazne farebnu lopticku - oranzova, zelena alebo cervena. Farba musi byt odlisna od podlahy a okolia.
- **Podlaha**: Jednofarebna podlaha funguje najlepsie. Vyhnout sa podlahe s farbou podobnou lopticke.

### Odporucane predvolene hodnoty

- Rozlisenie: 1280x720 (HD)
- Snimkova frekvencia: 30-60 fps
- HSV tolerancia: H=15, S=30, V=30 (upravit podla podmienok)
- Smoothing: 0.3 (nizsia hodnota = rychlejsia reakcia, vyssia = plynulejsi pohyb)

## Architektura

```
src/
  lib/
    tracking.ts        - Typy a rozhrania sledovacieho modulu
    ball-tracker.ts    - HSV farebna segmentacia, perspektivna korekcia
    supabase.ts        - Supabase klient
    scoring.ts         - Deterministicke skore, seedy pre vyzvy
  hooks/
    useCamera.ts       - Sprava kamery a zariadeni
    useTracker.ts      - React hook pre sledovanie / demo vstup
    useAuth.ts         - Autentifikacia
  components/
    tracking/          - Kalibracny sprievodca (7 krokov)
    games/             - Slalom (3D R3F), Osmicky (2D Canvas)
    ui/                - Vysledky, spolocne komponenty
    auth/              - Prihlasenie / registracia
  app/
    page.tsx           - Hlavna stranka
    trening/           - Slalom
    osmicky/           - Osmicky
    profil/            - Profil hraca
    rebricek/          - Verejne rebricky
    api/scores/        - Serverove overenie a ukladanie vysledkov
```

## Overene vs neoverene casti

**Overene** (build, typy, logika):
- Struktura aplikacie, routing, komponenty
- Logika skorovania, generovanie sekvencii
- Demo rezim s mysou
- Supabase schema a RLS pravidla

**Vyzaduju test s realnou kamerou**:
- HSV farebna segmentacia v roznych svetelnych podmienkach
- Perspektivna korekcia (4 rohy)
- Vyhladenie pohybu a latencia
- Spravanie pri strate sledovania
- Kalibracny proces s realnou loptickov

## Licencia

Vsetky 3D objekty su jednoduche geometrie vytvorene priamo v kode (kuzel, gula, rovina). Ziadne externe assety.
