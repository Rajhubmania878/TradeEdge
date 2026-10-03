// server.ts
import path2 from "path";
import fs2 from "fs";
import express2 from "express";

// server/app.ts
import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";

// server/modules/auth/auth.routes.ts
import { Router } from "express";

// server/shared/store.ts
import crypto from "crypto";
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "_RATIO_SPREAD_SALT_2026").digest("hex");
}
var usersStore = /* @__PURE__ */ new Map();
var sessionsStore = /* @__PURE__ */ new Map();
var savedStrategiesStore = [];
var defaultUsers = [
  {
    id: "user_admin_001",
    email: "admin@ratiospread.com",
    passwordHash: hashPassword("Admin123!"),
    displayName: "System Admin",
    role: "ADMIN",
    plan: "PRO",
    isActive: true,
    verified: true,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1e3,
    lastLoginAt: Date.now()
  },
  {
    id: "user_pro_002",
    email: "pro@ratiospread.com",
    passwordHash: hashPassword("Pro123!"),
    displayName: "Pro Trader",
    role: "USER",
    plan: "PRO",
    isActive: true,
    verified: true,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1e3,
    lastLoginAt: Date.now()
  },
  {
    id: "user_free_003",
    email: "demo@ratiospread.com",
    passwordHash: hashPassword("User123!"),
    displayName: "Free User",
    role: "USER",
    plan: "FREE",
    isActive: true,
    verified: true,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1e3,
    lastLoginAt: Date.now()
  }
];
defaultUsers.forEach((u) => usersStore.set(u.id, u));
savedStrategiesStore.push({
  id: "strat_01",
  userId: "user_pro_002",
  name: "RELIANCE 1:3 Bull Spread",
  exchange: "NSE",
  underlying: "RELIANCE",
  expiry: "29-Oct-2026",
  ratioLong: 1,
  ratioShort: 3,
  gap: 50,
  cnt: 5,
  stk: "AUTO",
  referenceMode: "ATM",
  optionType: "CE",
  minStrike: "ALL",
  maxStrike: "ALL",
  createdAt: Date.now()
});

// server/modules/auth/auth.repository.ts
var AuthRepository = class {
  findUserById(id) {
    return usersStore.get(id) || null;
  }
  findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    for (const user of usersStore.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return user;
      }
    }
    return null;
  }
  createUser(user) {
    usersStore.set(user.id, user);
  }
  createSession(token, userId) {
    sessionsStore.set(token, userId);
  }
  deleteSession(token) {
    sessionsStore.delete(token);
  }
  getUserIdBySession(token) {
    return sessionsStore.get(token) || null;
  }
  getAllUsers() {
    return Array.from(usersStore.values());
  }
  updateUser(user) {
    usersStore.set(user.id, user);
  }
};
var authRepository = new AuthRepository();

// server/modules/auth/auth.service.ts
var AuthService = class {
  async me(token) {
    const userId = authRepository.getUserIdBySession(token);
    if (!userId) return null;
    return authRepository.findUserById(userId);
  }
  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    const user = authRepository.findUserByEmail(cleanEmail);
    if (!user) return null;
    const hashedPassword = hashPassword(password);
    if (user.passwordHash !== hashedPassword) return null;
    const token = `sess_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    authRepository.createSession(token, user.id);
    user.lastLoginAt = Date.now();
    authRepository.updateUser(user);
    return { user, token };
  }
  async signup(email, password, displayName) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = authRepository.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error("Email is already registered.");
    }
    const hashedPassword = hashPassword(password);
    const newUser = {
      id: `user_${Date.now()}`,
      email: cleanEmail,
      passwordHash: hashedPassword,
      displayName: displayName.trim(),
      role: "USER",
      plan: "FREE",
      isActive: true,
      verified: true,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };
    authRepository.createUser(newUser);
    return newUser;
  }
  async logout(token) {
    authRepository.deleteSession(token);
  }
};
var authService = new AuthService();

// server/modules/auth/auth.controller.ts
var AuthController = class {
  async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated." });
      }
      const { passwordHash, ...safeUser } = req.user;
      return res.json({ success: true, user: safeUser });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Internal server error." });
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
      }
      const result = await authService.login(email, password);
      if (!result) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }
      const { passwordHash, ...safeUser } = result.user;
      return res.json({
        success: true,
        user: safeUser,
        token: result.token
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Internal server error." });
    }
  }
  async signup(req, res) {
    try {
      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        return res.status(400).json({ success: false, message: "Email, password, and display name are required." });
      }
      await authService.signup(email, password, displayName);
      return res.status(201).json({
        success: true,
        message: "Account created successfully. You can now log in."
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message || "Signup failed." });
    }
  }
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
      }
      return res.json({
        success: true,
        message: `Password reset instructions sent for ${email}.`
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Internal server error." });
    }
  }
  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        await authService.logout(token);
      }
      return res.json({ success: true, message: "Successfully logged out." });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Internal server error." });
    }
  }
};
var authController = new AuthController();

// server/shared/middleware/requireAuth.ts
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
  }
  const token = authHeader.split(" ")[1];
  const userId = sessionsStore.get(token);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
  }
  const user = usersStore.get(userId);
  if (!user) {
    return res.status(401).json({ success: false, message: "User account not found." });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "Your account has been suspended. Please contact admin." });
  }
  req.user = user;
  next();
}

// server/modules/auth/auth.routes.ts
var authRouter = Router();
authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);

// server/modules/market/market.routes.ts
import { Router as Router2 } from "express";

// server/config/credentials.ts
var DEFAULT_CREDENTIALS = {
  apiKey: process.env.ANGEL_API_KEY || "vTz0rnxJ",
  clientCode: process.env.ANGEL_CLIENT_CODE || "A700031",
  pin: process.env.ANGEL_PIN || "1811",
  totpSecret: process.env.ANGEL_TOTP_SECRET || "ABZDZPRGOK7SGZIS52GXKHZR5M"
};

// server/infrastructure/totp.ts
import crypto2 from "crypto";
function base32Decode(base32) {
  try {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const clean = base32.replace(/=+$/, "").toUpperCase();
    let bits = "";
    for (let i = 0; i < clean.length; i++) {
      const val = alphabet.indexOf(clean[i]);
      if (val === -1) {
        console.error("[AngelOne] Invalid base32 char: " + clean[i]);
        return Buffer.alloc(0);
      }
      bits += val.toString(2).padStart(5, "0");
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return Buffer.from(bytes);
  } catch (err) {
    console.error("[AngelOne] base32Decode failed:", err);
    return Buffer.alloc(0);
  }
}
function generateTOTP(secret) {
  try {
    const key = base32Decode(secret);
    if (key.length === 0) return "000000";
    const epoch = Math.floor(Date.now() / 1e3);
    const counter = Math.floor(epoch / 30);
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));
    const hmac = crypto2.createHmac("sha1", key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 15;
    const code = ((hmac[offset] & 127) << 24 | (hmac[offset + 1] & 255) << 16 | (hmac[offset + 2] & 255) << 8 | hmac[offset + 3] & 255) % 1e6;
    return code.toString().padStart(6, "0");
  } catch (err) {
    console.error("[AngelOne] generateTOTP failed:", err);
    return "000000";
  }
}

// server/infrastructure/angelOneClient.ts
var AngelSessionManager = class {
  constructor() {
    this.jwtToken = null;
    this.feedToken = null;
    this.refreshToken = null;
    this.lastLoginTime = 0;
    this.isLoggingIn = false;
    this.credentials = { ...DEFAULT_CREDENTIALS };
  }
  isConnected() {
    return Boolean(this.jwtToken && Date.now() - this.lastLoginTime < 18 * 60 * 60 * 1e3);
  }
  async getValidJwt() {
    if (!this.isConnected()) {
      await this.login();
    }
    return this.jwtToken;
  }
  async login() {
    if (this.isLoggingIn) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      return Boolean(this.jwtToken);
    }
    this.isLoggingIn = true;
    try {
      const totp = generateTOTP(this.credentials.totpSecret);
      const postData = JSON.stringify({
        clientcode: this.credentials.clientCode,
        password: this.credentials.pin,
        totp
      });
      const res = await fetch("https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": "192.168.1.1",
          "X-ClientPublicIP": "106.51.72.100",
          "X-MACAddress": "02-00-00-00-00-00",
          "X-PrivateKey": this.credentials.apiKey
        },
        body: postData
      });
      const data = await res.json();
      if (data.status && data.data?.jwtToken) {
        this.jwtToken = data.data.jwtToken;
        this.feedToken = data.data.feedToken || null;
        this.refreshToken = data.data.refreshToken || null;
        this.lastLoginTime = Date.now();
        console.log("[AngelOne] Successfully logged in to SmartAPI.");
        return true;
      }
      return false;
    } catch (err) {
      console.error("[AngelOne] Login error:", err);
      return false;
    } finally {
      this.isLoggingIn = false;
    }
  }
  async fetchQuote(exchange, tokens) {
    let jwt = await this.getValidJwt();
    if (!jwt) {
      throw new Error("Unable to obtain valid SmartAPI session token");
    }
    const uniqueTokens = Array.from(new Set(tokens.filter((t) => Boolean(t && String(t).trim()))));
    if (uniqueTokens.length === 0) return [];
    const chunks = [];
    for (let i = 0; i < uniqueTokens.length; i += 50) {
      chunks.push(uniqueTokens.slice(i, i + 50));
    }
    const allFetched = [];
    await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const makeRequest = async (token, timeoutMs = 8e3) => {
            return await fetch("https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/", {
              method: "POST",
              headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-ClientLocalIP": "192.168.1.1",
                "X-ClientPublicIP": "106.51.72.100",
                "X-MACAddress": "02-00-00-00-00-00",
                "X-PrivateKey": this.credentials.apiKey
              },
              body: JSON.stringify({
                mode: "FULL",
                exchangeTokens: {
                  [exchange]: chunk
                }
              }),
              signal: AbortSignal.timeout(timeoutMs)
            });
          };
          let fetchRes = null;
          try {
            fetchRes = await makeRequest(jwt);
          } catch {
            await new Promise((r) => setTimeout(r, 200));
            try {
              fetchRes = await makeRequest(jwt, 1e4);
            } catch {
              fetchRes = null;
            }
          }
          if (!fetchRes) return;
          if (fetchRes.status === 401 || fetchRes.status === 403) {
            this.jwtToken = null;
            jwt = await this.getValidJwt();
            if (jwt) {
              try {
                fetchRes = await makeRequest(jwt, 8e3);
              } catch {
                fetchRes = null;
              }
            }
          }
          if (fetchRes && fetchRes.ok) {
            const data = await fetchRes.json();
            if (data.status && Array.isArray(data.data?.fetched)) {
              allFetched.push(...data.data.fetched);
            } else if (data.errorcode === "AG8001" || data.message?.toLowerCase().includes("token")) {
              this.jwtToken = null;
            }
          }
        } catch {
        }
      })
    );
    return allFetched;
  }
};
var angelSession = new AngelSessionManager();

// server/modules/market/market.service.ts
var MarketService = class {
  getStatus() {
    return {
      connected: angelSession.isConnected(),
      clientCode: angelSession.credentials.clientCode,
      lastLogin: angelSession.isConnected(),
      mode: angelSession.isConnected() ? "LIVE_SMARTAPI" : "SIMULATED"
    };
  }
  async loginBroker(credentials) {
    if (credentials.apiKey && credentials.clientCode && credentials.pin && credentials.totpSecret) {
      angelSession.credentials = {
        apiKey: credentials.apiKey,
        clientCode: credentials.clientCode,
        pin: credentials.pin,
        totpSecret: credentials.totpSecret
      };
    }
    const success = await angelSession.login();
    return {
      success,
      connected: angelSession.isConnected(),
      clientCode: angelSession.credentials.clientCode
    };
  }
  async getQuotes(params) {
    const {
      exchange = "NFO",
      tokens = [],
      nseTokens = [],
      nfoTokens = [],
      bseTokens = [],
      bfoTokens = []
    } = params;
    const allFetched = [];
    if (Array.isArray(nseTokens) && nseTokens.length > 0) {
      const fetched = await angelSession.fetchQuote("NSE", nseTokens);
      allFetched.push(...fetched);
    }
    if (Array.isArray(nfoTokens) && nfoTokens.length > 0) {
      const fetched = await angelSession.fetchQuote("NFO", nfoTokens);
      allFetched.push(...fetched);
    }
    if (Array.isArray(bseTokens) && bseTokens.length > 0) {
      const fetched = await angelSession.fetchQuote("BSE", bseTokens);
      allFetched.push(...fetched);
    }
    if (Array.isArray(bfoTokens) && bfoTokens.length > 0) {
      const fetched = await angelSession.fetchQuote("BFO", bfoTokens);
      allFetched.push(...fetched);
    }
    if (Array.isArray(tokens) && tokens.length > 0 && nseTokens.length === 0 && nfoTokens.length === 0 && bseTokens.length === 0 && bfoTokens.length === 0) {
      const fetched = await angelSession.fetchQuote(exchange, tokens);
      allFetched.push(...fetched);
    }
    return allFetched;
  }
};
var marketService = new MarketService();

// server/modules/market/market.controller.ts
var MarketController = class {
  getStatus(req, res) {
    try {
      const status = marketService.getStatus();
      return res.json(status);
    } catch (err) {
      return res.json({
        connected: false,
        mode: "SIMULATED",
        error: err.message || "Status check failed"
      });
    }
  }
  async loginBroker(req, res) {
    try {
      const result = await marketService.loginBroker(req.body);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Broker login failed." });
    }
  }
  async getQuotes(req, res) {
    try {
      const quotes = await marketService.getQuotes(req.body);
      return res.json({
        success: true,
        data: quotes,
        simulatedFallback: quotes.length === 0
      });
    } catch (err) {
      return res.json({
        success: true,
        data: [],
        error: err.message || "Quote fetch fallback triggered"
      });
    }
  }
};
var marketController = new MarketController();

// server/shared/middleware/requireAdmin.ts
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Admin authorization required." });
  }
  next();
}

// server/modules/market/market.routes.ts
var marketRouter = Router2();
marketRouter.get("/status", marketController.getStatus);
marketRouter.post("/login", requireAuth, requireAdmin, marketController.loginBroker);
marketRouter.post("/quote", requireAuth, marketController.getQuotes);

// server/modules/strategies/strategy.routes.ts
import { Router as Router3 } from "express";

// server/modules/strategies/strategy.repository.ts
var StrategyRepository = class {
  findByUserId(userId) {
    return savedStrategiesStore.filter((s) => s.userId === userId);
  }
  create(strategy) {
    savedStrategiesStore.push(strategy);
    return strategy;
  }
  delete(id, userId) {
    const index = savedStrategiesStore.findIndex((s) => s.id === id && s.userId === userId);
    if (index !== -1) {
      savedStrategiesStore.splice(index, 1);
      return true;
    }
    return false;
  }
};
var strategyRepository = new StrategyRepository();

// server/modules/strategies/strategy.service.ts
var StrategyService = class {
  getUserStrategies(userId) {
    return strategyRepository.findByUserId(userId);
  }
  saveStrategy(userId, data) {
    const newStrategy = {
      id: `strat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: data.name || `${data.underlying || "RELIANCE"} ${data.ratioLong || 1}:${data.ratioShort || 3} (Gap \u20B9${data.gap || 50})`,
      exchange: data.exchange || "NSE",
      underlying: data.underlying || "RELIANCE",
      expiry: data.expiry || "29-Oct-2026",
      ratioLong: Number(data.ratioLong) || 1,
      ratioShort: Number(data.ratioShort) || 3,
      gap: Number(data.gap) || 50,
      cnt: Number(data.cnt) || 5,
      stk: data.stk || "AUTO",
      referenceMode: data.referenceMode || "ATM",
      optionType: data.optionType || "CE",
      minStrike: data.minStrike ?? "ALL",
      maxStrike: data.maxStrike ?? "ALL",
      createdAt: Date.now()
    };
    return strategyRepository.create(newStrategy);
  }
  deleteStrategy(id, userId) {
    return strategyRepository.delete(id, userId);
  }
};
var strategyService = new StrategyService();

// server/modules/strategies/strategy.controller.ts
var StrategyController = class {
  getUserStrategies(req, res) {
    try {
      const userId = req.user.id;
      const strategies = strategyService.getUserStrategies(userId);
      return res.json({ success: true, strategies });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to fetch strategies." });
    }
  }
  saveStrategy(req, res) {
    try {
      const userId = req.user.id;
      const strategy = strategyService.saveStrategy(userId, req.body);
      return res.json({ success: true, strategy });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to save strategy." });
    }
  }
  deleteStrategy(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const deleted = strategyService.deleteStrategy(id, userId);
      if (deleted) {
        return res.json({ success: true, message: "Strategy preset removed." });
      }
      return res.status(404).json({ success: false, message: "Strategy configuration not found." });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to delete strategy." });
    }
  }
};
var strategyController = new StrategyController();

// server/modules/strategies/strategy.routes.ts
var strategyRouter = Router3();
strategyRouter.get("/saved-strategies", requireAuth, strategyController.getUserStrategies);
strategyRouter.post("/saved-strategies", requireAuth, strategyController.saveStrategy);
strategyRouter.delete("/saved-strategies/:id", requireAuth, strategyController.deleteStrategy);

// server/modules/admin/admin.routes.ts
import { Router as Router4 } from "express";

// server/modules/admin/admin.service.ts
var AdminService = class {
  getAllUsers() {
    return Array.from(usersStore.values()).map(({ passwordHash, ...safeUser }) => safeUser);
  }
  updateUserStatus(id, isActive) {
    const user = usersStore.get(id);
    if (!user) return null;
    user.isActive = Boolean(isActive);
    return user;
  }
  updateUserRole(id, role) {
    const user = usersStore.get(id);
    if (!user) return null;
    if (role === "ADMIN" || role === "USER") {
      user.role = role;
    }
    return user;
  }
  updateUserPlan(id, plan) {
    const user = usersStore.get(id);
    if (!user) return null;
    if (plan === "FREE" || plan === "PRO") {
      user.plan = plan;
    }
    return user;
  }
};
var adminService = new AdminService();

// server/modules/admin/admin.controller.ts
var AdminController = class {
  getUsers(req, res) {
    try {
      const users = adminService.getAllUsers();
      return res.json({ success: true, users });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to list users." });
    }
  }
  updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = adminService.updateUserStatus(id, isActive);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });
      const { passwordHash, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to update user status." });
    }
  }
  updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = adminService.updateUserRole(id, role);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });
      const { passwordHash, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to update user role." });
    }
  }
  updateUserPlan(req, res) {
    try {
      const { id } = req.params;
      const { plan } = req.body;
      const user = adminService.updateUserPlan(id, plan);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });
      const { passwordHash, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Failed to update user plan." });
    }
  }
};
var adminController = new AdminController();

// server/modules/admin/admin.routes.ts
var adminRouter = Router4();
adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/users", adminController.getUsers);
adminRouter.patch("/users/:id/status", adminController.updateUserStatus);
adminRouter.patch("/users/:id/role", adminController.updateUserRole);
adminRouter.patch("/users/:id/plan", adminController.updateUserPlan);

// server/app.ts
var app = express();
app.use(compression({ threshold: 512, level: 6 }));
app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var universeCache = {};
function getCachedUniverseJson(filePath) {
  if (!universeCache[filePath]) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      universeCache[filePath] = fs.readFileSync(fullPath, "utf8");
    } else {
      universeCache[filePath] = JSON.stringify([]);
    }
  }
  return universeCache[filePath];
}
var apiRouter = express.Router();
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now(), service: "Ratio Spread API" });
});
var sendCachedJson = (res, filePath) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  res.send(getCachedUniverseJson(filePath));
};
apiRouter.get("/universe/nse-underlyings", (_req, res) => {
  sendCachedJson(res, "src/data/angelUnderlyings.json");
});
apiRouter.get("/universe/nse-instruments", (_req, res) => {
  sendCachedJson(res, "src/data/angelInstrumentsMap.json");
});
apiRouter.get("/universe/bse-underlyings", (_req, res) => {
  sendCachedJson(res, "src/data/bseUnderlyings.json");
});
apiRouter.get("/universe/bse-instruments", (_req, res) => {
  sendCachedJson(res, "src/data/bseInstrumentsMap.json");
});
apiRouter.get("/universe/bse-cash", (_req, res) => {
  sendCachedJson(res, "src/data/bseCashUniverse.json");
});
apiRouter.use("/auth", authRouter);
apiRouter.use("/angel", marketRouter);
apiRouter.use("/user", strategyRouter);
apiRouter.use("/admin", adminRouter);
app.use("/api", apiRouter);

// server.ts
process.on("uncaughtException", (err) => {
  console.error("[Server Supervisor] Trapped uncaughtException:", err?.stack || err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Server Supervisor] Trapped unhandledRejection at:", promise, "reason:", reason);
});
async function startServer() {
  const PORT = Number(process.env.PORT) || 3e3;
  const distPath = path2.join(process.cwd(), "dist");
  const distIndexExists = fs2.existsSync(path2.join(distPath, "index.html"));
  app.get("/api/health", (_req, res) => {
    const mem = process.memoryUsage();
    res.json({
      status: "HEALTHY",
      uptime: Math.round(process.uptime()),
      timestamp: Date.now(),
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
      }
    });
  });
  if (process.env.NODE_ENV === "production" && distIndexExists) {
    console.log("[Server] Serving production compiled build from dist/");
    app.use("/assets", express2.static(path2.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
      etag: true
    }));
    app.use(express2.static(distPath, { maxAge: "1h", etag: true }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path2.join(distPath, "index.html"));
    });
  } else {
    console.log("[Server] Mounting Vite dev middleware for live compilation...");
    const vitePkg = "vite";
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.use((err, _req, res, _next) => {
    console.error("[Server Express Error]:", err?.stack || err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: err?.message || "Unexpected application error"
      });
    }
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===========================================================`);
    console.log(`[Production Server] Ratio Spread Pro Terminal Running`);
    console.log(`[Status] ONLINE | Port: ${PORT} | Serving Build: ${distIndexExists}`);
    console.log(`[Supervisor] Crash recovery & instant compression active`);
    console.log(`===========================================================`);
  });
}
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("[Server Startup Error]:", err);
    setTimeout(() => {
      console.log("[Server Supervisor] Attempting auto-restart after startup exception...");
      startServer().catch((e) => console.error("[Server Supervisor] Fatal restart failure:", e));
    }, 2e3);
  });
}
var server_default = app;
export {
  server_default as default
};
