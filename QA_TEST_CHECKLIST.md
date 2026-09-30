# AFRO SPORT — QA TEST CHECKLIST

## 1. Dashboard
- [ ] Dashboard loads without errors
- [ ] Competition filter changes matches, scorers and team statistics
- [ ] Live, upcoming and finished matches display correctly
- [ ] Player Leaders display correctly
- [ ] Team Statistics display correctly
- [ ] Form, GD and Win % are calculated correctly
- [ ] News section loads

## 2. Competition Builder — AFRO TEST CUP
Create a temporary test competition using:
- [ ] Preliminary
- [ ] Round 1
- [ ] Quarter-final
- [ ] Semi-final
- [ ] Final
- [ ] Add test teams
- [ ] Assign teams to the correct stage
- [ ] Confirm stage order and progression

## 3. Fixtures
- [ ] Generate/create fixtures
- [ ] Verify home and away teams
- [ ] Verify date/time and venue
- [ ] Verify stage/group labels
- [ ] Open a match from the public match list

## 4. Lineups
For one test match:
- [ ] Select home team
- [ ] Select formation (4-3-3)
- [ ] Apply preset
- [ ] Select captain
- [ ] Verify 11 starters
- [ ] Verify substitutes
- [ ] Drag players to new positions
- [ ] Assign player roles
- [ ] Save lineup
- [ ] Open public Match Center
- [ ] Verify pitch formation and player labels

## 5. Live Match Center
Run one match through the complete lifecycle:
- [ ] Start LIVE
- [ ] Add goal
- [ ] Add penalty scored
- [ ] Add yellow card
- [ ] Add red card
- [ ] Add substitution
- [ ] Verify score changes
- [ ] Verify event timeline
- [ ] Move to HALFTIME
- [ ] Resume second half
- [ ] Add another goal
- [ ] Test EXTRA TIME
- [ ] Test SHOOTOUT values
- [ ] Finish match
- [ ] Confirm final result

## 6. Realtime
Open Admin Match Center and public Match Center in separate tabs/windows:
- [ ] Score updates appear on public page
- [ ] New events appear without manual refresh
- [ ] Match status changes update
- [ ] Lineup/event data remains consistent

## 7. Standings & Statistics
After finishing the test matches:
- [ ] League/stage standings update
- [ ] Wins/draws/losses are correct
- [ ] Points are correct
- [ ] GF/GA/GD are correct
- [ ] Clean sheets are correct
- [ ] Top scorers update
- [ ] Assists update
- [ ] Yellow/red cards update
- [ ] Team Statistics update
- [ ] Home/Away statistics update
- [ ] Player profile statistics update

## 8. Knockout Progression
- [ ] Winner is identified
- [ ] Winning team advances
- [ ] Next-stage fixture is created/updated
- [ ] Losing team is eliminated
- [ ] Final winner is recorded
- [ ] Verify two-leg aggregate if used
- [ ] Verify penalties decide a tied knockout match

## 9. Negative / Safety Tests
- [ ] Try invalid event type
- [ ] Try duplicate/invalid lineup player
- [ ] Try finishing a match with incorrect result path
- [ ] Verify non-editor users cannot perform admin writes
- [ ] Verify public users can still read public competition/match data

## 10. Final Acceptance
- [ ] No console errors during normal workflow
- [ ] No broken navigation links
- [ ] No empty critical cards caused by failed queries
- [ ] Mobile layout remains usable
- [ ] Desktop layout remains usable
- [ ] Test competition can be removed/archived after QA
