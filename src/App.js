import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

/* =====================================================
   FIREBASE
===================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyBF-W5EwRFF0baYzj-jIh8vuCBh3cj9Wn8",
  authDomain: "planning-dashboard-53c9f.firebaseapp.com",
  projectId: "planning-dashboard-53c9f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =====================================================
   SETTINGS
===================================================== */
const PASSWORD = "1234";
const isMobile = () => window.innerWidth < 900;

/* =====================================================
   UI HELPERS
===================================================== */
const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const Card = ({ children, color }) => (
  <div
    style={{
      background: "#0f172a",
      color: "#ffffff",
      borderLeft: `8px solid ${color}`,
      borderRadius: 14,
      padding: 12,
      boxShadow: "0 6px 16px rgba(0,0,0,.35)",
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
   DEFAULT STAFF
===================================================== */
const defaultStaff = {
  supervisors: [
    "Marciano Dekker",
    "Jan Schulz",
    "Cyrille Berkelaar",
    "Anna Cetera",
    "Brahim Said Yousef",
  ],
  coordinators: [
    "Kucharska Wioleta",
    "Janulevicius Antanas",
    "Sotirios Sampaliotis",
    "Pitic Paul-Ioan",
  ],
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
   EMPTY BOARD
===================================================== */
function createEmptyData() {
  const obj = {};
  teams.forEach((team) => {
    obj[team] = {};
    leadershipPositions.forEach((p) => (obj[team][p] = ""));
    areas.forEach((area) =>
      area.positions.forEach((p) => (obj[team][p] = ""))
    );
  });
  return obj;
}

/* =====================================================
   APP
===================================================== */
export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem("auth") === "true");
  const [pass, setPass] = useState("");

  const [boardData, setBoardData] = useState(createEmptyData());
  const [staff, setStaff] = useState(defaultStaff);

  const [team, setTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const [showStaff, setShowStaff] = useState(false);
  const [newName, setNewName] = useState("");
  const [category, setCategory] = useState("Team A");

  /* LIVE SYNC */
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "dashboard", "shared"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBoardData(data.board || createEmptyData());
        setStaff(data.staff || defaultStaff);
      } else {
        setDoc(doc(db, "dashboard", "shared"), {
          board: createEmptyData(),
          staff: defaultStaff,
        });
      }
    });

    return () => unsub();
  }, []);

  /* LOGIN SCREEN */
  if (!auth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "#fff",
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
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            padding: 10,
            fontSize: 18,
            borderRadius: 8,
          }}
        />

        <button
          style={{ ...buttonStyle, background: "#2563eb" }}
          onClick={() => {
            if (pass === PASSWORD) {
              localStorage.setItem("auth", "true");
              setAuth(true);
            }
          }}
        >
          Login
        </button>
      </div>
    );
  }

  const teamData = boardData[team] || {};

  /* ASSIGN PERSON */
  const assign = (position, value) => {
    if (locked) return;

    setBoardData({
      ...boardData,
      [team]: {
        ...boardData[team],
        [position]: value,
      },
    });
  };

  /* SAVE ALL */
  const apply = async () => {
    await setDoc(doc(db, "dashboard", "shared"), {
      board: boardData,
      staff,
    });
  };

  /* STAFF MANAGER */
  const addName = () => {
    if (!newName.trim()) return;

    setStaff({
      ...staff,
      [category]: [...staff[category], newName.trim()],
    });

    setNewName("");
  };

  const removeName = (cat, name) => {
    setStaff({
      ...staff,
      [cat]: staff[cat].filter((n) => n !== name),
    });
  };

  const assigned = Object.values(teamData).filter(Boolean);

  const free = staff[team].filter((n) => !assigned.includes(n));

  const renderArea = (area) => (
    <div key={area.name} style={{ marginBottom: 18 }}>
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
            <div style={{ marginBottom: 8, fontWeight: 700 }}>{pos}</div>

            <select
              disabled={locked}
              value={teamData[pos] || ""}
              onChange={(e) => assign(pos, e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                background: "#1e293b",
                color: "#fff",
                borderRadius: 8,
              }}
            >
              <option value="">Select</option>

              {staff[team].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        padding: 16,
      }}
    >
      <h1 style={{ marginBottom: 18 }}>📺 Planning Dashboard</h1>

      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {teams.map((t) => (
          <button
            key={t}
            onClick={() => setTeam(t)}
            style={{
              ...buttonStyle,
              background: team === t ? "#2563eb" : "#1e293b",
              border: "1px solid #475569",
              color: "#fff",
            }}
          >
            {t}
          </button>
        ))}

        <button
          onClick={() => setLocked(!locked)}
          style={{
            ...buttonStyle,
            background: locked ? "#dc2626" : "#16a34a",
          }}
        >
          {locked ? "🔒 Locked" : "🔓 Unlocked"}
        </button>

        <button
          onClick={apply}
          style={{ ...buttonStyle, background: "#22c55e" }}
        >
          ✅ Apply
        </button>

        <button
          onClick={() => setShowStaff(true)}
          style={{ ...buttonStyle, background: "#7c3aed" }}
        >
          ⚙️ Manage Staff
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("auth");
            setAuth(false);
          }}
          style={{ ...buttonStyle, background: "#475569" }}
        >
          Logout
        </button>
      </div>

      {/* STAFF POPUP */}
      {showStaff && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#111827",
              padding: 20,
              width: "95%",
              maxWidth: 520,
              borderRadius: 14,
            }}
          >
            <h2>⚙️ Staff Manager</h2>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 10,
                background: "#1e293b",
                color: "#fff",
              }}
            >
              <option>Team A</option>
              <option>Team B</option>
              <option>supervisors</option>
              <option>coordinators</option>
            </select>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                placeholder="New Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                }}
              />

              <button
                onClick={addName}
                style={{ ...buttonStyle, background: "#16a34a" }}
              >
                ➕ Add
              </button>
            </div>

            <div
              style={{
                maxHeight: 320,
                overflowY: "auto",
                marginBottom: 14,
              }}
            >
              {staff[category].map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #374151",
                  }}
                >
                  <span>{n}</span>

                  <button
                    onClick={() => removeName(category, n)}
                    style={{
                      ...buttonStyle,
                      background: "#dc2626",
                      padding: "6px 10px",
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={apply}
                style={{ ...buttonStyle, background: "#22c55e" }}
              >
                💾 Save Staff
              </button>

              <button
                onClick={() => setShowStaff(false)}
                style={{ ...buttonStyle, background: "#475569" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEADERSHIP */}
      <h2 style={{ color: "#facc15", marginBottom: 12 }}>
        👔 Leadership
      </h2>

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
            <div style={{ marginBottom: 8, fontWeight: 700 }}>{pos}</div>

            <select
              disabled={locked}
              value={teamData[pos] || ""}
              onChange={(e) => assign(pos, e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                background: "#1e293b",
                color: "#fff",
                borderRadius: 8,
              }}
            >
              <option value="">Select</option>

              {(pos.includes("Supervisor")
                ? staff.supervisors
                : staff.coordinators
              ).map((n) => (
                <option key={n}>{n}</option>
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
