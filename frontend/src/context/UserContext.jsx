import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem("userLocation");
    return saved
      ? JSON.parse(saved)
      : {
          locationName: "Fetching location...",
          coords: null,
          source: null, // gps | manual
        };
  });

  // Persist location
  useEffect(() => {
    localStorage.setItem("userLocation", JSON.stringify(userLocation));
  }, [userLocation]);

  return (
    <UserContext.Provider value={{ userLocation, setUserLocation }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
