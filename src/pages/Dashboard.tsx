
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Dumbbell, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useExercises, Exercise } from '@/services/exerciseService';
import { useWorkouts, Workout } from '@/services/workoutService';
import { useNavigate } from 'react-router-dom';
import VolumeChart from '@/components/VolumeChart';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { data: exercises = [] } = useExercises(token);
  const { data: workouts = [] } = useWorkouts(token);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  
  // Format date to a human-readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get recent workouts
  useEffect(() => {
    if (workouts.length > 0) {
      // Sort by date (newest first) and take the 3 most recent
      const sorted = [...workouts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 3);
      setRecentWorkouts(sorted);
    }
  }, [workouts]);
  
  // Select the first exercise for the chart if none is selected
  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => navigate('/workouts/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Workout
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workouts.length}</div>
            <p className="text-xs text-muted-foreground">
              Workouts logged in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground">
              Exercises to choose from
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentWorkouts.length > 0 
                ? new Date(recentWorkouts[0].date).toLocaleDateString() 
                : 'No workouts'}
            </div>
            <p className="text-xs text-muted-foreground">
              Date of your most recent workout
            </p>
          </CardContent>
        </Card>
      </div>
      
      {selectedExercise && (
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Progress Tracking</CardTitle>
              <div className="flex items-center space-x-2">
                <select 
                  className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-sm"
                  value={selectedExercise.id}
                  onChange={(e) => {
                    const exercise = exercises.find(ex => ex.id === e.target.value);
                    if (exercise) setSelectedExercise(exercise);
                  }}
                >
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <CardDescription>
              Weekly volume progress for {selectedExercise.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeChart exercise={selectedExercise} />
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Workouts</h2>
          <Button variant="outline" onClick={() => navigate('/workouts')}>
            View all
          </Button>
        </div>
        
        {recentWorkouts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentWorkouts.map((workout) => (
              <Card key={workout.id} className="card-hover cursor-pointer" onClick={() => navigate(`/workouts/${workout.id}`)}>
                <CardHeader>
                  <CardTitle className="text-xl">{workout.dayOfWeek}</CardTitle>
                  <CardDescription>{formatDate(workout.date)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Exercises: {workout.exercises.length}</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {workout.exercises.slice(0, 3).map((exercise, index) => (
                        <li key={index} className="truncate">
                          {exercise.exerciseName || `Exercise ${index + 1}`}
                        </li>
                      ))}
                      {workout.exercises.length > 3 && (
                        <li className="text-muted-foreground">
                          +{workout.exercises.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground mb-4">No workouts recorded yet</p>
              <Button onClick={() => navigate('/workouts/new')}>
                Create your first workout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
