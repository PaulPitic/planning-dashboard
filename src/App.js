import React, { useState } from "react";

export default function App() {
  const [team, setTeam] = useState("Team A");

  const staff = {
    "Team A": [
      "Marciano Dekker",
      "Jan Schulz",
      "Cyrille Berkelaar",
      "Arestov Oleksandr",
      "Angheluta Dan",
      "Biudiachenko Oleksander",
      "Chrobak Jaroslaw",
      "Diachenko Maria",
      "Fesenko Anna",
      "Mario Ringma",
      "Ruslan Oliinyk",
      "Jacek Maksymiuk",
    ],
    "Team B": [
      "Anna Cetera",
      "Brahim Said Yousef",
      "Baziuk Karyna",
      "Carizonni Victoria",
      "Cetera Adrian",
      "Chrobak Marta",
      "Cuchillo Lopez Eloi",
      "Debets Henk",
      "Daniel Ursaciuc",
      "Theo Natiri",
      "Robert Orlowski",
      "Piotr Firek",
    ],
  };

  const operators = staff[team];

  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        height: "100vh",
        display: "flex",
        fontFamily: "Arial",
      }}
    >
      {/* LEFT */}
      <div style={{ width: "75%", padding: 8 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>
          Planning Dashboard
        </h1>

        {/* TOP */}
        <div style={{ marginTop: 6, marginBottom: 6 }}>
          <button
            style={
              team === "Team A" ? btnBlue : btn
            }
            onClick={() => setTeam("Team A")}
          >
            Team A
          </button>{" "}
          <button
            style={
              team === "Team B" ? btnBlue : btn
            }
            onClick={() => setTeam("Team B")}
          >
            Team B
          </button>{" "}
          <button style={btnGreen}>Apply</button>{" "}
          <button style={btnPurple}>Staff</button>
        </div>

        {/* LEADERSHIP */}
        <Grid cols={4}>
          <Simple title="Supervisor" slots={3} c="#facc15" />
          <Simple title="Supervisor" slots={3} c="#facc15" />
          <Simple title="Coordinator" slots={3} c="#facc15" />
          <Simple title="Coordinator" slots={3} c="#facc15" />
        </Grid>

        {/* RT */}
        <Title text="RT / Hopt" c="#22c55e" />
        <Grid cols={3}>
          <Simple title="RT Driver" slots={3} c="#22c55e" />
          <Simple title="RT Driver" slots={3} c="#22c55e" />
          <Simple title="Hopt" slots={2} c="#22c55e" />
        </Grid>

        {/* PREP */}
        <Title text="Prep" c="#3b82f6" />
        <Grid cols={3}>
          <Split
            title="Trolley Prepper"
            mainTitle="Main"
            coverTitle="Break Cover"
            main={2}
            cover={2}
            c="#3b82f6"
            names={operators}
          />
          <Split
            title="Packsize"
            mainTitle="Main"
            coverTitle="Break Cover"
            main={2}
            cover={2}
            c="#3b82f6"
            names={operators}
          />
        </Grid>

        {/* DOCS */}
        <Title text="Docs / Pallet" c="#f97316" />
        <Grid cols={3}>
          <Split
            title="Document Applier"
            mainTitle="Main"
            coverTitle="Break Cover"
            main={2}
            cover={2}
            c="#f97316"
            names={operators}
          />
          <Split
            title="Palletiser"
            mainTitle="Main"
            coverTitle="Break Cover"
            main={3}
            cover={3}
            c="#f97316"
            names={operators}
          />
          <Split
            title="Palletiser"
            mainTitle="Main"
            coverTitle="Break Cover"
            main={3}
            cover={3}
            c="#f97316"
            names={operators}
          />
          <Split
            title="Trolley Dropper"
            mainTitle="Main"
            coverTitle="Break Cover"
            main={1}
            cover={1}
            c="#f97316"
            names={operators}
          />
          <Split
            title="Box Filler"
            mainTitle="Main"
            coverTitle="Break Cover"
            main={1}
            cover={1}
            c="#f97316"
            names={operators}
          />
        </Grid>

        {/* VAS */}
        <Title text="VAS / Nester" c="#a855f7" />
        <Grid cols={3}>
          <Simple title="VAS" slots={2} c="#a855f7" />
          <Simple title="Nester" slots={4} c="#a855f7" />
        </Grid>

        {/* OTHER */}
        <Title text="Other" c="#14b8a6" />
        <Grid cols={3}>
          <Simple title="Packing" slots={2} c="#14b8a6" />
          <Simple title="C-Plein" slots={2} c="#14b8a6" />
        </Grid>

        {/* BOTTOM */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 8,
            marginTop: 6,
          }}
        >
          {/* PICKING */}
          <div style={box("#16a34a")}>
            <div style={head}>Picking</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,1fr)",
                gap: 4,
              }}
            >
              {Array.from({ length: 12 }).map(
                (_, i) => (
                  <select
                    key={i}
                    style={{
                      ...sel,
                      fontSize: 13,
                    }}
                  >
                    <option>
                      Pick {i + 1}
                    </option>

                    {operators.map((n) => (
                      <option key={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                )
              )}
            </div>
          </div>

          {/* NOT IN */}
          <div style={box("#0ea5e9")}>
            <div style={head}>Not In</div>

            {Array.from({ length: 12 }).map(
              (_, i) => (
                <select key={i} style={sel}>
                  <option>
                    -{i + 1}-
                  </option>
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
          borderLeft:
            "1px solid #334155",
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

/* ===================================================== */

function Grid({ cols, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols},1fr)`,
        gap: 6,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Title({ text, c }) {
  return (
    <div
      style={{
        color: c,
        fontWeight: "bold",
        fontSize: 13,
        marginBottom: 4,
      }}
    >
      {text}
    </div>
  );
}

function Simple({ title, slots, c }) {
  return (
    <div style={box(c)}>
      <div style={head}>{title}</div>

      {Array.from({ length: slots }).map(
        (_, i) => (
          <select key={i} style={sel}>
            <option>
              -{i + 1}-
            </option>
          </select>
        )
      )}
    </div>
  );
}

function Split({
  title,
  mainTitle,
  coverTitle,
  main,
  cover,
  c,
  names,
}) {
  return (
    <div style={box(c)}>
      <div style={head}>{title}</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 4,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              marginBottom: 4,
              color: "#94a3b8",
            }}
          >
            {mainTitle}
          </div>

          {Array.from({ length: main }).map(
            (_, i) => (
              <select
                key={i}
                style={sel}
              >
                <option>
                  -{i + 1}-
                </option>
                {names.map((n) => (
                  <option key={n}>
                    {n}
                  </option>
                ))}
              </select>
            )
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: 10,
              marginBottom: 4,
              color: "#94a3b8",
            }}
          >
            {coverTitle}
          </div>

          {Array.from({
            length: cover,
          }).map((_, i) => (
            <select
              key={i}
              style={sel}
            >
              <option>
                -{i + 1}-
              </option>
              {names.map((n) => (
                <option key={n}>
                  {n}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================================================== */

const box = (c) => ({
  background: "#1e293b",
  borderLeft: `5px solid ${c}`,
  borderRadius: 10,
  padding: 8,
});

const head = {
  fontWeight: "bold",
  fontSize: 12,
  marginBottom: 4,
};

const sel = {
  width: "100%",
  marginBottom: 4,
  fontSize: 11,
};

const btn = {
  padding: "6px 10px",
  border: "none",
  borderRadius: 8,
  background: "#334155",
  color: "white",
  fontWeight: "bold",
};

const btnBlue = {
  ...btn,
  background: "#2563eb",
};

const btnGreen = {
  ...btn,
  background: "#22c55e",
};

const btnPurple = {
  ...btn,
  background: "#7c3aed",
};
