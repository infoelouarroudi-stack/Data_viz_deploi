import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import PropTypes from "prop-types";
import { CITY_COORDINATES } from "../../data/coordinates";
import { COUNTRY_TO_CONTINENT } from "../../data/continentMapping";
import { Globe, RefreshCw, ZoomIn, MapPin } from "lucide-react";

// Custom Color Schemes (User Request)
const COUNTRY_SCHEME = d3.interpolateRgb("#d6b6f6ff", "#581c87"); // Purple-400 to Purple-900
const CITY_SCHEME = d3.interpolateRgb("#7a7a7aff", "#000000"); // Zinc-600 to Pure Black

const METRICS = {
  cost: {
    label: "Avg Monthly Cost ($)",
    keyCountry: "avg_cost",
    keyCity: "estimated_monthly_cost_single",
    scheme: COUNTRY_SCHEME,
    reverse: false,
  },
  salary: {
    label: "Avg Monthly Salary ($)",
    keyCountry: "avg_salary",
    keyCity: "salary",
    scheme: COUNTRY_SCHEME,
    reverse: false,
  },
  rent: {
    label: "1 Bed Apt Outside Center ($)",
    keyCountry: null,
    keyCity: "apt_1bed_outside_center",
    scheme: CITY_SCHEME,
    reverse: false,
  },
  food: {
    label: "Inexpensive Meal ($)",
    keyCountry: null,
    keyCity: "meal_inexpensive",
    scheme: CITY_SCHEME,
    reverse: false,
  },
};

// Configuration optimisée avec fitSize pour un meilleur centrage
const CONTINENT_CONFIG = {
  europe: {
    file: "/data/world.json",
    label: "Europe",
    projection: () => d3.geoMercator(),
    bounds: [
      [-10, 35],
      [40, 70],
    ],
    filterRegion: true,
    fitBounds: true,
  },
  africa: {
    file: "/data/world.json",
    label: "Afrique",
    projection: () => d3.geoMercator(),
    bounds: [
      [-20, -35],
      [55, 38],
    ],
    filterRegion: true,
    fitBounds: true,
  },
  asia: {
    file: "/data/world.json",
    label: "Asie",
    projection: () => d3.geoMercator(),
    bounds: [
      [28, -12],
      [148, 52],
    ],
    filterRegion: true,
    fitBounds: true,
  },
  northamerica: {
    file: "/data/world.json",
    label: "Amérique du Nord",
    projection: () => d3.geoMercator(),
    bounds: [
      [-170, 15],
      [-50, 75],
    ],
    filterRegion: true,
    fitBounds: true,
  },
  southamerica: {
    file: "/data/world.json",
    label: "Amérique du Sud",
    projection: () => d3.geoMercator(),
    bounds: [
      [-85, -60],
      [-30, 15],
    ],
    filterRegion: true,
    fitBounds: true,
  },
  oceania: {
    file: "/data/world.json",
    label: "Océanie",
    projection: () => d3.geoMercator(),
    bounds: [
      [110, -50],
      [180, 0],
    ],
    filterRegion: true,
    fitBounds: true,
  },
  world: {
    file: "/data/world.json",
    label: "🌍 Monde",
    projection: () => d3.geoOrthographic(),
    scale: null,
    isGlobe: true,
  },
};

const WorldMap = ({ countryData, cities, onHover }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 680 });
  const [activeMetric, setActiveMetric] = useState("cost");
  const [selectedContinent, setSelectedContinent] = useState("world");

  const rotationRef = useRef([0, 0]);
  const isDragging = useRef(false);
  const isHovering = useRef(false);

  // Responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width } = entries[0].contentRect;
      if (width > 0) setDimensions((d) => ({ ...d, width }));
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Drawing Logic
  useEffect(() => {
    if (!countryData || dimensions.width === 0) return;
    const { width, height } = dimensions;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const config = METRICS[activeMetric];
    const continentConfig = CONTINENT_CONFIG[selectedContinent];

    // Prepare Scales
    // Prepare Scales
    // Calculate extent from cities data as the primary reference (usually more granular/wide)
    const extent = d3.extent(
      cities.filter((c) => c[config.keyCity] > 0),
      (d) => d[config.keyCity]
    );
    if (!extent[0]) extent[0] = 0;
    if (!extent[1]) extent[1] = 1000; // Fallback max

    // 1. Scale for Countries (Uses the metric's defined scheme - Purple for Cost/Salary)
    const countryColorScale = d3
      .scaleSequential(config.scheme)
      .domain(config.reverse ? [extent[1], extent[0]] : extent);

    // 2. Scale for Cities (ALWAYS uses CITY_SCHEME - Black/Zinc as requested)
    const cityColorScale = d3
      .scaleSequential(CITY_SCHEME)
      .domain(config.reverse ? [extent[1], extent[0]] : extent);

    // Projection setup
    const globeSize = Math.min(width, height) / 2 - 20;
    const projection = continentConfig.projection();

    if (!continentConfig.isGlobe && continentConfig.bounds && !continentConfig.fitBounds) {
      const [[minLon, minLat], [maxLon, maxLat]] = continentConfig.bounds;
      const centerLon = (minLon + maxLon) / 2;
      const centerLat = (minLat + maxLat) / 2;
      projection.rotate([-centerLon, 0]).center([0, centerLat]);
    }

    // Configuration initiale pour le globe
    if (continentConfig.isGlobe) {
      projection
        .scale(globeSize)
        .translate([width / 2, height / 2])
        .clipAngle(90)
        .rotate(rotationRef.current);
    }

    const path = d3.geoPath().projection(projection);

    // Layers
    const defs = svg.append("defs");

    // Atmosphere Glow (uniquement pour le globe)
    if (continentConfig.isGlobe) {
      const filter = defs.append("filter").attr("id", "glow");
      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "5")
        .attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    // Background
    if (continentConfig.isGlobe) {
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", globeSize)
        .attr("fill", "var(--bg-secondary)")
        .attr("stroke", "var(--border)")
        .attr("stroke-width", 2);

      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", globeSize)
        .attr("fill", "none")
        .attr("stroke", "var(--primary-glow)")
        .attr("stroke-width", 10)
        .attr("filter", "url(#glow)")
        .style("pointer-events", "none");
    } else {
      svg
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "var(--bg-main)")
        .attr("opacity", 0.5);
    }

    const mapGroup = svg.append("g");
    const cityGroup = svg.append("g");

    // Fonction pour vérifier si un pays est dans les limites
    const isInBounds = (feature) => {
      // Always show everything for 'world' view
      if (selectedContinent === 'world') return true;

      const countryName = feature.properties.name;
      // Strict check against our mapping (supports multiple continents per country)
      const continent = COUNTRY_TO_CONTINENT[countryName];
      if (Array.isArray(continent)) {
        return continent.includes(selectedContinent);
      }
      return continent === selectedContinent;
    };

    // Render Data
    // Using GeoJSON directly (migrated from TopoJSON)
    d3.json("/data/world-geo.json").then((geojson) => {
      if (!geojson) return;

      let countries = geojson.features;


      // Filtrer les pays selon la région si nécessaire
      if (continentConfig.filterRegion) {
        countries = countries.filter(isInBounds);
      }

        // AUTO-AJUSTEMENT pour les vues continentales
        if (continentConfig.fitBounds && continentConfig.bounds) {
          // Créer un polygone correspondant aux limites définies (cropping)
          // au lieu de s'adapter à la géométrie des pays (qui peut être trop vaste)
          const [[minLon, minLat], [maxLon, maxLat]] = continentConfig.bounds;
          
          const boundsPolygon = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[
                [minLon, minLat],
                [minLon, maxLat],
                [maxLon, maxLat],
                [maxLon, minLat],
                [minLon, minLat]
              ]]
            }
          };

          // Marges pour le padding
          const padding = 20;

          // Utiliser fitSize sur le cadre de délimitation (cropping effect)
          projection.fitSize(
            [width - padding * 2, height - padding * 2],
            boundsPolygon
          );

          // Ajuster la translation pour le padding
          const [tx, ty] = projection.translate();
          projection.translate([tx + padding, ty + padding]); 
        } else if (continentConfig.fitBounds && countries.length > 0) {
           // Fallback: Fit to countries if no explicit bounds (unlikely given our config)
           const featureCollection = {
            type: "FeatureCollection",
            features: countries,
          };
          const padding = 40;
          projection.fitSize(
            [width - padding * 2, height - padding * 2],
            featureCollection
          );
          const [tx, ty] = projection.translate();
          projection.translate([tx + padding, ty + padding]);
        }

        // Dynamic country name matching function
        const findCountryMatch = (topoJsonName, countryDataList) => {
          if (!topoJsonName) return null;

          const normalize = (str) => {
            if (!str) return "";
            return str
              .toLowerCase()
              .trim()
              .replace(/[.,]/g, "")
              .replace(/\s+/g, " ");
          };

          const topoNormalized = normalize(topoJsonName);

          // 1. Try exact match (case-insensitive)
          let match = countryDataList.find(
            (c) => normalize(c.country) === topoNormalized
          );
          if (match) return match;

          // 2. Try if TopoJSON name contains country name or vice versa
          match = countryDataList.find((c) => {
            const countryNormalized = normalize(c.country);
            return (
              topoNormalized.includes(countryNormalized) ||
              countryNormalized.includes(topoNormalized)
            );
          });
          if (match) return match;

          // 3. Try removing common suffixes/prefixes
          const removeCommonSuffixes = (str) => {
            return str
              .replace(/\b(republic of|kingdom of|united states of)\b/gi, "")
              .replace(/\b(the|of|and)\b/gi, "")
              .trim();
          };

          const topoCleaned = normalize(removeCommonSuffixes(topoJsonName));
          match = countryDataList.find((c) => {
            const countryCleaned = normalize(removeCommonSuffixes(c.country));
            return (
              topoCleaned === countryCleaned ||
              topoCleaned.includes(countryCleaned) ||
              countryCleaned.includes(topoCleaned)
            );
          });
          if (match) return match;

          // 4. Try matching key words (for cases like "United States of America" -> "United States")
          const getKeyWords = (str) => {
            const normalized = normalize(str);
            return normalized
              .split(/\s+/)
              .filter((w) => w.length > 2 && !["the", "of", "and"].includes(w));
          };

          const topoWords = getKeyWords(topoJsonName);
          if (topoWords.length > 0) {
            match = countryDataList.find((c) => {
              const countryWords = getKeyWords(c.country);
              // Check if at least 2 key words match
              const matchingWords = topoWords.filter((w) =>
                countryWords.some((cw) => cw.includes(w) || w.includes(cw))
              );
              return matchingWords.length >= Math.min(2, topoWords.length);
            });
            if (match) return match;
          }

          return null;
        };

        // Create lookup with dynamic matching
        const countryLookup = {};
        countryData.forEach((d) => {
          countryLookup[d.country] = d;
        });

        const paths = mapGroup
          .selectAll("path")
          .data(countries)
          .join("path")
          .attr("d", path)
          .attr("fill", (d) => {
            const countryName =
              d.properties.name ||
              d.properties.NAME ||
              d.properties.NAME_EN ||
              d.properties.NAME_LONG;

            // Try direct lookup first
            let cData = countryLookup[countryName];

            // If not found, try dynamic matching
            if (!cData && countryName) {
              cData = findCountryMatch(countryName, countryData);
            }

            if (config.keyCountry && cData && cData[config.keyCountry]) {
              return d3.color(countryColorScale(cData[config.keyCountry])).darker(0.3);
            }
            return "var(--fill-country)";
          })
          .attr("stroke", "var(--border)")
          .attr("stroke-width", 0.5)
          .attr("class", "country-path")
          .style("transition", "fill 0.3s ease");

        // Filtrer les villes par région
        let cityPoints = cities
          .filter((c) => CITY_COORDINATES[c.city] && c[config.keyCity])
          .map((c) => ({
            ...c,
            coords: CITY_COORDINATES[c.city],
          }));

        if (continentConfig.filterRegion) {
          // Utiliser COUNTRY_TO_CONTINENT pour le filtrage strict
          cityPoints = cityPoints.filter((c) => {
            if (selectedContinent === 'world') return true;
            const continent = COUNTRY_TO_CONTINENT[c.country];
            if (Array.isArray(continent)) {
              return continent.includes(selectedContinent);
            }
            return continent === selectedContinent;
          });
        }

        const circles = cityGroup
          .selectAll("circle")
          .data(cityPoints)
          .join("circle")
          .attr("r", 4)
          .attr("fill", (d) => cityColorScale(d[config.keyCity]))
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .attr("cursor", "pointer")
          .on("mouseenter", (event, d) => {
            if (isDragging.current) return;
            isHovering.current = true;
            d3.select(event.target)
              .attr("stroke", "#facc15")
              .attr("r", 8)
              .raise();

            const [x, y] = d3.pointer(event, containerRef.current);
            setTooltip({ x, y, data: d });
            if (onHover) onHover(d);
          })
          .on("mouseleave", (event) => {
            d3.select(event.target).attr("stroke", "#fff").attr("r", 4);
            setTooltip(null);
            isHovering.current = false;
          });

        // Update function for animation
        const updatePaths = () => {
          projection.rotate(rotationRef.current);
          paths.attr("d", path);
          circles.each(function (d) {
            const projected = projection(d.coords);
            if (projected && path({ type: "Point", coordinates: d.coords })) {
              d3.select(this)
                .attr("cx", projected[0])
                .attr("cy", projected[1])
                .attr("display", "block");
            } else {
              d3.select(this).attr("display", "none");
            }
          });
        };

        // Position initiale des villes
        circles.each(function (d) {
          const projected = projection(d.coords);
          if (projected) {
            d3.select(this)
              .attr("cx", projected[0])
              .attr("cy", projected[1])
              .attr("display", "block");
          } else {
            d3.select(this).attr("display", "none");
          }
        });

        // Drag Behavior - uniquement pour le globe
        if (continentConfig.isGlobe) {
          const drag = d3
            .drag()
            .on("start", () => {
              isDragging.current = true;
              svg.style("cursor", "grabbing");
            })
            .on("drag", (event) => {
              const k = 0.5;
              const r = rotationRef.current;
              rotationRef.current = [r[0] + event.dx * k, r[1] - event.dy * k];
              updatePaths();
            })
            .on("end", () => {
              isDragging.current = false;
              svg.style("cursor", "grab");
            });

          svg.call(drag);

          // Auto-rotation pour le globe
          const timer = d3.timer(() => {
            if (isDragging.current || isHovering.current) return;
            const r = rotationRef.current;
            rotationRef.current = [r[0] + 0.1, r[1]];
            updatePaths();
          });

          return () => timer.stop();
        } else {
          // Zoom et Pan pour les cartes continentales
          const zoom = d3
            .zoom()
            .scaleExtent([0.5, 8])
            .translateExtent([
              [-width, -height],
              [width * 2, height * 2],
            ])
            .on("zoom", (event) => {
              mapGroup.attr("transform", event.transform);
              cityGroup.attr("transform", event.transform);
            });

          svg.call(zoom);

          // Enable dragging to pan the map
          svg.call(
            d3
              .drag()
              .on("start", () => svg.style("cursor", "grabbing"))
              .on("end", () => svg.style("cursor", "grab"))
          );
          svg.style("cursor", "grab");
        }
      })
      .catch((err) => {
        console.error("Failed to load map data:", err);
      });
  }, [
    countryData,
    cities,
    dimensions,
    activeMetric,
    selectedContinent,
    onHover,
  ]);

  // Pre-calculate legend values and color scales dynamically
  const config = METRICS[activeMetric];
  const legendSteps = 5;
  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  const formatRange = (min, max) => {
    if (min == null || max == null) return "$—";
    const minStr = numberFormatter.format(Math.round(min));
    const maxStr = numberFormatter.format(Math.round(max));
    return minStr === maxStr ? `$${minStr}` : `$${minStr} - $${maxStr}`;
  };

  const buildLegendItems = (rawValues, colorScale, darker = false) => {
    if (!rawValues.length) return [];
    const sorted = [...rawValues].sort((a, b) => a - b);
    const thresholds = Array.from({ length: legendSteps + 1 }, (_, idx) =>
      d3.quantileSorted(sorted, idx / legendSteps)
    );

    const items = [];

    for (let i = 0; i < legendSteps; i += 1) {
      const start = thresholds[i];
      const end = thresholds[i + 1];
      if (start == null || end == null) continue;

      const valuesInRange = sorted.filter((value) =>
        i === legendSteps - 1
          ? value >= start && value <= end
          : value >= start && value < end
      );

      if (!valuesInRange.length) continue;

      const midValue = valuesInRange[Math.floor(valuesInRange.length / 2)];
      const baseColor = colorScale(midValue);
      const colorObj = d3.color(baseColor);
      const color = colorObj
        ? darker
          ? colorObj.darker(0.3).formatHex()
          : colorObj.formatHex()
        : "#999999";

      const roundedStart = Math.round(start);
      const roundedEnd = Math.round(end);
      const lastItem = items[items.length - 1];
      if (
        lastItem &&
        Math.round(lastItem.rangeMin) === roundedStart &&
        Math.round(lastItem.rangeMax) === roundedEnd
      ) {
        continue;
      }

      items.push({ color, rangeMin: start, rangeMax: end });
    }

    return items;
  };

  const cityValues = cities
    .map((c) => c[config.keyCity])
    .filter((value) => typeof value === "number" && value > 0);

  const cityMin = cityValues.length ? d3.min(cityValues) : 0;
  const cityMax = cityValues.length ? d3.max(cityValues) : 1;
  const cityDomainMin = cityMin;
  const cityDomainMax = cityMax === cityMin ? cityMin + 1 : cityMax;

  const cityColorScale = d3
    .scaleSequential(CITY_SCHEME)
    .domain(
      config.reverse
        ? [cityDomainMax, cityDomainMin]
        : [cityDomainMin, cityDomainMax]
    );

  const cityLegendItems = buildLegendItems(cityValues, cityColorScale);

  let countryLegendItems = [];
  if (config.keyCountry) {
    const countryValues = countryData
      .map((c) => c[config.keyCountry])
      .filter((value) => typeof value === "number" && value > 0);

    if (countryValues.length) {
      const countryMin = d3.min(countryValues);
      const countryMax = d3.max(countryValues);
      const countryDomainMin = countryMin;
      const countryDomainMax =
        countryMax === countryMin ? countryMin + 1 : countryMax;

      const countryColorScale = d3
        .scaleSequential(config.scheme)
        .domain(
          config.reverse
            ? [countryDomainMax, countryDomainMin]
            : [countryDomainMin, countryDomainMax]
        );

      countryLegendItems = buildLegendItems(
        countryValues,
        countryColorScale,
        true
      );
    }
  }

  const cityIndicatorColor =
    cityLegendItems[Math.floor(cityLegendItems.length / 2)]?.color || "#ffffff";
  const countryIndicatorColor =
    countryLegendItems[Math.floor(countryLegendItems.length / 2)]?.color ||
    "#ffffff";
  const legendColumns =
    config.keyCountry && countryLegendItems.length > 0 ? 2 : 1;

  return (
    <div
      ref={containerRef}
      className="chart-container"
      style={{
        height: "680px",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-card)",
        borderRadius: "1rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          cursor: CONTINENT_CONFIG[selectedContinent].isGlobe
            ? "grab"
            : "default",
        }}
      ></svg>

      {/* Sélecteur de Continent */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: "200px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
              paddingLeft: "12px",
              fontWeight: "600",
            }}
          >
            <MapPin
              size={12}
              style={{ display: "inline", marginRight: "4px" }}
            />
            Région
          </div>
          {Object.entries(CONTINENT_CONFIG).map(([key, conf]) => (
            <button
              key={key}
              onClick={() => setSelectedContinent(key)}
              style={{
                width: "100%",
                textAlign: "left",
                background:
                  selectedContinent === key ? "var(--primary)" : "transparent",
                color: selectedContinent === key ? "#fff" : "var(--text-muted)",
                border: "none",
                padding: "10px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: selectedContinent === key ? "600" : "500",
                marginBottom: "3px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (selectedContinent !== key) {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedContinent !== key) {
                  e.target.style.background = "transparent";
                }
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    selectedContinent === key ? "#fff" : "transparent",
                  border: "1px solid currentColor",
                }}
              ></div>
              {conf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls - Sélecteur de Métrique */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: "200px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
              paddingLeft: "12px",
              fontWeight: "600",
            }}
          >
            Métrique
          </div>
          {Object.entries(METRICS).map(([key, conf]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              style={{
                width: "100%",
                textAlign: "left",
                background:
                  activeMetric === key ? "var(--primary)" : "transparent",
                color: activeMetric === key ? "#fff" : "#94a3b8",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                marginBottom: "2px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                if (activeMetric !== key) {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeMetric !== key) {
                  e.target.style.background = "transparent";
                }
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: activeMetric === key ? "#fff" : "transparent",
                  border: "1px solid currentColor",
                }}
              ></div>
              {conf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            padding: "6px 12px",
            borderRadius: "6px",
            color: "#94a3b8",
            fontSize: "11px",
            textAlign: "right",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              justifyContent: "flex-end",
            }}
          >
            {CONTINENT_CONFIG[selectedContinent].isGlobe ? (
              <>
                <RefreshCw size={12} /> Glisser pour Rotation
              </>
            ) : (
              <>
                <ZoomIn size={12} /> Zoom &amp; Glisser pour Déplacer
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          pointerEvents: "none",
          maxWidth: "500px",
        }}
      >
        <div
          style={{
            background: "var(--bg-legend)",
            padding: "18px 20px",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: "700",
            }}
          >
            Légende
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "var(--text-main)",
              marginBottom: "18px",
              lineHeight: "1.3",
            }}
          >
            {METRICS[activeMetric].label}
          </div>

          {/* Two Column Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${legendColumns}, minmax(0, 1fr))`,
              columnGap: "24px",
              rowGap: "18px",
              alignItems: "start",
            }}
          >
            {/* Country Fill Color Scale - First Column */}
            {config.keyCountry && countryLegendItems.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-main)",
                    marginBottom: "10px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "10px",
                      borderRadius: "2px",
                      background: countryIndicatorColor,
                      border: "1px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 0 6px rgba(255,255,255,0.2)",
                    }}
                  ></div>
                  Pays (Moyenne)
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {countryLegendItems.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "22px",
                          borderRadius: "4px",
                          background: item.color,
                          border: "1px solid rgba(255,255,255,0.2)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          flexShrink: 0,
                        }}
                      ></div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          fontWeight: "500",
                        }}
                      >
                        {formatRange(item.rangeMin, item.rangeMax)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* City Dots Color Scale - Second Column */}
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-main)",
                  marginBottom: "10px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: cityIndicatorColor,
                    border: "2px solid #fff",
                    boxShadow: "0 0 8px rgba(255,255,255,0.3)",
                  }}
                ></div>
                Villes
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {cityLegendItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "22px",
                        borderRadius: "4px",
                        background: item.color,
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        flexShrink: 0,
                      }}
                    ></div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: "500",
                      }}
                    >
                      {formatRange(item.rangeMin, item.rangeMax)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && !isDragging.current && (
        <div
          className="chart-tooltip"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            transform: "translate(-50%, -120%)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <div style={{ fontWeight: "bold" }}>{tooltip.data.city}</div>
          <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
            {tooltip.data.country}
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}
          >
            {METRICS[activeMetric].label}:{" "}
            <strong>
              ${tooltip.data[METRICS[activeMetric].keyCity]?.toFixed(0)}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};

WorldMap.propTypes = {
  countryData: PropTypes.array.isRequired,
  cities: PropTypes.array.isRequired,
  onHover: PropTypes.func,
};

export default WorldMap;
