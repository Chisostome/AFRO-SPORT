const cfg=window.AFRO_CONFIG||{};
const db=cfg.supabaseKey&&cfg.supabaseKey.indexOf("WEKA_")!==0?supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey):null;
const app=document.getElementById("app");
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const fmt=d=>d?new Date(d).toLocaleString("sw-TZ",{dateStyle:"medium",timeStyle:"short"}):"—";
const q=v=>encodeURIComponent(v??"");
function shell(t,b){app.innerHTML='<div class="head"><div><div class="tag">AFRO SPORT</div><h1>'+t+'</h1></div><a class="btn" href="#/">← Dashboard</a></div>'+b}
function errBox(e){return '<div class="empty">Imeshindikana kupakia data. '+esc(e?.message||"Jaribu tena.")+'</div>'}
function table(rows,cols){return '<div class="card"><div class="list">'+(rows||[]).map(x=>'<div class="row">'+cols.map(c=>'<span><b>'+esc(c[1](x))+'</b></span>').join("")).replaceAll('<span><b>','<span><b>')+'</div>').join("")+'</div></div>'}

async function dashboard(){
 if(!db)return shell("AFRO SPORT",'<div class="card"><h2>Frontend tayari</h2><p>Supabase haijaunganishwa.</p></div>');
 const [l,t,p,m,live,res,s]=await Promise.all([
  db.from("leagues").select("id",{count:"exact",head:true}).eq("is_active",true),
  db.from("teams").select("id",{count:"exact",head:true}),
  db.from("players").select("id",{count:"exact",head:true}),
  db.from("matches").select("id",{count:"exact",head:true}),
  db.from("matches").select("id,scheduled_at,status,home_score,away_score,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").eq("status","live").order("scheduled_at").limit(6),
  db.from("matches").select("id,scheduled_at,status,home_score,away_score,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").eq("status","finished").order("scheduled_at",{ascending:false}).limit(6),
  db.from("competition_top_scorers").select("player_id,player_name,team_name,goals").order("goals",{ascending:false}).limit(5)
 ]);
 const row=x=>'<a class="row" href="#/matches/'+x.id+'"><span><b>'+esc(x.home_team?.name)+' vs '+esc(x.away_team?.name)+'</b><small>'+fmt(x.scheduled_at)+'</small></span><strong>'+((x.status==="scheduled")?"VS":(x.home_score??0)+" - "+(x.away_score??0))+'</strong></a>';
 shell("Mpira wa Afrika, sehemu moja.",'<div class="hero"><div><p>Fuata mashindano, vikundi, knockout, matokeo, standings, wafungaji na habari.</p></div><div class="ball">⚽</div></div><div class="cards"><a class="card stat" href="#/competitions"><small>Mashindano</small><strong>'+(l.count||0)+'</strong></a><a class="card stat" href="#/teams"><small>Timu</small><strong>'+(t.count||0)+'</strong></a><a class="card stat" href="#/players"><small>Wachezaji</small><strong>'+(p.count||0)+'</strong></a><a class="card stat" href="#/matches"><small>Mechi</small><strong>'+(m.count||0)+'</strong></a></div><div class="grid"><section class="card"><h2>🔴 Live</h2><div class="list">'+((live.data||[]).map(row).join("")||'<div class="empty">Hakuna mechi live.</div>')+'</div><h2>Matokeo</h2><div class="list">'+((res.data||[]).map(row).join("")||'<div class="empty">Hakuna matokeo.</div>')+'</div></section><section class="card"><h2>Top Scorers</h2><div class="list">'+((s.data||[]).map(x=>'<a class="row" href="#/players/'+x.player_id+'"><span><b>'+esc(x.player_name)+'</b><small>'+esc(x.team_name)+'</small></span><strong>'+x.goals+' ⚽</strong></a>').join("")||'<div class="empty">Hakuna.</div>')+'</div></section></div>');
}

async function listPage(t,title,fields,link){
 if(!db)return shell(title,'<div class="empty">Supabase haijaunganishwa.</div>');
 const r=await db.from(t).select(fields).limit(200);
 if(r.error)return shell(title,errBox(r.error));
 shell(title,'<div class="card"><div class="list">'+((r.data||[]).map(x=>'<a class="row" href="'+(link?link(x):"#")+'"><span><b>'+esc(x.name||x.player_name||x.title||"")+'</b><small>'+esc(x.country||x.position||x.team_name||x.category||x.competition_type||"")+'</small></span><span class="accent">→</span></a>').join("")||'<div class="empty">Hakuna data.</div>')+'</div></div>');
}

async function competitions(){
 const r=await db.from("leagues").select("id,name,country,season,competition_type,description,is_active").order("created_at",{ascending:false});
 if(r.error)return shell("Mashindano",errBox(r.error));
 shell("Mashindano",'<div class="cards">'+(r.data||[]).map(x=>'<a class="card" href="#/competitions/'+x.id+'"><div class="tag">'+esc(x.competition_type||"competition")+'</div><h2>'+esc(x.name)+'</h2><p>'+esc(x.country||"Africa")+' · '+esc(x.season||"")+'</p><span class="accent">Fungua mashindano →</span></a>').join("")+'</div>');
}

async function competition(id){
 const [c,s,st,m,sc]=await Promise.all([
  db.from("leagues").select("*").eq("id",id).single(),
  db.from("competition_stages").select("id,name,stage_type,stage_order,leg_count").eq("league_id",id).order("stage_order"),
  db.from("stage_teams").select("stage_id,team_id,group_id,teams(name,short_name)").eq("stage_id",(await db.from("competition_stages").select("id").eq("league_id",id).order("stage_order").limit(1)).data?.[0]?.id||"00000000-0000-0000-0000-000000000000"),
  db.from("matches").select("id,scheduled_at,status,home_score,away_score,round_name,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").eq("league_id",id).order("scheduled_at",{ascending:false}).limit(12),
  db.from("competition_top_scorers").select("player_id,player_name,team_name,goals").eq("competition_id",id).order("goals",{ascending:false}).limit(10)
 ]);
 if(c.error)return shell("Mashindano",errBox(c.error));
 const stages=(s.data||[]).map(x=>'<div class="row"><span><b>'+esc(x.name)+'</b><small>'+esc(x.stage_type)+' · '+(x.leg_count||1)+' leg(s)</small></span><span class="accent">Stage '+x.stage_order+'</span></div>').join("")||'<div class="empty">Hakuna stages.</div>';
 const matches=(m.data||[]).map(x=>'<a class="row" href="#/matches/'+x.id+'"><span><b>'+esc(x.home_team?.name)+' — '+esc(x.away_team?.name)+'</b><small>'+fmt(x.scheduled_at)+' · '+esc(x.status)+'</small></span><strong>'+((x.status==="scheduled")?"VS":(x.home_score??0)+" - "+(x.away_score??0))+'</strong></a>').join("")||'<div class="empty">Hakuna mechi.</div>';
 const scorers=(sc.data||[]).map(x=>'<a class="row" href="#/players/'+x.player_id+'"><span><b>'+esc(x.player_name)+'</b><small>'+esc(x.team_name)+'</small></span><strong>'+x.goals+' ⚽</strong></a>').join("")||'<div class="empty">Hakuna wafungaji.</div>';
 shell(esc(c.data.name),'<div class="detail"><section class="card"><div class="tag">'+esc(c.data.competition_type||"competition")+'</div><h2>'+esc(c.data.country||"Africa")+' · '+esc(c.data.season||"")+'</h2><p>'+esc(c.data.description||"")+'</p><h2>Stages</h2><div class="list">'+stages+'</div><p><a class="btn" href="#/competitions/'+id+'/standings">Angalia standings →</a></p></section><section class="card"><h2>Wafungaji</h2><div class="list">'+scorers+'</div></section></div><section class="card section"><h2>Mechi za mwisho</h2><div class="list">'+matches+'</div></section>');
}

async function standings(id){
 const r=await db.from("league_standings").select("*").eq("league_id",id).order("points",{ascending:false}).order("goal_difference",{ascending:false});
 const c=await db.from("leagues").select("name").eq("id",id).single();
 if(r.error)return shell("Standings",errBox(r.error));
 const rows=(r.data||[]).map((x,i)=>'<div class="row"><span><b>'+((i+1)+". "+esc(x.team_name||x.name))+'</b><small>'+x.played+' GP · '+x.wins+'W '+x.draws+'D '+x.losses+'L · '+x.goals_for+':'+x.goals_against+'</small></span><strong>'+x.points+' pts</strong></div>').join("")||'<div class="empty">Hakuna standings.</div>';
 shell("Standings · "+esc(c.data?.name||""),'<div class="card"><div class="list">'+rows+'</div></div>');
}

async function teams(){
 const r=await db.from("teams").select("id,name,short_name,city,leagues(name)").order("name");
 if(r.error)return shell("Timu",errBox(r.error));
 shell("Timu",'<div class="cards">'+(r.data||[]).map(x=>'<a class="card" href="#/teams/'+x.id+'"><h2>'+esc(x.name)+'</h2><p>'+esc(x.short_name||"")+' · '+esc(x.city||"")+'</p><small>'+esc(x.leagues?.name||"")+'</small></a>').join("")+'</div>');
}

async function team(id){
 const [t,p,m]=await Promise.all([
  db.from("teams").select("*,leagues(name)").eq("id",id).single(),
  db.from("players").select("id,name,position,jersey_number").eq("team_id",id).order("jersey_number"),
  db.from("matches").select("id,scheduled_at,status,home_score,away_score,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").or("home_team_id.eq."+id+",away_team_id.eq."+id).order("scheduled_at",{ascending:false}).limit(12)
 ]);
 if(t.error)return shell("Timu",errBox(t.error));
 shell(esc(t.data.name),'<div class="detail"><section class="card"><div class="tag">'+esc(t.data.leagues?.name||"")+'</div><h2>'+esc(t.data.short_name||"")+'</h2><p>'+esc(t.data.city||"")+'</p><h2>Wachezaji</h2><div class="list">'+(p.data||[]).map(x=>'<a class="row" href="#/players/'+x.id+'"><span><b>'+esc(x.name)+'</b><small>'+esc(x.position||"")+'</small></span><strong>#'+(x.jersey_number||"—")+'</strong></a>').join("")+'</div></section><section class="card"><h2>Mechi</h2><div class="list">'+(m.data||[]).map(x=>'<a class="row" href="#/matches/'+x.id+'"><span><b>'+esc(x.home_team?.name)+' — '+esc(x.away_team?.name)+'</b><small>'+fmt(x.scheduled_at)+'</small></span><strong>'+((x.status==="scheduled")?"VS":(x.home_score??0)+" - "+(x.away_score??0))+'</strong></a>').join("")+'</div></section></div>');
}

async function players(){return listPage("players","Wachezaji","id,name,position,jersey_number,teams(name)",x=>"#/players/"+x.id)}

async function player(id){
 const [p,s,a]=await Promise.all([
  db.from("players").select("*,teams(name),player_competition_stats(*)").eq("id",id).single(),
  db.from("player_match_appearances").select("*").eq("player_id",id).limit(20),
  db.from("match_events").select("event_type,minute,match_id").eq("player_id",id).order("created_at",{ascending:false}).limit(30)
 ]);
 if(p.error)return shell("Mchezaji",errBox(p.error));
 const stats=(p.data.player_competition_stats||[]).map(x=>'<div class="row"><span><b>'+esc(x.competition_id)+'</b><small>'+x.event_matches+' matches · '+x.assists+' assists · '+x.yellow_cards+' yellow · '+x.red_cards+' red</small></span><strong>'+x.goals+' ⚽</strong></div>').join("")||'<div class="empty">Hakuna stats za matukio.</div>';
 shell(esc(p.data.name),'<div class="detail"><section class="card"><div class="tag">'+esc(p.data.position||"")+'</div><h2>'+esc(p.data.teams?.name||"")+'</h2><p>Namba '+esc(p.data.jersey_number||"—")+'</p><h2>Competition Stats</h2><div class="list">'+stats+'</div></section><section class="card"><h2>Recent appearances</h2><p>'+((a.data||[]).length)+' appearances zilizorekodiwa.</p><h2>Events</h2><div class="list">'+(a.data||[]).slice(0,12).map(x=>'<div class="row"><span><b>'+esc(x.event_type)+'</b><small>Match '+esc(x.match_id)+' · '+esc(x.minute||"")+"'</small></span></div>').join("")+'</div></section></div>');
}

async function matches(){
 const r=await db.from("matches").select("id,scheduled_at,status,home_score,away_score,round_name,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name),leagues(name)").order("scheduled_at",{ascending:false}).limit(100);
 if(r.error)return shell("Mechi",errBox(r.error));
 shell("Mechi",'<div class="card"><div class="list">'+(r.data||[]).map(x=>'<a class="row" href="#/matches/'+x.id+'"><span><b>'+esc(x.home_team?.name)+' — '+esc(x.away_team?.name)+'</b><small>'+fmt(x.scheduled_at)+' · '+esc(x.leagues?.name||"")+' · '+esc(x.status)+'</small></span><strong>'+((x.status==="scheduled")?"VS":(x.home_score??0)+" - "+(x.away_score??0))+'</strong></a>').join("")+'</div></div>');
}

async function match(id){
 const [r,e]=await Promise.all([
  db.from("matches").select("*,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name),leagues(name),competition_stages(name)").eq("id",id).single(),
  db.from("match_events").select("*,players:player_id(name),teams:team_id(name)").eq("match_id",id).order("minute").order("added_time")
 ]);
 if(r.error)return shell("Mechi",errBox(r.error));
 const events=(e.data||[]).map(x=>'<div class="row"><span><b>'+esc(x.event_type)+'</b><small>'+esc(x.minute||"")+(x.added_time? "+"+x.added_time:"")+"' · "+esc(x.players?.name||"")+'</small></span><span>'+esc(x.teams?.name||"")+'</span></div>').join("")||'<div class="empty">Hakuna events.</div>';
 shell(esc(r.data.home_team?.name)+" vs "+esc(r.data.away_team?.name),'<div class="detail"><section class="card"><div class="tag">'+esc(r.data.status)+'</div><div class="score">'+(r.data.home_score??0)+' — '+(r.data.away_score??0)+'</div><p>'+fmt(r.data.scheduled_at)+'</p><p>'+esc(r.data.leagues?.name||"")+' · '+esc(r.data.competition_stages?.name||r.data.round_name||"")+'</p></section><section class="card"><h2>Events</h2><div class="list">'+events+'</div></section></div>');
}

async function statistics(){return listPage("competition_top_scorers","Top Scorers","player_id,player_name,team_name,goals",x=>"#/players/"+x.player_id)}
async function news(){
 const r=await db.from("news").select("id,title,category,published_at,summary,content").order("published_at",{ascending:false}).limit(100);
 if(r.error)return shell("Habari",errBox(r.error));
 shell("Habari",'<div class="cards">'+(r.data||[]).map(x=>'<a class="card" href="#/news/'+x.id+'"><div class="tag">'+esc(x.category||"Habari")+'</div><h2>'+esc(x.title)+'</h2><p>'+esc(x.summary||"")+'</p><small>'+fmt(x.published_at)+'</small></a>').join("")+'</div>');
}
async function newsDetail(id){
 const r=await db.from("news").select("*").eq("id",id).single();
 if(r.error)return shell("Habari",errBox(r.error));
 shell(esc(r.data.title),'<article class="card"><div class="tag">'+esc(r.data.category||"Habari")+' · '+fmt(r.data.published_at)+'</div><p>'+esc(r.data.summary||"")+'</p><div style="white-space:pre-wrap;line-height:1.8">'+esc(r.data.content||"")+'</div></article>');
}
async function admin(){
 const {data:{session}}=await db.auth.getSession();
 if(!session){
  shell("Admin",'<div class="card"><h2>Ingia Admin</h2><p>Admin inahitaji Supabase Auth. Akaunti lazima iwe na role ya <b>editor</b>.</p><form id="loginForm" class="form"><input id="email" type="email" placeholder="Email" required><input id="password" type="password" placeholder="Password" required><button class="btn" type="submit">Ingia</button><div id="authMsg" class="empty"></div></form></div>');
  document.getElementById("loginForm").onsubmit=async e=>{e.preventDefault();const msg=document.getElementById("authMsg");msg.textContent="Inaingia...";const r=await db.auth.signInWithPassword({email:document.getElementById("email").value,password:document.getElementById("password").value});if(r.error)msg.textContent=r.error.message;else route()};return;
 }
 const leagues=await db.from("leagues").select("id,name,country,season,competition_type,is_active").order("created_at",{ascending:false});
 shell("Admin",'<div class="detail"><section class="card"><div class="head"><div><div class="tag">SIGNED IN</div><h2>'+esc(session.user.email)+'</h2></div><button class="btn" id="logout">Toka</button></div><p>Uandishi unaruhusiwa kwa users wenye editor role kupitia RLS.</p><h2>Ongeza Mashindano</h2><form id="leagueForm" class="form"><input id="lname" placeholder="Jina la mashindano" required><input id="lcountry" placeholder="Nchi / eneo" value="Africa"><input id="lseason" placeholder="Season, mfano 2026/27"><select id="ltype"><option value="league">League</option><option value="group_stage">Group Stage</option><option value="playoff">Playoff</option><option value="knockout">Knockout</option><option value="final">Final</option><option value="qualifier">Qualifier</option></select><textarea id="ldesc" placeholder="Maelezo"></textarea><button class="btn" type="submit">Hifadhi Mashindano</button><div id="leagueMsg" class="empty"></div></form></section><section class="card"><h2>Mashindano</h2><div class="list">'+(leagues.data||[]).map(x=>'<div class="row"><span><b>'+esc(x.name)+'</b><small>'+esc(x.country||"")+' · '+esc(x.season||"")+' · '+esc(x.competition_type||"")+'</small></span><span class="accent">'+(x.is_active?"Active":"Inactive")+'</span></div>').join("")+'</div></section></div>');
 document.getElementById("logout").onclick=async()=>{await db.auth.signOut();route()};
 document.getElementById("leagueForm").onsubmit=async e=>{e.preventDefault();const msg=document.getElementById("leagueMsg");msg.textContent="Inahifadhi...";const slug=document.getElementById("lname").value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");const r=await db.from("leagues").insert({name:document.getElementById("lname").value.trim(),country:document.getElementById("lcountry").value.trim(),season:document.getElementById("lseason").value.trim(),competition_type:document.getElementById("ltype").value,description:document.getElementById("ldesc").value.trim(),slug,is_active:true}).select("id").single();if(r.error)msg.textContent="Imeshindikana: "+r.error.message;else{msg.textContent="Mashindano yamehifadhiwa.";route()}};
}

async function route(){
 const p=location.hash.replace(/^#\/?/,"").split("/").filter(Boolean);
 try{
  if(!p.length)return dashboard();
  if(!db)return shell("AFRO SPORT",'<div class="empty">Supabase haijaunganishwa.</div>');
  if(p[0]==="competitions"&&!p[1])return competitions();
  if(p[0]==="competitions"&&p[2]==="standings")return standings(p[1]);
  if(p[0]==="competitions")return competition(p[1]);
  if(p[0]==="teams"&&!p[1])return teams();
  if(p[0]==="teams")return team(p[1]);
  if(p[0]==="players"&&!p[1])return players();
  if(p[0]==="players")return player(p[1]);
  if(p[0]==="matches"&&!p[1])return matches();
  if(p[0]==="matches")return match(p[1]);
  if(p[0]==="statistics")return statistics();
  if(p[0]==="news"&&!p[1])return news();
  if(p[0]==="news")return newsDetail(p[1]);
  if(p[0]==="admin")return admin();
  return dashboard();
 }catch(e){shell("AFRO SPORT",errBox(e))}
}
addEventListener("hashchange",route);route();