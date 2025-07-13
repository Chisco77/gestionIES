import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProviderCustom = ({ children }) => {
  const [tituloActivo, setTituloActivo] = useState(null);
  return (
    <SidebarContext.Provider value={{ tituloActivo, setTituloActivo }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => useContext(SidebarContext);
