import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

/* =====================================================
   FIREBASE CONFIG  (replace with your real values)
===================================================== */
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const PASSWORD = "1234"; // change this

/* =====================================================
   FIREBASE INIT
===================================================== */
let db = null;

try {
  if (firebaseConfig.apiKey !== "YOUR_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (err) {
  console.error(err);
}

/* =====================================================
   HELPERS
===================================================== */
const isMobile = () => window.innerWidth < 900;

const Card = ({ children, color }) => (
  <div
    style={{
      background: "#0f172a",
      color: "#f8fafc",
      borderLeft: `8px solid ${color}`,
      borderRadius: 12,
      padding: 12,
      boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
    }}
  >
    {children}
  </div>
);

/* =====================================================
   STRUCTURE
===================================================== */

const teams = ["Team A", "Team B"];

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
    positions: ["RT Driver 1", "RT Driver 2", "Hopt"],
  },
  {
    name: "Prep / Packsize",
    color: "#3b82f6",
    positions: ["Trolley Preper 1", "Trolley Preper 2", "Packsize"],
  },
  {
    name: "Docs / Palletising",
    color: "#f97316",
    positions: [
      "Document Applier 1",
      "Document Applier 2",
      "Palletiser 1",
      "Palletiser 2",
      "Palletiser 3",
      "Palletiser 4",
      "Trolley Dropper",
      "Box Filler",
    ],
  },
  {
    name: "VAS / Nester",
    color: "#a855f7",
    positions: ["Vas 1", "Nester 1", "Nester 2"],
  },
  {
    name: "Other",
    color: "#14b8a6",
    positions: ["Packing", "C-Plein"],
  },
];

/* =====================================================
   STAFF
===================================================== */

const commonSupervisors = [
  "Marciano Dekker",
  "Jan Schulz",
  "Cyrille Berkelaar",
  "Anna Cetera",
  "Brahim Said Yousef",
];

const commonCoordinators = [
  "Kucharska Wioleta",
  "Janulevicius Antanas",
  "Sotirios Sampaliotis",
  "Pitic Paul-Ioan",
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
    "Arestov Oleksandr",
    "Angheluta Dan",
    "Biudiachenko Oleksander",
    "Chrobak Jaroslaw",
    "Diachenko Maria",
    "Fesenko Anna",
    "Fouka Eleni",
    "Hamerla Paula",
    "Iacob Ioana Adriana",
    "Karolin Adam",
    "Kaznowska Olivia",
    "Klaudia Voros",
    "Kwansungnern Ketwadi",
    "Kytsak Rostyslav",
    "Maksymiuk Jacek",
    "Marcin Szumilas",
    "Muravia Arsenii",
    "Oles Katarzyna",
    "Oliinyk Ruslan",
    "Palade Mihaela",
    "Parzyszek Lukasz",
    "Polehenko Snizhana",
    "Raluca Tarabacu",
    "Romanik Mariusz",
    "Ringma Mario",
    "Socha Ewelina",
    "Svistula Oleksii",
    "Tsioumas Panagiotis",
    "Varava Sofiia",
    "Veer v.d Kees",
    "Vilkhova Alina",
    "Zan Ewa",
  ],

  "Team B": [
    "Baziuk Karyna",
    "Carizonni Victoria",
    "Cetera Adrian",
    "Chrobak Marta",
    "Cuchillo Lopez Eloi",
    "Debets Henk",
    "Diaz Soler Arslan",
    "Fanelli Samson",
    "Firek Piotr",
    "Gnanasundarm G. Theepan",
    "Hudema Cristina",
    "Ivanenko Artem",
    "Jackiewicz Aleksandra",
    "Kicosova Zuzana",
    "Lahodiienko Oleh",
    "Mazgula Adam",
    "Natiri Theo",
    "Orlowski Robert",
    "Prifti Ervis",
    "Radus Alexandru",
    "Rapan Adrian",
    "Rodrigues Joao",
    "Shavb Yelyzaveta",
    "Siekierko Samanta",
    "Slavkovsky Martin (trainer)",
    "Socol Emmanuel",
    "Stipinas Aurimas",
    "Stryzh Anastasia",
    "Szabo Ibolya",
    "Ursaciuc Daniel",
    "Vysockaja Valentina",
    "Wasilewski Jacek",
  ],
};

/* =====================================================
   EMPTY TEMPLATE
===================================================== */

function createEmptyData() {
  const obj = {};

  teams.forEach((team) => {
    obj[team] = {};

    leadershipPositions.forEach((p) => {
      obj[team][p] = "";
    });

    areas.forEach((area) => {
      area.positions.forEach((p) => {
        obj[team][p] = "";
      });
    });
  });

  return obj;
}

/* =====================================================
   APP
===================================================== */

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("auth") === "true"
  );

  const [passwordInput, setPasswordInput] = useState("");
  const [currentTeam, setCurrentTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(0);

  const [boardData, setBoardData] = useState(createEmptyData());

  /* =====================================================
     LIVE FIREBASE LISTENER
  ===================================================== */
  useEffect(() => {
    if (!db) return;

    const ref = doc(db, "dashboard", "shared");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setBoardData(snap.data());
      } else {
        const starter = createEmptyData();
        setBoardData(starter);
        setDoc(ref, starter);
      }
    });

    return () => unsub();
  }, []);

  /* =====================================================
     AUTO REFRESH
  ===================================================== */
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const timer = setInterval(() => {
      window.location.reload();
    }, refreshInterval * 60000);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  /* =====================================================
     LOGIN SCREEN
  ===================================================== */
  if (!authenticated) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#020617",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h2>🔐 Dashboard Login</h2>

        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          style={{ padding: 10, fontSize: 18 }}
        />

        <button
          onClick={() => {
            if (passwordInput === PASSWORD) {
              localStorage.setItem("auth", "true");
              setAuthenticated(true);
            }
          }}
          style={{ padding: "10px 18px" }}
        >
          Login
        </button>
      </div>
    );
  }

  /* =====================================================
     SHARED TEAM DATA
  ===================================================== */
  const teamData = boardData[currentTeam] || {};

  /* =====================================================
     CHANGE POSITION
  ===================================================== */
  const assign = (position, value) => {
    if (locked) return;

    const updated = {
      ...boardData,
      [currentTeam]: {
        ...boardData[currentTeam],
        [position]: value,
      },
    };

    setBoardData(updated); // instant local
  };

  /* =====================================================
     APPLY TO FIREBASE
  ===================================================== */
  const applyChanges = async () => {
    if (!db) {
      alert("Firebase not configured");
      return;
    }

    await setDoc(doc(db, "dashboard", "shared"), boardData);
  };

  /* =====================================================
     FREE PEOPLE = PICKING
  ===================================================== */
  const assigned = Object.values(teamData).filter(Boolean);

  const free = employees[currentTeam].filter(
    (name) => !assigned.includes(name)
  );

  /* =====================================================
     RENDER AREA
  ===================================================== */
  const renderArea = (area) => (
    <div key={area.name} style={{ marginBottom: 16 }}>
      <h3 style={{ color: area.color }}>{area.name}</h3>

      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: isMobile()
            ? "repeat(2,1fr)"
            : "repeat(5,1fr)",
        }}
      >
        {area.positions.map((pos) => (
          <Card key={pos} color={area.color}>
            <div style={{ marginBottom: 8 }}>{pos}</div>

            <select
              disabled={locked}
              value={teamData[pos] || ""}
              onChange={(e) => assign(pos, e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">Select</option>

              {employees[currentTeam].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </Card>
        ))}
      </div>
    </div>
  );

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: 16,
      }}
    >
      <h1>📺 Planning Dashboard</h1>

      {/* TOP BAR */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {teams.map((t) => (
          <button key={t} onClick={() => setCurrentTeam(t)}>
            {t}
          </button>
        ))}

        <button onClick={() => setLocked(!locked)}>
          {locked ? "🔒 Locked" : "🔓 Unlocked"}
        </button>

        <button onClick={applyChanges}>✅ Apply</button>

        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
        >
          <option value={0}>No Refresh</option>
          <option value={5}>5 min</option>
          <option value={10}>10 min</option>
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={60}>60 min</option>
        </select>

        <button
          onClick={() => {
            localStorage.removeItem("auth");
            setAuthenticated(false);
          }}
        >
          Logout
        </button>
      </div>

      {/* LEADERSHIP */}
      <h2 style={{ color: "#facc15" }}>👔 Leadership</h2>

      <div
        style={{
          display: "grid",
          gap: 10,
          marginBottom: 20,
          gridTemplateColumns: isMobile()
            ? "repeat(2,1fr)"
            : "repeat(4,1fr)",
        }}
      >
        {leadershipPositions.map((pos) => (
          <Card key={pos} color="#facc15">
            <div style={{ marginBottom: 8 }}>{pos}</div>

            <select
              disabled={locked}
              value={teamData[pos] || ""}
              onChange={(e) => assign(pos, e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">Select</option>

              {(pos.includes("Supervisor")
                ? employees.supervisors[currentTeam]
                : employees.coordinators[currentTeam]
              ).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </Card>
        ))}
      </div>

      {/* OPERATIONS */}
      {areas.map(renderArea)}

      {/* PICKING */}
      <h2 style={{ color: "#4ade80" }}>
        📦 Picking ({free.length})
      </h2>

      <div>{free.join(", ")}</div>
    </div>
  );
}
