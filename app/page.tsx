"use client";
import {useEffect,useState} from "react";
import {supabase} from "../lib/supabase";

export default function Home(){
 const db=supabase(); const [data,setData]=useState<any>({leagues:0,teams:0,players:0,matches:0,upcoming:[],news:[]}); const [loading,setLoading]=useState(true);
 useEffect(()=>{if(!db){setLoading(false);return;}Promise.all([
  db.from("leagues").select("id",{count:"exact",head:true}).eq("is_active",true),
  db.from("teams").select("id",{count:"exact",head:true}),
  db.from("players").select("id",{count:"exact",head:true}),
  db.from("matches").select("id",{count:"exact",head:true}),
  db.from("matches").select("id,scheduled_at,status,venue,round_name,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name),leagues(name)").neq("status","finished").order("scheduled_at",{ascending:true}).limit(4),
  db.from("news").select("id,title,category,published_at,slug").lte("published_at",new Date().toISOString()).order("published_at",{ascending:false}).limit(4)
 ]).then(([l,t,p,m,u,n])=>{setData({leagues:l.count||0,teams:t.count||0,players:p.count||0,matches:m.count||0,upcoming:u.data||[],news:n.data||[]});setLoading(false)})},[]);
 const cards=[["Mashindano",data.leagues,"/competitions"],["Timu",data.teams,"/teams"],["Wachezaji",data.players,"/players"],["Mechi",data.matches,"/matches"]];
 return <main className="shell"><header className="topbar"><div className="brand">AFRO <span>SPORT</span></div><nav><a href="/">Dashboard</a><a href="/competitions">Mashindano</a><a href="/teams">Timu</a><a href="/players">Wachezaji</a><a href="/matches">Mechi</a><a className="admin" href="/admin">Admin</a></nav></header>
 <section className="hero"><div><p className="eyebrow">AFRICAN FOOTBALL PLATFORM</p><h1>Mpira wa Afrika,<br/><span>sehemu moja.</span></h1><p className="lead">Fuata ligi, vikundi, play-off, knockout, matokeo, standings na wafungaji bora.</p></div><div className="hero-ball">⚽</div></section>
 <section className="stats">{cards.map(([label,value,href])=><a className="stat" href={href as string} key={label as string}><small>{label}</small><strong>{loading?"—":Number(value).toLocaleString()}</strong><span>→</span></a>)}</section>
 <section className="grid"><div className="panel"><div className="panel-head"><h2>Mechi zijazo</h2><a href="/matches">Ona zote</a></div>{data.upcoming.length?data.upcoming.map((m:any)=><div className="match" key={m.id}><div><b>{m.home_team?.name||"Home"}</b><small>{m.scheduled_at?new Date(m.scheduled_at).toLocaleString("sw-TZ"):"—"}</small></div><strong>VS</strong><div className="right"><b>{m.away_team?.name||"Away"}</b><small>{m.round_name||m.leagues?.name||"Match"}</small></div></div>):<div className="empty">Hakuna mechi zijazo bado.</div>}</div>
 <div className="panel"><div className="panel-head"><h2>Habari</h2><a href="/news">Zote</a></div>{data.news.length?data.news.map((n:any)=><article key={n.id}><span>{n.category||"AFRO SPORT"}</span><h3>{n.title}</h3><p>{n.published_at?new Date(n.published_at).toLocaleDateString("sw-TZ"):""}</p></article>):<div className="empty">Hakuna habari zilizochapishwa bado.</div>}</div></section></main>
}