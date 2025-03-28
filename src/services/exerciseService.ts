
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string;
  requiresWeight: boolean;
}

const fetchExercises = async (token: string): Promise<Exercise[]> => {
  const response = await fetch('/api/exercises', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }
  
  return response.json();
};

const fetchExercisesByMuscleGroup = async (muscleGroup: string, token: string): Promise<Exercise[]> => {
  const response = await fetch(`/api/exercises/muscle-group/${muscleGroup}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch exercises for ${muscleGroup}`);
  }
  
  return response.json();
};

const fetchExercise = async (id: string, token: string): Promise<Exercise> => {
  const response = await fetch(`/api/exercises/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch exercise');
  }
  
  return response.json();
};

const createExercise = async ({ exercise, token }: { exercise: Omit<Exercise, 'id'>, token: string }): Promise<Exercise> => {
  const response = await fetch('/api/exercises', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(exercise),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create exercise');
  }
  
  return response.json();
};

const initializeDefaultExercises = async (token: string): Promise<{ message: string }> => {
  const response = await fetch('/api/exercises/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to initialize default exercises');
  }
  
  return response.json();
};

export const useExercises = (token: string | null) => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => token ? fetchExercises(token) : Promise.resolve([]),
    enabled: !!token,
  });
};

export const useExercisesByMuscleGroup = (muscleGroup: string, token: string | null) => {
  return useQuery({
    queryKey: ['exercises', muscleGroup],
    queryFn: () => token ? fetchExercisesByMuscleGroup(muscleGroup, token) : Promise.resolve([]),
    enabled: !!token && !!muscleGroup,
  });
};

export const useExercise = (id: string, token: string | null) => {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => token ? fetchExercise(id, token) : Promise.resolve({} as Exercise),
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
