# AFRO SPORT

African Football Platform built with Next.js + Supabase.

## Mfumo

- **Mashindano:** league, cup, continental, national na aina nyingine.
- **Stages:** league, group stage, qualifier, playoff, knockout na final.
- **Groups:** vikundi ndani ya group stage.
- **Stage Teams:** timu zinazoshiriki kila stage na group/seed zao.
- **Mechi:** fixtures, matokeo, venue, round na legs.
- **Knockout:** ties, seeds, winners na progression.
- **Standings & top scorers:** zinatokana na matokeo na match events zilizokamilika.
- **Admin:** kusimamia mashindano, stages, groups, teams, players, fixtures, results, knockout na habari.

## Kuunganisha Supabase

Weka variables hizi kwenye `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Mfano upo kwenye `.env.example`.

## Kuendesha

```bash
npm install
npm run dev
```

Kisha fungua `/` kwa dashboard na `/admin` kwa usimamizi.

## Muundo wa data

Database inatumia tables kuu: `leagues`, `competition_stages`, `stage_groups`, `stage_teams`, `teams`, `players`, `matches`, `match_events`, `knockout_ties`, na `news`. Supabase RLS inalinda writes za admin/editor.
