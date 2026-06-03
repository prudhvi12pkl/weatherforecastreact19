export function groupByDay(forecastList) {
  const days = {};

  forecastList.forEach((entry) => {
    // entry.dt_txt = "2024-06-01 12:00:00"
    const date = entry.dt_txt.split(" ")[0];
    if (!days[date]) {
      days[date] = [];
    }
    days[date].push(entry);
  });

  return Object.entries(days)
    .slice(0, 5) // max 5 days
    .map(([date, entries]) => {
      // prefer the 12:00 entry; fall back to the middle entry
      const noon = entries.find((e) => e.dt_txt.includes("12:00:00"));
      const rep = noon ?? entries[Math.floor(entries.length / 2)];

      return {
        date,
        minTemp: Math.round(Math.min(...entries.map((e) => e.main.temp_min))),
        maxTemp: Math.round(Math.max(...entries.map((e) => e.main.temp_max))),
        description: rep.weather[0].description,
        icon: rep.weather[0].icon,
        humidity: rep.main.humidity,
      };
    });
}
