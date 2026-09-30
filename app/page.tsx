"use client";

const cards = [
  ["Mashindano", "12", "/competitions"], ["Timu", "248", "/teams"],
  ["Wachezaji", "4,920", "/players"], ["Mechi", "36", "/matches"]
];

export default function Home() {
  return <main className="shell">
    <header className="topbar"><div className="brand">AFRO <span>SPORT</span></div><nav><a href="/">Dashboard</a><a href="/competitions">Mashindano</a><a href="/teams">Timu</a><a href="/players">Wachezaji</a><a href="/matches">Mechi</a><a className="admin" href="/admin">Admin</a></nav></header>
    <section className="hero"><div><p className="eyebrow">AFRICAN FOOTBALL PLATFORM</p><h1>Mpira wa Afrika,<br/><span>sehemu moja.</span></h1><p className="lead">Fuata ligi, vikundi, play-off, knockout, matokeo, standings na wafungaji bora.</p></div><div className="hero-ball">⚽</div></section>
    <section className="stats">{cards.map(([label,value,href]) => <a className="stat" href={href} key={label}><small>{label}</small><strong>{value}</strong><span>→</span></a>)}</section>
    <section className="grid"><div className="panel"><div className="panel-head"><h2>Mechi zijazo</h2><a href="/matches">Ona zote</a></div><div className="match"><div><b>Simba SC</b><small>19:00 · Dar es Salaam</small></div><strong>VS</strong><div className="right"><b>Al Ahly</b><small>Uwanja wa Taifa</small></div></div><div className="match"><div><b>Young Africans</b><small>16:00 · CAF</small></div><strong>VS</strong><div className="right"><b>Esperance</b><small>Group Stage</small></div></div></div><div className="panel"><div className="panel-head"><h2>Habari</h2><a href="/news">Zote</a></div><article><span>CAF</span><h3>Ratiba na matokeo ya mashindano ya Afrika</h3><p>Habari mpya za mpira, timu na wachezaji.</p></article><article><span>TRANSFERS</span><h3>Dirisha la usajili na taarifa za timu</h3></article></div></section>
  </main>;
}