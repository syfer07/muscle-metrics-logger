
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiService } from './mockApiService';

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

const fetchWorkouts = async (): Promise<Workout[]> => {
  return await mockApiService.getWorkouts();
};

const fetchWorkoutsByDay = async (dayOfWeek: string): Promise<Workout[]> => {
  return await mockApiService.getWorkoutsByDay(dayOfWeek);
};

const fetchWorkout = async (id: string): Promise<Workout> => {
  return await mockApiService.getWorkoutById(id);
};

const createWorkout = async ({ workout }: { workout: CreateWorkoutPayload }): Promise<Workout> => {
  return await mockApiService.createWorkout(workout);
};

const updateWorkout = async ({ id, workout }: { id: string, workout: Partial<Workout> }): Promise<Workout> => {
  return await mockApiService.updateWorkout(id, workout);
};

const deleteWorkout = async ({ id }: { id: string }): Promise<{ message: string }> => {
  return await mockApiService.deleteWorkout(id);
};

const fetchVolumeData = async (exerciseId: string, date: string): Promise<{ volume: number }> => {
  return await mockApiService.getVolumeData(exerciseId, date);
};

export const useWorkouts = (token: string | null) => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
    enabled: !!token,
  });
};

export const useWorkoutsByDay = (dayOfWeek: string, token: string | null) => {
  return useQuery({
    queryKey: ['workouts', dayOfWeek],
    queryFn: () => fetchWorkoutsByDay(dayOfWeek),
    enabled: !!token && !!dayOfWeek,
  });
};

export const useWorkout = (id: string | undefined, token: string | null) => {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => id ? fetchWorkout(id) : Promise.resolve({} as Workout),
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
    queryFn: () => fetchVolumeData(exerciseId, date),
    enabled: !!token && !!exerciseId && !!date,
  });
};

export type { Workout, WorkoutExercise, CreateWorkoutPayload };
