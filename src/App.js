import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PASSWORD = "1234"; // 🔐 CHANGE THIS

const isMobile = () => window.innerWidth < 900;

const Card = ({ children, color }) => (
  <div style={{
    background: "#0f172a",
    borderRadius: 12,
    padding: isMobile() ? 14 : 10,
    borderLeft: `6px solid ${color}`,
    boxShadow: "0 4px 14px rgba(0,0,0,0.7)",
    color: "#e5e7eb"
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

const areas = [
  { name: "RT / Hopt", color: "#22c55e", positions: ["RT Driver 1","RT Driver 2","Hopt"] },
  { name: "Prep / Packsize", color: "#3b82f6", positions: ["Trolley Preper 1","Trolley Preper 2","Packsize"] },
  { name: "Docs / Palletising", color: "#f97316", positions: [
    "Document Applier 1","Document Applier 2",
    "Palletiser 1","Palletiser 2","Palletiser 3","Palletiser 4",
    "Trolley Dropper","Box Filler"
  ]},
  { name: "VAS / Nester", color: "#a855f7", positions: ["Vas 1","Nester 1","Nester 2"] },
  { name: "Other", color: "#14b8a6", positions: ["Packing","C-Plein"] }
];

const teams = ["Team A", "Team B"];

const commonSupervisors = ["Marciano Dekker","Jan Schulz","Cyrille Berkelaar","Anna Cetera","Brahim Said Yousef"];
const commonCoordinators = [
  "Kucharska Wioleta","Janulevicius Antanas",
  "Sotirios Sampaliotis","Pitic Paul-Ioan"
];

const employees = {
  supervisors: { "Team A": commonSupervisors, "Team B": commonSupervisors },
  coordinators: { "Team A": commonCoordinators, "Team B": commonCoordinators },
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
  const [refreshInterval, setRefreshInterval] = useState(0); // minutes
  const [refreshTimer, setRefreshTimer] = useState(null);
  const [currentTeam, setCurrentTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);
  const [data, setData] = useState({});
  const [localData, setLocalData] = useState({});
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "dashboard", "data"), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
        setLocalData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const applyChanges = async () => {
    await setDoc(doc(db, "dashboard", "data"), localData);
  };

  const assign = (pos, val) => {
    if (locked) return;
    if (Object.values(localData[currentTeam] || {}).includes(val)) return;

    const updated = {
      ...localData,
      [currentTeam]: {
        ...(localData[currentTeam] || {}),
        [pos]: val,
      },
    };

    setLocalData(updated);
  };

  if (!authenticated) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "black",
        color: "white",
        flexDirection: "column"
      }}>
        <h2>🔐 Enter Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, fontSize: 18 }}
        />
        <button
          onClick={() => {
            if (password === PASSWORD) setAuthenticated(true);
          }}
          style={{ marginTop: 10, padding: 10 }}
        >
          Login
        </button>
      </div>
    );
  }

  const renderArea = (area) => (
    <div key={area.name} style={{ marginBottom: isMobile() ? 20 : 10 }}>
      <h3 style={{ color: area.color, fontSize: isMobile() ? 22 : 18, fontWeight: "bold" }}>{area.name}</h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile() ? "repeat(2,1fr)" : "repeat(5,1fr)",
        gap: 10
      }}>
        {area.positions.map(pos => (
          <Card key={pos} color={area.color}>
            <div style={{ fontSize: isMobile() ? 18 : 14, fontWeight: "600" }}>{pos}</div>
            <select
              disabled={locked}
              value={(localData[currentTeam] || {})[pos] || ""}
              onChange={e => assign(pos, e.target.value)}
              style={{ width: "100%", fontSize: isMobile() ? 16 : 12 }}
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

  // 🔄 AUTO REFRESH HANDLER
  useEffect(() => {
    if (refreshTimer) clearInterval(refreshTimer);

    if (refreshInterval > 0) {
      const timer = setInterval(() => {
        window.location.reload();
      }, refreshInterval * 60000);
      setRefreshTimer(timer);
    }

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [refreshInterval]);

  const assigned = Object.values(localData[currentTeam] || {}).filter(Boolean);
  const free = employees[currentTeam].filter(e => !assigned.includes(e));

  return (
    <div style={{ background: "#020617", color: "white", minHeight: "100vh", padding: 15 }}>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <h1 style={{ fontSize: isMobile() ? 28 : 22, fontWeight: "bold" }}>📺 Planning Dashboard</h1>

        <div style={{ display: "flex", gap: 10 }}>
          {teams.map(t => (
            <button
              key={t}
              onClick={() => setCurrentTeam(t)}
              style={{
                padding: "8px 14px",
                fontSize: 14,
                background: currentTeam === t ? "#22c55e" : "#1f2937",
                borderRadius: 8
              }}
            >
              {t}
            </button>
          ))}

          <button onClick={() => setLocked(!locked)}>
            {locked ? "🔒" : "🔓"}
          </button>

          <button onClick={applyChanges} style={{ background: "#22c55e", padding: "8px 12px" }}>
            ✅ Apply
          </button>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{ padding: "6px", background: "#1f2937", color: "white", borderRadius: 6 }}
          >
            <option value={0}>No Refresh</option>
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <h2 style={{ color: "#facc15", fontSize: 20 }}>👔 Leadership</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile() ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10 }}>
          {leadershipPositions.map(pos => (
            <Card key={pos} color="#facc15">
              <div style={{ fontWeight: "600" }}>{pos}</div>
              <select
                disabled={locked}
                value={(localData[currentTeam] || {})[pos] || ""}
                onChange={e => assign(pos, e.target.value)}
              >
                <option value="">Select</option>
                {(pos.includes("Supervisor")
                  ? employees.supervisors[currentTeam]
                  : employees.coordinators[currentTeam]
                ).map(e => <option key={e}>{e}</option>)}
              </select>
            </Card>
          ))}
        </div>
      </div>

      {areas.map(renderArea)}

      <div>
        <h3 style={{ color: "#4ade80", fontSize: 18 }}>📦 Picking — {free.length}</h3>
        <div style={{ fontSize: 13 }}>{free.join(", ")}</div>
      </div>
    </div>
  );
}

