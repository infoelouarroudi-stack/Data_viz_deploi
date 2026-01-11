import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Trash2, Coffee, Beer, Home, Utensils } from "lucide-react";

const StudentBasket = ({
  cities,
  selectedCities: propSelectedCities = [],
  allCities = [],
  defaultCities = [],
  onCitiesChange,
}) => {
  const [selectedCities, setSelectedCities] = useState(propSelectedCities);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);

  // Lifestyle Config State
  const [housingType, setHousingType] = useState("shared"); // shared, studio_out, studio_in
  const [eatingOutFreq, setEatingOutFreq] = useState(4); // meals/week
  const [partyFreq, setPartyFreq] = useState(4); // nights/month
  const [coffeeFreq, setCoffeeFreq] = useState(10); // cups/month

  useEffect(() => {
    setSelectedCities(propSelectedCities);
  }, [propSelectedCities]);

  useEffect(() => {
    if (!searchTerm) return;

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  const addToComparison = (city) => {
    if (!selectedCities.find((c) => c.city === city.city)) {
      const newCities = [...selectedCities, city];
      setSelectedCities(newCities);
      if (onCitiesChange) onCitiesChange(newCities);
    }
    setSearchTerm("");
  };

  const removeFromComparison = (cityName) => {
    const newCities = selectedCities.filter((c) => c.city !== cityName);
    setSelectedCities(newCities);
    if (onCitiesChange) onCitiesChange(newCities);
  };

  // --- LOGIC ---
  const calculateBudget = (city) => {
    // 1. Rent
    let rent = 0;
    if (housingType === "shared")
      rent = (city.apt_3bed_outside_center || 1000) / 3;
    else if (housingType === "studio_out")
      rent = city.apt_1bed_outside_center || 800;
    else rent = city.apt_1bed_city_center || 1200;

    // 2. Food (Groceries vs Eating Out)
    // Base Grocery Basket (approx 1 week survival): Milk, Bread, Rice, Eggs, Chicken, Veg
    const weeklyGrocery =
      (city.milk || 1) +
      (city.bread || 1) +
      (city.rice || 1.5) +
      (city.eggs || 2) +
      (city.chicken_fillets || 8) +
      (city.potato || 1) +
      (city.tomato || 1) +
      (city.onion || 1);
    // Heuristic: 30 days. If eating out 0 times, need 4.3 weeks of groceries.
    // If eating out every day (14 meals/week), grocery needs drop.
    const mealsPerWeek = 14;
    const groceryFactor = Math.max(
      0,
      (mealsPerWeek - eatingOutFreq) / mealsPerWeek
    );
    const monthlyGrocery = weeklyGrocery * 4.3 * groceryFactor;
    const monthlyEatingOut =
      eatingOutFreq * 4.3 * (city.meal_inexpensive || 15);
    const totalFood = monthlyGrocery + monthlyEatingOut;

    // 3. Fun
    const monthlyBeer = partyFreq * 3 * (city.beer_domestic_market || 2); // 3 beers per party
    const monthlyCoffee = coffeeFreq * (city.cappuccino || 3);
    const totalFun = monthlyBeer + monthlyCoffee;

    // 4. Fixed
    const transport = city.pass_monthly || 40;
    const internet = city.internet || 30;
    const phone = 20; // flat estimate
    const totalFixed = transport + internet + phone;

    const total = rent + totalFood + totalFun + totalFixed;

    return { total, rent, totalFood, totalFun, totalFixed };
  };

  // Color Scales for Charts
  const colorScale = {
    rent: "#6366f1",
    food: "#10b981",
    fun: "#f43f5e",
    fixed: "#64748b",
  };

  const DonutChart = ({ data, size = 60 }) => {
    const radius = size / 2;
    const total = data.rent + data.totalFood + data.totalFun + data.totalFixed;

    // Simple SVG Arc generator logic (simplified for inline)
    let cumul = 0;
    const slices = Object.entries(data)
      .filter(([k]) => k !== "total")
      .map(([key, value]) => {
        const percent = value / total;
        const startAngle = cumul * 2 * Math.PI;
        const endAngle = (cumul + percent) * 2 * Math.PI;
        cumul += percent;

        const x1 = radius + radius * Math.sin(startAngle);
        const y1 = radius - radius * Math.cos(startAngle);
        const x2 = radius + radius * Math.sin(endAngle);
        const y2 = radius - radius * Math.cos(endAngle);

        const largeArc = percent > 0.5 ? 1 : 0;

        return {
          d: `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
          fill: colorScale[key.replace("total", "").toLowerCase()] || "#ccc",
        };
      });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill={s.fill}
            stroke="#1e293b"
            strokeWidth="1"
          />
        ))}
        <circle cx={radius} cy={radius} r={radius * 0.6} fill="#0f172a" />
      </svg>
    );
  };

  return (
    <div
      className="dashboard-grid"
      style={{
        gridTemplateColumns: "minmax(300px, 1fr) 2fr",
        alignItems: "start",
      }}
    >
      {/* LEFT: Configurator */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="icon-box"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <Utensils size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Budget Persona</h2>
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              Customize your student lifestyle
            </div>
          </div>
        </div>

        {/* City Input Field */}
        <div
          style={{ marginBottom: "1.5rem", position: "relative" }}
          ref={searchRef}
        >
          <input
            type="text"
            placeholder="Add a city to compare..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
            }}
          />
          {searchTerm && (
            <div
              className="dropdown animate-fade-in"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                zIndex: 50,
                maxHeight: "200px",
                overflowY: "auto",
                color: "var(--text-main)",
                boxShadow:
                  "0 20px 25px -15px rgba(15, 23, 42, 0.35), 0 10px 12px -12px rgba(15, 23, 42, 0.2)",
              }}
            >
              {allCities
                .filter((c) =>
                  c.city.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 5)
                .map((c) => (
                  <div
                    key={c.city}
                    onClick={() => addToComparison(c)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                    }}
                    className="dropdown-option"
                  >
                    {c.city}, {c.country}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Housing Slider */}
        <div className="config-section" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Home size={14} /> Housing Type
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "0.75rem",
            }}
          >
            {["shared", "studio_out", "studio_in"].map((type) => {
              const isActive = housingType === type;
              return (
                <button
                  key={type}
                  onClick={() => setHousingType(type)}
                  style={{
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: isActive ? "600" : "500",
                    borderRadius: "10px",
                    border: isActive
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                    background: isActive
                      ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                      : "var(--bg-secondary)",
                    color: isActive ? "#fff" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: isActive
                      ? "0 8px 20px rgba(99, 102, 241, 0.2)"
                      : "0 2px 6px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  {type === "shared"
                    ? "Shared Room"
                    : type === "studio_out"
                    ? "Studio (Out)"
                    : "Studio (Center)"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Eating Out Slider */}
        <div className="config-section" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Utensils size={14} /> Eating Out (cheap)
            </span>
            <span className="text-secondary">{eatingOutFreq}x / week</span>
          </div>
          <input
            type="range"
            min="0"
            max="14"
            step="1"
            value={eatingOutFreq}
            onChange={(e) => setEatingOutFreq(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--secondary)" }}
          />
        </div>

        {/* Party Slider */}
        <div className="config-section" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Beer size={14} /> Party Nights
            </span>
            <span className="text-secondary">{partyFreq}x / month</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={partyFreq}
            onChange={(e) => setPartyFreq(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#f43f5e" }}
          />
        </div>

        {/* Coffee Slider */}
        <div className="config-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Coffee size={14} /> Coffees
            </span>
            <span className="text-secondary">{coffeeFreq}x / month</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={coffeeFreq}
            onChange={(e) => setCoffeeFreq(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#53442a" }}
          />
        </div>
      </div>

      {/* RIGHT: City Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div
          className="grid-cols-3"
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {selectedCities.map((city) => {
            const budget = calculateBudget(city);
            return (
              <div
                key={city.city}
                className="card animate-fade-in"
                style={{ position: "relative", overflow: "hidden" }}
              >
                <button
                  onClick={() => removeFromComparison(city.city)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "1rem",
                  }}
                >
                  <DonutChart data={budget} />
                  <div>
                    <h3 style={{ margin: 0 }}>{city.city}</h3>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {city.country}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    paddingTop: "10px",
                  }}
                >
                  <div
                    className="text-muted"
                    style={{ fontSize: "0.8rem", textTransform: "uppercase" }}
                  >
                    Est. Monthly Need
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "var(--primary-light)",
                    }}
                  >
                    ${budget.total.toFixed(0)}
                  </div>
                </div>

                <div
                  style={{ fontSize: "0.85rem", display: "grid", gap: "5px" }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6366f1" }}>Housing</span>
                    <strong>${budget.rent.toFixed(0)}</strong>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#10b981" }}>Food</span>
                    <strong>${budget.totalFood.toFixed(0)}</strong>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#f43f5e" }}>Fun</span>
                    <strong>${budget.totalFun.toFixed(0)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {selectedCities.length === 0 && (
          <div
            className="text-muted"
            style={{
              textAlign: "center",
              padding: "3rem",
              border: "2px dashed var(--border)",
              borderRadius: "1rem",
            }}
          >
            Add cities to start planning your budget!
          </div>
        )}
      </div>
    </div>
  );
};

StudentBasket.propTypes = {
  cities: PropTypes.array,
  selectedCities: PropTypes.array,
  allCities: PropTypes.array.isRequired,
  defaultCities: PropTypes.array,
  onCitiesChange: PropTypes.func,
};

export default StudentBasket;
