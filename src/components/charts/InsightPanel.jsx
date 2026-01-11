import React from "react";
import PropTypes from "prop-types";

const InsightPanel = ({ cityData, showSavings = false }) => {
  if (!cityData) {
    return (
      <div
        className="card"
        style={{
          minHeight: "520px",
          height: "100%",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2.5rem",
          opacity: 0.6,
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌍</div>
        <h3>Explore the World</h3>
        <p className="text-muted">
          Hover over a city on the map above to see detailed economic insights.
        </p>
      </div>
    );
  }

  // Calculators
  const totalCost = cityData.estimated_monthly_cost_single;
  const salary = cityData.salary || 0;
  const savingsPotential =
    salary > 0 ? ((salary - totalCost) / salary) * 100 : 0;
  const savingsAmount = salary - totalCost;
  // Replaced Salary/Savings with Internet and Quality of Life
  const internet = cityData.internet || 0;
  const qol = cityData.quality_of_life_index || 0;

  // QoL Color (Higher is better)
  const qolColor = qol > 150 ? "#10b981" : qol > 100 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="card animate-fade-in"
      style={{
        height: "100%",
        width: "100%",
        flex: 1,
        borderColor: "var(--border)",
        boxShadow:
          "var(--glass-shadow)",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        color: "var(--text-main)",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.8rem", color: "var(--text-main)" }}>
          {cityData.city}
        </h2>
        <div
          style={{
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontWeight: "600",
          }}
        >
          {cityData.country}
        </div>
      </div>

      <div
        className="grid-cols-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}
          >
            Monthly Cost
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-main)" }}
          >
            ${totalCost.toFixed(0)}
          </div>
        </div>
        <div
          style={{
            padding: "1rem",
            paddingBottom: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}
          >
            Internet (60 Mbps+)
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-main)" }}
          >
            ${internet.toFixed(0)}
          </div>
        </div>
      </div>

      {qol > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>
              Quality of Life
            </span>
            <span style={{ color: qolColor, fontWeight: "bold" }}>
              {qol.toFixed(0)}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "var(--border)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (qol / 200) * 100)}%`, // Normalize QoL (approx max 200)
                height: "100%",
                background: qolColor,
                transition: "width 0.3s ease-out",
              }}
            ></div>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "5px",
              textAlign: "right",
            }}
          >
            Safety, Health, Climate & more
          </div>
        </div>
      )}

      {showSavings && salary > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>
              Savings Potential
            </span>
            <span
              style={{
                color: savingsPotential > 0 ? "#22c55e" : "#ef4444",
                fontWeight: "bold",
              }}
            >
              {savingsPotential.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "var(--border)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, savingsPotential))}%`,
                height: "100%",
                background: savingsPotential > 0 ? "#22c55e" : "#ef4444",
                transition: "width 0.3s ease-out",
              }}
            ></div>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "5px",
              textAlign: "right",
            }}
          >
            You could save ~${Math.max(0, savingsAmount).toFixed(0)}/mo
          </div>
        </div>
      )}

      <h4
        style={{
          marginBottom: "1rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "1rem",
          color: "var(--text-main)",
          fontSize: "1.1rem",
        }}
      >
        Student Metrics
      </h4>

      <div
        className="metric-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.8rem",
          color: "var(--text-main)",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>🏠 Rent (Outside)</span>
        <span style={{ fontWeight: "600" }}>
          ${cityData.apt_1bed_outside_center?.toFixed(0)}
        </span>
      </div>
      <div
        className="metric-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.8rem",
          color: "var(--text-main)",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>🍔 Cheap Meal</span>
        <span style={{ fontWeight: "600" }}>
          ${cityData.meal_inexpensive?.toFixed(2)}
        </span>
      </div>
      <div
        className="metric-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.8rem",
          color: "var(--text-main)",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>🍺 Beer</span>
        <span style={{ fontWeight: "600" }}>
          ${cityData.beer_domestic_market?.toFixed(2)}
        </span>
      </div>
      <div
        className="metric-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "var(--text-main)",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>🚍 Transport</span>
        <span style={{ fontWeight: "600" }}>
          ${cityData.pass_monthly?.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

InsightPanel.propTypes = {
  cityData: PropTypes.object,
  showSavings: PropTypes.bool,
};

export default InsightPanel;
