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

const buttonStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
};

const cardStyle = (color) => ({
  background: "#1e293b",
  borderLeft: `5px solid ${color}`,
  borderRadius: 10,
  padding: 8,
});

const teams = ["Team A", "Team B"];

/* =====================================================
   LEADERSHIP
===================================================== */
const leadership = [
  { key: "Supervisor A", label: "Supervisor", slots: 3, type: "supervisors" },
  { key: "Supervisor B", label: "Supervisor", slots: 3, type: "supervisors" },
  { key: "Coordinator A", label: "Coordinator", slots: 3, type: "coordinators" },
  { key: "Coordinator B", label: "Coordinator", slots: 3, type: "coordinators" },
];

/* =====================================================
   AREAS
===================================================== */
const areas = [
  {
    name: "RT / Hopt",
    color: "#22c55e",
    positions: [
      { key: "RT Driver A", label: "RT Driver", slots: 3 },
      { key: "RT Driver B", label: "RT Driver", slots: 3 },
      { key: "Hopt", label: "Hopt", slots: 2 },
    ],
  },
  {
    name: "Prep",
    color: "#3b82f6",
    positions: [
      { key: "Trolley Prepper", label: "Trolley Prepper", slots: 2 },
      { key: "Packsize", label: "Packsize", slots: 2 },
    ],
  },
  {
    name: "Docs / Pallet",
    color: "#f97316",
    positions: [
      { key: "Document Applier", label: "Document Applier", slots: 2 },
      { key: "Palletiser A", label: "Palletiser", slots: 3 },
      { key: "Palletiser B", label: "Palletiser", slots: 3 },
      { key: "Trolley Dropper", label: "Trolley Dropper", slots: 1 },
      { key: "Box Filler", label: "Box Filler", slots: 1 },
    ],
  },
  {
    name: "VAS / Nester",
    color: "#a855f7",
    positions: [
      { key: "VAS", label: "VAS", slots: 2 },
      { key: "Nester", label: "Nester", slots: 4 },
    ],
  },
  {
    name: "Other",
    color: "#14b8a6",
    positions: [
      { key: "Packing", label: "Packing", slots: 2 },
      { key: "C-Plein", label: "C-Plein", slots: 2 },
    ],
  },
];

/* =====================================================
   STAFF
===================================================== */
const defaultStaff = {
  supervisors: [
    "Marciano Dekker",
    "Jan Schulz",
    "Cyrille Berkelaar",
    "Anna Cetera",
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
  ],
  "Team B": [
    "Baziuk Karyna",
    "Carizonni Victoria",
    "Cetera Adrian",
    "Chrobak Marta",
    "Cuchillo Lopez Eloi",
    "Debets Henk",
  ],
};

/* =====================================================
   HELPERS
===================================================== */
function createBoard() {
  const obj = {};

  teams.forEach((team) => {
    obj[team] = {};

    leadership.forEach((l) => {
      obj[team][l.key] = Array(l.slots).fill("");
    });

    areas.forEach((area) => {
      area.positions.forEach((p) => {
        obj[team][p.key] = Array(p.slots).fill("");
      });
    });
  });

  return obj;
}

/* =====================================================
   APP
===================================================== */
export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem("auth") === "true");
  const [pass, setPass] = useState("");

  const [team, setTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const [boardData, setBoardData] = useState(createBoard());
  const [staff, setStaff] = useState(defaultStaff);

  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockPass, setUnlockPass] = useState("");

  const [showStaff, setShowStaff] = useState(false);
  const [staffCat, setStaffCat] = useState("Team A");
  const [newName, setNewName] = useState("");

  /* =====================================================
     FIREBASE
  ===================================================== */
  useEffect(() => {
    const ref = doc(db, "dashboard", "shared");

    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setBoardData(data.board || createBoard());
        setStaff(data.staff || defaultStaff);
        setLocked(data.locked ?? true);
        setTeam(data.currentTeam || "Team A");
      } else {
        await setDoc(ref, {
          board: createBoard(),
          staff: defaultStaff,
          locked: true,
          currentTeam: "Team A",
        });
      }
    });

    return () => unsub();
  }, []);

  const saveShared = async (
    nextBoard = boardData,
    nextStaff = staff,
    nextLocked = locked,
    nextTeam = team
  ) => {
    await setDoc(doc(db, "dashboard", "shared"), {
      board: nextBoard,
      staff: nextStaff,
      locked: nextLocked,
      currentTeam: nextTeam,
    });
  };

  /* =====================================================
     LOGIN
  ===================================================== */
  if (!auth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
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
          style={{ padding: 10, borderRadius: 8 }}
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

  const teamData = boardData[team];

  /* =====================================================
     ASSIGN
  ===================================================== */
  const assignSlot = (role, index, value) => {
    if (locked) return;

    const updated = [...teamData[role]];
    updated[index] = value;

    setBoardData({
      ...boardData,
      [team]: {
        ...boardData[team],
        [role]: updated,
      },
    });
  };

  /* =====================================================
     RENDER CARD
  ===================================================== */
  const renderCard = (item, color, options) => (
    <div key={item.key} style={cardStyle(color)}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        {item.label}
      </div>

      {teamData[item.key].map((slot, idx) => (
        <select
          key={idx}
          disabled={locked}
          value={slot}
          onChange={(e) =>
            assignSlot(item.key, idx, e.target.value)
          }
          style={{
            width: "100%",
            padding: 4,
            marginBottom: 4,
            fontSize: 11,
            borderRadius: 6,
          }}
        >
          <option value="">-{idx + 1}-</option>

          {options.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      ))}
    </div>
  );

  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        color: "#fff",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* LEFT 75% */}
      <div
        style={{
          width: "75%",
          padding: 8,
          overflow: "hidden",
        }}
      >
        <h1 style={{ fontSize: 18, margin: "0 0 6px 0" }}>
          📺 Planning Dashboard
        </h1>

        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 6,
          }}
        >
          {teams.map((t) => (
            <button
              key={t}
              style={{
                ...buttonStyle,
                background: team === t ? "#2563eb" : "#334155",
              }}
              onClick={async () => {
                setTeam(t);
                await saveShared(boardData, staff, locked, t);
              }}
            >
              {t}
            </button>
          ))}

          <button
            style={{
              ...buttonStyle,
              background: locked ? "#dc2626" : "#16a34a",
            }}
            onClick={() => {
              if (locked) setShowUnlock(true);
              else {
                setLocked(true);
                saveShared(boardData, staff, true, team);
              }
            }}
          >
            {locked ? "🔒" : "🔓"}
          </button>

          <button
            style={{
              ...buttonStyle,
              background: "#22c55e",
            }}
            onClick={() => saveShared()}
          >
            Apply
          </button>

          <button
            style={{
              ...buttonStyle,
              background: "#7c3aed",
            }}
            onClick={() => setShowStaff(true)}
          >
            Staff
          </button>
        </div>

        {/* Leadership */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 6,
            marginBottom: 6,
          }}
        >
          {leadership.map((l) =>
            renderCard(
              l,
              "#facc15",
              staff[l.type]
            )
          )}
        </div>

        {/* Areas */}
        {areas.map((area) => (
          <div key={area.name} style={{ marginBottom: 6 }}>
            <h3
              style={{
                color: area.color,
                fontSize: 13,
                margin: "2px 0",
              }}
            >
              {area.name}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 6,
              }}
            >
              {area.positions.map((p) =>
                renderCard(
                  p,
                  area.color,
                  staff[team]
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT 25% */}
      <div
        style={{
          width: "25%",
          borderLeft: "1px solid #334155",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#64748b",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        KPI PANEL
      </div>

      {/* Unlock Popup */}
      {showUnlock && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: 20,
              borderRadius: 14,
            }}
          >
            <h2>Unlock</h2>

            <input
              type="password"
              value={unlockPass}
              onChange={(e) => setUnlockPass(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
              }}
            />

            <button
              style={{
                ...buttonStyle,
                background: "#2563eb",
              }}
              onClick={async () => {
                if (unlockPass === PASSWORD) {
                  setLocked(false);
                  setShowUnlock(false);
                  await saveShared(boardData, staff, false, team);
                }
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* Staff Popup */}
      {showStaff && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: 20,
              borderRadius: 14,
              width: 420,
            }}
          >
            <h2>Staff Manager</h2>

            <select
              value={staffCat}
              onChange={(e) => setStaffCat(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 8,
              }}
            >
              <option>Team A</option>
              <option>Team B</option>
              <option>supervisors</option>
              <option>coordinators</option>
            </select>

            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New name"
                style={{
                  flex: 1,
                  padding: 8,
                }}
              />

              <button
                style={{
                  ...buttonStyle,
                  background: "#16a34a",
                }}
                onClick={() => {
                  if (!newName.trim()) return;

                  setStaff({
                    ...staff,
                    [staffCat]: [
                      ...staff[staffCat],
                      newName.trim(),
                    ],
                  });

                  setNewName("");
                }}
              >
                Add
              </button>
            </div>

            <div
              style={{
                maxHeight: 260,
                overflowY: "auto",
                marginBottom: 10,
              }}
            >
              {staff[staffCat].map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span>{n}</span>

                  <button
                    style={{
                      ...buttonStyle,
                      background: "#dc2626",
                    }}
                    onClick={() => {
                      setStaff({
                        ...staff,
                        [staffCat]:
                          staff[staffCat].filter(
                            (x) => x !== n
                          ),
                      });
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
              }}
            >
              <button
                style={{
                  ...buttonStyle,
                  background: "#22c55e",
                }}
                onClick={async () => {
                  await saveShared(
                    boardData,
                    staff,
                    locked,
                    team
                  );
                  setShowStaff(false);
                }}
              >
                Save
              </button>

              <button
                style={{
                  ...buttonStyle,
                  background: "#475569",
                }}
                onClick={() => setShowStaff(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
