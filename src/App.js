import React, { useState, useEffect } from "react";

// Simple replacements for Card components (no external dependency)
const Card = ({ children, className }) => (
  <div className={`rounded-2xl shadow ${className}`}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const leadershipPositions = [
  "Supervisor 1 (BHV)",
  "Supervisor 2 (BHV)",
  "Area Coordinator 1 (BHV)",
  "Area Coordinator 2 (BHV)",
];

const operationalPositions = [
  "Trolley preper 1",
  "Trolley preper 2",
  "Packsize",
  "Trolley dropper",
  "Document applier 1",
  "Document applier 2",
  "Box Filler",
  "Palletiser 1",
  "Palletiser2",
  "Palletiser3",
  "palletiser4",
  "Vas1",
  "vas2",
  "nester 1",
  "nester2",
  "nester3",
  "Hopt",
  "Packing",
  "ReachTruck Driver 1",
  "ReachTruck Driver 2",
  "ReachTruck Driver 3",
  "ReachTruck Driver 4",
];

const positions = [...leadershipPositions, ...operationalPositions];

const shifts = [
  { name: "Shift 1", time: "07:00 - 15:30" },
  { name: "Shift 2", time: "15:00 - 23:30" },
];

const teams = ["Team A", "Team B"];

const employees = {
  supervisors: {
    "Team A": ["Marciano Dekker", "Jan Schulz", "Cyrille Berkelaar"],
    "Team B": ["Anna Cetera", "Brahim Said Yousef"],
  },
  coordinators: {
    "Team A": ["Kucharska Wioleta", "Janulevicius Antanas"],
    "Team B": ["Sotirios Sampaliotis", "Pitic Paul-Ioan"],
  },
  "Team A": [
    "Marciano Dekker","Jan Schulz","Cyrille Berkelaar",
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

function getWeekNumber(date) {
  const temp = new Date(date.getTime());
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((temp.getTime() - week1.getTime()) / 86400000 - 3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

export default function Dashboard() {
  const [currentShiftIndex, setCurrentShiftIndex] = useState(0);
  const [locked, setLocked] = useState(true);

  const currentWeek = getWeekNumber(new Date());
  const isEvenWeek = currentWeek % 2 === 0;

  const shiftTeams = isEvenWeek
    ? { "Shift 1": "Team A", "Shift 2": "Team B" }
    : { "Shift 1": "Team B", "Shift 2": "Team A" };

  const currentShift = shifts[currentShiftIndex].name;
  const currentTeam = shiftTeams[currentShift];

  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem("dashboard-data");
    return saved
      ? JSON.parse(saved)
      : teams.reduce((acc, team) => {
          acc[team] = positions.reduce((p, pos) => {
            p[pos] = "";
            return p;
          }, {});
          return acc;
        }, {});
  });

  useEffect(() => {
    localStorage.setItem("dashboard-data", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShiftIndex((prev) => (prev + 1) % shifts.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const teamEmployees = employees[currentTeam];
    const assigned = Object.values(assignments[currentTeam]).filter(Boolean);

    const uniqueAssigned = [...new Set(assigned)];
    const remaining = teamEmployees.filter((e) => !uniqueAssigned.includes(e));

    let updated = { ...assignments[currentTeam] };
    let index = 0;

    operationalPositions.forEach((pos) => {
      if (!updated[pos] && remaining[index]) {
        updated[pos] = remaining[index];
        index++;
      }
    });

    setAssignments((prev) => ({
      ...prev,
      [currentTeam]: updated,
    }));
  }, [currentTeam]);

  const handleChange = (position, value) => {
    if (locked) return;

    const currentAssignments = { ...assignments[currentTeam] };
    const alreadyUsed = Object.values(currentAssignments);
    if (alreadyUsed.includes(value)) return;

    currentAssignments[position] = value;

    setAssignments({
      ...assignments,
      [currentTeam]: currentAssignments,
    });
  };

  const renderSection = (title, list, isLeadership = false) => (
    <div style={{ marginBottom: 30 }}>
      <h2 style={{ color: isLeadership ? "#facc15" : "white", fontSize: 24 }}>
        {title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {list.map((pos) => {
          const isEmpty = !assignments[currentTeam][pos];

          return (
            <Card key={pos} className={`bg-gray-900`}>
              <CardContent className="p-4">
                <h3>{pos}</h3>
                <select
                  disabled={locked}
                  value={assignments[currentTeam][pos]}
                  onChange={(e) => handleChange(pos, e.target.value)}
                >
                  <option value="">Select</option>
                  {(
                    pos.includes("Supervisor")
                      ? employees.supervisors[currentTeam]
                      : pos.includes("Coordinator")
                      ? employees.coordinators[currentTeam]
                      : employees[currentTeam]
                  )?.map((emp) => (
                    <option key={emp}>{emp}</option>
                  ))}
                </select>
                {isEmpty && isLeadership && (
                  <div style={{ color: "red", fontSize: 12 }}>Required</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const assigned = Object.values(assignments[currentTeam]).filter(Boolean);
  const unassigned = employees[currentTeam].filter(
    (e) => !assigned.includes(e)
  );

  return (
    <div style={{ padding: 20, background: "black", color: "white" }}>
      <h1>Planning Dashboard</h1>
      <button onClick={() => setLocked(!locked)}>
        {locked ? "Unlock" : "Lock"}
      </button>

      {renderSection("Leadership", leadershipPositions, true)}
      {renderSection("Operations", operationalPositions)}

      <div>
        <h3>Unassigned ({unassigned.length})</h3>
        <div>{unassigned.join(", ")}</div>
      </div>
    </div>
  );
}
