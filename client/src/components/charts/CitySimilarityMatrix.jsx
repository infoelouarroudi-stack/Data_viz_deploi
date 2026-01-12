import React, { useMemo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import { Info, Home, Utensils, Bus } from "lucide-react";

/**
 * City Similarity Matrix (Adjacency Matrix)
 * Visualizes similarity between cities based on cost of living metrics.
 * Brighter cells = More similar cities.
 */
const CitySimilarityMatrix = ({ cities, onCitySelect }) => {
  const svgRef = useRef(null);
  const [sortMethod, setSortMethod] = useState("rent");
  const [hoveredCell, setHoveredCell] = useState(null);

  // Sort button configuration
  const sortButtons = [
    { key: "rent", label: "Rent", icon: Home, color: "#f43f5e" },
    { key: "food", label: "Food", icon: Utensils, color: "#10b981" },
    { key: "transport", label: "Transport", icon: Bus, color: "#6366f1" },
  ];

  // 1. Prepare Matrix Data
  const { matrix, cityList, indexMap } = useMemo(() => {
    if (!cities || cities.length === 0) {
      return { matrix: [], cityList: [], indexMap: {} };
    }

    // Take first 40 cities for a larger matrix
    const subset = cities.slice(0, 40);

    // Build feature vectors for each city
    const features = subset.map((c) => ({
      city: c.city,
      country: c.country || "Unknown",
      rent: c.apt_1bed_outside_center || 500,
      food: c.meal_inexpensive || 10,
      transport: c.pass_monthly || 50,
      internet: c.internet || 40,
      obj: c,
    }));

    // Normalize each feature
    const mins = { rent: Infinity, food: Infinity, transport: Infinity, internet: Infinity };
    const maxs = { rent: -Infinity, food: -Infinity, transport: -Infinity, internet: -Infinity };

    features.forEach((f) => {
      Object.keys(mins).forEach((key) => {
        if (f[key] < mins[key]) mins[key] = f[key];
        if (f[key] > maxs[key]) maxs[key] = f[key];
      });
    });

    const norm = (val, key) => (maxs[key] === mins[key] ? 0 : (val - mins[key]) / (maxs[key] - mins[key]));

    // Calculate N x N similarity matrix
    const n = features.length;
    const mat = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const a = features[i];
        const b = features[j];

        // Euclidean Distance (normalized)
        const dist = Math.sqrt(
          Math.pow(norm(a.rent, "rent") - norm(b.rent, "rent"), 2) +
          Math.pow(norm(a.food, "food") - norm(b.food, "food"), 2) +
          Math.pow(norm(a.transport, "transport") - norm(b.transport, "transport"), 2) +
          Math.pow(norm(a.internet, "internet") - norm(b.internet, "internet"), 2)
        );

        // Similarity: 1 / (1 + dist), Range ~[0.33, 1]
        const sim = 1 / (1 + dist);

        mat.push({
          row: i,
          col: j,
          value: sim,
          sourceCity: a.city,
          targetCity: b.city,
          sourceCountry: a.country,
          targetCountry: b.country,
          sourceObj: a.obj,
          targetObj: b.obj,
        });
      }
    }

    // Sort cities based on selected metric
    let sortedCities = [...features];
    if (sortMethod === "rent") {
      sortedCities.sort((a, b) => a.rent - b.rent);
    } else if (sortMethod === "food") {
      sortedCities.sort((a, b) => a.food - b.food);
    } else if (sortMethod === "transport") {
      sortedCities.sort((a, b) => a.transport - b.transport);
    }

    // Create index map: city name -> visual position
    const idxMap = {};
    sortedCities.forEach((c, i) => {
      idxMap[c.city] = i;
    });

    return { matrix: mat, cityList: sortedCities, indexMap: idxMap };
  }, [cities, sortMethod]);

  // 2. D3 Rendering
  useEffect(() => {
    if (!svgRef.current || matrix.length === 0 || cityList.length === 0) return;

    const margin = { top: 130, right: 30, bottom: 30, left: 130 };
    const cellSize = 22; // Balanced size for 40 cities
    const n = cityList.length;
    const width = n * cellSize;
    const height = n * cellSize;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "transparent");


    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Color Scale - Using a warm gradient
    const colorScale = d3
      .scaleSequential()
      .domain([0.3, 1])
      .interpolator(d3.interpolateViridis);

    // Draw Cells with staggered animation
    g.selectAll("rect")
      .data(matrix)
      .join("rect")
      .attr("x", (d) => indexMap[d.targetCity] * cellSize)
      .attr("y", (d) => indexMap[d.sourceCity] * cellSize)
      .attr("width", cellSize - 2)
      .attr("height", cellSize - 2)
      .attr("rx", 4)
      .style("fill", (d) => colorScale(d.value))
      .style("opacity", 0)
      .style("cursor", "pointer")
      .style("transition", "transform 0.2s ease, box-shadow 0.2s ease")
      .on("mouseover", function (event, d) {
        setHoveredCell(d);
        d3.select(this)
          .style("stroke", "#fff")
          .style("stroke-width", 3)
          .style("filter", "drop-shadow(0 0 8px rgba(255,255,255,0.5))");
        d3.selectAll(".row-label").style("fill", (l) => (l.city === d.sourceCity ? "#38bdf8" : "#64748b")).style("font-weight", (l) => (l.city === d.sourceCity ? "bold" : "normal"));
        d3.selectAll(".col-label").style("fill", (l) => (l.city === d.targetCity ? "#38bdf8" : "#64748b")).style("font-weight", (l) => (l.city === d.targetCity ? "bold" : "normal"));
      })
      .on("mouseout", function () {
        setHoveredCell(null);
        d3.select(this).style("stroke", "none").style("filter", "none");
        d3.selectAll(".row-label").style("fill", "#94a3b8").style("font-weight", "normal");
        d3.selectAll(".col-label").style("fill", "#94a3b8").style("font-weight", "normal");
      })
      .on("click", (event, d) => onCitySelect && onCitySelect(d.sourceObj))
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .delay((d) => (indexMap[d.sourceCity] + indexMap[d.targetCity]) * 3)
      .style("opacity", 1);


    // Row Labels (Left)
    g.selectAll(".row-label")
      .data(cityList)
      .join("text")
      .attr("class", "row-label")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellSize + cellSize / 2 + 5)
      .attr("text-anchor", "end")
      .style("font-size", "11px")
      .style("fill", "#94a3b8")
      .style("cursor", "pointer")
      .style("transition", "fill 0.2s ease")
      .text((d) => d.city)
      .style("opacity", 0)
      .on("click", (event, d) => onCitySelect && onCitySelect(d.obj))
      .transition()
      .duration(600)
      .delay((d, i) => i * 30)
      .style("opacity", 1);

    // Column Labels (Top)
    g.selectAll(".col-label")
      .data(cityList)
      .join("text")
      .attr("class", "col-label")
      .attr("x", (d, i) => i * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "start")
      .attr("transform", (d, i) => `rotate(-55, ${i * cellSize + cellSize / 2}, -10)`)
      .style("font-size", "11px")
      .style("fill", "#94a3b8")
      .style("cursor", "pointer")
      .style("transition", "fill 0.2s ease")
      .text((d) => d.city)
      .style("opacity", 0)
      .on("click", (event, d) => onCitySelect && onCitySelect(d.obj))
      .transition()
      .duration(600)
      .delay((d, i) => i * 30)
      .style("opacity", 1);

  }, [matrix, cityList, indexMap, onCitySelect]);

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", margin: 0, fontWeight: 700 }}>City Similarity Matrix</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Compare cities by cost profile. <strong style={{ color: "#22c55e" }}>Brighter squares</strong> = High similarity.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Sort by:</span>
          {sortButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = sortMethod === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setSortMethod(btn.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: isActive ? `2px solid ${btn.color}` : "1px solid var(--border)",
                  background: isActive ? `${btn.color}15` : "transparent",
                  color: isActive ? btn.color : "var(--text-muted)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  transition: "all 0.25s ease",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                <Icon size={16} />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matrix Container */}
      <div style={{ 
        overflowX: "auto", 
        overflowY: "auto",
        position: "relative", 
        maxHeight: "80vh",
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "1.5rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--glass-shadow)"
      }}>
        <svg ref={svgRef}></svg>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--chart-tooltip-bg)",
              padding: "1.25rem 1.75rem",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              color: "var(--chart-tooltip-color)",
              pointerEvents: "none",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              zIndex: 1000,
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)", marginBottom: "0.25rem" }}>
              {(hoveredCell.value * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>Similarity Score</div>
            <div style={{ fontSize: "0.95rem", display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{hoveredCell.sourceCity}</span>
              <span style={{ color: "var(--text-muted)" }}>↔</span>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{hoveredCell.targetCity}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem 1.25rem",
          background: "var(--bg-card)",
          borderRadius: "10px",
          fontSize: "0.9rem",
          color: "var(--text-muted)",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
          border: "1px solid var(--border)",
        }}
      >
        <Info size={20} style={{ flexShrink: 0, marginTop: "2px", color: "var(--primary)" }} />
        <div>
          <strong style={{ color: "var(--text-main)" }}>How to read:</strong> Find a city you like, then scan across its row. Bright yellow cells indicate cities with very similar <strong>Rent</strong>, <strong>Food</strong>, and <strong>Transport</strong> costs.
        </div>
      </div>
    </div>
  );
};

CitySimilarityMatrix.propTypes = {
  cities: PropTypes.array.isRequired,
  onCitySelect: PropTypes.func,
};

export default CitySimilarityMatrix;
