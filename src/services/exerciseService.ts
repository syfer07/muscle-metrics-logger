
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiService } from './mockApiService';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string;
  requiresWeight: boolean;
}

const fetchExercises = async (): Promise<Exercise[]> => {
  return await mockApiService.getExercises();
};

const fetchExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
  return await mockApiService.getExercisesByMuscleGroup(muscleGroup);
};

const fetchExercise = async (id: string): Promise<Exercise> => {
  return await mockApiService.getExerciseById(id);
};

const createExercise = async ({ exercise }: { exercise: Omit<Exercise, 'id'> }): Promise<Exercise> => {
  return await mockApiService.createExercise(exercise);
};

const initializeDefaultExercises = async (): Promise<{ message: string }> => {
  return await mockApiService.initializeExercises();
};

export const useExercises = (token: string | null) => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
    enabled: !!token,
  });
};

export const useExercisesByMuscleGroup = (muscleGroup: string, token: string | null) => {
  return useQuery({
    queryKey: ['exercises', muscleGroup],
    queryFn: () => fetchExercisesByMuscleGroup(muscleGroup),
    enabled: !!token && !!muscleGroup,
  });
};

export const useExercise = (id: string, token: string | null) => {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => fetchExercise(id),
    enabled: !!token && !!id,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export const useInitializeExercises = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: initializeDefaultExercises,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export type { Exercise };
