// Mock authentication service for testing

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Mock users for testing
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Иван Иванов",
    phone: "+79991234567",
  },
  {
    id: "2",
    name: "Мария Петрова",
    phone: "+79997654321",
  },
  {
    id: "3",
    name: "Алексей Владелец",
    phone: "+79990001122",
  },
  {
    id: "4",
    name: "Михаил Клиент",
    phone: "+79990001133",
  },
];

// Mock verification codes
// Format: phone -> code
// NOTE: Check console for verification codes when testing
const mockVerificationCodes: Record<string, string> = {
  "+79991234567": "1234", // User 1: Иван Иванов
  "+79997654321": "5678", // User 2: Мария Петрова
  "+79990001122": "9012", // User 3: Алексей Владелец (владелец парковки)
  "+79990001133": "3456", // User 4: Михаил Клиент (клиент с подтвержденным бронированием)
};

// Store for pending registrations
const pendingRegistrations: Record<string, { name: string; code: string }> = {};

// Generate a random 4-digit code
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Simulate SMS delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuth = {
  // Check if phone number is already registered
  isPhoneRegistered(phone: string): boolean {
    return mockUsers.some((user) => user.phone === phone);
  },

  // Get pending registration (for debugging)
  getPendingRegistration(phone: string): { name: string; code: string } | null {
    return pendingRegistrations[phone] || null;
  },

  // Send verification code (mock)
  async sendVerificationCode(
    phone: string,
    isRegistration: boolean = false
  ): Promise<string> {
    // Simulate network delay
    await delay(1000);

    let code: string;

    if (isRegistration) {
      // For registration, always use fixed test code "0000"
      code = "0000";
      // Store the code for this phone (in real app, this would be sent via SMS)
      pendingRegistrations[phone] = { name: "", code };
      console.log(
        `[MOCK AUTH] Stored pending registration for ${phone} with code: ${code}`
      );
      console.log(
        `[MOCK AUTH] Pending registrations:`,
        Object.keys(pendingRegistrations)
      );
    } else {
      // For login, use mock code if exists, otherwise generate
      code = mockVerificationCodes[phone] || generateCode();
    }

    // In development, log the code to console
    console.log(`[MOCK AUTH] Verification code for ${phone}: ${code}`);
    if (isRegistration) {
      console.log(`[MOCK AUTH] Registration code is always "0000" for testing`);
    }
    console.log(
      `[MOCK AUTH] Mock users:`,
      mockUsers.map((u) => `${u.name} (${u.phone})`)
    );
    console.log(
      `[MOCK AUTH] To test "already registered", use: ${
        mockUsers[0]?.phone || "+79991234567"
      }`
    );

    return code;
  },

  // Verify code and login
  async verifyCodeAndLogin(phone: string, code: string): Promise<User | null> {
    await delay(800);

    // For testing: accept "0000" as valid code for any phone number
    if (code === "0000") {
      // Try to find existing user
      let user = mockUsers.find((u) => u.phone === phone);

      // If user doesn't exist, create a temporary test user
      if (!user) {
        user = {
          id: String(mockUsers.length + 1),
          name: "Test User",
          phone: phone,
        };
        // Optionally add to mockUsers for this session
        mockUsers.push(user);
      }

      return user;
    }

    const user = mockUsers.find((u) => u.phone === phone);
    const expectedCode = mockVerificationCodes[phone] || code;

    if (user && code === expectedCode) {
      return user;
    }

    // Check pending registrations
    const pending = pendingRegistrations[phone];
    if (pending && pending.code === code) {
      // This shouldn't happen for login, but handle it
      return null;
    }

    return null;
  },

  // Register new user
  async register(
    name: string,
    phone: string,
    code: string
  ): Promise<User | null> {
    await delay(800);

    const pending = pendingRegistrations[phone];

    if (!pending || pending.code !== code) {
      return null;
    }

    // Check if already registered
    if (this.isPhoneRegistered(phone)) {
      return null;
    }

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      phone,
    };

    mockUsers.push(newUser);
    mockVerificationCodes[phone] = code;
    delete pendingRegistrations[phone];

    return newUser;
  },

  // Complete registration (save name after phone verification)
  async completeRegistration(
    phone: string,
    code: string,
    name: string
  ): Promise<User | null> {
    await delay(800);

    const pending = pendingRegistrations[phone];

    console.log("[MOCK AUTH] completeRegistration:", {
      phone,
      code,
      name,
      pending,
    });
    console.log(
      "[MOCK AUTH] All pending registrations:",
      Object.keys(pendingRegistrations)
    );

    // Check if already registered
    if (this.isPhoneRegistered(phone)) {
      console.log("[MOCK AUTH] Phone already registered:", phone);
      return null;
    }

    // For testing: if code is "0000" and no pending registration exists, create one
    // This handles cases where the pending registration might have been lost
    if (!pending && code === "0000") {
      console.log(
        "[MOCK AUTH] No pending registration found, but code is 0000 - accepting for testing"
      );
      // Create the user directly
      const newUser: User = {
        id: String(mockUsers.length + 1),
        name,
        phone,
      };

      mockUsers.push(newUser);
      mockVerificationCodes[phone] = code;

      console.log("[MOCK AUTH] Registration successful (fallback):", newUser);
      return newUser;
    }

    if (!pending) {
      console.log("[MOCK AUTH] No pending registration found for:", phone);
      return null;
    }

    if (pending.code !== code) {
      console.log(
        "[MOCK AUTH] Code mismatch. Expected:",
        pending.code,
        "Got:",
        code
      );
      return null;
    }

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      phone,
    };

    mockUsers.push(newUser);
    mockVerificationCodes[phone] = code;
    delete pendingRegistrations[phone];

    console.log("[MOCK AUTH] Registration successful:", newUser);
    return newUser;
  },
};
