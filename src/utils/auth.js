/**
 * Production-Grade Client Authentication & Token Management Service
 * - Secure Salted SHA-256 Cryptographic Password Hashing (Web Crypto API)
 * - Standard JWT-structured Authentication Tokens with Expiration
 * - Persistent vs Session Storage (Remember Me support)
 * - Token verification & automatic expired session revocation
 */

const AUTH_TOKEN_KEY = "scamshield_auth_token";
const AUTH_USER_KEY = "scamshield_user";
const REGISTERED_USERS_KEY = "scamshield_registered_users";

/**
 * Base64URL Encoding & Decoding helpers
 */
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Generates a random cryptographic salt hex string
 */
export function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Hashes a password with a cryptographic salt using SHA-256
 */
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a secure structured JWT-like authentication token
 * Header + Payload + Signature
 */
export function generateToken(user, remember = true) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (remember ? 7 * 24 * 3600 : 24 * 3600); // 7 days or 24 hours

  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id || user.email,
      email: user.email.toLowerCase(),
      name: user.name,
      iat: now,
      exp: exp,
      remember: !!remember,
    })
  );

  // Random 256-bit cryptographic signature token
  const sigArray = new Uint8Array(32);
  crypto.getRandomValues(sigArray);
  const signature = Array.from(sigArray, (b) => b.toString(16).padStart(2, "0")).join("");

  return `${header}.${payload}.${signature}`;
}

/**
 * Verifies an authentication token's format and expiration
 */
export function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "malformed_token" };
  }

  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    if (!payload.exp || !payload.email) {
      return { valid: false, reason: "invalid_payload" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.exp) {
      return { valid: false, reason: "token_expired", expiredAt: payload.exp };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error("Token verification parse error:", err);
    return { valid: false, reason: "token_parse_error" };
  }
}

/**
 * Safely parse JSON with fallback
 */
function safeJsonParse(str, fallback = null) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Reads registered users from persistent storage
 */
export function getRegisteredUsers() {
  return safeJsonParse(localStorage.getItem(REGISTERED_USERS_KEY), []);
}

/**
 * Saves registered users to persistent storage
 */
function saveRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

/**
 * Finds user by email in registered storage
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

/**
 * Registers a new user with salted cryptographic password hash
 */
export async function registerUser({ name, email, password }) {
  const cleanName = (name || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  if (!cleanName || !cleanEmail || !cleanPassword) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: "Please provide a valid email address." };
  }

  if (cleanPassword.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long." };
  }

  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return { success: false, message: "An account with this email is already registered. Please sign in." };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(cleanPassword, salt);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  const users = getRegisteredUsers();
  users.push(newUser);
  saveRegisteredUsers(users);

  return {
    success: true,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  };
}

/**
 * Authenticates user credentials and returns a valid session and token
 */
export async function authenticateUser({ email, password, remember = true }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, message: "Please enter both email and password." };
  }

  const userRecord = findUserByEmail(cleanEmail);
  if (!userRecord) {
    return {
      success: false,
      message: "No account found with this email. Please check your email or sign up.",
    };
  }

  // Handle password verification (salted hash or legacy plain password upgrade)
  let isPasswordValid = false;
  if (userRecord.passwordHash && userRecord.salt) {
    const computedHash = await hashPassword(cleanPassword, userRecord.salt);
    isPasswordValid = computedHash === userRecord.passwordHash;
  } else if (userRecord.password) {
    // Legacy migration: user previously registered before hash upgrade
    if (userRecord.password === cleanPassword) {
      isPasswordValid = true;
      // Automatically upgrade to salted hash
      const salt = generateSalt();
      const passwordHash = await hashPassword(cleanPassword, salt);
      delete userRecord.password;
      userRecord.salt = salt;
      userRecord.passwordHash = passwordHash;
      const allUsers = getRegisteredUsers().map((u) =>
        u.email.toLowerCase() === cleanEmail ? userRecord : u
      );
      saveRegisteredUsers(allUsers);
    }
  }

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Incorrect password. Please try again.",
    };
  }

  const safeUser = {
    id: userRecord.id || userRecord.email,
    name: userRecord.name,
    email: userRecord.email,
  };

  const token = generateToken(safeUser, remember);
  saveAuthSession(token, safeUser, remember);

  return {
    success: true,
    user: safeUser,
    token,
  };
}

/**
 * Saves authenticated session and token into proper browser storage
 */
export function saveAuthSession(token, user, remember = true) {
  const userData = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, userData);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  } else {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_USER_KEY, userData);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

/**
 * Loads current authentication session, verifying token validity and expiration
 */
export function loadAuthSession() {
  // Check sessionStorage first, then localStorage
  let token = sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  let userStr = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);

  if (!token || !userStr) {
    clearAuthSession();
    return { token: null, user: null, isAuthenticated: false };
  }

  const verification = verifyToken(token);
  if (!verification.valid) {
    console.warn(`[Auth] Session invalid (${verification.reason}), clearing credentials.`);
    clearAuthSession();
    return { token: null, user: null, isAuthenticated: false, reason: verification.reason };
  }

  const user = safeJsonParse(userStr, null);
  if (!user || !user.email) {
    clearAuthSession();
    return { token: null, user: null, isAuthenticated: false };
  }

  return { token, user, isAuthenticated: true };
}

/**
 * Clears all authentication tokens, session data, and user profile
 */
export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}
