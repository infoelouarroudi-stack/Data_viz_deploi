import React, { useMemo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import { REGIONS } from "../../data/regions"; // Ensure this path is correct
import { Info } from "lucide-react";

// Helper to determine region from country
const getRegion = (country) => {
  for (const [region, countries] of Object.entries(REGIONS)) {
    if (countries.includes(country)) return region;
  }
  return "Other";
};

// Region Colors
const REGION_COLORS = {
  "Europe": "#60a5fa", // Blue
  "Asia": "#f472b6",   // Pink
  "North America": "#34d399", // Green
  "South America": "#fbbf24", // Yellow
  "Middle East": "#a78bfa", // Purple
  "Africa": "#f87171", // Red
  "Oceania": "#2dd4bf", // Teal
  "Other": "#9ca3af" // Gray
};

const StudentOpportunityChart = ({ cities, onCitySelect, selectedCity }) => {
  const chartRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // 1. Process Data
  const data = useMemo(() => {
    if (!cities || cities.length === 0) return [];

    // Filter relevant cities
    // Filter relevant cities - Relaxed filter
    const relevantCities = cities.filter(
      (c) =>
        c.apt_1bed_outside_center &&
        c.meal_inexpensive &&
        c.pass_monthly
    );

    // Calculate Metrics
    return relevantCities.map((city) => {
      // Essentials
      const rent = city.apt_1bed_outside_center || 0;
      const food = (city.meal_inexpensive || 0) * 30 + (city.milk || 0) * 4 + (city.bread || 0) * 4;
      const transport = city.pass_monthly || 0;
      const internet = city.internet || 40; // Default $40 if missing.
      
      const monthlyCost = rent + food + transport + internet;

      // Lifestyle Basket (Handle missing values with defaults)
      // Defaults based on global approx averages: Cinema $12, Gym $40, Cappuccino $4, Beer $3, McMeal $8
      const cinema = city.cinema || 12;
      const gym = city.fitness_club || 40;
      const coffee = city.cappuccino || 4;
      const beer = city.beer_domestic_market || 3;
      const mcMeal = city.mc_meal || 8;

      const funBasketCost = 
        cinema + 
        gym + 
        (coffee * 4) + 
        (beer * 4) + 
        (mcMeal * 2);

      return {
        ...city,
        region: getRegion(city.country),
        monthlyCost,
        funBasketCost,
        // Keep original values for tooltip (or show specific ones)
        display_cinema: cinema,
        display_gym: gym,
        display_coffee: coffee,
        display_beer: beer
      };
    });
  }, [cities]);

  // 2. Normalize Scores (0-100)
  const plotData = useMemo(() => {
    if (data.length === 0) return [];

    // Find min/max for normalization
    const maxFunCost = d3.max(data, d => d.funBasketCost);
    const minFunCost = d3.min(data, d => d.funBasketCost);

    return data.map(d => {
        // Lifestyle Score: 
        // Cheapest city gets 100, Most expensive gets 0
        const normalizedFun = (d.funBasketCost - minFunCost) / (maxFunCost - minFunCost);
        const lifestyleScore = 100 - (normalizedFun * 100);

        return {
            ...d,
            lifestyleScore
        };
    });
  }, [data]);


  // 3. D3 Rendering
  useEffect(() => {
    if (!chartRef.current || plotData.length === 0) return;

    // Clear previous
    d3.select(chartRef.current).selectAll("*").remove();
    d3.selectAll(".opp-tooltip").remove();

    // Dimensions
    const containerWidth = chartRef.current.parentElement.offsetWidth || 1000;
    const width = Math.max(containerWidth, 800);
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    const svg = d3
      .select(chartRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    // Scales
    const xMin = d3.min(plotData, d => d.monthlyCost) * 0.9;
    const xMax = d3.max(plotData, d => d.monthlyCost) * 1.05;
    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    const rScale = d3.scaleSqrt()
      .domain([0, d3.max(plotData, d => d.salary)])
      .range([4, 12]); // Bubble size based on Salary (Earnings potential)

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(8).tickFormat(d => `$${d}`);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    // Draw Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .attr("color", "var(--text-muted)")
        .select(".domain").attr("stroke", "var(--border)");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .attr("color", "var(--text-muted)")
        .select(".domain").remove(); // Clean look

    // Gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickSize(-width + margin.left + margin.right).tickFormat(""))
        .selectAll("line")
        .attr("stroke", "var(--border)")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "4,4");

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom).tickFormat(""))
        .selectAll("line")
        .attr("stroke", "var(--border)")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "4,4");


    // Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 15)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-muted)")
        .style("font-size", "14px")
        .text("Student Monthly Cost ($)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-muted)")
        .style("font-size", "14px")
        .text("Lifestyle Score (0-100)");

    // Quadrant Labels (Sweet Spot)
    // Top-Left: High Score, Low Cost
    svg.append("text")
        .attr("x", margin.left + 40)
        .attr("y", margin.top + 20)
        .style("fill", "#10b981")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .style("opacity", 0.8)
        .text("💎 THE SWEET SPOT");
    
    svg.append("text")
        .attr("x", margin.left + 40)
        .attr("y", margin.top + 40)
        .style("fill", "#10b981")
        .style("font-size", "12px")
        .style("opacity", 0.6)
        .text("High Lifestyle / Low Cost");


    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "opp-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "var(--bg-card)")
        .style("border", "1px solid var(--border)")
        .style("padding", "1rem")
        .style("border-radius", "8px")
        .style("box-shadow", "0 4px 20px rgba(0,0,0,0.5)")
        .style("z-index", 1000)
        .style("pointer-events", "none")
        .style("font-size", "0.9rem")
        .style("color", "var(--text-main)")
        .style("min-width", "250px");

    // Bubbles
    svg.selectAll("circle")
        .data(plotData)
        .join("circle")
        .attr("cx", d => xScale(d.monthlyCost))
        .attr("cy", d => yScale(d.lifestyleScore))
        .attr("r", d => rScale(d.salary))
        .attr("fill", d => REGION_COLORS[d.region] || REGION_COLORS["Other"])
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8)
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
            setHoveredNode(d);
            d3.select(event.currentTarget).attr("stroke", "var(--primary)").attr("stroke-width", 3).attr("opacity", 1);
            
            tooltip.style("visibility", "visible").html(`
                <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem; color: ${REGION_COLORS[d.region]}">${d.city}</div>
                <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">${d.country}</div>
                
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted)">Student Cost:</span>
                    <span style="font-weight: bold;">$${d.monthlyCost.toFixed(0)}</span>
                    
                    <span style="color: var(--text-muted)">Lifestyle Score:</span>
                    <span style="font-weight: bold; color: ${d.lifestyleScore > 75 ? '#10b981' : d.lifestyleScore > 50 ? '#f59e0b' : '#ef4444'}">${d.lifestyleScore.toFixed(0)}</span>
                    
                    <span style="color: var(--text-muted)">Avg Salary:</span>
                    <span>$${d.salary.toFixed(0)}</span>
                </div>

                <div style="border-top: 1px dashed var(--border); padding-top: 0.5rem; margin-top: 0.5rem; font-size: 0.8rem;">
                    <div>🍺 Beer: $${d.display_beer.toFixed(2)}</div>
                    <div>🏋 Gym: $${d.display_gym.toFixed(2)}</div>
                    <div>🎬 Cinema: $${d.display_cinema.toFixed(2)}</div>
                </div>
            `);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", (event) => {
            setHoveredNode(null);
            d3.select(event.currentTarget).attr("stroke", "#fff").attr("stroke-width", 1.5).attr("opacity", 0.8);
            tooltip.style("visibility", "hidden");
        })
        .on("click", (event, d) => {
            if (onCitySelect) onCitySelect(d);
        });

    return () => {
        d3.selectAll(".opp-tooltip").remove();
    };
  }, [plotData, onCitySelect]);

  return (
    <div className="card animate-fade-in" style={{ width: "100%", padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Student Opportunity Matrix</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Identify cities with the best balance of <strong style={{color: "#10b981"}}>Lifestyle</strong> and <strong style={{color: "#ec4899"}}>Cost</strong>.
          </p>
        </div>
        
        {/* Legend */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", maxWidth: "400px", justifyContent: "flex-end" }}>
            {Object.entries(REGION_COLORS).map(([region, color]) => (
                <div key={region} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color }}></span>
                    <span style={{ color: "var(--text-muted)" }}>{region}</span>
                </div>
            ))}
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", height: "600px" }}>
        <svg ref={chartRef}></svg>
      </div>
      
      <div style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          background: "var(--bg-main)", 
          borderRadius: "8px", 
          fontSize: "0.9rem", 
          color: "var(--text-muted)",
          display: "flex",
          gap: "0.5rem"
      }}>
          <Info size={18} />
          <div>
            <strong>How to read this chart:</strong>
            <ul style={{ margin: "0.5rem 0 0 1rem", padding: 0 }}>
                <li><strong>X-Axis (Cost):</strong> Monthly essentials (Rent + Food + Transport). Further left is cheaper.</li>
                <li><strong>Y-Axis (Lifestyle):</strong> Score based on affordability of "fun" (Cinema, Gym, Coffee, Beer). Higher is better.</li>
                <li><strong>Bubble Size:</strong> Local average salary. Bigger bubbles = higher earning potential.</li>
                <li><strong>Sweet Spot:</strong> Look for cities in the <strong>Top-Left</strong> (High Lifestyle, Low Cost).</li>
            </ul>
          </div>
      </div>
    </div>
  );
};

StudentOpportunityChart.propTypes = {
  cities: PropTypes.array.isRequired,
  onCitySelect: PropTypes.func,
  selectedCity: PropTypes.object,
};

export default StudentOpportunityChart;
