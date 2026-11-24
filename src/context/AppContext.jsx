import React, { createContext, useContext, useState, useEffect } from "react";
import { analyzeScam } from "../utils/scamAnalyzer";
import { translations } from "../utils/translations";

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

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("scamshield_user");
    return saved ? safeJsonParse(saved, null) : null;
  });

  const getUserKey = () => {
    return user
      ? `scamshield_history_${user.email.toLowerCase()}`
      : "scamshield_history_guest";
  };

  const [history, setHistory] = useState(() => {
    const savedUser = localStorage.getItem("scamshield_user");
    if (savedUser) {
      const parsedUser = safeJsonParse(savedUser, null);
      if (parsedUser) {
        const userKey = `scamshield_history_${parsedUser.email.toLowerCase()}`;
        const savedHistory = localStorage.getItem(userKey);
        if (savedHistory) {
          return safeJsonParse(savedHistory, []);
        }
        if (parsedUser.email.toLowerCase() === "admin@scamshield.ai") {
          const seed = [
            {
              id: "seed-1",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000,
              ).toISOString(),
              filename: "Remote Data Entry Job Offer.pdf",
              text: "Congratulations! You have been selected for our Work From Home Data Entry position. The pay is $45 per hour. To proceed, please pay a registration fee of $30 to cover the software licensing fee. We guarantee 100% placement and limited seats are available. Pay now immediately to secure your seat.",
              result: analyzeScam(
                "Congratulations! You have been selected for our Work From Home Data Entry position. The pay is $45 per hour. To proceed, please pay a registration fee of $30 to cover the software licensing fee. We guarantee 100% placement and limited seats are available. Pay now immediately to secure your seat.",
                "Remote Data Entry Job Offer.pdf",
              ),
              chatHistory: [
                {
                  sender: "user",
                  text: "Is this real? They sent this PDF via Telegram.",
                  timestamp: new Date(
                    Date.now() - 23.9 * 60 * 60 * 1000,
                  ).toISOString(),
                },
                {
                  sender: "ai",
                  text: 'This job offer exhibits multiple critical scam indicators. Firstly, legitimate companies never charge a "registration fee" or "software fee" to employees. Secondly, the urgency to "pay now immediately" and "limited seats" are pressure tactics used in advance-fee employment scams. I highly recommend cutting contact.',
                  timestamp: new Date(
                    Date.now() - 23.8 * 60 * 60 * 1000,
                  ).toISOString(),
                },
              ],
            },
            {
              id: "seed-2",
              timestamp: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              filename: "Google Software Engineer Offer.png",
              text: "Thank you for your interest in Google. We are pleased to offer you the position of Software Engineer in our Mountain View campus. Your compensation will include a base salary, stock options, and full health benefits. The formal background check will begin once you sign the agreement. No payment is required.",
              result: analyzeScam(
                "Thank you for your interest in Google. We are pleased to offer you the position of Software Engineer in our Mountain View campus. Your compensation will include a base salary, stock options, and full health benefits. The formal background check will begin once you sign the agreement. No payment is required.",
                "Google Software Engineer Offer.png",
              ),
              chatHistory: [],
            },
          ];
          localStorage.setItem(userKey, JSON.stringify(seed));
          return seed;
        }
      }
    }
    return [];
  });

  const [activeScan, setActiveScan] = useState(null);

  useEffect(() => {
    if (user) {
      const userKey = `scamshield_history_${user.email.toLowerCase()}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setHistory(safeJsonParse(saved, []));
      } else {
        if (user.email.toLowerCase() === "admin@scamshield.ai") {
          const seed = [
            {
              id: "seed-1",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000,
              ).toISOString(),
              filename: "Remote Data Entry Job Offer.pdf",
              text: "Congratulations! You have been selected for our Work From Home Data Entry position. The pay is $45 per hour. To proceed, please pay a registration fee of $30 to cover the software licensing fee. We guarantee 100% placement and limited seats are available. Pay now immediately to secure your seat.",
              result: analyzeScam(
                "Congratulations! You have been selected for our Work From Home Data Entry position. The pay is $45 per hour. To proceed, please pay a registration fee of $30 to cover the software licensing fee. We guarantee 100% placement and limited seats are available. Pay now immediately to secure your seat.",
                "Remote Data Entry Job Offer.pdf",
              ),
              chatHistory: [
                {
                  sender: "user",
                  text: "Is this real? They sent this PDF via Telegram.",
                  timestamp: new Date(
                    Date.now() - 23.9 * 60 * 60 * 1000,
                  ).toISOString(),
                },
                {
                  sender: "ai",
                  text: 'This job offer exhibits multiple critical scam indicators. Firstly, legitimate companies never charge a "registration fee" or "software fee" to employees. Secondly, the urgency to "pay now immediately" and "limited seats" are pressure tactics used in advance-fee employment scams. I highly recommend cutting contact.',
                  timestamp: new Date(
                    Date.now() - 23.8 * 60 * 60 * 1000,
                  ).toISOString(),
                },
              ],
            },
            {
              id: "seed-2",
              timestamp: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              filename: "Google Software Engineer Offer.png",
              text: "Thank you for your interest in Google. We are pleased to offer you the position of Software Engineer in our Mountain View campus. Your compensation will include a base salary, stock options, and full health benefits. The formal background check will begin once you sign the agreement. No payment is required.",
              result: analyzeScam(
                "Thank you for your interest in Google. We are pleased to offer you the position of Software Engineer in our Mountain View campus. Your compensation will include a base salary, stock options, and full health benefits. The formal background check will begin once you sign the agreement. No payment is required.",
                "Google Software Engineer Offer.png",
              ),
              chatHistory: [],
            },
          ];
          setHistory(seed);
          localStorage.setItem(userKey, JSON.stringify(seed));
        } else {
          setHistory([]);
          localStorage.setItem(userKey, JSON.stringify([]));
        }
      }
    } else {
      setHistory([]);
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

  const login = (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    const registeredUsers = safeJsonParse(
      localStorage.getItem("scamshield_registered_users"),
      [],
    );
    const defaultUser = {
      name: "Demo Analyst",
      email: "admin@scamshield.ai",
      password: "password123",
    };
    const allUsers = [defaultUser, ...registeredUsers];

    const match = allUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        u.password === cleanPassword,
    );

    if (match) {
      const userData = { name: match.name, email: match.email };
      setUser(userData);
      // Persist logged-in user in localStorage reliably
      localStorage.setItem("scamshield_user", JSON.stringify(userData));
      return { success: true, user: userData };
    } else {
      return {
        success: false,
        message: "Invalid email or password. Please try again!",
      };
    }
  };

  const signup = (name, email, password) => {
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    const registeredUsers = safeJsonParse(
      localStorage.getItem("scamshield_registered_users"),
      [],
    );

    if (
      cleanEmail === "admin@scamshield.ai" ||
      registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)
    ) {
      return { success: false, message: "Email is already registered. Please login." };
    }

    const newUser = { name: cleanName, email: cleanEmail, password: cleanPassword };
    registeredUsers.push(newUser);
    localStorage.setItem(
      "scamshield_registered_users",
      JSON.stringify(registeredUsers),
    );

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setActiveScan(null);
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
    localStorage.removeItem("scamshield_user");
    sessionStorage.removeItem("scamshield_user");
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
    localStorage.setItem(getUserKey(), JSON.stringify(updated));
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
    localStorage.setItem(getUserKey(), JSON.stringify(updated));

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
    localStorage.setItem(getUserKey(), JSON.stringify([]));
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
  const [toasts, setToasts] = useState([]);

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
        toasts,
        addToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
