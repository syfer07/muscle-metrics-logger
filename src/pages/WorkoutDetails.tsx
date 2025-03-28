
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkout, useDeleteWorkout } from '@/services/workoutService';
import { Dumbbell, ArrowLeft, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const WorkoutDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { data: workout, isLoading, error } = useWorkout(id, token);
  const deleteWorkout = useDeleteWorkout();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Calculate total volume for the workout
  const calculateTotalVolume = () => {
    if (!workout || !workout.exercises) return 0;
    
    return workout.exercises.reduce((total, exercise) => {
      // Volume = sets * reps * weight
      return total + (exercise.sets * exercise.reps * exercise.weight);
    }, 0);
  };
  
  // Handle workout deletion
  const handleDelete = async () => {
    if (!id || !token) return;
    
    try {
      await deleteWorkout.mutateAsync({ id, token });
      toast.success('Workout deleted successfully');
      navigate('/workouts');
    } catch (error) {
      toast.error('Failed to delete workout');
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (error || !workout) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-4">Failed to load workout details</p>
        <Button variant="outline" onClick={() => navigate('/workouts')}>
          Back to Workouts
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Workout Details</h1>
        </div>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete Workout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(workout.date)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {workout.dayOfWeek}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{workout.exercises.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Exercises performed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalVolume()} kg</div>
            <p className="text-xs text-muted-foreground">
              Total weight moved in this workout
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
          <CardDescription>
            Details of all exercises performed in this workout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <Card key={index} className="bg-secondary">
                <CardHeader className="pb-2">
                  <CardTitle>{exercise.exerciseName || `Exercise ${index + 1}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Sets</p>
                      <p className="text-lg font-medium">{exercise.sets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reps</p>
                      <p className="text-lg font-medium">{exercise.reps}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="text-lg font-medium">{exercise.weight} kg</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="text-lg font-medium">
                      {exercise.sets * exercise.reps * exercise.weight} kg
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workout
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutDetails;
