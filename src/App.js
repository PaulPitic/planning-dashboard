/*
FULL FINAL App.js
Requested update summary:
✅ Keep 75 / 25 TV layout
✅ Break Cover added to marked roles
✅ Picking list auto-generated
✅ Not In section (12 slots)
✅ Team sync
✅ Firebase sync
✅ Login / lock / staff manager preserved structure

NOTE:
This is a FULL ready-paste file.
*/

import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

/* ===================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyBF-W5EwRFF0baYzj-jIh8vuCBh3cj9Wn8",
  authDomain: "planning-dashboard-53c9f.firebaseapp.com",
  projectId: "planning-dashboard-53c9f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PASSWORD = "1234";
const teams = ["Team A", "Team B"];

const btn = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
};

const card = (color) => ({
  background: "#1e293b",
  borderLeft: `5px solid ${color}`,
  borderRadius: 10,
  padding: 8,
});

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
    "Extra A1",
    "Extra A2",
  ],
  "Team B": [
    "Baziuk Karyna",
    "Carizonni Victoria",
    "Cetera Adrian",
    "Chrobak Marta",
    "Cuchillo Lopez Eloi",
    "Debets Henk",
    "Extra B1",
    "Extra B2",
  ],
};

/* =====================================================
ROLES
===================================================== */
const leadership = [
  { key: "sup1", label: "Supervisor", slots: 3, src: "supervisors" },
  { key: "sup2", label: "Supervisor", slots: 3, src: "supervisors" },
  { key: "coord1", label: "Coordinator", slots: 3, src: "coordinators" },
  { key: "coord2", label: "Coordinator", slots: 3, src: "coordinators" },
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
      { key: "prep", label: "Trolley Prepper", slots: 2, breakCover: true },
      { key: "packsize", label: "Packsize", slots: 2, breakCover: true },
    ],
  },
  {
    title: "Docs / Pallet",
    color: "#f97316",
    items: [
      { key: "doc", label: "Document Applier", slots: 2, breakCover: true },
      { key: "pal1", label: "Palletiser", slots: 3, breakCover: true },
      { key: "pal2", label: "Palletiser", slots: 3, breakCover: true },
      { key: "drop", label: "Trolley Dropper", slots: 1, breakCover: true },
      { key: "box", label: "Box Filler", slots: 1, breakCover: true },
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

/* ===================================================== */
function createBoard() {
  const b = {};

  teams.forEach((team) => {
    b[team] = {};

    leadership.forEach((x) => {
      b[team][x.key] = Array(x.slots).fill("");
    });

    areas.forEach((a) => {
      a.items.forEach((x) => {
        b[team][x.key] = Array(x.slots).fill("");

        if (x.breakCover) b[team][x.key + "_bc"] = "";
      });
    });

    b[team]["notin"] = Array(12).fill("");
  });

  return b;
}

function safe(v, n) {
  if (Array.isArray(v)) {
    const c = [...v];
    while (c.length < n) c.push("");
    return c.slice(0, n);
  }
  return Array(n).fill("");
}

/* ===================================================== */
export default function App() {
  const [auth, setAuth] = useState(
    localStorage.getItem("auth") === "true"
  );
  const [pass, setPass] = useState("");

  const [team, setTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const [board, setBoard] = useState(createBoard());
  const [staff, setStaff] = useState(defaultStaff);

  /* ===================================================== */
  useEffect(() => {
    const ref = doc(db, "dashboard", "shared");

    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const d = snap.data();

        setBoard(d.board || createBoard());
        setStaff(d.staff || defaultStaff);
        setLocked(d.locked ?? true);
        setTeam(d.currentTeam || "Team A");
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

  async function saveShared(
    nextBoard = board,
    nextStaff = staff,
    nextLocked = locked,
    nextTeam = team
  ) {
    await setDoc(doc(db, "dashboard", "shared"), {
      board: nextBoard,
      staff: nextStaff,
      locked: nextLocked,
      currentTeam: nextTeam,
    });
  }

  /* ===================================================== */
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
          gap: 10,
        }}
      >
        <h2>Login</h2>

        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button
          style={{ ...btn, background: "#2563eb" }}
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

  const teamData = board[team] || {};
  const operators = staff[team] || [];
  const allNames = [...staff["Team A"], ...staff["Team B"]];

  function assign(key, idx, val, size) {
    if (locked) return;

    const arr = safe(teamData[key], size);
    arr[idx] = val;

    const next = {
      ...board,
      [team]: {
        ...board[team],
        [key]: arr,
      },
    };

    setBoard(next);
  }

  function assignSingle(key, val) {
    if (locked) return;

    const next = {
      ...board,
      [team]: {
        ...board[team],
        [key]: val,
      },
    };

    setBoard(next);
  }

  /* =====================================================
     PICKING LIST
  ===================================================== */
  const mainAssigned = [];

  Object.keys(teamData).forEach((k) => {
    const v = teamData[k];

    if (Array.isArray(v)) {
      v.forEach((x) => x && mainAssigned.push(x));
    }
  });

  const picking = operators.filter(
    (x) => !mainAssigned.includes(x)
  );

  /* ===================================================== */
  function renderRole(item, color) {
    const vals = safe(teamData[item.key], item.slots);

    return (
      <div key={item.key} style={card(color)}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          {item.label}
        </div>

        {vals.map((v, i) => (
          <select
            key={i}
            disabled={locked}
            value={v}
            onChange={(e) =>
              assign(item.key, i, e.target.value, item.slots)
            }
            style={{
              width: "100%",
              marginBottom: 4,
              fontSize: 11,
            }}
          >
            <option value="">-{i + 1}-</option>

            {operators.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        ))}

        {item.breakCover && (
          <select
            disabled={locked}
            value={teamData[item.key + "_bc"] || ""}
            onChange={(e) =>
              assignSingle(item.key + "_bc", e.target.value)
            }
            style={{
              width: "100%",
              fontSize: 11,
            }}
          >
            <option value="">Break Cover</option>

            {operators.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        )}
      </div>
    );
  }

  /* ===================================================== */
  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        color: "#fff",
        display: "flex",
        overflow: "hidden",
        fontFamily: "Arial",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          width: "75%",
          padding: 8,
          overflow: "hidden",
        }}
      >
        <h1 style={{ fontSize: 18, margin: "0 0 6px 0" }}>
          Planning Dashboard
        </h1>

        {/* TOP */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 6,
          }}
        >
          {teams.map((t) => (
            <button
              key={t}
              style={{
                ...btn,
                background:
                  team === t ? "#2563eb" : "#334155",
              }}
              onClick={async () => {
                setTeam(t);
                await saveShared(board, staff, locked, t);
              }}
            >
              {t}
            </button>
          ))}

          <button
            style={{
              ...btn,
              background: locked
                ? "#dc2626"
                : "#16a34a",
            }}
            onClick={async () => {
              setLocked(!locked);
              await saveShared(
                board,
                staff,
                !locked,
                team
              );
            }}
          >
            {locked ? "🔒" : "🔓"}
          </button>

          <button
            style={{
              ...btn,
              background: "#22c55e",
            }}
            onClick={() => saveShared()}
          >
            Apply
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
          {leadership.map((x) => (
            <div key={x.key} style={card("#facc15")}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                {x.label}
              </div>

              {safe(teamData[x.key], x.slots).map(
                (v, i) => (
                  <select
                    key={i}
                    disabled={locked}
                    value={v}
                    onChange={(e) =>
                      assign(
                        x.key,
                        i,
                        e.target.value,
                        x.slots
                      )
                    }
                    style={{
                      width: "100%",
                      marginTop: 4,
                      fontSize: 11,
                    }}
                  >
                    <option value="">
                      -{i + 1}-
                    </option>

                    {staff[x.src].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                )
              )}
            </div>
          ))}
        </div>

        {/* AREAS */}
        {areas.map((a) => (
          <div key={a.title} style={{ marginBottom: 6 }}>
            <div
              style={{
                color: a.color,
                fontSize: 13,
                fontWeight: "bold",
              }}
            >
              {a.title}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 6,
              }}
            >
              {a.items.map((x) =>
                renderRole(x, a.color)
              )}
            </div>
          </div>
        ))}

        {/* Bottom Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 8,
            marginTop: 6,
          }}
        >
          {/* Picking */}
          <div style={card("#16a34a")}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 6,
              }}
            >
              Picking Operators
            </div>

            <div
              style={{
                fontSize: 12,
                lineHeight: "18px",
              }}
            >
              {picking.join(", ")}
            </div>
          </div>

          {/* Not In */}
          <div style={card("#0ea5e9")}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 6,
              }}
            >
              Not In
            </div>

            {safe(teamData.notin, 12).map(
              (v, i) => (
                <select
                  key={i}
                  disabled={locked}
                  value={v}
                  onChange={(e) =>
                    assign(
                      "notin",
                      i,
                      e.target.value,
                      12
                    )
                  }
                  style={{
                    width: "100%",
                    marginBottom: 4,
                    fontSize: 11,
                  }}
                >
                  <option value="">
                    -{i + 1}-
                  </option>

                  {allNames.map((n) => (
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
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        KPI PANEL
      </div>
    </div>
  );
}
