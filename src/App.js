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

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  background: "#2563eb",
};

const cardStyle = (color) => ({
  background: "#1e293b",
  borderLeft: `8px solid ${color}`,
  borderRadius: 14,
  padding: 12,
});

/* =====================================================
   STRUCTURE
===================================================== */
const teams = ["Team A", "Team B"];

const leadershipPositions = [
  "Supervisor 1",
  "Supervisor 2",
  "Coordinator 1",
  "Coordinator 2",
];

const areas = [
  {
    name: "RT / Hopt",
    color: "#22c55e",
    positions: [
      { name: "RT Driver A", slots: 3 },
      { name: "RT Driver B", slots: 3 },
      { name: "Hopt", slots: 2 },
    ],
  },
  {
    name: "Prep",
    color: "#3b82f6",
    positions: [
      { name: "Trolley Prepper", slots: 2 },
      { name: "Packsize", slots: 1 },
    ],
  },
  {
    name: "Docs / Pallet",
    color: "#f97316",
    positions: [
      { name: "Document Applier", slots: 2 },
      { name: "Palletiser A", slots: 3 },
      { name: "Palletiser B", slots: 3 },
      { name: "Trolley Dropper", slots: 1 },
      { name: "Box Filler", slots: 1 },
    ],
  },
  {
    name: "VAS / Nester",
    color: "#a855f7",
    positions: [
      { name: "VAS", slots: 2 },
      { name: "Nester", slots: 4 },
    ],
  },
  {
    name: "Other",
    color: "#14b8a6",
    positions: [
      { name: "Packing", slots: 2 },
      { name: "C-Plein", slots: 2 },
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
  ],
};

/* =====================================================
   EMPTY DATA
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
        obj[team][p.name] = Array(p.slots).fill("");
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

  const [boardData, setBoardData] = useState(createEmptyData());
  const [staff, setStaff] = useState(defaultStaff);

  const [team, setTeam] = useState("Team A");
  const [locked, setLocked] = useState(true);

  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockPass, setUnlockPass] = useState("");

  /* =====================================================
     FIREBASE SYNC
  ===================================================== */
  useEffect(() => {
    const ref = doc(db, "dashboard", "shared");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setBoardData(data.board || createEmptyData());
        setStaff(data.staff || defaultStaff);
        setLocked(data.locked ?? true);
        setTeam(data.currentTeam || "Team A");
      } else {
        setDoc(ref, {
          board: createEmptyData(),
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
      <div style={{
        minHeight:"100vh",
        background:"#0f172a",
        color:"#fff",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"column",
        gap:12
      }}>
        <h2>🔐 Dashboard Login</h2>

        <input
          type="password"
          value={pass}
          onChange={(e)=>setPass(e.target.value)}
          style={{padding:10,borderRadius:8}}
        />

        <button
          style={buttonStyle}
          onClick={()=>{
            if(pass===PASSWORD){
              localStorage.setItem("auth","true");
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
     ASSIGN SLOT
  ===================================================== */
  const assignSlot = (role, slotIndex, value) => {
    if (locked) return;

    const used = [];

    Object.values(teamData).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach((x) => x && used.push(x));
      } else if (val) {
        used.push(val);
      }
    });

    const currentVal = teamData[role][slotIndex];
    const filteredUsed = used.filter((u) => u !== currentVal);

    if (value && filteredUsed.includes(value)) return;

    const updatedSlots = [...teamData[role]];
    updatedSlots[slotIndex] = value;

    const updated = {
      ...boardData,
      [team]: {
        ...boardData[team],
        [role]: updatedSlots,
      },
    };

    setBoardData(updated);
  };

  /* =====================================================
     UNASSIGNED
  ===================================================== */
  const assigned = [];

  Object.values(teamData).forEach((val) => {
    if (Array.isArray(val)) {
      val.forEach((x) => x && assigned.push(x));
    } else if (val) {
      assigned.push(val);
    }
  });

  const free = staff[team].filter((n) => !assigned.includes(n));

  /* =====================================================
     RENDER AREA
  ===================================================== */
  const renderArea = (area) => (
    <div key={area.name} style={{ marginBottom: 16 }}>
      <h3 style={{ color: area.color }}>{area.name}</h3>

      <div style={{
        display:"grid",
        gap:10,
        gridTemplateColumns:isMobile()
          ? "repeat(1,1fr)"
          : "repeat(2,1fr)"
      }}>
        {area.positions.map((pos) => (
          <div key={pos.name} style={cardStyle(area.color)}>
            <div style={{
              fontWeight:"bold",
              fontSize:20,
              marginBottom:8
            }}>
              {pos.name}
            </div>

            {teamData[pos.name].map((slot, idx) => (
              <select
                key={idx}
                disabled={locked}
                value={slot}
                onChange={(e)=>
                  assignSlot(pos.name, idx, e.target.value)
                }
                style={{
                  width:"100%",
                  padding:10,
                  marginBottom:8,
                  borderRadius:8,
                  fontSize:16
                }}
              >
                <option value="">Slot {idx + 1}</option>

                {staff[team].map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:"#0f172a",
      color:"#fff",
      padding:16
    }}>
      <h1>📺 Planning Dashboard</h1>

      {/* TOP BAR */}
      <div style={{
        display:"flex",
        gap:10,
        flexWrap:"wrap",
        marginBottom:20
      }}>
        {teams.map((t)=>(
          <button
            key={t}
            style={{
              ...buttonStyle,
              background:team===t ? "#2563eb" : "#334155"
            }}
            onClick={async ()=>{
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
            background:locked ? "#dc2626" : "#16a34a"
          }}
          onClick={async ()=>{
            if(locked){
              setShowUnlock(true);
            } else {
              setLocked(true);
              await saveShared(boardData, staff, true, team);
            }
          }}
        >
          {locked ? "🔒 Locked" : "🔓 Unlocked"}
        </button>

        <button
          style={{...buttonStyle, background:"#22c55e"}}
          onClick={()=>saveShared()}
        >
          ✅ Apply
        </button>

        <button
          style={{...buttonStyle, background:"#475569"}}
          onClick={()=>{
            localStorage.removeItem("auth");
            setAuth(false);
          }}
        >
          Logout
        </button>
      </div>

      {/* Unlock Popup */}
      {showUnlock && (
        <div style={{
          position:"fixed",
          inset:0,
          background:"rgba(0,0,0,.7)",
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}>
          <div style={{
            background:"#1e293b",
            padding:20,
            borderRadius:14
          }}>
            <h2>Unlock Dashboard</h2>

            <input
              type="password"
              value={unlockPass}
              onChange={(e)=>setUnlockPass(e.target.value)}
              style={{
                width:"100%",
                padding:10,
                marginBottom:10,
                borderRadius:8
              }}
            />

            <button
              style={buttonStyle}
              onClick={async ()=>{
                if(unlockPass===PASSWORD){
                  setLocked(false);
                  setShowUnlock(false);
                  setUnlockPass("");
                  await saveShared(boardData, staff, false, team);
                }
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* Leadership */}
      <div style={{
        display:"grid",
        gridTemplateColumns:isMobile()
          ? "repeat(2,1fr)"
          : "repeat(4,1fr)",
        gap:10,
        marginBottom:20
      }}>
        {leadershipPositions.map((pos)=>(
          <div key={pos} style={cardStyle("#facc15")}>
            <div style={{fontWeight:"bold", marginBottom:8}}>
              {pos}
            </div>

            <select
              disabled={locked}
              value={teamData[pos]}
              onChange={(e)=>{
                const updated = {
                  ...boardData,
                  [team]: {
                    ...boardData[team],
                    [pos]: e.target.value,
                  },
                };
                setBoardData(updated);
              }}
              style={{
                width:"100%",
                padding:10,
                borderRadius:8
              }}
            >
              <option value="">Select</option>

              {(pos.includes("Supervisor")
                ? staff.supervisors
                : staff.coordinators
              ).map((name)=>(
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Areas */}
      {areas.map(renderArea)}

      {/* Picking */}
      <h2 style={{color:"#4ade80"}}>
        📦 Picking ({free.length})
      </h2>

      <div>{free.join(", ")}</div>
    </div>
  );
}
