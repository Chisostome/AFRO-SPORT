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

async function players(){
 const r=await db.from("players").select("id,name,position,jersey_number,teams(name)").order("name").limit(200);
 if(r.error)return shell("Wachezaji",errBox(r.error));
 shell("Wachezaji",'<div class="cards">'+(r.data||[]).map(x=>'<a class="card" href="#/players/'+x.id+'"><h2>'+esc(x.name)+'</h2><p>'+esc(x.position||"")+' · #'+esc(x.jersey_number||"—")+'</p><small>'+esc(x.teams?.name||"")+'</small></a>').join("")+'</div>');
}

async function player(id){
 const [p,s,a]=await Promise.all([
  db.from("players").select("*,teams(name)").eq("id",id).single(),
  db.from("player_competition_stats").select("*").eq("player_id",id).order("goals",{ascending:false}),
  db.from("player_match_appearances").select("*").eq("player_id",id).limit(20)
 ]);
 if(p.error)return shell("Mchezaji",errBox(p.error));
 const stats=(s.data||[]).map(x=>'<div class="row"><span><b>'+esc(x.team_name||"Competition")+'</b><small>'+x.event_matches+' matches · '+x.assists+' assists · '+x.yellow_cards+' yellow · '+x.red_cards+' red</small></span><strong>'+x.goals+' ⚽</strong></div>').join("")||'<div class="empty">Hakuna stats za matukio.</div>';
 const events=await db.from("match_events").select("event_type,minute,match_id").eq("player_id",id).order("created_at",{ascending:false}).limit(30);
 shell(esc(p.data.name),'<div class="detail"><section class="card"><div class="tag">'+esc(p.data.position||"")+'</div><h2>'+esc(p.data.teams?.name||"")+'</h2><p>Namba '+esc(p.data.jersey_number||"—")+'</p><h2>Competition Stats</h2><div class="list">'+stats+'</div></section><section class="card"><h2>Recent appearances</h2><p>'+((a.data||[]).length)+' appearances zilizorekodiwa.</p><h2>Events</h2><div class="list">'+(events.data||[]).slice(0,12).map(x=>'<div class="row"><span><b>'+esc(x.event_type)+'</b><small>Match '+esc(x.match_id)+' · '+esc(x.minute||"")+"'</small></span></div>").join("")+'</div></section></div>');
}

async function matches(){
 const r=await db.from("matches").select("id,scheduled_at,status,home_score,away_score,round_name,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name),leagues(name)").order("scheduled_at",{ascending:false}).limit(100);
 if(r.error)return shell("Mechi",errBox(r.error));
 shell("Mechi",'<div class="card"><div class="list">'+(r.data||[]).map(x=>'<a class="row" href="#/matches/'+x.id+'"><span><b>'+esc(x.home_team?.name)+' — '+esc(x.away_team?.name)+'</b><small>'+fmt(x.scheduled_at)+' · '+esc(x.leagues?.name||"")+' · '+esc(x.status)+'</small></span><strong>'+((x.status==="scheduled")?"VS":(x.home_score??0)+" - "+(x.away_score??0))+'</strong></a>').join("")+'</div></div>');
}

async function match(id){
 const [r,e,l]=await Promise.all([
  db.from("matches").select("*,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name),leagues(name),competition_stages(name)").eq("id",id).single(),
  db.from("match_events").select("*,players:player_id(name),teams:team_id(name)").eq("match_id",id).order("minute").order("added_time"),
  db.from("match_lineups").select("*,team:teams!match_lineups_team_id_fkey(name),match_lineup_players(*,player:players!match_lineup_players_player_id_fkey(name))").eq("match_id",id)
 ]);
 if(r.error)return shell("Mechi",errBox(r.error));
 const render=()=>{
  const x=r.data, events=e.data||[], lineups=l.data||[];
  const ev=events.map(z=>'<div class="row"><span><b>'+esc(z.event_type)+'</b><small>'+esc(z.minute||"")+(z.added_time?"+ "+z.added_time:"")+"' · "+esc(z.players?.name||"")+'</small></span><span>'+esc(z.teams?.name||"")+'</span></div>').join("")||'<div class="empty">Hakuna events.</div>';
  const lu=lineups.map(z=>'<div class="card"><h3>'+esc(z.team?.name||"Lineup")+'</h3><p>Formation: '+esc(z.formation||"—")+' · Captain: '+esc((z.match_lineup_players||[]).find(q=>q.player_id===z.captain_player_id)?.player?.name||"—")+'</p><div class="list">'+(z.match_lineup_players||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map(q=>'<div class="row"><span><b>'+esc(q.player?.name||"")+'</b><small>'+esc(q.position||"")+'</small></span><span>'+ (q.starter?"Starter":"Sub") +'</span></div>').join("")+'</div></div>').join("");
  const timer=(x.status==="live"||x.status==="halftime")?'<div id="liveClock" class="tag">LIVE</div>':"";
  shell(esc(x.home_team?.name)+" vs "+esc(x.away_team?.name),'<div class="detail"><section class="card"><div class="tag">'+esc(x.status)+'</div><div class="score">'+esc(x.home_team?.name)+' <b>'+(x.home_score??0)+' — '+(x.away_score??0)+'</b> '+esc(x.away_team?.name)+'</div>'+timer+'<p>'+fmt(x.scheduled_at)+'</p><p>'+esc(x.leagues?.name||"")+' · '+esc(x.competition_stages?.name||x.round_name||"")+'</p></section><section class="card"><h2>Timeline</h2><div class="list">'+ev+'</div></section><section class="card"><h2>Lineups</h2><div class="cards">'+(lu||'<div class="empty">Lineups bado hazijawekwa.</div>')+'</div></section></div>');
 };
 render();
 const channel=db.channel("match-"+id).on("postgres_changes",{event:"*",schema:"public",table:"matches",filter:"id=eq."+id},()=>match(id)).on("postgres_changes",{event:"*",schema:"public",table:"match_events",filter:"match_id=eq."+id},()=>match(id)).on("postgres_changes",{event:"*",schema:"public",table:"match_lineups",filter:"match_id=eq."+id},()=>match(id)).subscribe();
 setTimeout(()=>db.removeChannel(channel),300000);
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
async function adminLive(id){
 const {data:{session}}=await db.auth.getSession(); if(!session)return admin();
 const m=await db.from("matches").select("id,status,home_score,away_score,home_team_id,away_team_id,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").eq("id",id).single();
 if(m.error)return shell("Live Match",errBox(m.error));
 const players=(await db.from("players").select("id,name,team_id,position,jersey_number").in("team_id",[m.data.home_team_id,m.data.away_team_id]).order("name")).data||[];
 shell("Live Match",'<div class="detail"><section class="card"><h2>'+esc(m.data.home_team?.name)+' '+(m.data.home_score??0)+' — '+(m.data.away_score??0)+' '+esc(m.data.away_team?.name)+'</h2><p>Status: <b>'+esc(m.data.status)+'</b></p><div class="cards"><button class="btn" id="goLive">Anza Live</button><button class="btn" id="half">Halftime</button><button class="btn" id="finish">Maliza</button></div></section><section class="card"><h2>Match Event</h2><form id="eventForm" class="form"><select id="eTeam" required><option value="">Timu</option><option value="'+m.data.home_team_id+'">'+esc(m.data.home_team?.name)+'</option><option value="'+m.data.away_team_id+'">'+esc(m.data.away_team?.name)+'</option></select><select id="ePlayer" required><option value="">Mchezaji</option>'+players.map(p=>'<option value="'+p.id+'" data-team="'+p.team_id+'">'+esc(p.name)+' · '+esc(p.position||"")+'</option>').join("")+'</select><select id="eType"><option value="goal">Goal</option><option value="yellow_card">Yellow Card</option><option value="red_card">Red Card</option><option value="penalty_scored">Penalty Scored</option><option value="penalty_missed">Penalty Missed</option><option value="own_goal">Own Goal</option><option value="assist">Assist</option></select><input id="eMinute" type="number" min="0" value="1"><input id="eAdded" type="number" min="0" value="0"><input id="eDetails" placeholder="Details"><button class="btn">Ongeza Event</button><div id="eventMsg"></div></form></section><section class="card"><h2>Substitution</h2><form id="subForm" class="form"><select id="sTeam" required><option value="">Timu</option><option value="'+m.data.home_team_id+'">'+esc(m.data.home_team?.name)+'</option><option value="'+m.data.away_team_id+'">'+esc(m.data.away_team?.name)+'</option></select><select id="sOn" required><option value="">Player in</option>'+players.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("")+'</select><select id="sOff" required><option value="">Player out</option>'+players.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("")+'</select><input id="sMinute" type="number" min="0" value="60"><button class="btn">Substitution</button><div id="subMsg"></div></form></section></div>');
 const status=async s=>{const x=await db.rpc("set_match_status",{p_match_id:id,p_status:s}); if(x.error)alert(x.error.message); else adminLive(id)};
 goLive.onclick=()=>status("live"); half.onclick=()=>status("halftime"); finish.onclick=()=>status("finished");
 eventForm.onsubmit=async e=>{e.preventDefault();const x=await db.rpc("add_match_event",{p_match_id:id,p_team_id:eTeam.value,p_player_id:ePlayer.value,p_event_type:eType.value,p_minute:Number(eMinute.value),p_added_time:Number(eAdded.value),p_details:eDetails.value.trim()});eventMsg.textContent=x.error?x.error.message:"Event imehifadhiwa.";if(!x.error)adminLive(id)};
 subForm.onsubmit=async e=>{e.preventDefault();const x=await db.rpc("record_substitution",{p_match_id:id,p_team_id:sTeam.value,p_player_on_id:sOn.value,p_player_off_id:sOff.value,p_minute:Number(sMinute.value),p_added_time:0});subMsg.textContent=x.error?x.error.message:"Substitution imehifadhiwa.";if(!x.error)adminLive(id)};
}
async function adminLineup(id){
 const {data:{session}}=await db.auth.getSession(); if(!session)return admin();
 const m=await db.from("matches").select("id,home_team_id,away_team_id,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").eq("id",id).single();
 if(m.error)return shell("Lineup",errBox(m.error));
 const ps=(await db.from("players").select("id,name,team_id,position,jersey_number").in("team_id",[m.data.home_team_id,m.data.away_team_id]).order("jersey_number")).data||[];
 const options=ps.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' #'+esc(p.jersey_number||"")+'</option>').join("");
 shell("Lineups",'<div class="cards"><div class="card"><h2>'+esc(m.data.home_team?.name)+'</h2><form id="lh" class="form"><select id="hCaptain"><option value="">Captain</option>'+ps.filter(p=>p.team_id===m.data.home_team_id).map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("")+'</select><select id="hPlayers" multiple size="12">'+ps.filter(p=>p.team_id===m.data.home_team_id).map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · '+esc(p.position||"")+'</option>').join("")+'</select><input id="hFormation" value="4-3-3"><button class="btn">Save Home Lineup</button><div id="hm"></div></form></div><div class="card"><h2>'+esc(m.data.away_team?.name)+'</h2><form id="la" class="form"><select id="aCaptain"><option value="">Captain</option>'+ps.filter(p=>p.team_id===m.data.away_team_id).map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("")+'</select><select id="aPlayers" multiple size="12">'+ps.filter(p=>p.team_id===m.data.away_team_id).map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · '+esc(p.position||"")+'</option>').join("")+'</select><input id="aFormation" value="4-3-3"><button class="btn">Save Away Lineup</button><div id="am"></div></form></div></div>');
 const save=(form,team,playersSel,cap,formation,msg)=>form.onsubmit=async e=>{e.preventDefault();const arr=[...playersSel.selectedOptions].map((o,i)=>({player_id:o.value,starter:i<11,sort_order:i,position:null,position_x:null,position_y:null}));const x=await db.rpc("save_match_lineup",{p_match_id:id,p_team_id:team,p_formation:formation.value,p_captain_player_id:cap.value||null,p_players:arr});msg.textContent=x.error?x.error.message:"Lineup imehifadhiwa."};
 save(lh,m.data.home_team_id,hPlayers,hCaptain,hFormation,hm); save(la,m.data.away_team_id,aPlayers,aCaptain,aFormation,am);
}
async function adminMatches(){
 const {data:{session}}=await db.auth.getSession(); if(!session)return admin();
 const leagues=(await db.from("leagues").select("id,name").order("name")).data||[], teams=(await db.from("teams").select("id,name,league_id").order("name")).data||[];
 shell("Admin · Mechi",'<div class="cards"><div class="card"><h2>Tengeneza Fixture</h2><form id="matchForm" class="form"><select id="mLeague" required><option value="">Mashindano</option>'+leagues.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")+'</select><select id="mHome" required><option value="">Home</option>'+teams.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")+'</select><select id="mAway" required><option value="">Away</option>'+teams.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")+'</select><input id="mDate" type="datetime-local" required><input id="mVenue" placeholder="Uwanja"><input id="mRound" placeholder="Round / Stage"><button class="btn">Hifadhi Fixture</button><div id="matchMsg"></div></form></div><div class="card"><h2>Weka Matokeo</h2><form id="resultForm" class="form"><select id="rMatch" required><option value="">Chagua mechi</option></select><input id="rHome" type="number" min="0" value="0" required><input id="rAway" type="number" min="0" value="0" required><input id="rHP" type="number" min="0" placeholder="Home penalties (optional)"><input id="rAP" type="number" min="0" placeholder="Away penalties (optional)"><button class="btn">Maliza Mechi</button><div id="resultMsg"></div></form></div></div>');
 const load=async()=>{const x=await db.from("matches").select("id,scheduled_at,home_score,away_score,status,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").neq("status","finished").order("scheduled_at");rMatch.innerHTML='<option value="">Chagua mechi</option>'+(x.data||[]).map(m=>'<option value="'+m.id+'">'+esc(m.home_team?.name)+' vs '+esc(m.away_team?.name)+' · '+fmt(m.scheduled_at)+'</option>').join("")}; await load();
 const open=await db.from("matches").select("id,scheduled_at,status,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").order("scheduled_at",{ascending:false}).limit(20);
 const box=document.createElement("section");box.className="card";box.innerHTML='<h2>Mechi</h2><div class="list">'+(open.data||[]).map(x=>'<div class="row"><span><b>'+esc(x.home_team?.name)+' vs '+esc(x.away_team?.name)+'</b><small>'+fmt(x.scheduled_at)+' · '+esc(x.status)+'</small></span><span><a class="btn" href="#/admin/matches/live/'+x.id+'">Live</a> <a class="btn" href="#/admin/matches/lineup/'+x.id+'">Lineup</a></span></div>').join("")+'</div>';document.querySelector(".detail").appendChild(box);
 matchForm.onsubmit=async e=>{e.preventDefault();if(mHome.value===mAway.value)return matchMsg.textContent="Home na Away lazima zitofautiane.";const x=await db.from("matches").insert({league_id:mLeague.value,home_team_id:mHome.value,away_team_id:mAway.value,scheduled_at:new Date(mDate.value).toISOString(),venue:mVenue.value.trim(),round_name:mRound.value.trim(),status:"scheduled",home_score:0,away_score:0}).select("id").single();matchMsg.textContent=x.error?x.error.message:"Fixture imehifadhiwa.";if(!x.error)load()};
 resultForm.onsubmit=async e=>{e.preventDefault();const x=await db.rpc("record_match_result",{p_match_id:rMatch.value,p_home_score:Number(rHome.value),p_away_score:Number(rAway.value),p_home_penalties:rHP.value===""?null:Number(rHP.value),p_away_penalties:rAP.value===""?null:Number(rAP.value)});resultMsg.textContent=x.error?x.error.message:"Matokeo yamehifadhiwa na standings/progression zimesasishwa.";if(!x.error){await load();rHome.value=0;rAway.value=0}};
}
async function admin(){
 const {data:{session}}=await db.auth.getSession();
 if(!session){shell("Admin",'<div class="card"><h2>Ingia Admin</h2><form id="loginForm" class="form"><input id="email" type="email" placeholder="Email" required><input id="password" type="password" placeholder="Password" required><button class="btn">Ingia</button><div id="authMsg"></div></form></div>');document.getElementById("loginForm").onsubmit=async e=>{e.preventDefault();const r=await db.auth.signInWithPassword({email:email.value,password:password.value});if(r.error)authMsg.textContent=r.error.message;else route()};return}
 const leagues=(await db.from("leagues").select("id,name").order("name")).data||[];
 shell("Admin",'<div class="detail"><section class="card"><div class="head"><h2>Admin</h2><button class="btn" id="logout">Toka</button></div><div class="cards"><div class="card"><h3>Mashindano</h3><form id="leagueForm" class="form"><input id="lname" placeholder="Jina" required><input id="lcountry" value="Africa" placeholder="Nchi"><input id="lseason" placeholder="Season"><select id="ltype"><option value="league">League</option><option value="group_stage">Group Stage</option><option value="playoff">Playoff</option><option value="knockout">Knockout</option><option value="final">Final</option><option value="qualifier">Qualifier</option></select><button class="btn">Hifadhi</button><div id="leagueMsg"></div></form></div><div class="card"><h3>Timu</h3><form id="teamForm" class="form"><select id="teamLeague" required><option value="">Mashindano</option>'+leagues.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")+'</select><input id="teamName" placeholder="Jina la timu" required><input id="teamShort" placeholder="Short name"><input id="teamCity" placeholder="Mji"><button class="btn">Hifadhi Timu</button><div id="teamMsg"></div></form></div><div class="card"><h3>Mchezaji</h3><form id="playerForm" class="form"><select id="playerTeam" required><option value="">Timu</option></select><input id="playerName" placeholder="Jina" required><input id="playerPosition" placeholder="Position"><input id="playerNumber" type="number" placeholder="Jersey number"><button class="btn">Hifadhi Mchezaji</button><div id="playerMsg"></div></form></div></div></section></div>');
 const loadTeams=async()=>{const r=await db.from("teams").select("id,name").order("name");playerTeam.innerHTML='<option value="">Timu</option>'+(r.data||[]).map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")}; await loadTeams();
 logout.onclick=async()=>{await db.auth.signOut();route()};
 leagueForm.onsubmit=async e=>{e.preventDefault();const n=lname.value.trim(),slug=n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");const r=await db.from("leagues").insert({name:n,country:lcountry.value.trim(),season:lseason.value.trim(),competition_type:ltype.value,slug,is_active:true});leagueMsg.textContent=r.error?r.error.message:"Mashindano yamehifadhiwa.";if(!r.error)route()};
 teamForm.onsubmit=async e=>{e.preventDefault();const r=await db.from("teams").insert({league_id:teamLeague.value,name:teamName.value.trim(),short_name:teamShort.value.trim(),city:teamCity.value.trim()});teamMsg.textContent=r.error?r.error.message:"Timu imehifadhiwa.";if(!r.error)loadTeams()};
 playerForm.onsubmit=async e=>{e.preventDefault();const r=await db.from("players").insert({team_id:playerTeam.value,name:playerName.value.trim(),position:playerPosition.value.trim(),jersey_number:playerNumber.value?Number(playerNumber.value):null});playerMsg.textContent=r.error?r.error.message:"Mchezaji amehifadhiwa.";if(!r.error)e.target.reset()};
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
  if(p[0]==="admin"&&p[1]==="matches"&&!p[2])return adminMatches();
  if(p[0]==="admin"&&p[1]==="matches"&&p[2]==="live")return adminLive(p[3]);
  if(p[0]==="admin"&&p[1]==="matches"&&p[2]==="lineup")return adminLineup(p[3]);
  if(p[0]==="admin")return admin();
  return dashboard();
 }catch(e){shell("AFRO SPORT",errBox(e))}
}
addEventListener("hashchange",route);route();