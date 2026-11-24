import { COMPANIES_DATABASE } from "../data/companiesData";

/**
 * Official MCA CIN Regular Expression:
 * 1 letter (L or U)
 * 5 digits (NIC Code)
 * 2 letters (State Code)
 * 4 digits (Year of Incorporation)
 * 3 letters (Company Type: PLC, PTC, GOI, SGC, NPL, etc.)
 * 6 digits (Registration Number)
 */
export const MCA_CIN_REGEX = /\b([LUlu]\d{5}[A-Za-z]{2}\d{4}[A-Za-z]{3}\d{6})\b/g;

/**
 * Checks whether a single string is a valid MCA CIN format.
 */
export function isValidCINFormat(cinStr = "") {
  if (!cinStr) return false;
  return /^[LUlu]\d{5}[A-Za-z]{2}\d{4}[A-Za-z]{3}\d{6}$/.test(cinStr.trim());
}

/**
 * Extracts all valid MCA CIN strings from text.
 */
export function extractCINs(text = "") {
  if (!text) return [];
  const matches = text.match(MCA_CIN_REGEX);
  if (!matches) return [];
  return [...new Set(matches.map((c) => c.toUpperCase()))];
}

/**
 * Finds a registered company from the 1000-company database by exact or partial CIN.
 */
export function findCompanyByCIN(cin = "") {
  if (!cin) return null;
  const upper = cin.trim().toUpperCase();
  return (
    COMPANIES_DATABASE.find(
      (c) => c.cin.toUpperCase() === upper,
    ) || null
  );
}

/**
 * Searches the 1000 companies by name, alias, CIN, domain, or sector.
 */
export function searchCompanies(query = "", limit = 25) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  return COMPANIES_DATABASE.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.cin.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q)))
    );
  }).slice(0, limit);
}

/**
 * Verifies any company names and CIN mentions within candidate text or offer letters.
 */
export function verifyDocumentCompanyAndCIN(text = "") {
  if (!text) return null;
  const normalized = text.toLowerCase();

  // 1. Extract valid CINs
  const detectedCINs = extractCINs(text);

  // 2. Check for fake CIN patterns (e.g., "CIN: 123456" or "CIN: ABC12345" which fail standard MCA 21-char format)
  const suspiciousCINPattern = /(?:cin|corporate identity no|registration no)[\s:.-]*([a-z0-9]{5,25})/gi;
  let fakeCinMatch = null;
  let rawMatch;
  while ((rawMatch = suspiciousCINPattern.exec(text)) !== null) {
    const candidate = rawMatch[1].trim();
    if (candidate.length >= 6 && candidate.length <= 25 && !isValidCINFormat(candidate)) {
      // If it mentions CIN explicitly but is not 21 valid chars
      fakeCinMatch = candidate;
      break;
    }
  }

  // 3. Match known companies from database
  const matchedCompanies = [];
  for (const company of COMPANIES_DATABASE) {
    // Check main name
    const compNameLower = company.name.toLowerCase();
    if (normalized.includes(compNameLower)) {
      matchedCompanies.push(company);
      continue;
    }
    // Check aliases
    if (company.aliases && company.aliases.length > 0) {
      const aliasMatch = company.aliases.find(
        (alias) => alias.length >= 4 && normalized.includes(alias.toLowerCase()),
      );
      if (aliasMatch) {
        matchedCompanies.push(company);
      }
    }
  }

  // Cross-reference CIN with matched companies
  let verifiedCompany = null;
  let cinMismatch = false;

  if (detectedCINs.length > 0) {
    for (const cin of detectedCINs) {
      const found = findCompanyByCIN(cin);
      if (found) {
        verifiedCompany = found;
        break;
      }
    }
    // If a company was claimed and CIN is present, check match
    if (matchedCompanies.length > 0 && verifiedCompany) {
      const isConsistent = matchedCompanies.some(
        (mc) => mc.cin === verifiedCompany.cin,
      );
      if (!isConsistent) {
        cinMismatch = true;
      }
    }
  }

  return {
    detectedCINs,
    fakeCinMatch,
    matchedCompanies: matchedCompanies.slice(0, 5),
    verifiedCompany,
    cinMismatch,
  };
}
