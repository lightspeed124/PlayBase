"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { detectCity } from "@/lib/geo";

interface CityContextType {
  city: string;
  loading: boolean;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({
  city: "",
  loading: true,
  setCity: () => {},
});

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectCity().then((detected) => {
      setCity(detected || "your area");
      setLoading(false);
    });
  }, []);

  return (
    <CityContext.Provider value={{ city, loading, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
