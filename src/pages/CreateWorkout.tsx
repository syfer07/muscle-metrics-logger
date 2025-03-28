
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useExercises, Exercise } from '@/services/exerciseService';
import { useCreateWorkout, CreateWorkoutPayload } from '@/services/workoutService';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const CreateWorkout = () => {
  const { token } = useAuth();
  const { data: exercises = [], isLoading: isLoadingExercises } = useExercises(token);
  const createWorkout = useCreateWorkout();
  const navigate = useNavigate();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutExercises, setWorkoutExercises] = useState<Array<{
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: number;
    weight: number;
  }>>([]);
  
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Set the first exercise as selected when exercises are loaded
  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);
  
  // Calculate day of week from date
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  // Add exercise to workout
  const handleAddExercise = () => {
    if (!selectedExercise) return;
    
    setWorkoutExercises([
      ...workoutExercises,
      {
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        sets: 3,
        reps: 10,
        weight: 0,
      },
    ]);
  };
  
  // Remove exercise from workout
  const handleRemoveExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };
  
  // Update exercise details
  const handleExerciseChange = (index: number, field: string, value: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setWorkoutExercises(updatedExercises);
  };
  
  // Submit workout
  const handleSubmit = async () => {
    if (!token) return;
    
    if (workoutExercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }
    
    const payload: CreateWorkoutPayload = {
      date,
      dayOfWeek: getDayOfWeek(date),
      exercises: workoutExercises.map(({ exerciseId, sets, reps, weight }) => ({
        exerciseId,
        sets,
        reps,
        weight,
      })),
    };
    
    try {
      await createWorkout.mutateAsync({ workout: payload, token });
      toast.success('Workout created successfully');
      navigate('/workouts');
    } catch (error) {
      toast.error('Failed to create workout');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Workout</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
          <CardDescription>
            Set the date and add exercises to your workout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                {getDayOfWeek(date)}
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="exercise">Add Exercise</Label>
                  <select
                    id="exercise"
                    value={selectedExercise?.id || ''}
                    onChange={(e) => {
                      const exercise = exercises.find(ex => ex.id === e.target.value);
                      if (exercise) setSelectedExercise(exercise);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoadingExercises}
                  >
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} ({exercise.muscleGroup})
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAddExercise} disabled={!selectedExercise || isLoadingExercises}>
                  <Plus className="mr-2 h-4 w-4" /> Add to Workout
                </Button>
              </div>
              
              {workoutExercises.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Exercise List</h3>
                  {workoutExercises.map((exercise, index) => (
                    <Card key={index} className="bg-secondary">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveExercise(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor={`sets-${index}`}>Sets</Label>
                            <Input
                              id={`sets-${index}`}
                              type="number"
                              min="1"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`reps-${index}`}>Reps</Label>
                            <Input
                              id={`reps-${index}`}
                              type="number"
                              min="1"
                              value={exercise.reps}
                              onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`weight-${index}`}>Weight (kg)</Label>
                            <Input
                              id={`weight-${index}`}
                              type="number"
                              min="0"
                              step="0.5"
                              value={exercise.weight}
                              onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-md">
                  <p className="text-muted-foreground">
                    No exercises added yet. Select an exercise and click "Add to Workout".
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={workoutExercises.length === 0}>
                Create Workout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWorkout;
