import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ApiFetch, getValidToken } from "../utils/api";
import { tokenStore } from "../utils/token";
import { MapAvatar, type Avatar, type AvatarApi } from "../types/avatar";

interface AuthContextValue {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  refreshToken(): Promise<void>;
  setAuthenticatedUser(user: AvatarApi): void;
  user: Avatar | null;
  logout(): Promise<void>;
}

interface AuthProviderInterface {
  children: React.ReactNode;
}

const authContext = createContext<AuthContextValue>({
  loading: true,
  setLoading: () => {},
  refreshToken: () => Promise.resolve(),
  setAuthenticatedUser: () => {},
  user: null,
  logout: () => Promise.resolve(),
});

const AuthProvider: React.FC<AuthProviderInterface> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Avatar | null>(null);

  const setAuthenticatedUser = useCallback((userData: AvatarApi) => {
    setUser(MapAvatar(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await ApiFetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.status === 200) {
        console.log("logging out...");
      } else {
        console.error("Something went wrong during logout.");
      }
    } catch (err) {
      // network / refresh errors can happen — we still clear local state
      console.error("Logout request failed", err);
    } finally {
      tokenStore.clear();
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // When other code dispatches `auth:logout` (e.g. session expired),
    // only perform local cleanup here to avoid calling network logout
    // which can trigger the same 401 -> refresh -> dispatch loop.
    const handleExternalLogout = () => {
      tokenStore.clear();
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:logout", handleExternalLogout);
    return () =>
      window.removeEventListener("auth:logout", handleExternalLogout);
  }, []);

  async function refreshToken() {
    const token = tokenStore.get();
    if (token === null) {
      setLoading(true);
      try {
        const refreshedSession = await getValidToken();
        setAuthenticatedUser(refreshedSession.user);
      } catch (err) {
        console.error(err);
        throw new Error("Token refresh failed");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <authContext.Provider
      value={{
        loading,
        setLoading,
        refreshToken,
        setAuthenticatedUser,
        user,
        logout,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

const useAuth = () => useContext(authContext);

export { useAuth, AuthProvider };
