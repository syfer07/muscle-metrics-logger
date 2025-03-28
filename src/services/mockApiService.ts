
// Mock user database
const users = [
  {
    id: "1",
    username: "demo",
    email: "demo@example.com",
    password: "password123",
    weight: 70,
    height: 175,
  },
];

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiService = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    await delay(800); // Simulate network delay
    
    const user = users.find((u) => u.email === email);
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password");
    }
    
    // Generate a fake token
    const token = `mock-jwt-token-${Date.now()}`;
    
    return {
      token,
      user: { ...user, password: undefined }, // Don't return password
    };
  },
  
  register: async (username: string, email: string, password: string) => {
    await delay(800); // Simulate network delay
    
    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      throw new Error("User with this email already exists");
    }
    
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
    };
    
    users.push(newUser);
    
    return {
      message: "User registered successfully",
      userId: newUser.id,
    };
  },
  
  // User profile endpoints
  getUserProfile: async (token: string) => {
    await delay(500);
    
    // For demo, just return the first user
    const user = { ...users[0], password: undefined };
    return user;
  },
  
  updateUserProfile: async (token: string, userData: any) => {
    await delay(500);
    
    // Update user (in a real app, would use token to find the right user)
    const user = users[0];
    Object.assign(user, userData);
    
    return { ...user, password: undefined };
  },
  
  updatePassword: async (token: string, oldPassword: string, newPassword: string) => {
    await delay(500);
    
    const user = users[0];
    if (user.password !== oldPassword) {
      throw new Error("Current password is incorrect");
    }
    
    user.password = newPassword;
    
    return { message: "Password updated successfully" };
  },
};
