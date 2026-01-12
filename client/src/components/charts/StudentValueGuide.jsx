import React, { useState, useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import { Filter, ChevronDown } from "lucide-react";
import { REGIONS } from "../../data/regions";

const StudentValueGuide = ({ cities, onCitySelect, selectedCity }) => {
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [chartType, setChartType] = useState("grouped"); // 'grouped' or 'stacked'
  const chartRef = useRef(null);

  // Calculate student-specific metrics
  const processedCities = useMemo(() => {
    if (!cities || cities.length === 0) return [];

    return cities
      .filter(
        (city) =>
          city.apt_1bed_outside_center &&
          city.meal_inexpensive &&
          city.pass_monthly &&
          city.salary
      )
      .map((city) => {
        const rent = city.apt_1bed_outside_center || 0;
        const food = (city.meal_inexpensive || 0) * 30;
        const transport = city.pass_monthly || 0;
        const studentMonthlyCost = rent + food + transport;

        const affordabilityScore =
          city.salary > 0
            ? Math.max(
                0,
                ((city.salary - studentMonthlyCost) / city.salary) * 100
              )
            : 0;

        return {
          ...city,
          rent,
          food,
          transport,
          studentMonthlyCost,
          affordabilityScore,
        };
      })
      .filter((city) => city.studentMonthlyCost > 0);
  }, [cities]);

  // Filter and sort cities
  const filteredCities = useMemo(() => {
    let filtered = [...processedCities];

    if (regionFilter !== "All Regions" && REGIONS[regionFilter]) {
      filtered = filtered.filter((city) =>
        REGIONS[regionFilter].includes(city.country)
      );
    }

    // Sort by affordability score descending
    filtered.sort((a, b) => b.affordabilityScore - a.affordabilityScore);

    return filtered;
  }, [processedCities, regionFilter]);

  // Display top 20 cities
  const displayCities = filteredCities.slice(0, 20);

  // D3 Chart (Grouped or Stacked)
  useEffect(() => {
    if (!chartRef.current || displayCities.length === 0) return;

    // Clear previous
    d3.select(chartRef.current).selectAll("*").remove();
    d3.selectAll(".student-chart-tooltip").remove();

    const containerWidth = chartRef.current.parentElement.offsetWidth || 1000;
    const width = Math.max(containerWidth - 20, 1000);
    const height = 550;
    const margin = { top: 30, right: 30, bottom: 140, left: 60 };

    const svg = d3
      .select(chartRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Colors
    const colors = {
      studentCost: "#ec4899", // Pink for student cost
      salary: "#10b981", // Green for salary
    };

    // X Scale (same for both modes)
    const x0 = d3
      .scaleBand()
      .domain(displayCities.map((d) => d.city))
      .range([0, chartWidth])
      .padding(chartType === "stacked" ? 0.3 : 0.2);

    // Y Scale - different max for stacked vs grouped
    const maxValue =
      chartType === "stacked"
        ? d3.max(displayCities, (d) => d.salary + d.studentMonthlyCost)
        : d3.max(displayCities, (d) =>
            Math.max(d.salary, d.studentMonthlyCost)
          );

    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .nice()
      .range([chartHeight, 0]);

    // Gridlines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "rgba(148, 163, 184, 0.1)");

    g.select(".grid .domain").remove();

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "student-chart-tooltip chart-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("min-width", "220px");

    if (chartType === "grouped") {
      // GROUPED BAR CHART
      const x1 = d3
        .scaleBand()
        .domain(["salary", "studentCost"])
        .range([0, x0.bandwidth()])
        .padding(0.08);

      const cityGroups = g
        .selectAll(".city-group")
        .data(displayCities)
        .join("g")
        .attr("class", "city-group")
        .attr("transform", (d) => `translate(${x0(d.city)},0)`);

      // Salary bars (first/left)
      cityGroups
        .append("rect")
        .attr("class", "salary-bar")
        .attr("x", x1("salary"))
        .attr("y", (d) => y(d.salary))
        .attr("width", x1.bandwidth())
        .attr("height", (d) => chartHeight - y(d.salary))
        .attr("fill", colors.salary)
        .style("cursor", "pointer")
        .style("opacity", (d) => (selectedCity?.city === d.city ? 1 : 0.85))
        .on("mouseover", function (event, d) {
          d3.select(this).style("opacity", 1);
          showTooltip(event, d);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function (event, d) {
          d3.select(this).style(
            "opacity",
            selectedCity?.city === d.city ? 1 : 0.85
          );
          hideTooltip();
        })
        .on("click", (event, d) => onCitySelect && onCitySelect(d));

      // Student Cost bars (second/right)
      cityGroups
        .append("rect")
        .attr("class", "cost-bar")
        .attr("x", x1("studentCost"))
        .attr("y", (d) => y(d.studentMonthlyCost))
        .attr("width", x1.bandwidth())
        .attr("height", (d) => chartHeight - y(d.studentMonthlyCost))
        .attr("fill", colors.studentCost)
        .style("cursor", "pointer")
        .style("opacity", (d) => (selectedCity?.city === d.city ? 1 : 0.85))
        .on("mouseover", function (event, d) {
          d3.select(this).style("opacity", 1);
          showTooltip(event, d);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function (event, d) {
          d3.select(this).style(
            "opacity",
            selectedCity?.city === d.city ? 1 : 0.85
          );
          hideTooltip();
        })
        .on("click", (event, d) => onCitySelect && onCitySelect(d));
    } else {
      // STACKED BAR CHART
      const cityGroups = g
        .selectAll(".city-group")
        .data(displayCities)
        .join("g")
        .attr("class", "city-group")
        .attr("transform", (d) => `translate(${x0(d.city)},0)`);

      // Salary bar (bottom)
      cityGroups
        .append("rect")
        .attr("class", "salary-bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.salary))
        .attr("width", x0.bandwidth())
        .attr("height", (d) => chartHeight - y(d.salary))
        .attr("fill", colors.salary)
        .attr("rx", 0)
        .style("cursor", "pointer")
        .style("opacity", (d) => (selectedCity?.city === d.city ? 1 : 0.85))
        .on("mouseover", function (event, d) {
          d3.select(this).style("opacity", 1);
          showTooltip(event, d);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function (event, d) {
          d3.select(this).style(
            "opacity",
            selectedCity?.city === d.city ? 1 : 0.85
          );
          hideTooltip();
        })
        .on("click", (event, d) => onCitySelect && onCitySelect(d));

      // Student Cost bar (stacked on top)
      cityGroups
        .append("rect")
        .attr("class", "cost-bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.salary + d.studentMonthlyCost))
        .attr("width", x0.bandwidth())
        .attr("height", (d) => y(d.salary) - y(d.salary + d.studentMonthlyCost))
        .attr("fill", colors.studentCost)
        .attr("rx", 0)
        .style("cursor", "pointer")
        .style("opacity", (d) => (selectedCity?.city === d.city ? 1 : 0.85))
        .on("mouseover", function (event, d) {
          d3.select(this).style("opacity", 1);
          showTooltip(event, d);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function (event, d) {
          d3.select(this).style(
            "opacity",
            selectedCity?.city === d.city ? 1 : 0.85
          );
          hideTooltip();
        })
        .on("click", (event, d) => onCitySelect && onCitySelect(d));
    }

    // Tooltip functions
    function showTooltip(event, d) {
      const affordColor =
        d.affordabilityScore > 60
          ? "#10b981"
          : d.affordabilityScore > 40
          ? "#f59e0b"
          : "#ef4444";
      tooltip.style("visibility", "visible").html(`
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: #667eea; border-bottom: 1px solid rgba(99,102,241,0.3); padding-bottom: 8px;">
                        ${d.city}, ${d.country}
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: #10b981; font-weight: 600;">💰 Avg Salary</span>
                            <span style="font-weight: 700; font-size: 15px;">$${d.salary.toFixed(
                              0
                            )}</span>
                        </div>
                    </div>

                    <div style="background: rgba(236, 72, 153, 0.1); border-radius: 8px; padding: 10px; margin-bottom: 12px;">
                        <div style="color: #ec4899; font-weight: 600; margin-bottom: 8px;">📊 Student Monthly Cost</div>
                        <div style="display: grid; gap: 4px; font-size: 12px; color: #475569;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>🏠 Rent (1BR outside):</span>
                                <span>$${d.rent.toFixed(0)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>🍽️ Food (30 meals):</span>
                                <span>$${d.food.toFixed(0)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>🚌 Transport Pass:</span>
                                <span>$${d.transport.toFixed(0)}</span>
                            </div>
                        </div>
                        <div style="border-top: 1px dashed rgba(100,116,139,0.3); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 700;">
                            <span>Total:</span>
                            <span style="color: #ec4899;">$${d.studentMonthlyCost.toFixed(
                              0
                            )}</span>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(99,102,241,0.1); padding: 8px 10px; border-radius: 8px;">
                        <span style="font-weight: 600;">✨ Affordability</span>
                        <span style="font-weight: 700; font-size: 15px; color: ${affordColor};">${d.affordabilityScore.toFixed(
        1
      )}%</span>
                    </div>
                `);
    }

    function moveTooltip(event) {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 10 + "px");
    }

    function hideTooltip() {
      tooltip.style("visibility", "hidden");
    }

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0));

    xAxis
      .selectAll("text")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.5em");

    xAxis.select(".domain").attr("stroke", "var(--border)");
    xAxis.selectAll("line").attr("stroke", "var(--border)");

    // Y Axis
    const yAxis = g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(8)
        .tickFormat((d) => `$${d >= 1000 ? (d / 1000).toFixed(0) + "k" : d}`)
    );

    yAxis
      .selectAll("text")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "12px");

    yAxis.select(".domain").attr("stroke", "var(--border)");
    yAxis.selectAll("line").attr("stroke", "var(--border)");

    // Y Axis Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "13px")
      .attr("font-weight", "500")
      .text("Amount (USD)");

    // Legend - positioned at bottom center in 2x2 grid
    const legendY = height - 50;
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${legendY})`);

    const legendItems = [
      { key: "salary", label: "Avg Salary", color: colors.salary },
      { key: "studentCost", label: "Student Cost", color: colors.studentCost },
    ];

    // Row 1: Legend items (2 columns)
    const colSpacing = 160;
    legendItems.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(${(i - 0.5) * colSpacing - 40}, 0)`);

      legendRow
        .append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("rx", 3)
        .attr("fill", item.color);

      legendRow
        .append("text")
        .attr("x", 22)
        .attr("y", 12)
        .attr("fill", "var(--text-main)")
        .attr("font-size", "13px")
        .attr("font-weight", "500")
        .text(item.label);
    });

    // Row 2: Formula (centered below)
    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "12px")
      .text("Student Cost = Rent + Food + Transport");

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".student-chart-tooltip").remove();
    };
  }, [displayCities, selectedCity, onCitySelect, chartType]);

  return (
    <div className="student-value-guide" style={{ color: "var(--text-main)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-main)",
            }}
          >
            Top 20 Best Value Cities for Students
          </h3>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}
          >
            Comparing student costs vs average salary — sorted by affordability
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Chart Type Selector */}
          <div style={{ position: "relative", minWidth: 170 }}>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.5rem 2.2rem 0.5rem 1rem",
                color: "var(--text-main)",
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
                background: "var(--bg-card)",
              }}
            >
              <option value="grouped">Grouped Bars</option>
              <option value="stacked">Stacked Bars</option>
            </select>
            <ChevronDown
              size={18}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            />
          </div>

          {/* Region Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ position: "relative", minWidth: 140 }}>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 2.2rem 0.5rem 1rem",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  background: "var(--bg-card)",
                }}
              >
                {Object.keys(REGIONS).map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          borderRadius: "12px",
          padding: "1.5rem",
          // Removed gray background
        }}
      >
        <svg ref={chartRef}></svg>
      </div>
    </div>
  );
};

StudentValueGuide.propTypes = {
  cities: PropTypes.array.isRequired,
  onCitySelect: PropTypes.func,
  selectedCity: PropTypes.object,
};

export default StudentValueGuide;
