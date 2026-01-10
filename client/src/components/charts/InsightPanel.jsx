import React from "react";
import PropTypes from "prop-types";

const InsightPanel = ({ cityData }) => {
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
  // Replaced Salary/Savings with Internet and Quality of Life
  const internet = cityData.internet || 0;
  const qol = cityData.quality_of_life_index || 0;

  // QoL Color (Higher is better)
  const qolColor = qol > 150 ? "#10b981" : qol > 100 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="card animate-fade-in"
      style={{
        minHeight: "520px",
        height: "100%",
        width: "100%",
        flex: 1,
        borderColor: "#cbd5e1",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#000000" }}>{cityData.city}</h2>
        <div
          style={{
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "0.8rem",
            color: "#64748b",
            fontWeight: "600",
          }}
        >
          {cityData.country}
        </div>
      </div>

      <div
        className="grid-cols-2"
        style={{ gap: "1rem", marginBottom: "1.5rem" }}
      >
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>
            Monthly Cost
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#000000" }}>
            ${totalCost.toFixed(0)}
          </div>
        </div>
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>
            Internet (60 Mbps+)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#000000" }}>
            ${internet.toFixed(0)}
          </div>
        </div>
      </div>

      {qol > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "#64748b", fontWeight: "600" }}>
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
              background: "#e2e8f0",
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
              color: "#64748b",
              marginTop: "5px",
              textAlign: "right",
            }}
          >
            Safety, Health, Climate & more
          </div>
        </div>
      )}

      <h4
        style={{
          marginBottom: "1rem",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "1rem",
          color: "#000000",
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
          color: "#000000",
        }}
      >
        <span style={{ color: "#475569" }}>🏠 Rent (Outside)</span>
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
          color: "#000000",
        }}
      >
        <span style={{ color: "#475569" }}>🍔 Cheap Meal</span>
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
          color: "#000000",
        }}
      >
        <span style={{ color: "#475569" }}>🍺 Beer</span>
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
          color: "#000000",
        }}
      >
        <span style={{ color: "#475569" }}>🚍 Transport</span>
        <span style={{ fontWeight: "600" }}>
          ${cityData.pass_monthly?.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

InsightPanel.propTypes = {
  cityData: PropTypes.object,
};

export default InsightPanel;
