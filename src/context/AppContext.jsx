import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../utils/translations";
import {
  authenticateUser,
  registerUser,
  loadAuthSession,
  clearAuthSession,
} from "../utils/auth";

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

const safeJsonParse = (str, fallback) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    console.error("JSON parsing error:", e);
    return fallback;
  }
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("scamshield_theme") || "dark";
  });

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("scamshield_lang") || "en";
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("scamshield_lang", lang);
  };

  const t = (key, fallback = "") => {
    return (
      translations[language]?.[key] ||
      translations["en"]?.[key] ||
      fallback ||
      key
    );
  };

  // Initialize authentication from verified token and stored profile
  const [sessionState, setSessionState] = useState(() => loadAuthSession());
  const user = sessionState.user;
  const token = sessionState.token;
  const isAuthenticated = Boolean(user && token);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Synchronize authentication across tabs or on BFcache pageshow
  useEffect(() => {
    const handleStorageSync = () => {
      const current = loadAuthSession();
      if (!current.isAuthenticated && isAuthenticated) {
        setSessionState({ token: null, user: null, isAuthenticated: false });
      } else if (current.isAuthenticated && current.token !== token) {
        setSessionState(current);
      }
    };

    window.addEventListener("storage", handleStorageSync);
    window.addEventListener("pageshow", handleStorageSync);
    return () => {
      window.removeEventListener("storage", handleStorageSync);
      window.removeEventListener("pageshow", handleStorageSync);
    };
  }, [isAuthenticated, token]);

  const getUserKey = () => {
    return user
      ? `scamshield_history_${user.email.toLowerCase()}`
      : "scamshield_history_guest";
  };

  const [history, setHistory] = useState(() => {
    const current = loadAuthSession();
    if (current.isAuthenticated && current.user) {
      const userKey = `scamshield_history_${current.user.email.toLowerCase()}`;
      const savedHistory = localStorage.getItem(userKey);
      if (savedHistory) {
        return safeJsonParse(savedHistory, []);
      }
    }
    return [];
  });

  const [activeScan, _setActiveScan] = useState(() => {
    try {
      const saved = sessionStorage.getItem("scamshield_active_scan");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  const setActiveScan = (scan) => {
    _setActiveScan(scan);
    try {
      if (scan) {
        let storableScan = scan;
        if (scan.preview && typeof scan.preview === "string" && scan.preview.length > 200000) {
          storableScan = { ...scan, preview: null };
        }
        sessionStorage.setItem("scamshield_active_scan", JSON.stringify(storableScan));
      } else {
        sessionStorage.removeItem("scamshield_active_scan");
      }
    } catch (e) {
      console.warn("sessionStorage active scan sync error:", e);
    }
  };

  const safeSaveHistory = (updatedHistory) => {
    try {
      localStorage.setItem(getUserKey(), JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn("Storage quota exceeded, stripping large preview images:", err);
      try {
        const sanitized = updatedHistory.map((item, idx) => ({
          ...item,
          preview: (idx < 2 && typeof item.preview === "string" && item.preview.length < 50000) ? item.preview : null,
        }));
        localStorage.setItem(getUserKey(), JSON.stringify(sanitized));
      } catch (innerErr) {
        console.error("Critical localStorage write failure:", innerErr);
      }
    }
  };

  useEffect(() => {
    if (user) {
      const userKey = `scamshield_history_${user.email.toLowerCase()}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setHistory(safeJsonParse(saved, []));
      } else {
        setHistory([]);
        localStorage.setItem(userKey, JSON.stringify([]));
      }
    } else {
      setHistory([]);
      setActiveScan(null);
    }
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("scamshield_theme", theme);
  }, [theme]);

  const login = async (email, password, remember = true) => {
    setIsAuthLoading(true);
    try {
      const res = await authenticateUser({ email, password, remember });
      if (res.success) {
        setSessionState({
          token: res.token,
          user: res.user,
          isAuthenticated: true,
        });
      }
      return res;
    } catch (err) {
      console.error("Login authentication error:", err);
      return {
        success: false,
        message: "An unexpected error occurred during login. Please try again.",
      };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setIsAuthLoading(true);
    try {
      return await registerUser({ name, email, password });
    } catch (err) {
      console.error("Signup error:", err);
      return {
        success: false,
        message: "An unexpected error occurred during registration. Please try again.",
      };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    setSessionState({ token: null, user: null, isAuthenticated: false });
    setActiveScan(null);
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
  };

  const addScan = (filename, text, result, preview) => {
    const newScan = {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      filename: filename || "Text Input Analysis",
      text,
      result,
      chatHistory: [],
      preview: preview || null,
    };

    const updated = [newScan, ...history];
    setHistory(updated);
    safeSaveHistory(updated);
    setActiveScan(newScan);
    return newScan;
  };

  const deleteScan = (id) => {
    const scanToDelete = history.find((scan) => scan.id === id);
    if (
      scanToDelete &&
      scanToDelete.preview &&
      scanToDelete.preview.startsWith("blob:")
    ) {
      try {
        URL.revokeObjectURL(scanToDelete.preview);
      } catch (err) {
        console.error("Failed to revoke object URL:", err);
      }
    }
    const updated = history.filter((scan) => scan.id !== id);
    setHistory(updated);
    safeSaveHistory(updated);

    if (activeScan && activeScan.id === id) {
      setActiveScan(null);
    }
  };

  const clearAllHistory = () => {
    history.forEach((scan) => {
      if (scan.preview && scan.preview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(scan.preview);
        } catch (err) {
          console.error("Failed to revoke object URL:", err);
        }
      }
    });
    setHistory([]);
    safeSaveHistory([]);
    setActiveScan(null);
  };

  const updateScanChat = (scanId, sender, messageText) => {
    const updated = history.map((scan) => {
      if (scan.id === scanId) {
        return {
          ...scan,
          chatHistory: [
            ...scan.chatHistory,
            { sender, text: messageText, timestamp: new Date().toISOString() },
          ],
        };
      }
      return scan;
    });

    setHistory(updated);
    localStorage.setItem(getUserKey(), JSON.stringify(updated));

    if (activeScan && activeScan.id === scanId) {
      setActiveScan((prev) => ({
        ...prev,
        chatHistory: [
          ...prev.chatHistory,
          { sender, text: messageText, timestamp: new Date().toISOString() },
        ],
      }));
    }
  };

  const [shouldOpenFilePicker, setShouldOpenFilePicker] = useState(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isHelplineModalOpen, setIsHelplineModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const openHelpline = () => {
    const isMobile =
      typeof navigator !== "undefined" &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
        (typeof window !== "undefined" &&
          window.innerWidth < 768 &&
          window.matchMedia("(pointer: coarse)").matches));

    if (isMobile) {
      window.location.href = "tel:1930";
    } else {
      setIsHelplineModalOpen(true);
    }
  };

  const addToast = (message, type = "info") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        user,
        token,
        isAuthenticated,
        isAuthLoading,
        login,
        signup,
        logout,
        history,
        activeScan,
        setActiveScan,
        addScan,
        deleteScan,
        clearAllHistory,
        updateScanChat,
        shouldOpenFilePicker,
        setShouldOpenFilePicker,
        isLeftDrawerOpen,
        setIsLeftDrawerOpen,
        isRightDrawerOpen,
        setIsRightDrawerOpen,
        isHelplineModalOpen,
        setIsHelplineModalOpen,
        openHelpline,
        toasts,
        addToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
