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

const isMobile = () => window.innerWidth < 900;

const Card = ({ children, color }) => (
  <div style={{
    background: "#111",
    borderRadius: 12,
    padding: isMobile() ? 12 : 8,
    borderLeft: `6px solid ${color}`,
    boxShadow: "0 3px 10px rgba(0,0,0,0.6)"
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
  {
    name: "RT / Hopt",
    color: "#22c55e",
    positions: ["RT Driver 1","RT Driver 2","Hopt"]
  },
  {
    name: "Prep / Packsize",
    color: "#3b82f6",
    positions: ["Trolley Preper 1","Trolley Preper 2","Packsize"]
  },
  {
    name: "Docs / Palletising",
    color: "#f97316",
    positions: [
      "Document Applier 1","Document Applier 2",
      "Palletiser 1","Palletiser 2","Palletiser 3","Palletiser 4",
      "Trolley Dropper","Box Filler"
    ]
  },
  {
    name: "VAS / Nester",
    color: "#a855f7",
    positions: ["Vas 1","Nester 1","Nester 2"]
  },
  {
    name: "Other",
    color: "#14b8a6",
    positions: ["Packing","C-Plein"]
  }
];

const teams = ["Team A", "Team B"];

const commonSupervisors = ["Marciano Dekker","Jan Schulz","Cyrille Berkelaar","Anna Cetera","Brahim Said Yousef"];
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
  const [data, setData] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "dashboard", "data"), (docSnap) => {
      if (docSnap.exists()) setData(docSnap.data());
    });
    return () => unsub();
  }, []);

  const updateData = async (newData) => {
    await setDoc(doc(db, "dashboard", "data"), newData);
  };

  const assign = (pos, val) => {
    if (locked) return;
    if (Object.values(data[currentTeam] || {}).includes(val)) return;

    const updated = {
      ...data,
      [currentTeam]: {
        ...(data[currentTeam] || {}),
        [pos]: val,
      },
    };

    setData(updated);
    updateData(updated);
  };

  const renderArea = (area) => (
    <div key={area.name} style={{ marginBottom: isMobile() ? 20 : 10 }}>
      <h3 style={{ color: area.color, fontSize: isMobile() ? 20 : 16 }}>{area.name}</h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile() ? "repeat(2,1fr)" : "repeat(5,1fr)",
        gap: 10
      }}>
        {area.positions.map(pos => (
          <Card key={pos} color={area.color}>
            <div style={{ fontSize: isMobile() ? 16 : 12 }}>{pos}</div>
            <select
              disabled={locked}
              value={(data[currentTeam] || {})[pos] || ""}
              onChange={e => assign(pos, e.target.value)}
              style={{ width: "100%", fontSize: isMobile() ? 16 : 11 }}
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

  const assigned = Object.values(data[currentTeam] || {}).filter(Boolean);
  const free = employees[currentTeam].filter(e => !assigned.includes(e));

  return (
    <div style={{
      background: "#020617",
      color: "white",
      minHeight: "100vh",
      padding: isMobile() ? 15 : 10
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        flexDirection: isMobile() ? "column" : "row",
        justifyContent: "space-between",
        marginBottom: 10,
        gap: 10
      }}>
        <h1 style={{ fontSize: isMobile() ? 26 : 20 }}>📺 Planning Dashboard</h1>

        <div style={{ display: "flex", gap: 10 }}>
          {teams.map(t => (
            <button
              key={t}
              onClick={() => setCurrentTeam(t)}
              style={{
                padding: isMobile() ? "10px 16px" : "5px 10px",
                fontSize: isMobile() ? 16 : 12,
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
        </div>
      </div>

      {/* Leadership */}
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ color: "#facc15" }}>👔 Leadership</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile() ? "repeat(2,1fr)" : "repeat(4,1fr)",
          gap: 10
        }}>
          {leadershipPositions.map(pos => (
            <Card key={pos} color="#facc15">
              <div>{pos}</div>
              <select
                disabled={locked}
                value={(data[currentTeam] || {})[pos] || ""}
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

      {/* Areas */}
      {areas.map(renderArea)}

      {/* Picking */}
      <div>
        <h3 style={{ color: "#4ade80" }}>📦 Picking — {free.length}</h3>
        <div style={{ fontSize: isMobile() ? 14 : 11 }}>{free.join(", ")}</div>
      </div>
    </div>
  );
}

