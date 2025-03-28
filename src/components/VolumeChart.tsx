
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise } from '@/services/exerciseService';

interface VolumeChartProps {
  exercise: Exercise;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ exercise }) => {
  const { token } = useAuth();
  const [data, setData] = useState<Array<{ date: string; volume: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        if (!token) return;
        
        setLoading(true);
        
        // Get dates for the last 7 days
        const dates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();
        
        // Fetch volume data for each date
        const volumeData = await Promise.all(
          dates.map(async (date) => {
            try {
              const response = await fetch(`/api/workouts/volume?exerciseId=${exercise.id}&date=${date}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (!response.ok) {
                return { date, volume: 0 };
              }
              
              const { volume } = await response.json();
              return { date, volume: volume || 0 };
            } catch (error) {
              return { date, volume: 0 };
            }
          })
        );
        
        setData(volumeData);
      } catch (err) {
        setError('Failed to load volume data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolumeData();
  }, [exercise.id, token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).split(',')[0];
  };

  if (loading) {
    return (
      <Card className="w-full h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart data...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[300px] flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weekly Volume: {exercise.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ 
                  value: 'Volume', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
                formatter={(value) => [`${value} kg`, 'Volume']}
                labelFormatter={formatDate}
              />
              <Bar 
                dataKey="volume" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VolumeChart;
