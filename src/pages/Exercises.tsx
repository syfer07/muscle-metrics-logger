
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  useExercises,
  useInitializeExercises,
  useCreateExercise,
  Exercise
} from '@/services/exerciseService';
import { Search, Plus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const muscleGroups = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Cardio'
];

const Exercises = () => {
  const { token } = useAuth();
  const { data: exercises = [], isLoading, error } = useExercises(token);
  const initializeExercises = useInitializeExercises();
  const createExercise = useCreateExercise();
  
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  
  // New exercise form state
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: 'Chest',
    description: '',
    requiresWeight: true
  });
  
  // Initialize default exercises
  const handleInitialize = async () => {
    try {
      if (!token) return;
      
      await initializeExercises.mutateAsync(token);
      toast.success('Default exercises initialized successfully');
    } catch (error) {
      toast.error('Failed to initialize default exercises');
    }
  };
  
  // Filter exercises when search term or active tab changes
  useEffect(() => {
    if (!exercises) return;
    
    let filtered = [...exercises];
    
    // Filter by muscle group
    if (activeTab !== 'All') {
      filtered = filtered.filter(exercise => exercise.muscleGroup === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        exercise => 
          exercise.name.toLowerCase().includes(term) || 
          exercise.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredExercises(filtered);
  }, [exercises, searchTerm, activeTab]);
  
  // Handle input change for new exercise form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExercise({ ...newExercise, [name]: value });
  };
  
  // Handle checkbox change for requiresWeight
  const handleCheckboxChange = (checked: boolean) => {
    setNewExercise({ ...newExercise, requiresWeight: checked });
  };
  
  // Submit new exercise
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;
    
    try {
      await createExercise.mutateAsync({ 
        exercise: newExercise, 
        token 
      });
      
      toast.success(`Exercise "${newExercise.name}" created successfully`);
      setOpenDialog(false);
      setNewExercise({
        name: '',
        muscleGroup: 'Chest',
        description: '',
        requiresWeight: true
      });
    } catch (error) {
      toast.error('Failed to create exercise');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading exercises...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-4">Failed to load exercises</p>
        <Button onClick={handleInitialize}>Initialize Default Exercises</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search exercises..."
              className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Exercise
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>
                    Create a custom exercise to add to your workouts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Exercise Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newExercise.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="muscleGroup">Muscle Group</Label>
                    <select
                      id="muscleGroup"
                      name="muscleGroup"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newExercise.muscleGroup}
                      onChange={handleInputChange}
                      required
                    >
                      {muscleGroups.filter(group => group !== 'All').map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newExercise.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresWeight"
                      checked={newExercise.requiresWeight}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="requiresWeight">Requires Weight</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!newExercise.name}>Add Exercise</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {exercises.length === 0 && (
            <Button variant="outline" onClick={handleInitialize}>
              <Check className="mr-2 h-4 w-4" /> Initialize Defaults
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto flex flex-wrap justify-start">
          {muscleGroups.map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {muscleGroups.map((group) => (
          <TabsContent key={group} value={group} className="mt-6">
            {filteredExercises.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.id} className="card-hover">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{exercise.name}</CardTitle>
                          <CardDescription>{exercise.muscleGroup}</CardDescription>
                        </div>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
                          {exercise.requiresWeight ? 'Weighted' : 'Bodyweight'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {exercise.description || 'No description available.'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground mb-4">No exercises found</p>
                {exercises.length === 0 ? (
                  <Button onClick={handleInitialize}>Initialize Default Exercises</Button>
                ) : null}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Exercises;
