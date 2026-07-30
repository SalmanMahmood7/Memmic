import { useEffect, useState } from "react";

function getLondonTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function useLondonTime() {
  const [time, setTime] = useState(getLondonTime);

  useEffect(() => {
    const interval = setInterval(() => setTime(getLondonTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}
