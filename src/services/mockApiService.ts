
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
      weight: 0,
      height: 0,
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

  // Exercise endpoints
  getExercises: async () => {
    await delay(500);
    
    return [
      {
        id: "ex1",
        name: "Bench Press",
        muscleGroup: "Chest",
        description: "A compound exercise that targets the chest, shoulders, and triceps.",
        requiresWeight: true,
      },
      {
        id: "ex2",
        name: "Pull-ups",
        muscleGroup: "Back",
        description: "An upper body exercise that targets the back and biceps.",
        requiresWeight: false,
      },
      {
        id: "ex3",
        name: "Squats",
        muscleGroup: "Legs",
        description: "A compound exercise that targets the quadriceps, hamstrings, and glutes.",
        requiresWeight: true,
      },
      {
        id: "ex4",
        name: "Push-ups",
        muscleGroup: "Chest",
        description: "A bodyweight exercise that targets the chest, shoulders, and triceps.",
        requiresWeight: false,
      },
      {
        id: "ex5",
        name: "Deadlifts",
        muscleGroup: "Back",
        description: "A compound exercise that targets the back, hamstrings, and glutes.",
        requiresWeight: true,
      },
    ];
  },
  
  getExercisesByMuscleGroup: async (muscleGroup: string) => {
    const exercises = await mockApiService.getExercises();
    return exercises.filter(ex => ex.muscleGroup === muscleGroup);
  },
  
  getExerciseById: async (id: string) => {
    const exercises = await mockApiService.getExercises();
    const exercise = exercises.find(ex => ex.id === id);
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    return exercise;
  },
  
  createExercise: async (exercise: any) => {
    await delay(500);
    
    return {
      id: `ex-${Date.now()}`,
      ...exercise,
    };
  },
  
  initializeExercises: async () => {
    await delay(500);
    
    return { message: "Default exercises initialized successfully" };
  },

  // Workout endpoints
  getWorkouts: async () => {
    await delay(500);
    
    return [
      {
        id: "w1",
        date: "2025-03-25",
        dayOfWeek: "Monday",
        exercises: [
          {
            exerciseId: "ex1",
            exerciseName: "Bench Press",
            sets: 3,
            reps: 10,
            weight: 60,
          },
          {
            exerciseId: "ex4",
            exerciseName: "Push-ups",
            sets: 3,
            reps: 15,
            weight: 0,
          },
        ],
      },
      {
        id: "w2",
        date: "2025-03-26",
        dayOfWeek: "Tuesday",
        exercises: [
          {
            exerciseId: "ex2",
            exerciseName: "Pull-ups",
            sets: 3,
            reps: 8,
            weight: 0,
          },
          {
            exerciseId: "ex5",
            exerciseName: "Deadlifts",
            sets: 3,
            reps: 8,
            weight: 80,
          },
        ],
      },
    ];
  },

  getWorkoutById: async (id: string) => {
    const workouts = await mockApiService.getWorkouts();
    const workout = workouts.find(w => w.id === id);
    if (!workout) {
      throw new Error("Workout not found");
    }
    return workout;
  },

  getWorkoutsByDay: async (dayOfWeek: string) => {
    const workouts = await mockApiService.getWorkouts();
    return workouts.filter(w => w.dayOfWeek === dayOfWeek);
  },

  createWorkout: async (workout: any) => {
    await delay(500);
    
    return {
      id: `workout-${Date.now()}`,
      ...workout,
    };
  },

  updateWorkout: async (id: string, workout: any) => {
    await delay(500);
    
    return {
      id,
      ...workout,
    };
  },

  deleteWorkout: async (id: string) => {
    await delay(500);
    
    return { message: "Workout deleted successfully" };
  },

  getVolumeData: async (exerciseId: string, date: string) => {
    await delay(500);
    
    // Mock volume calculation
    return { volume: 1200 }; // Just a mock value
  },
};
