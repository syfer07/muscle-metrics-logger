
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkouts } from '@/services/workoutService';
import { Calendar as CalendarIcon, Search, PlusCircle } from 'lucide-react';

const WorkoutHistory = () => {
  const { token } = useAuth();
  const { data: workouts = [], isLoading } = useWorkouts(token);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkouts, setFilteredWorkouts] = useState(workouts);
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Filter workouts based on search term
  useEffect(() => {
    if (!workouts) return;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = workouts.filter(
        workout => 
          workout.dayOfWeek.toLowerCase().includes(term) ||
          formatDate(workout.date).toLowerCase().includes(term) ||
          workout.exercises.some(ex => 
            ex.exerciseName?.toLowerCase().includes(term)
          )
      );
      setFilteredWorkouts(filtered);
    } else {
      setFilteredWorkouts(workouts);
    }
  }, [workouts, searchTerm]);
  
  // Navigate to workout details
  const handleWorkoutClick = (id: string) => {
    navigate(`/workouts/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading workouts...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Workout History</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search workouts..."
              className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/workouts/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Workout
          </Button>
        </div>
      </div>
      
      {filteredWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((workout) => (
            <Card 
              key={workout.id} 
              className="card-hover cursor-pointer"
              onClick={() => handleWorkoutClick(workout.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{workout.dayOfWeek}</CardTitle>
                    <CardDescription>{formatDate(workout.date)}</CardDescription>
                  </div>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {workout.exercises.length} {workout.exercises.length === 1 ? 'Exercise' : 'Exercises'}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {workout.exercises.slice(0, 4).map((exercise, index) => (
                      <li key={index} className="truncate">
                        {exercise.exerciseName || `Exercise ${index + 1}`}
                        <span className="text-xs text-muted-foreground ml-2">
                          {exercise.sets}×{exercise.reps} {exercise.weight > 0 ? `(${exercise.weight}kg)` : ''}
                        </span>
                      </li>
                    ))}
                    {workout.exercises.length > 4 && (
                      <li className="text-xs text-muted-foreground">
                        +{workout.exercises.length - 4} more
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">No workouts found</p>
          <Button onClick={() => navigate('/workouts/new')}>Create Workout</Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
