export const generateSmartTips = (city) => {
  if (!city) return [];

  const tips = [];
  const {
    city: name,
    country,
    apt_1bed_city_center,
    apt_1bed_outside_center,
    salary,
    estimated_monthly_cost_single,
    mc_meal,
    internet,
    safety_index, // Assuming this might exist or we use proxies
    quality_of_life_index, // Assuming this might exist
  } = city;

  // 1. Rent Savings Tip (Center vs Outside)
  const rentSaving = apt_1bed_city_center - apt_1bed_outside_center;
  const rentSavingPercent = (rentSaving / apt_1bed_city_center) * 100;

  if (rentSavingPercent > 25) {
    tips.push({
      type: "savings",
      title: "Huge Rent Savings",
      text: `Moving just outside the center of ${name} saves you about ${rentSavingPercent.toFixed(
        0
      )}% on rent ($${rentSaving.toFixed(
        0
      )}/mo). That's a huge boost to your student budget!`,
      icon: "🏠",
    });
  } else if (rentSavingPercent < 10) {
    tips.push({
      type: "info",
      title: "City Center Living",
      text: `Rent prices in ${name} are surprisingly similar across the city. You might as well live centrally to save on transport usage!`,
      icon: "🏙️",
    });
  }

  // 2. Salary vs Cost Reality Check
  const coverage = (salary / estimated_monthly_cost_single) * 100;
  if (coverage < 100) {
    tips.push({
      type: "warning",
      title: "Budget Warning",
      text: `Average local salaries covers only ${coverage.toFixed(
        0
      )}% of living costs. You'll likely need external funding or savings to study here comfortably without stress.`,
      icon: "⚠️",
    });
  } else if (coverage > 150) {
    tips.push({
      type: "success",
      title: "Student Friendly Econ",
      text: `Great choice! Local purchasing power is strong. A part-time job could significantly offset your living expenses in ${name}.`,
      icon: "💰",
    });
  }

  // 3. Food/Lifestyle Tip
  if (mc_meal > 10) {
    tips.push({
      type: "lifestyle",
      title: "Cook at Home",
      text: `Eating out is pricey here (~$${mc_meal.toFixed(
        2
      )}/meal). Mastering a few simple recipes will save you hundreds per semester compared to fast food.`,
      icon: "🍳",
    });
  } else if (mc_meal < 5) {
    tips.push({
      type: "lifestyle",
      title: "Foodie Paradise",
      text: `Street food and casual dining are very affordable (~$${mc_meal.toFixed(
        2
      )}). Enjoying the local cuisine won't break your bank!`,
      icon: "🍜",
    });
  }

  // 4. Digital Nomad / Connectivity
  if (internet > 60) {
    tips.push({
      type: "tech",
      title: "Pricey Connectivity",
      text: `Internet is expensive (~$${internet.toFixed(
        0
      )}/mo). Look for student housing with included utilities or WiFi-friendly cafes to work from.`,
      icon: "wifi",
    });
  } else {
    tips.push({
      type: "tech",
      title: "Digital Friendly",
      text: `Internet is reasonably priced (~$${internet.toFixed(0)}/mo).`,
      icon: "💻",
    });
  }

  // 5. Generic fun fact or vibe check (Randomized for variety if needed, or based on specific data points if available)
  // For now, let's add a "Safety/General" placeholder if we had data, currently just data-derived.

  return tips;
};
