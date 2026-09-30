"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../../lib/supabase";
type Row=any;

export default function CompetitionDetail({params}:{params:Promise<{id:string}>}){
  const [id,setId]=useState(""); const [competition,setCompetition]=useState<Row>(null);
  const [stages,setStages]=useState<Row[]>([]); const [groups,setGroups]=useState<Row[]>([]);
  const [stageTeams,setStageTeams]=useState<Row[]>([]); const [matches,setMatches]=useState<Row[]>([]);
  const [standings,setStandings]=useState<Row[]>([]); const [stageStandings,setStageStandings]=useState<Row[]>([]); const [scorers,setScorers]=useState<Row[]>([]); const [playerStats,setPlayerStats]=useState<Row[]>([]);
  const [ties,setTies]=useState<Row[]>([]); const [loading,setLoading]=useState(true);

  useEffect(()=>{params.then(p=>setId(p.id))},[params]);
  useEffect(()=>{
    if(!id)return; const db=supabase(); if(!db){setLoading(false);return;}
    const load=async()=>{
      const [c,s,g,m,st,sc,k,ps]=await Promise.all([
        db.from("leagues").select("*").eq("id",id).single(),
        db.from("competition_stages").select("*").eq("league_id",id).order("stage_order"),
        db.from("stage_groups").select("id,stage_id,name,group_order").order("group_order"),
        db.from("matches").select("id,scheduled_at,status,home_score,away_score,venue,round_name,stage_id,group_id,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)").eq("league_id",id).order("scheduled_at",{ascending:true}).limit(100),
        db.from("league_standings").select("*").eq("league_id",id).order("points",{ascending:false}).order("goal_difference",{ascending:false}),
        db.from("competition_top_scorers").select("*").eq("competition_id",id).order("goals",{ascending:false}).limit(50),
        db.from("knockout_ties").select("id,stage_id,tie_number,home_seed,away_seed,home_team_id,away_team_id,winner_team_id,status,next_slot,home_team:teams!knockout_ties_home_team_id_fkey(name),away_team:teams!knockout_ties_away_team_id_fkey(name),winner_team:teams!knockout_ties_winner_team_id_fkey(name)").order("tie_number"),
        db.from("player_competition_stats").select("*").eq("competition_id",id).order("goals",{ascending:false}).order("assists",{ascending:false}).limit(100)
      ]);
      const stageRows=s.data||[];
      const stageIds=stageRows.map((x:Row)=>x.id);
      const [tr,ss]=await Promise.all([
        stageIds.length?db.from("stage_teams").select("stage_id,team_id,group_id,seed,teams(id,name,short_name,logo_url)").in("stage_id",stageIds):Promise.resolve({data:[],error:null}),
        stageIds.length?db.from("stage_standings").select("*").in("stage_id",stageIds):Promise.resolve({data:[],error:null})
      ]);
      setCompetition(c.data);setStages(stageRows);setGroups(g.data||[]);setStageTeams(tr.data||[]);setMatches(m.data||[]);setStandings(st.data||[]);setStageStandings(ss.data||[]);setScorers(sc.data||[]);setPlayerStats(ps.data||[]);setTies(k.data||[]);setLoading(false);
    };
    load();
  },[id]);

  if(loading)return <main className="page"><div className="empty">Inapakia mashindano...</div></main>;
  if(!competition)return <main className="page"><div className="empty">Mashindano hayajapatikana.</div></main>;

  const stageName=(stageId:string)=>stages.find(s=>s.id===stageId)?.name||"Stage";
  const groupsByStage=stages.map((stage:Row)=>({stage,items:groups.filter(g=>g.stage_id===stage.id)})).filter(x=>x.items.length);
  const tiesByStage=stages.map((stage:Row)=>({stage,items:ties.filter(t=>t.stage_id===stage.id)})).filter(x=>x.items.length);
  const teamName=(teamId:string|null)=>stageTeams.find(t=>t.team_id===teamId)?.teams?.name||"TBD";

  return <main className="page">
    <div className="page-head"><a href="/competitions">← Mashindano</a><h1>{competition.name}</h1><p>{competition.country||"Afrika"} · {competition.season||"Season"} · {competition.competition_type}</p></div>
    <section className="detail-hero"><div className="logo big">🏆</div><div><h2>{competition.name}</h2><p>{competition.description||"Ratiba, stages, standings na takwimu za mashindano."}</p></div></section>
    <section className="detail-grid">
      <div className="panel"><div className="panel-head"><h2>Stages</h2></div>{stages.length?stages.map(s=><div className="stage-item" key={s.id}><b>{s.stage_order}. {s.name}</b><span>{s.stage_type} · {s.leg_count} leg{Number(s.leg_count)===1?"":"s"}</span></div>):<div className="empty">Hakuna stages bado.</div>}</div>
      <div className="panel"><div className="panel-head"><h2>Top Scorers</h2></div>{scorers.length?scorers.slice(0,8).map((s,i)=><div className="score-item" key={s.player_id+"-"+s.stage_id}><b>{i+1}. {s.player_name}</b><span>{s.team_name} · {s.goals}</span></div>):<div className="empty">Hakuna magoli bado.</div>}</div>
    </section>
    {groupsByStage.length>0&&<section className="panel"><div className="panel-head"><h2>Group Stage</h2><span>{groups.length} groups</span></div>{groupsByStage.map(({stage,items})=><div className="group-stage" key={stage.id}><h3>{stage.name}</h3><div className="group-grid">{items.map((g:Row)=><div className="group-card" key={g.id}><h4>{g.name}</h4><div className="table-wrap inner"><table><thead><tr><th>#</th><th>Timu</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>{stageStandings.filter(r=>r.stage_id===stage.id&&r.group_id===g.id).map((r:Row,i:number)=><tr key={r.team_id}><td>{r.position||i+1}</td><td><b>{r.team_name}</b></td><td>{r.played}</td><td>{r.wins}</td><td>{r.draws}</td><td>{r.losses}</td><td>{r.goal_difference}</td><td><b>{r.points}</b></td></tr>)}{stageTeams.filter(t=>t.stage_id===stage.id&&t.group_id===g.id).length===0&&<tr><td colSpan={8}>Hakuna timu zilizopangwa bado.</td></tr>}</tbody></table></div></div>)}</div></div>)}</section>}
    {tiesByStage.length>0&&<section className="panel"><div className="panel-head"><h2>Knockout Bracket</h2><span>Play-off · Knockout · Final</span></div>{tiesByStage.map(({stage,items})=><div className="bracket-stage" key={stage.id}><h3>{stage.name}</h3><div className="bracket-grid">{items.map((t:Row)=><div className="tie-card" key={t.id}><small>Tie {t.tie_number} · {t.status}</small><div className={t.winner_team_id===t.home_team_id?"winner":""}>{t.home_team?.name||teamName(t.home_team_id)}{t.home_seed?" (#"+t.home_seed+")":""}</div><div className={t.winner_team_id===t.away_team_id?"winner":""}>{t.away_team?.name||teamName(t.away_team_id)}{t.away_seed?" (#"+t.away_seed+")":""}</div>{t.winner_team?.name&&<strong>✓ {t.winner_team.name}</strong>}</div>)}</div></div>)}</section>}
    <section className="panel"><div className="panel-head"><h2>Standings</h2></div>{standings.length?<div className="table-wrap inner"><table><thead><tr><th>#</th><th>Timu</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>{standings.filter(r=>!r.group_id).map((r,i)=><tr key={r.team_id}><td>{r.position||i+1}</td><td><b>{r.team_name}</b></td><td>{r.played}</td><td>{r.wins}</td><td>{r.draws}</td><td>{r.losses}</td><td>{r.goal_difference}</td><td><b>{r.points}</b></td></tr>)}</tbody></table></div>:<div className="empty">Standings zitaonekana baada ya matokeo ya league kuingizwa.</div>}</section>
    <section className="panel"><div className="panel-head"><h2>Ratiba & Matokeo</h2></div>{matches.length?<div className="match-list">{matches.map(m=><div className="match-row" key={m.id}><div><b>{m.home_team?.name}</b><span>{m.away_team?.name}</span></div><strong>{m.status==="finished"?m.home_score+" - "+m.away_score:"VS"}</strong><div className="match-meta"><span>{m.round_name||stageName(m.stage_id)||"League"}</span><small>{m.scheduled_at?new Date(m.scheduled_at).toLocaleString("sw-TZ"):"—"}</small></div></div>)}</div>:<div className="empty">Hakuna mechi bado.</div>}</section>
  </main>
}