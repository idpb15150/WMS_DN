
import React, { createContext, useState, useContext, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthData {
  message: string;
  commonname: string;
  token: string;
  role: string | null;
}

interface AuthContextProps {
  authData: AuthData | null;
  setAuthData: (data: AuthData) => void;
}

const AuthContext = createContext<AuthContextProps>({
  authData: null,
  setAuthData: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authData, setAuthDataState] = useState<AuthData | null>(null);

  const setAuthData = (data: AuthData) => {
    let role: string | null = null;
    try {
      const decoded: any = jwtDecode(data.token);
      role = decoded.role || null;
    } catch (err) {
      console.error("Invalid token");
    }
    setAuthDataState({ ...data, role });
  };

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
