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
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const cardStyle = (color) => ({
  background: "#1e293b",
  borderLeft: `6px solid ${color}`,
  borderRadius: 12,
  padding: 10,
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
   DEFAULT STAFF
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
  const out = {};

  teams.forEach((team) => {
    out[team] = {};

    leadershipPositions.forEach((p) => {
      out[team][p] = "";
    });

    areas.forEach((area) => {
      area.positions.forEach((pos) => {
        out[team][pos.name] = Array(pos.slots).fill("");
      });
    });
  });

  return out;
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
          style={{...buttonStyle, background:"#2563eb"}}
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
     ASSIGN
  ===================================================== */
  const assignSlot = (role, index, value) => {
    if (locked) return;

    const used = [];

    Object.values(teamData).forEach((val) => {
      if (Array.isArray(val)) val.forEach((x) => x && used.push(x));
      else if (val) used.push(val);
    });

    const current = teamData[role][index];
    const filtered = used.filter((u) => u !== current);

    if (value && filtered.includes(value)) return;

    const updatedSlots = [...teamData[role]];
    updatedSlots[index] = value;

    setBoardData({
      ...boardData,
      [team]: {
        ...boardData[team],
        [role]: updatedSlots,
      },
    });
  };

  const addStaff = () => {
    if (!newName.trim()) return;

    setStaff({
      ...staff,
      [staffCat]: [...staff[staffCat], newName.trim()],
    });

    setNewName("");
  };

  const removeStaff = (name) => {
    setStaff({
      ...staff,
      [staffCat]: staff[staffCat].filter((n) => n !== name),
    });
  };

  const renderArea = (area) => (
    <div key={area.name} style={{marginBottom:10}}>
      <h3 style={{color:area.color}}>{area.name}</h3>

      <div style={{
        display:"grid",
        gap:8,
        gridTemplateColumns:"repeat(2,1fr)"
      }}>
        {area.positions.map((pos)=>(
          <div key={pos.name} style={cardStyle(area.color)}>
            <div style={{
              fontWeight:"bold",
              fontSize:15,
              marginBottom:6
            }}>
              {pos.name}
            </div>

            {teamData[pos.name].map((slot,idx)=>(
              <select
                key={idx}
                disabled={locked}
                value={slot}
                onChange={(e)=>
                  assignSlot(pos.name, idx, e.target.value)
                }
                style={{
                  width:"100%",
                  padding:6,
                  marginBottom:6,
                  borderRadius:8
                }}
              >
                <option value="">Slot {idx+1}</option>

                {staff[team].map((n)=>(
                  <option key={n}>{n}</option>
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
      display:"flex"
    }}>
      {/* LEFT HALF */}
      <div style={{
        width:"50%",
        padding:12,
        overflowY:"auto"
      }}>
        <h1 style={{fontSize:24}}>📺 Planning Dashboard</h1>

        {/* TOP BAR */}
        <div style={{
          display:"flex",
          gap:8,
          flexWrap:"wrap",
          marginBottom:12
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
            onClick={()=>{
              if(locked) setShowUnlock(true);
              else {
                setLocked(true);
                saveShared(boardData, staff, true, team);
              }
            }}
          >
            {locked ? "🔒 Locked" : "🔓 Unlocked"}
          </button>

          <button
            style={{
              ...buttonStyle,
              background:"#22c55e"
            }}
            onClick={()=>saveShared()}
          >
            ✅ Apply
          </button>

          <button
            style={{
              ...buttonStyle,
              background:"#7c3aed"
            }}
            onClick={()=>setShowStaff(true)}
          >
            ⚙️ Manage Staff
          </button>
        </div>

        {/* Leadership */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(2,1fr)",
          gap:8,
          marginBottom:12
        }}>
          {leadershipPositions.map((pos)=>(
            <div key={pos} style={cardStyle("#facc15")}>
              <div style={{
                fontWeight:"bold",
                marginBottom:6
              }}>
                {pos}
              </div>

              <select
                disabled={locked}
                value={teamData[pos]}
                onChange={(e)=>{
                  setBoardData({
                    ...boardData,
                    [team]: {
                      ...boardData[team],
                      [pos]: e.target.value
                    }
                  });
                }}
                style={{
                  width:"100%",
                  padding:6,
                  borderRadius:8
                }}
              >
                <option value="">Select</option>

                {(pos.includes("Supervisor")
                  ? staff.supervisors
                  : staff.coordinators
                ).map((n)=>(
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {areas.map(renderArea)}
      </div>

      {/* RIGHT HALF */}
      <div style={{
        width:"50%",
        borderLeft:"1px solid #334155",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        color:"#64748b",
        fontSize:28,
        fontWeight:700
      }}>
        KPI / NOTES / TARGETS PANEL
      </div>

      {/* STAFF POPUP */}
      {showStaff && (
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
            borderRadius:14,
            width:"90%",
            maxWidth:500
          }}>
            <h2>⚙️ Staff Manager</h2>

            <select
              value={staffCat}
              onChange={(e)=>setStaffCat(e.target.value)}
              style={{
                width:"100%",
                padding:8,
                marginBottom:10
              }}
            >
              <option>Team A</option>
              <option>Team B</option>
              <option>supervisors</option>
              <option>coordinators</option>
            </select>

            <div style={{
              display:"flex",
              gap:8,
              marginBottom:12
            }}>
              <input
                value={newName}
                onChange={(e)=>setNewName(e.target.value)}
                placeholder="New Name"
                style={{
                  flex:1,
                  padding:8,
                  borderRadius:8
                }}
              />

              <button
                style={{
                  ...buttonStyle,
                  background:"#16a34a"
                }}
                onClick={addStaff}
              >
                Add
              </button>
            </div>

            <div style={{
              maxHeight:300,
              overflowY:"auto",
              marginBottom:12
            }}>
              {staff[staffCat].map((n)=>(
                <div
                  key={n}
                  style={{
                    display:"flex",
                    justifyContent:"space-between",
                    marginBottom:6
                  }}
                >
                  <span>{n}</span>

                  <button
                    style={{
                      ...buttonStyle,
                      background:"#dc2626",
                      padding:"4px 8px"
                    }}
                    onClick={()=>removeStaff(n)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              display:"flex",
              gap:8
            }}>
              <button
                style={{
                  ...buttonStyle,
                  background:"#22c55e"
                }}
                onClick={async ()=>{
                  await saveShared(boardData, staff, locked, team);
                  setShowStaff(false);
                }}
              >
                Save
              </button>

              <button
                style={{
                  ...buttonStyle,
                  background:"#475569"
                }}
                onClick={()=>setShowStaff(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                marginBottom:10
              }}
            />

            <button
              style={{
                ...buttonStyle,
                background:"#2563eb"
              }}
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
    </div>
  );
}
