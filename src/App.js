import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

let db = null;
try {
  if (firebaseConfig.apiKey !== "YOUR_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase init error", e);
}

const PASSWORD = "1234";

const isMobile = () => window.innerWidth < 900;

const Card = ({ children, color }) => (
  <div style={{
    background: "#020617",
    borderRadius: 14,
    padding: isMobile() ? 16 : 12,
    borderLeft: `8px solid ${color}`,
    boxShadow: "0 6px 18px rgba(0,0,0,0.8)",
    color: "#f1f5f9"
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

const commonSupervisors = [
  "Marciano Dekker","Jan Schulz","Cyrille Berkelaar",
  "Anna Cetera","Brahim Said Yousef"
];

const commonCoordinators = [
  "Kucharska Wioleta","Janulevicius Antanas",
  "Sotirios Sampaliotis","Pitic Paul-Ioan"
];

const employees = {
  supervisors: {
    "Team A": commonSupervisors,
    "Team B": commonSupervisors,
  },
  coordinators: {
    "Team A": commonCoordinators,
    "Team B": commonCoordinators,
  },

  "Team A": [
    "Arestov Oleksandr","Angheluta Dan","Biudiachenko Oleksander","Chrobak Jaroslaw",
    "Diachenko Maria","Fesenko Anna","Fouka Eleni","Hamerla Paula",
    "Iacob Ioana Adriana","Karolin Adam","Kaznowska Olivia","Klaudia Voros",
    "Kwansungnern Ketwadi","Kytsak Rostyslav","Maksymiuk Jacek","Marcin Szumilas",
    "Muravia Arsenii","Oles Katarzyna","Oliinyk Ruslan","Palade Mihaela",
    "Parzyszek Lukasz","Polehenko Snizhana","Raluca Tarabacu","Romanik Mariusz",
    "Ringma Mario","Socha Ewelina","Svistula Oleksii","Tsioumas Panagiotis",
    "Varava Sofiia","Veer v.d Kees","Vilkhova Alina","Zan Ewa"
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
    "Vysockaja Valentina","Wasilewski Jacek"
  ]
};

export default function Dashboard() {
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [currentTeam, setCurrentTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const createEmptyData = () => {
    const obj = {};
    teams.forEach(t => {
      obj[t] = {};
      leadershipPositions.forEach(p => obj[t][p] = "");
      areas.forEach(a => a.positions.forEach(p => obj[t][p] = ""));
    });
    return obj;
  };

  const [localData, setLocalData] = useState(createEmptyData());
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("auth") === "true"
  );
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "dashboard", "data"), (docSnap) => {
      if (docSnap.exists()) {
        setLocalData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const applyChanges = async () => {
    if (!db) return;
    await setDoc(doc(db, "dashboard", "data"), localData);
  };

  const assign = (pos, val) => {
    if (locked) return;

    const updated = {
      ...localData,
      [currentTeam]: {
        ...(localData[currentTeam] || {}),
        [pos]: val,
      },
    };

    setLocalData(updated);
  };

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(() => window.location.reload(), refreshInterval * 60000);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  if (!authenticated) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#020617",
        color: "white",
        flexDirection: "column"
      }}>
        <h2>🔐 Enter Password</h2>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={() => {
          if (password === PASSWORD) {
            localStorage.setItem("auth", "true");
            setAuthenticated(true);
          }
        }}>
          Login
        </button>
      </div>
    );
  }

  const teamData = localData[currentTeam] || {};
  const assigned = Object.values(teamData).filter(Boolean);
  const free = employees[currentTeam].filter(e => !assigned.includes(e));

  const renderArea = (area) => (
    <div key={area.name}>
      <h3 style={{ color: area.color }}>{area.name}</h3>
      <div style={{ display: "grid", gridTemplateColumns: isMobile() ? "repeat(2,1fr)" : "repeat(5,1fr)" }}>
        {area.positions.map(pos => (
          <Card key={pos} color={area.color}>
            <div>{pos}</div>
            <select
              disabled={locked}
              value={teamData[pos] || ""}
              onChange={e => assign(pos, e.target.value)}
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

  return (
    <div style={{ background: "#020617", color: "white", minHeight: "100vh" }}>
      <h1>📺 Planning Dashboard</h1>

      {teams.map(t => (
        <button key={t} onClick={() => setCurrentTeam(t)}>{t}</button>
      ))}

      <button onClick={() => setLocked(!locked)}>
        {locked ? "🔒" : "🔓"}
      </button>

      <button onClick={applyChanges}>✅ Apply</button>

      <select onChange={(e) => setRefreshInterval(Number(e.target.value))}>
        <option value={0}>No Refresh</option>
        <option value={5}>5 min</option>
        <option value={10}>10 min</option>
        <option value={15}>15 min</option>
        <option value={30}>30 min</option>
        <option value={60}>60 min</option>
      </select>

      <button onClick={() => {
        localStorage.removeItem("auth");
        setAuthenticated(false);
      }}>
        Logout
      </button>

      <h2>👔 Leadership</h2>
      {areas.map(renderArea)}

      <h3>📦 Picking — {free.length}</h3>
      <div>{free.join(", ")}</div>
    </div>
  );
}
