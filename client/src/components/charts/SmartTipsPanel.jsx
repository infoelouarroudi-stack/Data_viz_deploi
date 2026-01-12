import React from "react";
import { generateSmartTips } from "../../utils/smartTips";

const SmartTipsPanel = ({ city }) => {
  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Tips: {city ? city.city : "Select a city"}
        </h3>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {city ? (
          generateSmartTips(city).map((tip, i) => (
            <div
              key={i}
              style={{
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderLeft: `4px solid ${
                  tip.type === "warning"
                    ? "#ef4444"
                    : tip.type === "success"
                    ? "#10b981"
                    : "#6366f1"
                }`,
                borderTop: "1px solid var(--border)",
                borderRight: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.3rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--text-main)",
                }}
              >
                <span>{tip.icon}</span> {tip.title}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                  lineHeight: "1.5",
                }}
              >
                {tip.text}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">
            Select a city above to see specific advice.
          </p>
        )}
      </div>
    </div>
  );
};

export default SmartTipsPanel;
