/* FULL FINAL App.js (stable base + requested upgrades applied) */
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
    name: "RT / Hopt",
    color: "#22c55e",
    items: [
      { key: "rt1", label: "RT Driver", slots: 3 },
      { key: "rt2", label: "RT Driver", slots: 3 },
      { key: "hopt", label: "Hopt", slots: 2 },
    ],
  },
  {
    name: "Prep",
    color: "#3b82f6",
    items: [
      { key: "prep", label: "Trolley Prepper", slots: 2, split: true },
      { key: "packsize", label: "Packsize", slots: 2, split: true },
    ],
  },
  {
    name: "Docs / Pallet",
    color: "#f97316",
    items: [
      { key: "doc", label: "Document Applier", slots: 2, split: true },
      { key: "pal1", label: "Palletiser A", slots: 3, split: true },
      { key: "pal2", label: "Palletiser B", slots: 3, split: true },
      { key: "drop", label: "Trolley Dropper", slots: 1, split: true },
      { key: "box", label: "Box Filler", slots: 1, split: true },
    ],
  },
  {
    name: "VAS / Nester",
    color: "#a855f7",
    items: [
      { key: "vas", label: "VAS", slots: 2 },
      { key: "nest", label: "Nester", slots: 4 },
    ],
  },
  {
    name: "Other",
    color: "#14b8a6",
    items: [
      { key: "pack", label: "Packing", slots: 2 },
      { key: "cplein", label: "C-Plein", slots: 2 },
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
    "Darzina Evita",
    "Mohammad Abdi",
    "Zwolinska Aleksandra",
    "Vromen John",
    "Kamionowski Mateusz",
    "Selvavinayagam Mike",
    "Fotini Varsamidou",
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
    "Darzina Evita",
    "Mohammad Abdi",
    "Zwolinska Aleksandra",
    "Vromen John",
    "Kamionowski Mateusz",
    "Selvavinayagam Mike",
    "Fotini Varsamidou",
  ],
   "A-FLOW A": [
  "Skitinas Edgaras",
  "Gomez Gina",
  "Gonzalez Jose",
  "Andrushehenko Kyrylo",
  "Sienkiewicz Mariusz",
  "Simirska Marta",
  "Ostapuk Oleksander",
  "Shytyk Oleksandr",
  "Goyke Przemyslaw",
  "Tanasienko Serhii (BHV)",
  "Vinkovic Velimir",
  "Ciprian - ionut Iacob",
  "Palun Igor",
  "Kyrou Nikolaos (BHV)",
  "Macaay Shandell",
  "Falhi Tarik",
  "Gorzkiewicz Gerard (BHV)"
],

"A-FLOW B": [
  "Dorobek Aleksandra",
  "George Andrei (BHV)",
  "Papan Antonio",
  "Papan Costel",
  "Arbos Killian",
  "Godlewski Lukasz",
  "Domenech Marc",
  "Wizyn-Jastrzebski Mateusz",
  "Gliszczynski-Mrozek Przemyslaw (BHV)",
  "Kania Regina",
  "Shushvalov Vladyslav",
  "Vasyl Kytsak",
  "Francisco Rafael Rodrigues André",
  "Kyrou Nikolaos (BHV)",
  "Macaay Shandell",
  "Falhi Tarik",
  "Gorzkiewicz Gerard (BHV)"
],
};

/* =====================================================
   HELPERS
===================================================== */
function createBoard() {
  const board = {};

  teams.forEach((team) => {
    board[team] = {};

    leadership.forEach((item) => {
      board[team][item.key] = Array(item.slots).fill("");
    });

    areas.forEach((area) => {
      area.items.forEach((item) => {
        board[team][item.key] = Array(item.slots).fill("");
        if (item.split) {
          board[team][item.key + "_bc"] = Array(item.slots).fill("");
        }
      });
    });

    board[team].notin = Array(12).fill("");
  });

  return board;
}

function safeArray(value, size) {
  if (Array.isArray(value)) {
    const copy = [...value];
    while (copy.length < size) copy.push("");
    return copy.slice(0, size);
  }
  return Array(size).fill("");
}

/* =====================================================
   APP
===================================================== */
export default function App() {
  const [logged, setLogged] = useState(
    localStorage.getItem("auth") === "true"
  );
  const [passwordInput, setPasswordInput] = useState("");

  const [team, setTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const [boardData, setBoardData] = useState(createBoard());
  const [staff, setStaff] = useState(defaultStaff);

  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockInput, setUnlockInput] = useState("");

  const [showStaff, setShowStaff] = useState(false);
  const [staffCat, setStaffCat] = useState("Team A");
  const [newName, setNewName] = useState("");

  const [aFlowTeamA, setAFlowTeamA] = useState(Array(15).fill(""));
  const [aFlowTeamB, setAFlowTeamB] = useState(Array(15).fill(""));

  const [aFlowRoleA, setAFlowRoleA] = useState(Array(15).fill(""));
  const [aFlowRoleB, setAFlowRoleB] = useState(Array(15).fill(""));

  /* ===================================================== */

   useEffect(() => {
  const ref = doc(db, "dashboard", "shared");

  const unsub = onSnapshot(ref, async (snap) => {
    if (snap.exists()) {
      const data = snap.data();

      setBoardData(data.board || createBoard());

      /* AUTOMATIC STAFF MERGE FIX */
      const savedStaff = data.staff || {};

      setStaff({
        supervisors: [
          ...new Set([
            ...(savedStaff.supervisors || []),
            ...defaultStaff.supervisors,
          ]),
        ],

        coordinators: [
          ...new Set([
            ...(savedStaff.coordinators || []),
            ...defaultStaff.coordinators,
          ]),
        ],

        "Team A": [
          ...new Set([
            ...(savedStaff["Team A"] || []),
            ...defaultStaff["Team A"],
          ]),
        ],

        "Team B": [
          ...new Set([
            ...(savedStaff["Team B"] || []),
            ...defaultStaff["Team B"],
          ]),
        ],
      });

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

  async function saveShared(
    nextBoard = boardData,
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
  if (!logged) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 12
      }}>
        <h2>🔐 Dashboard Login</h2>

        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          style={{ padding: 10, borderRadius: 8 }}
        />

        <button
          style={{ ...buttonStyle, background: "#2563eb" }}
          onClick={() => {
            if (passwordInput === PASSWORD) {
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

  const teamData = boardData[team] || {};
  const options = staff[team] || [];
  const allPeople = [...staff["Team A"], ...staff["Team B"]];

  /* =====================================================
     ASSIGN
  ===================================================== */
  function assign(roleKey, slotIndex, value, slots) {
  if (locked) return;

  const labelMap = {};

  leadership.forEach((x) => {
    labelMap[x.key] = x.label;
  });

  areas.forEach((area) => {
    area.items.forEach((x) => {
      labelMap[x.key] = x.label;
      if (x.split) {
        labelMap[x.key + "_bc"] = x.label + " Break Cover";
      }
    });
  });

  labelMap["notin"] = "Not In";

  if (value) {
    let duplicateText = null;

    Object.entries(teamData).forEach(([key, arr]) => {
      if (!Array.isArray(arr)) return;

      arr.forEach((person, idx) => {
        if (
          person === value &&
          !(key === roleKey && idx === slotIndex)
        ) {
          const roleName = labelMap[key] || key;
          duplicateText =
            value +
            " already assigned as " +
            roleName +
            " Slot " +
            (idx + 1);
        }
      });
    });

    if (duplicateText) {
      const ok = window.confirm(
        duplicateText + "\n\nUse anyway?"
      );

      if (!ok) return;
    }
  }

  const current = safeArray(teamData[roleKey], slots);
  current[slotIndex] = value;

  const updated = {
    ...boardData,
    [team]: {
      ...boardData[team],
      [roleKey]: current,
    },
  };

  setBoardData(updated);
}

  /* =====================================================
     AUTO PICKING
  ===================================================== */
  const used = [];

  Object.values(teamData).forEach((v) => {
    if (Array.isArray(v)) {
      v.forEach((x) => x && used.push(x));
    }
  });

  const picking = options.filter((x) => !used.includes(x));

  /* =====================================================
     CARD
  ===================================================== */
  function renderCard(item, color, optionsList) {
    const values = safeArray(teamData[item.key], item.slots);
     if (item.key === "notin") {
  return (
    <div key={item.key} style={cardStyle(color)}>
      <div
  style={{
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
    background: "#0284c7",
    padding: "5px 8px",
    borderRadius: 6,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.4,
  }}
>
  {item.label}
</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 4,
        }}
      >
        {values.map((v, i) => (
          <select
            key={i}
            disabled={locked}
            value={v}
            onChange={(e) =>
              assign(item.key, i, e.target.value, item.slots)
            }
            style={{
              width: "100%",
              padding: 4,
              fontSize: 11,
            }}
          >
            <option value="">-{i + 1}-</option>
            {optionsList.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}

    if (item.split) {
      const cover = safeArray(
        teamData[item.key + "_bc"],
        item.slots
      );

      return (
        <div key={item.key} style={cardStyle(color)}>
          <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>
            {item.label}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4
          }}>
            {/* MAIN */}
            <div>
             <div
  style={{
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    background: "#334155",
    padding: "4px 6px",
    borderRadius: 6,
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  }}
>
  Main
</div>

              {values.map((val, i) => (
                <select
                  key={i}
                  disabled={locked}
                  value={val}
                  onChange={(e) =>
                    assign(item.key, i, e.target.value, item.slots)
                  }
                  style={{
                    width: "100%",
                    marginBottom: 4,
                    padding: 4,
                    fontSize: 11,
                  }}
                >
                  <option value="">-{i + 1}-</option>
                  {optionsList
  .filter((name) => {
    const usedPeople = [];

    Object.entries(teamData).forEach(([k, arr]) => {
      if (Array.isArray(arr)) {
        arr.forEach((p, idx) => {
          if (
            p &&
            !(k === item.key && idx === i)
          ) {
            usedPeople.push(p);
          }
        });
      }
    });

    return !usedPeople.includes(name);
  })
  .map((n) => (
    <option key={n}>{n}</option>
  ))}
                </select>
              ))}
            </div>

            {/* BREAK COVER */}
            <div>
              <div
  style={{
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    background: "#475569",
    padding: "4px 6px",
    borderRadius: 6,
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  }}
>
  Break Cover
</div>

              {cover.map((val, i) => (
                <select
                  key={i}
                  disabled={locked}
                  value={val}
                  onChange={(e) =>
                    assign(
                      item.key + "_bc",
                      i,
                      e.target.value,
                      item.slots
                    )
                  }
                  style={{
                    width: "100%",
                    marginBottom: 4,
                    padding: 4,
                    fontSize: 11,
                  }}
                >
                  <option value="">-{i + 1}-</option>
                  {optionsList.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={item.key} style={cardStyle(color)}>
        <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>
          {item.label}
        </div>

        {values.map((val, i) => (
          <select
            key={i}
            disabled={locked}
            value={val}
            onChange={(e) =>
              assign(item.key, i, e.target.value, item.slots)
            }
            style={{
              width: "100%",
              marginBottom: 4,
              padding: 4,
              fontSize: 11,
            }}
          >
            <option value="">-{i + 1}-</option>
            {optionsList.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        ))}
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div style={{
      height: "100vh",
      background: "#0f172a",
      color: "#fff",
      display: "flex",
      overflow: "hidden",
      fontFamily: "Arial, sans-serif",
    }}>
      {/* LEFT */}
      <div style={{ width: "75%", padding: 8 }}>
        <h1 style={{ margin: "0 0 6px 0", fontSize: 18 }}>
          📺 Planning Dashboard
        </h1>

        {/* TOP */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
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
            onClick={async () => {
              if (locked) setShowUnlock(true);
              else {
                setLocked(true);
                await saveShared(boardData, staff, true, team);
              }
            }}
          >
            {locked ? "🔒" : "🔓"}
          </button>

          <button
            style={{ ...buttonStyle, background: "#22c55e" }}
            onClick={() => saveShared()}
          >
            Apply
          </button>

          <button
            style={{ ...buttonStyle, background: "#7c3aed" }}
            onClick={() => setShowStaff(true)}
          >
            Staff
          </button>
        </div>

        {/* LEADERSHIP */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 6,
          marginBottom: 6,
        }}>
          {leadership.map((item) =>
            renderCard(item, "#facc15", staff[item.source])
          )}
        </div>

        {/* AREAS */}
        {areas.map((area) => (
          <div key={area.name} style={{ marginBottom: 6 }}>
            <div style={{
              color: area.color,
              fontSize: 13,
              fontWeight: "bold",
              marginBottom: 4,
            }}>
              {area.name}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 6,
            }}>
              {area.items.map((item) =>
                renderCard(item, area.color, options)
              )}
            </div>
          </div>
        ))}

        {/* BOTTOM */}
{/* NOT IN */}
<div style={cardStyle("#0ea5e9")}>
  <div
    style={{
      fontSize: 13,
      fontWeight: "bold",
      color: "#ffffff",
      background: "#0284c7",
      padding: "5px 8px",
      borderRadius: 6,
      marginBottom: 6,
      textAlign: "center",
      letterSpacing: 0.4,
    }}
  >
    Not In
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(6,1fr)",
      gap: 4,
    }}
  >
    {safeArray(teamData.notin, 12).map((v, i) => (
      <select
        key={i}
        disabled={locked}
        value={v}
        onChange={(e) =>
          assign("notin", i, e.target.value, 12)
        }
        style={{
          width: "100%",
          padding: 4,
          fontSize: 11,
        }}
      >
        <option value="">-{i + 1}-</option>
        {allPeople.map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
    ))}
  </div>
</div>
<div style={{
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 6,
  alignItems: "start",
}}>
          {/* PICKING */}
          <div style={cardStyle("#16a34a")}>
           <div
  style={{
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
    background: "#166534",
    padding: "5px 8px",
    borderRadius: 6,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.4,
  }}
>
  Picking Operations
</div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 4,
              fontSize: 14,
            }}>
              {picking.map((name) => (
                <div key={name}>{name}</div>
              ))}
            </div>
          </div>

          
        </div>
      </div>

      {/* RIGHT */}
<div
  style={{
    width: "25%",
    borderLeft: "1px solid #334155",
    padding: 10,
    overflowY: "auto",
    color: "#e2e8f0",
  }}
>
  {/* HEADER */}
  <div
    style={{
      background: "#0f766e",
      padding: "8px",
      borderRadius: 8,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 20,
      marginBottom: 10,
    }}
  >
    A-FLOW
  </div>

  {/* BUTTONS */}
  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
  <button
    style={{ ...buttonStyle, flex: 1 }}
    onClick={() => setShowStaff(true)}
  >
    Staff Management
  </button>

  <button
    style={{ ...buttonStyle, flex: 1 }}
    onClick={() => setLocked(!locked)}
  >
    {locked ? "Unlock" : "Lock"}
  </button>
</div>

  {/* TEAM A */}
<div
  style={{
    background: "#1e293b",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  }}
>
  <div style={{ fontWeight: "bold", marginBottom: 6 }}>TEAM A</div>

  {aFlowTeamA.map((value, i) => (
  <div
    key={i}
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 4,
      marginBottom: 4,
    }}
  >
    <select
      disabled={locked}
      value={value}
      onChange={(e) => {
        const updated = [...aFlowTeamA];
        updated[i] = e.target.value;
        setAFlowTeamA(updated);
      }}
      style={{ padding: 4, fontSize: 11 }}
    >
      <option value="">- Slot {i + 1} -</option>

      {[
        "Skitinas Edgaras",
        "Gomez Gina",
        "Gonzalez Jose",
        "Andrushehenko Kyrylo",
        "Sienkiewicz Mariusz",
        "Simirska Marta",
        "Ostapuk Oleksander",
        "Shytyk Oleksandr",
        "Goyke Przemyslaw",
        "Tanasienko Serhii (BHV)",
        "Vinkovic Velimir",
        "Ciprian - ionut Iacob",
        "Palun Igor",
        "Kyrou Nikolaos (BHV)",
        "Macaay Shandell",
        "Falhi Tarik",
        "Gorzkiewicz Gerard (BHV)",
      ].map((name) => (
        <option key={name}>{name}</option>
      ))}
    </select>

    <input
      disabled={locked}
      value={aFlowRoleA[i]}
      onChange={(e) => {
        const updated = [...aFlowRoleA];
        updated[i] = e.target.value;
        setAFlowRoleA(updated);
      }}
      placeholder="Sup B-Flow / note"
      style={{ padding: 4, fontSize: 11 }}
    />
  </div>
))}
</div>

  {/* TEAM B */}
<div
  style={{
    background: "#1e293b",
    padding: 8,
    borderRadius: 8,
  }}
>
  <div style={{ fontWeight: "bold", marginBottom: 6 }}>TEAM B</div>

  {aFlowTeamB.map((value, i) => (
    <div
      key={i}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 4,
        marginBottom: 4,
      }}
    >
      <select
        disabled={locked}
        value={value}
        onChange={(e) => {
          const updated = [...aFlowTeamB];
          updated[i] = e.target.value;
          setAFlowTeamB(updated);
        }}
        style={{ padding: 4, fontSize: 11 }}
      >
        <option value="">- Slot {i + 1} -</option>

        {[
          "Dorobek Aleksandra",
          "George Andrei (BHV)",
          "Papan Antonio",
          "Papan Costel",
          "Arbos Killian",
          "Godlewski Lukasz",
          "Domenech Marc",
          "Wizyn-Jastrzebski Mateusz",
          "Gliszczynski-Mrozek Przemyslaw (BHV)",
          "Kania Regina",
          "Shushvalov Vladyslav",
          "Vasyl Kytsak",
          "Francisco Rafael Rodrigues André",
          "Kyrou Nikolaos (BHV)",
          "Macaay Shandell",
          "Falhi Tarik",
          "Gorzkiewicz Gerard (BHV)",
        ].map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <input
        disabled={locked}
        value={aFlowRoleB[i]}
        onChange={(e) => {
          const updated = [...aFlowRoleB];
          updated[i] = e.target.value;
          setAFlowRoleB(updated);
        }}
        placeholder="Sup B-Flow / note"
        style={{ padding: 4, fontSize: 11 }}
      />
    </div>
  ))}
</div>
</div>

{/* UNLOCK POPUP */}

      {/* UNLOCK POPUP */}
      {showUnlock && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div style={{
            background: "#1e293b",
            padding: 20,
            borderRadius: 14,
            width: 320,
          }}>
            <h2>Unlock</h2>

            <input
              type="password"
              value={unlockInput}
              onChange={(e) => setUnlockInput(e.target.value)}
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
                if (unlockInput === PASSWORD) {
                  setLocked(false);
                  setShowUnlock(false);
                  setUnlockInput("");
                  await saveShared(boardData, staff, false, team);
                }
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* STAFF POPUP */}
      {showStaff && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div style={{
            background: "#1e293b",
            padding: 20,
            borderRadius: 14,
            width: 420,
          }}>
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
              <option>A-FLOW A</option>
<option>A-FLOW B</option>
<option>Team A</option>
<option>Team B</option>
<option>supervisors</option>
<option>coordinators</option>
            </select>

            <div style={{
              display: "flex",
              gap: 6,
              marginBottom: 10,
            }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New name"
                style={{ flex: 1, padding: 8 }}
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

            <div style={{
              maxHeight: 260,
              overflowY: "auto",
              marginBottom: 10,
            }}>
              {staff[staffCat].map((name) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span>{name}</span>

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
                            (x) => x !== name
                          ),
                      });
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6 }}>
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

