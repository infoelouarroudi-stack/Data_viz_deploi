import React, { useState } from "react";
import PropTypes from "prop-types";
import { REGIONS } from "../data/regions";

const CityFinder = ({ cities }) => {
  const [budget, setBudget] = useState(2000);
  const [minSalary, setMinSalary] = useState(0);
  const [sortBy, setSortBy] = useState("cost_low");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    let filtered = cities.filter((c) => {
      // Check if data exists and salary is valid
      if (
        !c.estimated_monthly_cost_single ||
        typeof c.salary !== "number" ||
        isNaN(c.salary)
      )
        return false;

      // Budget Filter (Cost < Budget)
      const fitsBudget = c.estimated_monthly_cost_single <= budget;
      // Salary Filter (Salary > Min)
      const fitsSalary = c.salary >= minSalary;
      // Region Filter
      const fitsRegion =
        regionFilter === "All Regions" ||
        (REGIONS[regionFilter] && REGIONS[regionFilter].includes(c.country));

      return fitsBudget && fitsSalary && fitsRegion;
    });

    // Sorting
    if (sortBy === "cost_low") {
      filtered.sort(
        (a, b) =>
          a.estimated_monthly_cost_single - b.estimated_monthly_cost_single
      );
    } else if (sortBy === "salary_high") {
      filtered.sort((a, b) => b.salary - a.salary);
    } else if (sortBy === "power_high") {
      filtered.sort(
        (a, b) =>
          b.salary / b.estimated_monthly_cost_single -
          a.salary / a.estimated_monthly_cost_single
      );
    }

    setResults(filtered.slice(0, 20)); // Top 20
  };

  return (
    <div style={{ color: "var(--text-main)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
              fontWeight: "600",
            }}
          >
            Max Monthly Budget ($)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
              fontWeight: "600",
            }}
          >
            Min Net Salary ($)
          </label>
          <input
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
              fontWeight: "600",
            }}
          >
            Region
          </label>
          <div style={{ position: "relative", minWidth: 170 }}>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.5rem 2.2rem 0.5rem 1rem",
                color: "var(--text-main)",
                background: "var(--bg-card)",
                fontSize: "0.95rem",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {Object.keys(REGIONS).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {/* ChevronDown icon for custom arrow */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
              fontWeight: "600",
            }}
          >
            Sort By
          </label>
          <div style={{ position: "relative", minWidth: 170 }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.5rem 2.2rem 0.5rem 1rem",
                color: "var(--text-main)",
                background: "var(--bg-card)",
                fontSize: "0.95rem",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              <option value="cost_low">Lowest Cost</option>
              <option value="salary_high">Highest Salary</option>
              <option value="power_high">Best Purchasing Power</option>
            </select>
            {/* ChevronDown icon for custom arrow */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "flex-end", height: "100%" }}
        >
          <button
            onClick={handleSearch}
            style={{
              width: "100%",
              height: "40px",
              minHeight: "40px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.25)";
            }}
          >
            Find Cities
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        }}
      >
        {results.map((city, i) => {
          const hasSalary =
            typeof city.salary === "number" && !isNaN(city.salary);
          const hasCost =
            typeof city.estimated_monthly_cost_single === "number" &&
            !isNaN(city.estimated_monthly_cost_single);
          const power =
            hasSalary && hasCost && city.estimated_monthly_cost_single !== 0
              ? (city.salary / city.estimated_monthly_cost_single).toFixed(2)
              : "N/A";
          return (
            <div key={i} className="card" style={{ padding: "1rem" }}>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "var(--text-main)",
                }}
              >
                {city.city}
              </div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                {city.country}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Cost:</span>
                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>
                  {hasCost
                    ? `$${city.estimated_monthly_cost_single.toFixed(0)}`
                    : "N/A"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Salary:</span>
                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>
                  {hasSalary ? `$${city.salary.toFixed(0)}` : "N/A"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.5rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px dashed var(--border)",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Power:</span>
                <span
                  style={{
                    color:
                      power !== "N/A" && power > 1.5 ? "#10b981" : "#f59e0b",
                  }}
                >
                  {power !== "N/A" ? `${power}x` : "N/A"}
                </span>
              </div>
            </div>
          );
        })}
        {results.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              gridColumn: "1/-1",
            }}
          >
            Adjust filters and click Find to see cities.
          </div>
        )}
      </div>
    </div>
  );
};

CityFinder.propTypes = {
  cities: PropTypes.array.isRequired,
};

export default CityFinder;
