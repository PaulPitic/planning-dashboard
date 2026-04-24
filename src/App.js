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
const teams = ["Team A", "Team B"];

const btnBase = {
  padding: "6px 10px",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 12,
};

const selectStyle = {
  width: "100%",
  marginBottom: 4,
  fontSize: 11,
  padding: 3,
  borderRadius: 5,
};

const box = (c) => ({
  background: "#1e293b",
  borderLeft: `5px solid ${c}`,
  borderRadius: 10,
  padding: 8,
});

const titleStyle = {
  fontWeight: "bold",
  fontSize: 12,
  marginBottom: 4,
};

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
    "Adam Kowalski",
    "Mario Test",
    "Lukas TeamA",
  ],
  "Team B": [
    "Baziuk Karyna",
    "Carizonni Victoria",
    "Cetera Adrian",
    "Chrobak Marta",
    "Cuchillo Lopez Eloi",
    "Debets Henk",
    "Robert TeamB",
    "Daniel TeamB",
    "Theo TeamB",
  ],
};

/* =====================================================
   STRUCTURE
===================================================== */
const leadership = [
  { key: "sup1", label: "Supervisor", slots: 3, source: "supervisors" },
  { key: "sup2", label: "Supervisor", slots: 3, source: "supervisors" },
  { key: "coord1", label: "Coordinator", slots: 3, source: "coordinators" },
  { key: "coord2", label: "Coordinator", slots: 3, source: "coordinators" },
];

const areas = [
  {
    title: "RT / Hopt",
    color: "#22c55e",
    items: [
      { key: "rt1", label: "RT Driver", slots: 3 },
      { key: "rt2", label: "RT Driver", slots: 3 },
      { key: "hopt", label: "Hopt", slots: 2 },
    ],
  },
  {
    title: "Prep",
    color: "#3b82f6",
    items: [
      { key: "prep", label: "Trolley Prepper", slots: 2, breakCover: 2 },
      { key: "packsize", label: "Packsize", slots: 2, breakCover: 2 },
    ],
  },
  {
    title: "Docs / Pallet",
    color: "#f97316",
    items: [
      { key: "doc", label: "Document Applier", slots: 2, breakCover: 2 },
      { key: "pal1", label: "Palletiser", slots: 3, breakCover: 3 },
      { key: "pal2", label: "Palletiser", slots: 3, breakCover: 3 },
      { key: "drop", label: "Trolley Dropper", slots: 1, breakCover: 1 },
      { key: "boxf", label: "Box Filler", slots: 1, breakCover: 1 },
    ],
  },
  {
    title: "VAS / Nester",
    color: "#a855f7",
    items: [
      { key: "vas", label: "VAS", slots: 2 },
      { key: "nest", label: "Nester", slots: 4 },
    ],
  },
  {
    title: "Other",
    color: "#14b8a6",
    items: [
      { key: "pack", label: "Packing", slots: 2 },
      { key: "cplein", label: "C-Plein", slots: 2 },
    ],
  },
];

/* =====================================================
   HELPERS
===================================================== */
function emptyArr(n) {
  return Array(n).fill("");
}

function createBoard() {
  const board = {};

  teams.forEach((team) => {
    board[team] = {};

    leadership.forEach((x) => {
      board[team][x.key] = emptyArr(x.slots);
    });

    areas.forEach((a) => {
      a.items.forEach((x) => {
        board[team][x.key] = emptyArr(x.slots);

        if (x.breakCover) {
          board[team][x.key + "_bc"] = emptyArr(x.breakCover);
        }
      });
    });

    board[team]["notin"] = emptyArr(12);
  });

  return board;
}

function safeArray(value, len) {
  if (Array.isArray(value)) {
    const arr = [...value];
    while (arr.length < len) arr.push("");
    return arr.slice(0, len);
  }
  return emptyArr(len);
}

/* =====================================================
   APP
===================================================== */
export default function App() {
  const [logged, setLogged] = useState(
    localStorage.getItem("auth") === "true"
  );
  const [loginPass, setLoginPass] = useState("");

  const [team, setTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const [board, setBoard] = useState(createBoard());
  const [staff] = useState(defaultStaff);

  /* =====================================================
     FIREBASE
  ===================================================== */
  useEffect(() => {
    const ref = doc(db, "dashboard", "shared");

    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setBoard(data.board || createBoard());
        setLocked(data.locked ?? true);
        setTeam(data.currentTeam || "Team A");
      } else {
        await setDoc(ref, {
          board: createBoard(),
          locked: true,
          currentTeam: "Team A",
        });
      }
    });

    return () => unsub();
  }, []);

  async function saveShared(
    nextBoard = board,
    nextLocked = locked,
    nextTeam = team
  ) {
    await setDoc(doc(db, "dashboard", "shared"), {
      board: nextBoard,
      locked: nextLocked,
      currentTeam: nextTeam,
    });
  }

  /* =====================================================
     LOGIN
  ===================================================== */
  if (!logged) {
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
          gap: 10,
        }}
      >
        <h2>Dashboard Login</h2>

        <input
          type="password"
          value={loginPass}
          onChange={(e) => setLoginPass(e.target.value)}
          style={{ padding: 8 }}
        />

        <button
          style={{ ...btnBase, background: "#2563eb" }}
          onClick={() => {
            if (loginPass === PASSWORD) {
              localStorage.setItem("auth", "true");
              setLogged(true);
            }
          }}
        >
          Login
        </button>
      </div>
    );
  }

  const teamData = board[team] || {};
  const operators = staff[team] || [];
  const allPeople = [...staff["Team A"], ...staff["Team B"]];

  /* =====================================================
     ASSIGN
  ===================================================== */
  function updateField(key, index, value, size) {
    if (locked) return;

    const arr = safeArray(teamData[key], size);
    arr[index] = value;

    const next = {
      ...board,
      [team]: {
        ...board[team],
        [key]: arr,
      },
    };

    setBoard(next);
  }

  /* =====================================================
     USED PEOPLE
  ===================================================== */
  const used = [];

  Object.keys(teamData).forEach((k) => {
    const val = teamData[k];

    if (Array.isArray(val)) {
      val.forEach((x) => x && used.push(x));
    }
  });

  const picking = operators.filter((x) => !used.includes(x));

  /* =====================================================
     COMPONENTS
  ===================================================== */
  function SplitCard({ item, color }) {
    const main = safeArray(teamData[item.key], item.slots);
    const cover = safeArray(
      teamData[item.key + "_bc"],
      item.breakCover
    );

    return (
      <div style={box(color)}>
        <div style={titleStyle}>{item.label}</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
          }}
        >
          <div>
            {main.map((v, i) => (
              <select
                key={i}
                value={v}
                disabled={locked}
                onChange={(e) =>
                  updateField(
                    item.key,
                    i,
                    e.target.value,
                    item.slots
                  )
                }
                style={selectStyle}
              >
                <option value="">-{i + 1}-</option>
                {operators.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            ))}
          </div>

          <div>
            {cover.map((v, i) => (
              <select
                key={i}
                value={v}
                disabled={locked}
                onChange={(e) =>
                  updateField(
                    item.key + "_bc",
                    i,
                    e.target.value,
                    item.breakCover
                  )
                }
                style={selectStyle}
              >
                <option value="">Break</option>
                {operators.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function NormalCard({ item, color }) {
    const arr = safeArray(teamData[item.key], item.slots);

    return (
      <div style={box(color)}>
        <div style={titleStyle}>{item.label}</div>

        {arr.map((v, i) => (
          <select
            key={i}
            value={v}
            disabled={locked}
            onChange={(e) =>
              updateField(
                item.key,
                i,
                e.target.value,
                item.slots
              )
            }
            style={selectStyle}
          >
            <option value="">-{i + 1}-</option>
            {operators.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        ))}
      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */
  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        color: "#fff",
        display: "flex",
        fontFamily: "Arial",
      }}
    >
      {/* LEFT */}
      <div style={{ width: "75%", padding: 8 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>
          Planning Dashboard
        </h1>

        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 6,
            marginBottom: 6,
          }}
        >
          {teams.map((t) => (
            <button
              key={t}
              style={{
                ...btnBase,
                background:
                  team === t ? "#2563eb" : "#334155",
              }}
              onClick={async () => {
                setTeam(t);
                await saveShared(board, locked, t);
              }}
            >
              {t}
            </button>
          ))}

          <button
            style={{
              ...btnBase,
              background: locked
                ? "#dc2626"
                : "#16a34a",
            }}
            onClick={async () => {
              setLocked(!locked);
              await saveShared(board, !locked, team);
            }}
          >
            {locked ? "🔒" : "🔓"}
          </button>

          <button
            style={{
              ...btnBase,
              background: "#22c55e",
            }}
            onClick={() => saveShared()}
          >
            Apply
          </button>
        </div>

        {/* LEADERSHIP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 6,
            marginBottom: 6,
          }}
        >
          {leadership.map((x) => (
            <div key={x.key} style={box("#facc15")}>
              <div style={titleStyle}>{x.label}</div>

              {safeArray(
                teamData[x.key],
                x.slots
              ).map((v, i) => (
                <select
                  key={i}
                  value={v}
                  disabled={locked}
                  onChange={(e) =>
                    updateField(
                      x.key,
                      i,
                      e.target.value,
                      x.slots
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">-{i + 1}-</option>
                  {staff[x.source].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              ))}
            </div>
          ))}
        </div>

        {/* AREAS */}
        {areas.map((area) => (
          <div key={area.title}>
            <div
              style={{
                color: area.color,
                fontWeight: "bold",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              {area.title}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 6,
                marginBottom: 6,
              }}
            >
              {area.items.map((item) =>
                item.breakCover ? (
                  <SplitCard
                    key={item.key}
                    item={item}
                    color={area.color}
                  />
                ) : (
                  <NormalCard
                    key={item.key}
                    item={item}
                    color={area.color}
                  />
                )
              )}
            </div>
          </div>
        ))}

        {/* BOTTOM */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 8,
          }}
        >
          {/* PICKING */}
          <div style={box("#16a34a")}>
            <div style={titleStyle}>Picking Operators</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 4,
                fontSize: 15,
                lineHeight: "22px",
              }}
            >
              {picking.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>
          </div>

          {/* NOT IN */}
          <div style={box("#0ea5e9")}>
            <div style={titleStyle}>Not In</div>

            {safeArray(teamData.notin, 12).map(
              (v, i) => (
                <select
                  key={i}
                  value={v}
                  disabled={locked}
                  onChange={(e) =>
                    updateField(
                      "notin",
                      i,
                      e.target.value,
                      12
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">-{i + 1}-</option>

                  {allPeople.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              )
            )}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          width: "25%",
          borderLeft: "1px solid #334155",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#64748b",
          fontWeight: "bold",
          fontSize: 22,
        }}
      >
        KPI PANEL
      </div>
    </div>
  );
}
