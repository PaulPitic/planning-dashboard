import React, { useState, useEffect } from "react";

const Card = ({ children, highlight }) => (
  <div style={{
    background: highlight ? "#1f2937" : "#111",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
    border: highlight ? "2px solid #facc15" : "1px solid #333"
  }}>
    {children}
  </div>
);

const leadershipPositions = [
  "Supervisor 1 (BHV)",
  "Supervisor 2 (BHV)",
  "Area Coordinator 1 (BHV)",
  "Area Coordinator 2 (BHV)",
];

const operationalPositions = [
  "Trolley preper 1","Trolley preper 2","Packsize","Trolley dropper",
  "Document applier 1","Document applier 2","Box Filler",
  "Palletiser 1","Palletiser2","Palletiser3","palletiser4",
  "Vas1","vas2","nester 1","nester2","nester3",
  "Hopt","Packing",
  "ReachTruck Driver 1","ReachTruck Driver 2","ReachTruck Driver 3","ReachTruck Driver 4",
];

const teams = ["Team A", "Team B"];

const employees = {
  supervisors: {
    "Team A": ["Marciano Dekker","Jan Schulz","Cyrille Berkelaar"],
    "Team B": ["Anna Cetera","Brahim Said Yousef"],
  },
  coordinators: {
    "Team A": ["Kucharska Wioleta","Janulevicius Antanas"],
    "Team B": ["Sotirios Sampaliotis","Pitic Paul-Ioan"],
  },
  "Team A": [
    "Arestov Oleksandr","Angheluta Dan","Biudiachenko Oleksander","Chrobak Jaroslaw",
    "Diachenko Maria","Fesenko Anna","Fouka Eleni","Hamerla Paula",
    "Iacob Ioana Adriana","Karolin Adam","Kaznowska Olivia","Klaudia Voros",
    "Kwansungnern Ketwadi","Kytsak Rostyslav","Maksymiuk Jacek","Marcin Szumilas",
    "Muravia Arsenii","Oles Katarzyna","Oliinyk Ruslan","Palade Mihaela",
    "Parzyszek Lukasz","Polehenko Snizhana","Raluca Tarabacu","Romanik Mariusz",
    "Ringma Mario","Socha Ewelina","Svistula Oleksii","Tsioumas Panagiotis",
    "Varava Sofiia","Veer v.d Kees","Vilkhova Alina","Zan Ewa",
  ],
  "Team B": [
    "Baziuk Karyna","Carizonni Victoria","Cetera Adrian","Chrobak Marta",
    "Cuchillo Lopez Eloi","Debets Henk","Diaz Soler Arslan","Fanelli Samson",
    "Firek Piotr","Gnanasundarm G. Theepan","Hudema Cristina","Ivanenko Artem",
    "Jackiewicz Aleksandra","Kicosova Zuzana","Lahodiienko Oleh","Mazgula Adam",
    "Natiri Theo","Orlowski Robert","Prifti Ervis","Radus Alexandru",
    "Rapan Adrian","Rodrigues Joao","Shavb Yelyzaveta","Siekierko Samanta",
    "Slavkovsky Martin (trainer)","Socol Emmanuel","Stipinas Aurimas",
    "Stryzh Anastasia","Szabo Ibolya","Ursaciuc Daniel",
    "Vysockaja Valentina","Wasilewski Jacek",
  ],
};

export default function Dashboard() {
  const [currentTeam, setCurrentTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("data");
    return saved
      ? JSON.parse(saved)
      : teams.reduce((acc, t) => {
          acc[t] = {};
          [...leadershipPositions, ...operationalPositions].forEach(p => acc[t][p] = "");
          return acc;
        }, {});
  });

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  const assign = (pos, val) => {
    if (locked) return;
    if (Object.values(data[currentTeam]).includes(val)) return;
    setData({ ...data, [currentTeam]: { ...data[currentTeam], [pos]: val } });
  };

  const render = (title, list, highlight=false) => (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ color: highlight ? "#facc15" : "#60a5fa", fontSize: 36 }}>
        {highlight ? "👔 " : "⚙️ "}{title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 25 }}>
        {list.map(pos => (
          <Card key={pos} highlight={highlight}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{pos}</div>
            <select
              disabled={locked}
              value={data[currentTeam][pos]}
              onChange={e => assign(pos, e.target.value)}
              style={{ width: "100%", fontSize: 18, padding: 6 }}
            >
              <option value="">Select</option>
              {(pos.includes("Supervisor")
                ? employees.supervisors[currentTeam]
                : pos.includes("Coordinator")
                ? employees.coordinators[currentTeam]
                : employees[currentTeam]
              ).map(e => <option key={e}>{e}</option>)}
            </select>
          </Card>
        ))}
      </div>
    </div>
  );

  const assigned = Object.values(data[currentTeam]).filter(Boolean);
  const free = employees[currentTeam].filter(e => !assigned.includes(e));

  return (
    <div style={{ background: "#020617", color: "white", minHeight: "100vh", padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <h1 style={{ fontSize: 48 }}>📺 Planning Dashboard</h1>

        {/* TABS */}
        <div style={{ display: "flex", gap: 10 }}>
          {teams.map(t => (
            <button
              key={t}
              onClick={() => setCurrentTeam(t)}
              style={{
                padding: "12px 25px",
                fontSize: 20,
                background: currentTeam === t ? "#22c55e" : "#1f2937",
                color: "white",
                borderRadius: 12,
                border: currentTeam === t ? "2px solid #4ade80" : "1px solid #333"
              }}
            >
              {t}
            </button>
          ))}

          <button
            onClick={() => setLocked(!locked)}
            style={{ padding: "12px 20px", fontSize: 18 }}
          >
            {locked ? "🔒" : "🔓"}
          </button>
        </div>
      </div>

      {render("Leadership", leadershipPositions, true)}
      {render("Operations", operationalPositions)}

      {/* PICKING AREA */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ color: "#4ade80", fontSize: 32 }}>
          📦 Picking (Unassigned Operators) — {free.length}
        </h2>
        <div style={{ fontSize: 20, marginTop: 10 }}>
          {free.length === 0 ? "All assigned" : free.join(", ")}
        </div>
      </div>
    </div>
  );
}
