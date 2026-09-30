"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
export default function CompetitionsPage(){
 const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{const db=supabase();if(!db){setLoading(false);return;}db.from("competition_overview").select("*").order("name").then(({data})=>{setRows(data||[]);setLoading(false)})},[]);
 return <main className="page"><div className="page-head"><a href="/">← Dashboard</a><h1>Mashindano</h1><p>Ligi, vikundi, play-off na knockout zote.</p></div><div className="cards">{loading?<div className="empty">Inapakia...</div>:rows.map((r:any)=><a className="competition-card" href={"/competitions/"+r.id} key={r.id}><div className="logo">🏆</div><div><h3>{r.name}</h3><p>{r.country||"Afrika"} · {r.season||"Season"}</p><span>{r.competition_type||"league"} · {r.stage_count||0} stages</span></div></a>)}{!loading&&!rows.length&&<div className="empty">Hakuna mashindano bado.</div>}</div></main>;
}