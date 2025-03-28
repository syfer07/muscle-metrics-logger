
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkoutExercise {
  exerciseId: string;
  exerciseName?: string;
  sets: number;
  reps: number;
  weight: number;
}

interface Workout {
  id: string;
  date: string;
  dayOfWeek: string;
  exercises: WorkoutExercise[];
}

interface CreateWorkoutPayload {
  date: string;
  dayOfWeek: string;
  exercises: Omit<WorkoutExercise, 'exerciseName'>[];
}

const fetchWorkouts = async (token: string): Promise<Workout[]> => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const startDate = oneMonthAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  
  const response = await fetch(`/api/workouts/date-range?startDate=${startDate}&endDate=${endDate}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch workouts');
  }
  
  return response.json();
};

const fetchWorkoutsByDay = async (dayOfWeek: string, token: string): Promise<Workout[]> => {
  const response = await fetch(`/api/workouts/day/${dayOfWeek}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workouts for ${dayOfWeek}`);
  }
  
  return response.json();
};

const fetchWorkout = async (id: string, token: string): Promise<Workout> => {
  const response = await fetch(`/api/workouts/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch workout');
  }
  
  return response.json();
};

const createWorkout = async ({ workout, token }: { workout: CreateWorkoutPayload, token: string }): Promise<Workout> => {
  const response = await fetch('/api/workouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(workout),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create workout');
  }
  
  return response.json();
};

const updateWorkout = async ({ id, workout, token }: { id: string, workout: Partial<Workout>, token: string }): Promise<Workout> => {
  const response = await fetch(`/api/workouts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(workout),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update workout');
  }
  
  return response.json();
};

const deleteWorkout = async ({ id, token }: { id: string, token: string }): Promise<{ message: string }> => {
  const response = await fetch(`/api/workouts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete workout');
  }
  
  return response.json();
};

const fetchVolumeData = async (exerciseId: string, date: string, token: string): Promise<{ volume: number }> => {
  const response = await fetch(`/api/workouts/volume?exerciseId=${exerciseId}&date=${date}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch volume data');
  }
  
  return response.json();
};

export const useWorkouts = (token: string | null) => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => token ? fetchWorkouts(token) : Promise.resolve([]),
    enabled: !!token,
  });
};

export const useWorkoutsByDay = (dayOfWeek: string, token: string | null) => {
  return useQuery({
    queryKey: ['workouts', dayOfWeek],
    queryFn: () => token ? fetchWorkoutsByDay(dayOfWeek, token) : Promise.resolve([]),
    enabled: !!token && !!dayOfWeek,
  });
};

export const useWorkout = (id: string | undefined, token: string | null) => {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => id && token ? fetchWorkout(id, token) : Promise.resolve({} as Workout),
    enabled: !!token && !!id,
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateWorkout,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useVolumeData = (exerciseId: string, date: string, token: string | null) => {
  return useQuery({
    queryKey: ['volume', exerciseId, date],
    queryFn: () => token ? fetchVolumeData(exerciseId, date, token) : Promise.resolve({ volume: 0 }),
    enabled: !!token && !!exerciseId && !!date,
  });
};

export type { Workout, WorkoutExercise, CreateWorkoutPayload };
