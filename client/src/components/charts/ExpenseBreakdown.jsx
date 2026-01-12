import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

const ExpenseBreakdown = ({ cityData }) => {
  const svgRef = useRef();

  const { data, total } = useMemo(() => {
    if (!cityData) return { data: [], total: 0 };

    const housing =
      (cityData.apt_1bed_city_center + cityData.apt_1bed_outside_center) / 2 ||
      0;
    const food =
      (cityData.market_total ||
        cityData.milk +
          cityData.bread +
          cityData.chicken_fillets * 4 +
          cityData.rice * 2) * 4 || 0; // rough estimate
    const transport = cityData.pass_monthly || 50;
    const utilities = cityData.utilities_basic + cityData.internet || 0;
    const leisure = cityData.fitness_club + cityData.cinema * 2 || 0;

    const rawData = [
      { label: "Housing", value: housing, color: "#6366f1" },
      { label: "Food & Groceries", value: food, color: "#ec4899" },
      { label: "Transport", value: transport, color: "#14b8a6" },
      { label: "Utilities", value: utilities, color: "#f59e0b" },
      { label: "Leisure", value: leisure, color: "#8b5cf6" },
    ].filter((d) => d.value > 0);

    const calculatedTotal = rawData.reduce((acc, curr) => acc + curr.value, 0);

    return { data: rawData, total: calculatedTotal };
  }, [cityData]);

  useEffect(() => {
    if (!data.length) return;

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);
    const arc = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);
    const arcHover = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 1.1);

    g.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "var(--bg-card)")
      .style("stroke-width", "4px")
      .style("cursor", "pointer")
      .on("mouseenter", function (e, d) {
        d3.select(this).transition().duration(200).attr("d", arcHover);
        // Center Text
        g.select(".center-text-val").text(`$${d.data.value.toFixed(0)}`);
        g.select(".center-text-label").text(d.data.label);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("d", arc);
        g.select(".center-text-val").text(`$${total.toFixed(0)}`);
        g.select(".center-text-label").text("Total / Mo");
      });

    // Center Text
    g.append("text")
      .attr("class", "center-text-val")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", "var(--text-main)")
      .text(`$${total.toFixed(0)}`);

    g.append("text")
      .attr("class", "center-text-label")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .style("font-size", "12px")
      .style("fill", "var(--text-muted)")
      .text("Total / Mo");
  }, [data, total]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <svg ref={svgRef}></svg>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "1rem",
          justifyContent: "center",
        }}
      >
        {data.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.8rem",
              color: "var(--text-main)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            ></div>
            <span>
              {item.label}
              <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>
                ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

ExpenseBreakdown.propTypes = {
  cityData: PropTypes.object,
};

export default ExpenseBreakdown;
