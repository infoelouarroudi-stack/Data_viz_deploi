import React, { useState, useEffect } from "react";
import { LABELS } from "../data/columns";
import { generateSmartTips } from "../utils/smartTips";
import BarChart from "./charts/BarChart";
import ScatterPlot from "./charts/ScatterPlot";
import WorldMap from "./charts/WorldMap";
import RadarChart from "./charts/RadarChart";
import ExpenseBreakdown from "./charts/ExpenseBreakdown";
import CityFinder from "./CityFinder";
import StudentBasket from "./charts/StudentBasket";
import InsightPanel from "./charts/InsightPanel";
import StudentValueGuide from "./charts/StudentValueGuide";
import {
  TrendingUp,
  GraduationCap,
  Scale,
  Calculator,
  BarChart3,
  Info,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Dashboard = ({ theme, toggleTheme }) => {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // State for City Insights
  const [insightCity, setInsightCity] = useState(null);

  // State for Comparison
  const [compareCities, setCompareCities] = useState([]);

  // State for Map Hover
  const [hoveredCity, setHoveredCity] = useState(null);

  // State for Student Hub
  const [studentCities, setStudentCities] = useState([]);
  const [tipCity, setTipCity] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/cities.json").then((res) => res.json()),
      fetch("/data/countries.json").then((res) => res.json()),
    ])
      .then(([cityData, countryData]) => {
        setCities(cityData);
        setCountries(countryData);

        // Defaults
        const paris = cityData.find((c) => c.city === "Paris");
        const ny = cityData.find((c) => c.city === "New York");
        const tokyo = cityData.find((c) => c.city === "Tokyo");

        if (paris) setInsightCity(paris);
        if (paris && ny && tokyo) setCompareCities([paris, ny]);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  const handleCompareChange = (e, index) => {
    const cityName = e.target.value;
    const cityData = cities.find((c) => c.city === cityName);
    if (cityData) {
      const newSelection = [...compareCities];
      newSelection[index] = cityData;
      setCompareCities(newSelection);
    }
  };

  const handleStudentCityChange = (e) => {
    const cityName = e.target.value;
    const cityData = cities.find((c) => c.city === cityName);
    if (cityData && !studentCities.find((c) => c.city === cityName)) {
      // Keep max 6
      const newList = [...studentCities, cityData].slice(-6);
      setStudentCities(newList);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", color: "#fff", textAlign: "center" }}>
        Loading Visualization Engine...
      </div>
    );

  const tabs = [
    { id: "overview", label: "Global Overview", icon: BarChart3 },
    { id: "student", label: "Student Hub", icon: GraduationCap },
    { id: "insights", label: "City Insights", icon: TrendingUp },
    { id: "compare", label: "Compare Cities", icon: Scale },
    { id: "planner", label: "Budget Planner", icon: Calculator },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <div className="dashboard-container">
      <header
        className="modern-header"
        style={{
          zIndex: 100,
          background: "var(--bg-card)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          padding: "1rem 2rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1400px",
            margin: "0 auto",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* LOGO & TITRE - NOUVEAU DESIGN */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img
              src="/android-chrome-192x192.png"
              alt="Global Cost of Living logo"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                objectFit: "cover",
                transform: "rotate(8deg)",
              }}
            />

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                Global Cost of Living
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: "400",
                }}
              >
                Economic insights & purchasing power analysis
              </p>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav
            style={{
              display: "flex",
              gap: "0.5rem",
              background: "var(--bg-secondary)",
              padding: "0.5rem",
              borderRadius: "12px",
              border: "1px solid var(--border)",
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1rem",
                    background:
                      activeTab === tab.id
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: activeTab === tab.id ? "#fff" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: activeTab === tab.id ? "600" : "500",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                    boxShadow:
                      activeTab === tab.id
                        ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                        : "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = "var(--bg-card-hover)";
                      e.currentTarget.style.color = "var(--text-main)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }
                  }}
                >
                  <Icon size={18} />
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
            <div
              style={{
                width: "1px",
                background: "var(--border)",
                margin: "0 0.5rem",
              }}
            />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </nav>
        </div>
      </header>

      {/* Reste du code identique... */}
      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="animate-fade-in">
          <section className="card" style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2>Global Economic Landscape</h2>
              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                Regional Inequalities Map
              </div>
            </div>
            <WorldMap
              countryData={countries}
              cities={cities}
              onHover={setHoveredCity}
            />
          </section>

          <section
            style={{ display: "flex", width: "100%", marginBottom: "2rem" }}
          >
            <InsightPanel cityData={hoveredCity} showSavings />
          </section>

          <section className="card">
            <h2>Purchasing Power Parity</h2>
            <p className="text-muted" style={{ marginBottom: "1rem" }}>
              Correlation between Avg Salary and Living Costs. Cities in the
              bottom-right offer the best quality of life (High Salary, Low
              Cost).
            </p>
            <ScatterPlot data={cities} />
          </section>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="animate-fade-in">
          <div className="grid-cols-2">
            <section className="card" style={{ marginBottom: "1.75rem" }}>
              <h2>🔍 Analyze a City</h2>
              <div style={{ margin: "1rem 0" }}>
                <label
                  className="text-muted"
                  style={{ display: "block", marginBottom: "0.5rem" }}
                >
                  Select City
                </label>
                <div style={{ position: "relative", minWidth: 180 }}>
                  <select
                    value={insightCity?.city || ""}
                    onChange={(e) =>
                      setInsightCity(
                        cities.find((c) => c.city === e.target.value)
                      )
                    }
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
                    {cities.map((c, i) => (
                      <option key={i} value={c.city}>
                        {c.city}, {c.country}
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
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {insightCity && <InsightPanel cityData={insightCity} />}
            </section>

            <section className="card">
              <h2>Expense Breakdown</h2>
              <p className="text-muted">
                Estimated distribution of monthly expenses.
              </p>
              {insightCity && <ExpenseBreakdown cityData={insightCity} />}
            </section>
          </div>

          {/* Student Value Guide Section */}
          <section className="card" style={{ marginTop: "2rem" }}>
            <StudentValueGuide
              cities={cities}
              onCitySelect={setInsightCity}
              selectedCity={insightCity}
            />
          </section>
        </div>
      )}

      {activeTab === "student" && (
        <div className="animate-fade-in">
          <div
            style={{
              marginBottom: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {cities
              .filter(
                (c) => c.estimated_monthly_cost_single < 1500 && c.internet > 0
              )
              .sort(
                (a, b) =>
                  b.salary / b.estimated_monthly_cost_single -
                  a.salary / a.estimated_monthly_cost_single
              )
              .slice(0, 4)
              .map((c, i) => (
                <div
                  key={i}
                  className="card hover-bg"
                  onClick={() => setTipCity(c)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    cursor: "pointer",
                    borderLeft: "3px solid #10b981",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#10b981",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Top Value Pick #{i + 1}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {c.city}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    {c.country}
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "10px",
                      fontSize: "0.8rem",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      Cost: ${c.estimated_monthly_cost_single.toFixed(0)}
                    </span>
                    <span style={{ color: "#facc15" }}>
                      Save{" "}
                      {(
                        (1 - c.estimated_monthly_cost_single / c.salary) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <section
            className="card"
            style={{ marginBottom: "2rem", borderLeft: "4px solid #10b981" }}
          >
            <h2>Student Budget Persona</h2>
            <p className="text-muted">
              Customize your lifestyle to see where you can afford to study.
            </p>
            <StudentBasket
              allCities={cities}
              selectedCities={studentCities}
              onCitiesChange={setStudentCities}
            />
          </section>

          <div className="grid-cols-2">
            <section className="card" style={{ marginBottom: "1.5rem" }}>
              <h3>🏠 Rent vs. Part-Time Salary</h3>
              <p className="text-muted">
                Can you pay rent with a local job? High Value areas (Green/Blue)
                mean Salary exceeds Rent.
              </p>
              <ScatterPlot
                data={cities}
                metricX="salary"
                metricY="apt_1bed_outside_center"
                labelX="Average Local Salary (USD)"
                labelY="Rent 1-Bed Outside Center (USD)"
              />
            </section>
            <section className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  🤖 AI Agent Tips: {tipCity ? tipCity.city : "Select a city"}
                </h3>
                <div style={{ position: "relative", minWidth: 150 }}>
                  <select
                    value={tipCity?.city || ""}
                    onChange={(e) =>
                      setTipCity(cities.find((c) => c.city === e.target.value))
                    }
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "0.3rem 2rem 0.3rem 0.8rem",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      outline: "none",
                      background: "var(--bg-card)",
                      width: "100%",
                    }}
                  >
                    <option value="" disabled>
                      Choose City...
                    </option>
                    {[...cities]
                      .sort((a, b) => a.city.localeCompare(b.city))
                      .map((c, i) => (
                        <option key={i} value={c.city}>
                          {c.city}
                        </option>
                      ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {tipCity ? (
                  generateSmartTips(tipCity).map((tip, i) => (
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
                    Select a "Top Value Pick" above to generate specific advice.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "compare" && (
        <div className="animate-fade-in">
          {/* Header & City Selection Bar */}
          <section
            className="card"
            style={{
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "1rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                  ⚖️ Head-to-Head Analysis
                </h2>
                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                  Directly compare usage costs and lifestyle metrics
                </div>
              </div>
              <button
                onClick={() =>
                  setCompareCities((p) => [...p, cities[0]].slice(0, 3))
                }
                disabled={compareCities.length >= 3}
                style={{
                  fontSize: "0.85rem",
                  padding: "0.5rem 1rem",
                  background:
                    compareCities.length >= 3
                      ? "rgba(255,255,255,0.1)"
                      : "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: compareCities.length >= 3 ? "not-allowed" : "pointer",
                  opacity: compareCities.length >= 3 ? 0.5 : 1,
                }}
              >
                + Add City (Max 3)
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {compareCities.map((city, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <select
                    value={city?.city || ""}
                    onChange={(e) => handleCompareChange(e, idx)}
                    style={{
                      width: "100%",
                      padding: "12px 40px 12px 16px",
                      borderRadius: "8px",
                      // Light Theme Style for Readability
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-main)",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      appearance: "none",
                      outline: "none",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    {[...cities]
                      .sort((a, b) => a.city.localeCompare(b.city))
                      .map((c, i) => (
                        <option key={i} value={c.city}>
                          {c.city}, {c.country}
                        </option>
                      ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  {compareCities.length > 1 && (
                    <button
                      onClick={() =>
                        setCompareCities((p) => p.filter((_, i) => i !== idx))
                      }
                      style={{
                        position: "absolute",
                        right: "-10px",
                        top: "-10px",
                        background: "#ef4444",
                        color: "#fff",
                        border: "2px solid #1e293b",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "14px",
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Analysis Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: "2.5rem",
                marginTop: "2rem",
              }}
            >
              {/* Left: Lifestyle Radar - Spans 5 columns */}
              <div
                style={{
                  gridColumn: "span 5",
                }}
              >
                <h3
                  style={{
                    color: "var(--text-main)",
                    marginBottom: "2rem",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Lifestyle Profile
                </h3>
                <div style={{ padding: "0 1rem" }}>
                  <RadarChart
                    data={compareCities}
                    metrics={[
                      "apt_1bed_city_center",
                      "mc_meal",
                      "pass_monthly",
                      "utilities_basic",
                      "cinema",
                      "jeans",
                    ]}
                    labels={{
                      apt_1bed_city_center: "Rent",
                      mc_meal: "Fast Food",
                      pass_monthly: "Transport",
                      utilities_basic: "Utilities",
                      cinema: "Fun",
                      jeans: "Clothing",
                    }}
                    height={350}
                  />
                </div>
                <div
                  className="text-muted"
                  style={{
                    textAlign: "center",
                    marginTop: "2rem",
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                    opacity: 0.7,
                  }}
                >
                  * Values normalized relative to max in comparisons
                </div>
              </div>

              {/* Right: Financial Overview - Spans 7 columns */}
              <div
                style={{
                  gridColumn: "span 7",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "var(--text-main)",
                      marginBottom: "1.5rem",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Cost vs Income
                  </h3>
                  <div
                    style={{
                      padding: "0 1rem",
                    }}
                  >
                    <BarChart
                      data={compareCities}
                      metric="estimated_monthly_cost_single"
                      label="Monthly Cost of Living ($)"
                      color="#f43f5e"
                    />
                  </div>
                </div>

                <div>
                  <h3
                    style={{
                      color: "var(--text-main)",
                      marginBottom: "1.5rem",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Salary Expectations
                  </h3>
                  <div
                    style={{
                      padding: "0 1rem",
                    }}
                  >
                    <BarChart
                      data={compareCities}
                      metric="salary"
                      label="Average Monthly Salary ($)"
                      color="#6366f1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "planner" && (
        <div className="animate-fade-in">
          <section className="card">
            <h2>Budget Planner & City Finder</h2>
            <p className="text-muted" style={{ marginBottom: "2rem" }}>
              Ideal for students and digital nomads. Find the perfect city that
              fits your financial constraints and lifestyle.
            </p>
            <CityFinder cities={cities} />
          </section>
        </div>
      )}

      {activeTab === "about" && (
        <div className="animate-fade-in">
          <section className="card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>
              About Global Cost of Living
            </h2>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                Project Overview
              </h3>
              <p
                style={{
                  lineHeight: "1.8",
                  color: "var(--text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                The cost of living varies significantly from country to country,
                and even from city to city. Yet, these differences often remain
                abstract for the general public, international students,
                expatriates, and decision-makers.
              </p>
              <p style={{ lineHeight: "1.8", color: "var(--text-secondary)" }}>
                <strong>Our Objective:</strong> Provide a clear, interactive,
                and comparative view of the global cost of living,{" "}
                <strong style={{ color: "#10b981" }}>
                  primarily designed for international students
                </strong>
                . Our platform enables users to easily compare living standards,
                identify the most expensive or affordable cities and countries,
                and better understand the factors that influence these
                differences (housing, food, transportation, salaries, etc.).
              </p>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                Target Audience
              </h3>
              <ul
                style={{
                  lineHeight: "1.8",
                  color: "var(--text-secondary)",
                  paddingLeft: "1.5rem",
                }}
              >
                <li>
                  International students planning their studies abroad
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "500",
                      marginLeft: "0.5rem",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    Main Target
                  </span>
                </li>
                <li>Expatriates considering relocation</li>
                <li>Digital nomads seeking affordable destinations</li>
                <li>
                  Researchers and policymakers analyzing economic disparities
                </li>
                <li>Travelers planning long-term stays</li>
              </ul>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                Data Sources
              </h3>
              <p
                style={{
                  lineHeight: "1.8",
                  color: "var(--text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                We prioritize a single primary source to ensure consistency and
                limit harmonization issues.
              </p>
              <div
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Primary Source: Kaggle
                </p>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.5rem",
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                  }}
                >
                  <li>
                    <a
                      href="https://www.kaggle.com/datasets/mvieira101/global-cost-of-living/data"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--primary)",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      Global Cost of Living Dataset
                    </a>{" "}
                    - Comprehensive cost of living data for cities worldwide
                  </li>
                  <li>
                    <a
                      href="https://www.kaggle.com/datasets/adilshamim8/cost-of-international-education"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--primary)",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      Cost of International Education
                    </a>{" "}
                    - Educational costs and university information
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                Data Processing Pipeline
              </h3>
              <div
                style={{
                  background: "var(--bg-secondary)",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4
                  style={{
                    color: "#10b981",
                    marginBottom: "0.75rem",
                    fontSize: "1rem",
                  }}
                >
                  Step 1: Data Fusion (process_data.py)
                </h4>
                <p
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                  }}
                >
                  Initial script that merges disparate data sources (v2,
                  education, index) to generate the raw master file:{" "}
                  <code
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    master_city_data_final.csv
                  </code>
                </p>

                <h4
                  style={{
                    color: "#10b981",
                    marginBottom: "0.75rem",
                    fontSize: "1rem",
                  }}
                >
                  Step 2: Data Cleaning & Feature Engineering (polish_data.py)
                </h4>
                <p
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                  }}
                >
                  Advanced cleaning script that generates the final polished
                  dataset:
                  <code
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    master_city_data_polished.csv
                  </code>
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                Data Cleaning Methodology
              </h3>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    color: "#f59e0b",
                    marginBottom: "0.75rem",
                    fontSize: "0.95rem",
                  }}
                >
                  1. Outlier Detection & Treatment
                </h4>
                <p
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  To prevent data entry errors or extreme values from skewing
                  averages, we applied the
                  <strong> Interquartile Range (IQR) method</strong> by country:
                </p>
                <ul
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    paddingLeft: "1.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <li>
                    Calculate Q1 (1st quartile) and Q3 (3rd quartile) for each
                    country
                  </li>
                  <li>Define bounds: [Q1 - 1.5×IQR, Q3 + 1.5×IQR]</li>
                  <li>
                    Replace values outside bounds with the country's median
                  </li>
                </ul>
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Results:</strong> 49 outliers corrected for Studio
                  Rent, 77 for Restaurant Meals, 48 for Net Monthly Salary
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    color: "#f59e0b",
                    marginBottom: "0.75rem",
                    fontSize: "0.95rem",
                  }}
                >
                  2. Missing Value Imputation
                </h4>
                <ul
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    paddingLeft: "1.5rem",
                  }}
                >
                  <li>
                    <strong>Prices</strong> (Coffee, Beer, Meals, etc.): Missing
                    values replaced by country average. If no country data
                    exists, global average is used.
                  </li>
                  <li>
                    <strong>Universities</strong>: Empty cells filled with "No
                    University Listed"
                  </li>
                </ul>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    color: "#f59e0b",
                    marginBottom: "0.75rem",
                    fontSize: "0.95rem",
                  }}
                >
                  3. Geographic Duplicate Management
                </h4>
                <p
                  style={{ lineHeight: "1.8", color: "var(--text-secondary)" }}
                >
                  The original dataset contains multiple rows for the same city
                  (one row per university). We created a boolean column{" "}
                  <code
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    City_Is_Unique
                  </code>
                  to mark the first occurrence of each City/Country pair,
                  enabling single-city display on maps without overlap.
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    color: "#f59e0b",
                    marginBottom: "0.75rem",
                    fontSize: "0.95rem",
                  }}
                >
                  4. Feature Engineering
                </h4>
                <p
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  New metrics created for analysis:
                </p>
                <ul
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    paddingLeft: "1.5rem",
                  }}
                >
                  <li>
                    <strong>Rent_to_Income_Ratio (%)</strong>: (Studio Rent /
                    Net Salary) × 100
                  </li>
                  <li>
                    <strong>Daily_Survival_Budget ($)</strong>: Cheap Meal + (2
                    × Transport Ticket) + Cappuccino
                  </li>
                  <li>
                    <strong>Affordability Score</strong>: ((Salary - Student
                    Monthly Cost) / Salary) × 100
                  </li>
                </ul>
              </div>

              <div>
                <h4
                  style={{
                    color: "#f59e0b",
                    marginBottom: "0.75rem",
                    fontSize: "0.95rem",
                  }}
                >
                  5. Standardization
                </h4>
                <p
                  style={{ lineHeight: "1.8", color: "var(--text-secondary)" }}
                >
                  All numeric columns converted to Float format and rounded to 2
                  decimal places for consistency.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                Team
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    padding: "1rem",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    Khalil Ferhati
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    padding: "1rem",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    Hafid Oucouc
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    padding: "1rem",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    Monir EL OUARROUDI
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    padding: "1rem",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    Abdessamad Ibdoussadel
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
                Communication
              </h3>
              <div
                style={{
                  background: "var(--bg-secondary)",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <ul
                  style={{
                    lineHeight: "1.8",
                    color: "var(--text-secondary)",
                    paddingLeft: "1.5rem",
                    margin: 0,
                  }}
                >
                  <li style={{ marginBottom: "0.75rem" }}>
                    <strong style={{ color: "var(--text-secondary)" }}>
                      GitHub:
                    </strong>{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      Suivi des tâches, Issues, Milestones.
                    </span>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <strong style={{ color: "var(--text-secondary)" }}>
                      WhatsApp / Discord:
                    </strong>{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      Communication rapide.
                    </span>
                  </li>
                  <li>
                    <strong style={{ color: "var(--text-secondary)" }}>
                      Google Drive:
                    </strong>{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      Partage de documents.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              style={{
                background: "rgba(20, 184, 166, 0.1)",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid rgba(20, 184, 166, 0.2)",
              }}
            >
              <h3 style={{ color: "#14b8a6", marginBottom: "0.75rem" }}>
                Technology Stack
              </h3>
              <p
                style={{
                  lineHeight: "1.8",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                Built with <strong>React</strong>, <strong>D3.js</strong>, and
                modern web technologies to provide an interactive and responsive
                data visualization experience.
              </p>
            </div>
          </section>
        </div>
      )}

      <footer
        className="text-muted"
        style={{
          textAlign: "center",
          marginTop: "2rem",
          fontSize: "0.8rem",
          padding: "2rem 0",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          Global Cost of Living Dashboard
        </div>
        <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
          Created with React, D3.js & Love • 2025
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
