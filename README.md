# AFRO SPORT

African Football Platform built with HTML, CSS, JavaScript, Supabase, and GitHub Pages.

## Mfumo

- **Mashindano:** league, cup, continental, national na aina nyingine.
- **Stages:** league, group stage, qualifier, playoff, knockout na final.
- **Groups:** vikundi ndani ya group stage.
- **Stage Teams:** timu zinazoshiriki kila stage na group/seed zao.
- **Mechi:** fixtures, matokeo, venue, round na legs.
- **Knockout:** ties, seeds, winners na progression.
- **Standings & top scorers:** zinatokana na matokeo na match events zilizokamilika.
- **Admin:** kusimamia mashindano, stages, groups, teams, players, fixtures, results, knockout na habari.

## Deployment

AFRO SPORT inatumia **GitHub Pages** pekee.

- Frontend: `docs/`
- Deployment workflow: `.github/workflows/pages.yml`
- Hosting: GitHub Pages
- Supabase: database, authentication na realtime

Hakuna Vercel inayohitajika kwa deployment ya sasa.

## Supabase

Frontend hutumia Supabase publishable key kupitia `docs/config.js`. Service-role key haijawekwa kwenye frontend.

## Muundo wa data

Database inatumia tables kuu: `leagues`, `competition_stages`, `stage_groups`, `stage_teams`, `teams`, `players`, `matches`, `match_events`, `knockout_ties`, na `news`. Supabase RLS inalinda writes za admin/editor.
