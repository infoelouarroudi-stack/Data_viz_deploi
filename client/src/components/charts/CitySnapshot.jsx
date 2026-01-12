import React from "react";
import PropTypes from "prop-types";

const CitySnapshot = ({ cityData }) => {
  if (!cityData) {
    return (
      <div
        className="card"
        style={{
          width: "100%",
          padding: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background: "var(--bg-card)",
          border: "1px dashed var(--border)",
          borderRadius: "12px",
          color: "var(--text-muted)",
          minHeight: "120px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.5rem" }}>👆</span>
          <span>Click on a city on the map to see a quick snapshot.</span>
        </div>
      </div>
    );
  }

  // Metrics
  const totalCost = cityData.estimated_monthly_cost_single;
  const salary = cityData.salary || 0;
  const savingsPotential =
    salary > 0 ? ((salary - totalCost) / salary) * 100 : 0;
  
  // Purchasing Power = Salary / Cost
  const power = totalCost > 0 ? salary / totalCost : 0;
  const powerColor = power > 1.5 ? "#10b981" : power > 1.0 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="card animate-fade-in"
      style={{
        width: "100%",
        padding: "1.5rem", // Compact padding
        display: "flex", // Horizontal layout
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        flexWrap: "wrap",
        gap: "1.5rem",
        borderLeft: "5px solid var(--primary)", 
      }}
    >
      {/* 1. Identity */}
      <div style={{ flex: "1 1 auto", minWidth: "150px" }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--text-main)" }}>
          {cityData.city}
        </h2>
        <div
          style={{
            textTransform: "uppercase",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            fontWeight: "700",
            letterSpacing: "0.05em",
          }}
        >
          {cityData.country}
        </div>
      </div>

      {/* 2. Monthly Cost (Hero Metric) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          paddingRight: "1.5rem",
          borderRight: "1px solid var(--border)",
          minWidth: "120px",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Est. Monthly Cost
        </span>
        <span
          style={{
            fontSize: "1.8rem",
            fontWeight: "800",
            color: "var(--text-main)",
            lineHeight: 1.1,
          }}
        >
          ${totalCost.toFixed(0)}
        </span>
      </div>

       {/* 3. Savings */}
       <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          paddingRight: "1.5rem",
          borderRight: "1px solid var(--border)",
          minWidth: "120px",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Savings Potential
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
             <span
            style={{
                fontSize: "1.4rem",
                fontWeight: "700",
                color: savingsPotential > 0 ? "#10b981" : "#ef4444",
            }}
            >
            {savingsPotential.toFixed(0)}%
            </span>
             {savingsPotential > 0 && <span style={{fontSize: "0.8rem", color: "var(--text-muted)"}}>saved</span>}
        </div>
       
      </div>

      {/* 4. Purchasing Power */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Centered for badge look
          minWidth: "100px",
        }}
      >
         <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
          Purchasing Power
        </span>
        <div
            style={{
                background: `${powerColor}20`, // low opacity bg
                color: powerColor,
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: "700",
                fontSize: "1rem",
                border: `1px solid ${powerColor}40`
            }}
        >
            {power.toFixed(2)}x
        </div>
      </div>
    </div>
  );
};

CitySnapshot.propTypes = {
  cityData: PropTypes.object,
};

export default CitySnapshot;
