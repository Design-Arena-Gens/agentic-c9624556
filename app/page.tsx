"use client";

import { useEffect, useMemo, useState } from "react";

const investors = [
  {
    id: "emma",
    name: "Emma",
    emoji: "🧑‍🔧",
    direct: [
      { projectId: "solar", amount: 5 },
      { projectId: "ai", amount: 2 },
    ],
    etf: 0,
  },
  {
    id: "rafael",
    name: "Rafael",
    emoji: "🧔🏻",
    direct: [
      { projectId: "solar", amount: 4 },
      { projectId: "wind", amount: 2 },
    ],
    etf: 0,
  },
  {
    id: "li",
    name: "Li",
    emoji: "🧑‍💼",
    direct: [],
    etf: 8,
  },
  {
    id: "aisha",
    name: "Aisha",
    emoji: "🧕",
    direct: [{ projectId: "ai", amount: 3 }],
    etf: 4,
  },
  {
    id: "noah",
    name: "Noah",
    emoji: "🧑‍🚀",
    direct: [{ projectId: "wind", amount: 4 }],
    etf: 3,
  },
  {
    id: "sofia",
    name: "Sofia",
    emoji: "👩‍🏫",
    direct: [],
    etf: 6,
  },
] as const;

const projects = [
  {
    id: "solar",
    name: "Solar Microgrids",
    target: 12,
    risk: "Medium",
    expectedReturn: 8,
    color: "linear-gradient(135deg, rgba(56,189,248,0.45), rgba(56,189,248,0))",
  },
  {
    id: "ai",
    name: "AI Logistics",
    target: 9,
    risk: "High",
    expectedReturn: 15,
    color: "linear-gradient(135deg, rgba(248,113,113,0.45), rgba(248,113,113,0))",
  },
  {
    id: "wind",
    name: "Coastal Wind Farms",
    target: 14,
    risk: "Low",
    expectedReturn: 6,
    color: "linear-gradient(135deg, rgba(74,222,128,0.45), rgba(74,222,128,0))",
  },
] as const;

const etfAllocations: Record<string, number> = {
  solar: 3,
  ai: 6,
  wind: 12,
};

const baseTimings = {
  collect: 6200,
  deploy: 6200,
  distribute: 6200,
};

type PhaseKey = "collect" | "deploy" | "distribute";

const phaseMeta: Record<PhaseKey, { title: string; subtitle: string }> = {
  collect: {
    title: "Capital is pooled",
    subtitle:
      "Direct investors pick projects while others stack cash into the shared ETF basket.",
  },
  deploy: {
    title: "Fund targets are met",
    subtitle:
      "The ETF deploys into every project that reaches its funding hurdle, spreading risk across the portfolio.",
  },
  distribute: {
    title: "Returns flow back",
    subtitle:
      "Projects that launched send money back to the ETF and direct investors, illustrating compounding diversification.",
  },
};

const phaseOrder: PhaseKey[] = ["collect", "deploy", "distribute"];

function sum(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0);
}

const directByProject = projects.reduce<Record<string, number>>((acc, project) => {
  acc[project.id] = sum(
    investors.flatMap((inv) =>
      inv.direct
        .filter((d) => d.projectId === project.id)
        .map((d) => d.amount)
    )
  );
  return acc;
}, {});

const totalsByProject = projects.reduce<Record<string, number>>((acc, project) => {
  acc[project.id] = directByProject[project.id] + (etfAllocations[project.id] ?? 0);
  return acc;
}, {});

const etfInboundTotal = sum(investors.map((inv) => inv.etf));

const etfOutboundTotal = sum(Object.values(etfAllocations));

const returnsByProject: Record<string, { total: number; toETF: number; toDirect: number }> = {
  solar: { total: 12.6, toETF: 3.3, toDirect: 9.3 },
  ai: { total: 11.7, toETF: 3.6, toDirect: 8.1 },
  wind: { total: 15.4, toETF: 5.1, toDirect: 10.3 },
};

const totalReturnETF = sum(Object.values(returnsByProject).map((r) => r.toETF));

const etfDistributionShares = investors
  .filter((inv) => inv.etf > 0)
  .map((inv) => ({
    investorId: inv.id,
    name: inv.name,
    amount: (inv.etf / etfInboundTotal) * totalReturnETF,
  }));

export default function Page() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [speed, setSpeed] = useState(1.1);

  const activePhase = phaseOrder[phaseIndex];

  useEffect(() => {
    const duration = baseTimings[activePhase] / speed;
    const timer = setTimeout(() => {
      if (phaseIndex === phaseOrder.length - 1) {
        setPhaseIndex(0);
        setCycle((v) => v + 1);
      } else {
        setPhaseIndex((v) => v + 1);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [phaseIndex, speed, activePhase]);

  const moneyParticles = useMemo(() => {
    const makeParticles = (count: number, offset: number) =>
      Array.from({ length: count }, (_, idx) => ({
        key: `${activePhase}-${cycle}-${idx}-${offset}`,
        delay: (idx * 220) / speed,
        left: `${18 + idx * 12}%`,
        top: `${62 - idx * 8}%`,
      }));

    switch (activePhase) {
      case "collect":
        return makeParticles(12, 1);
      case "deploy":
        return makeParticles(10, 2);
      case "distribute":
      default:
        return makeParticles(8, 3);
    }
  }, [activePhase, cycle, speed]);

  return (
    <main className="flex-col gap-lg" style={{ padding: "3.5rem 2.5rem" }}>
      <section className="flex-col gap-md fade-in">
        <div className="stage-indicator">
          <span>🚀</span>
          <div>
            <div style={{ fontWeight: 600 }}>{phaseMeta[activePhase].title}</div>
            <div className="muted" style={{ fontSize: "0.85rem" }}>
              {phaseMeta[activePhase].subtitle}
            </div>
          </div>
        </div>
        <h1 className="hero-title">Why diversified investing keeps building real-world projects</h1>
        <p className="subtext muted">
          Watch money cascade from individual investors into an ETF, flow into
          projects that hit their funding goals, and recycle back as new
          returns. Adjust the speed to slow down or speed up the cycle.
        </p>
        <div className="flex gap-md" style={{ alignItems: "center", maxWidth: "420px" }}>
          <label htmlFor="speed" className="muted" style={{ fontSize: "0.9rem", width: "140px" }}>
            Animation speed
          </label>
          <input
            id="speed"
            className="slider"
            type="range"
            min={0.65}
            max={2.5}
            step={0.05}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <span style={{ width: "48px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {speed.toFixed(2)}x
          </span>
        </div>
      </section>

      <section className="grid-layout">
        <article className="card flex-col gap-md">
          <header className="flex-between">
            <h2>Investors</h2>
            <span className="badge">Direct &amp; ETF</span>
          </header>
          <div className="stack">
            {investors.map((investor) => {
              const directTotal = sum(investor.direct.map((item) => item.amount));
              return (
                <div
                  key={investor.id}
                  className="flex-between"
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "14px",
                    background: "rgba(15, 23, 42, 0.55)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                  }}
                >
                  <div className="flex gap-sm" style={{ alignItems: "center" }}>
                    <span style={{ fontSize: "1.65rem" }}>{investor.emoji}</span>
                    <div className="flex-col" style={{ gap: "0.15rem" }}>
                      <strong>{investor.name}</strong>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>
                        Direct {directTotal}M{investor.etf > 0 ? ` · ETF ${investor.etf}M` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-sm" style={{ alignItems: "center" }}>
                    <div className={`money-line ${activePhase === "collect" ? "active" : ""}`} style={{ width: "92px" }} />
                    <span style={{ color: "var(--accent)" }}>
                      {sum([directTotal, investor.etf]).toFixed(1)}M
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card flex-col gap-md">
          <header className="flex-between">
            <h2>ETF Engine</h2>
            <span className="badge" style={{ background: "rgba(250, 204, 21, 0.25)", color: "#fde68a" }}>
              Shared pool
            </span>
          </header>
          <div
            style={{
              background: "rgba(202, 138, 4, 0.12)",
              border: "1px solid rgba(250, 204, 21, 0.35)",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <div className="flex-between" style={{ marginBottom: "0.75rem" }}>
              <span className="muted">Capital collected</span>
              <strong>{etfInboundTotal.toFixed(1)}M</strong>
            </div>
            <div className="progress-bar" style={{ marginBottom: "1rem" }}>
              <div style={{ width: `${(etfOutboundTotal / etfInboundTotal) * 100}%` }} />
            </div>
            <div className="flex-col gap-sm">
              {projects.map((project) => (
                <div key={project.id} className="flex-between" style={{ fontSize: "0.85rem" }}>
                  <span>{project.name}</span>
                  <span>
                    {etfAllocations[project.id]}M
                    <span className="muted"> · {((etfAllocations[project.id] / etfInboundTotal) * 100).toFixed(0)}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "rgba(14, 165, 233, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              borderRadius: "16px",
              padding: "1.15rem",
            }}
          >
            <div className="flex-between" style={{ marginBottom: "0.35rem" }}>
              <span className="muted">Distributed back to investors</span>
              <strong style={{ color: "var(--positive)" }}>{totalReturnETF.toFixed(1)}M</strong>
            </div>
            <div className="flex-col" style={{ gap: "0.35rem" }}>
              {etfDistributionShares.map((share) => (
                <div key={share.investorId} className="flex-between" style={{ fontSize: "0.8rem" }}>
                  <span>{share.name}</span>
                  <span>{share.amount.toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="card flex-col gap-md" style={{ gridColumn: "span 2" }}>
          <header className="flex-between">
            <h2>Projects</h2>
            <span className="badge">Target · Risk · Return</span>
          </header>
          <div className="grid-layout">
            {projects.map((project) => {
              const directRaised = directByProject[project.id];
              const totalRaised = totalsByProject[project.id];
              const funded = totalRaised >= project.target;
              const completion = Math.min(100, (totalRaised / project.target) * 100);
              return (
                <div
                  key={project.id}
                  className="flex-col gap-md"
                  style={{
                    borderRadius: "16px",
                    padding: "1.25rem",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    background: "rgba(15, 23, 42, 0.58)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: project.color,
                      opacity: 0.35,
                      pointerEvents: "none",
                    }}
                  />
                  <div className="flex-between" style={{ position: "relative" }}>
                    <strong>{project.name}</strong>
                    <span
                      className="badge"
                      style={{
                        background: funded ? "rgba(52, 211, 153, 0.25)" : "rgba(248, 113, 113, 0.18)",
                        color: funded ? "#bbf7d0" : "#fecaca",
                      }}
                    >
                      {funded ? "Funded" : "Short"}
                    </span>
                  </div>
                  <div className="flex-between" style={{ position: "relative" }}>
                    <div className="flex-col gap-sm muted" style={{ fontSize: "0.8rem" }}>
                      <span>Target {project.target}M</span>
                      <span>Direct {directRaised.toFixed(1)}M</span>
                      <span>ETF {etfAllocations[project.id].toFixed(1)}M</span>
                    </div>
                    <div className="flex-col gap-sm" style={{ alignItems: "flex-end", fontSize: "0.8rem" }}>
                      <span>Risk {project.risk}</span>
                      <span>Expected {project.expectedReturn}%</span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ position: "relative" }}>
                    <div style={{ width: `${completion}%` }} />
                  </div>
                  <div
                    className={"money-line " + (activePhase === "deploy" && funded ? "active" : "")}
                    style={{ width: "100%" }}
                  />
                  <div className="flex-between" style={{ fontSize: "0.85rem", zIndex: 1 }}>
                    <span className="muted">Projected distribution</span>
                    <span>{returnsByProject[project.id].total.toFixed(1)}M</span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section
        className="card"
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h2>Money in motion</h2>
        <p className="muted" style={{ marginTop: "0.35rem", maxWidth: "640px" }}>
          Capital continuously recycles between investors and projects. When a
          project crosses its funding target, it activates, receives capital,
          and later pays out to the ETF before the ETF distributes gains back to
          every participant.
        </p>
        <div
          className="money-stream"
          style={{
            marginTop: "2rem",
            height: "240px",
            borderRadius: "16px",
            background: "rgba(15, 23, 42, 0.55)",
            border: "1px solid rgba(148, 163, 184, 0.24)",
          }}
        >
          {moneyParticles.map((particle) => (
            <div
              key={particle.key}
              className="money-particle active"
              style={{
                left: particle.left,
                bottom: "18px",
                animationDelay: `${particle.delay}ms`,
                // @ts-expect-error custom property
                "--duration": `${Math.max(1600, 2600 / speed)}ms`,
              }}
            >
              $
            </div>
          ))}
          <div
            className="flex-between"
            style={{
              position: "absolute",
              inset: "24px 24px auto 24px",
              fontSize: "0.85rem",
            }}
          >
            <span className="muted">Phase</span>
            <span style={{ fontWeight: 600 }}>{phaseMeta[activePhase].title}</span>
          </div>
          <div
            style={{
              position: "absolute",
              inset: "auto 24px 24px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
              fontSize: "0.8rem",
            }}
          >
            <div className="flex-col gap-sm">
              <strong>Direct investors</strong>
              <span className="muted">
                {activePhase === "collect"
                  ? "Capital committed"
                  : activePhase === "deploy"
                  ? "Capital at work"
                  : "Capital paid back"}
              </span>
            </div>
            <div className="flex-col gap-sm">
              <strong>ETF basket</strong>
              <span className="muted">
                {activePhase === "collect"
                  ? "Pooling diversified exposure"
                  : activePhase === "deploy"
                  ? "Deploying into funded deals"
                  : "Rebalancing to investors"}
              </span>
            </div>
            <div className="flex-col gap-sm">
              <strong>Projects</strong>
              <span className="muted">
                {activePhase === "collect"
                  ? "Waiting for target to be hit"
                  : activePhase === "deploy"
                  ? "Building real assets"
                  : "Returning principal + gains"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
