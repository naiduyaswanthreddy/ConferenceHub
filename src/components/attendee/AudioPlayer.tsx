
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Volume2, VolumeX, X } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface AudioPlayerProps {
  eventId: string;
  onStop: () => void;
}

// Mock audio URL for demonstration
const getDemoAudioUrl = (eventId: string) => {
  return `https://mock-audio-stream.com/live/${eventId}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ eventId, onStop }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  
  useEffect(() => {
    // In a real implementation, we would fetch the actual audio stream URL
    // from a backend service based on the eventId
    const url = getDemoAudioUrl(eventId);
    setAudioUrl(url);
    
    // Simulate connecting to a live audio stream
    const timer = setTimeout(() => {
      toast.success("Audio stream connected");
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      // In a real implementation, we would disconnect from the audio stream here
    };
  }, [eventId]);
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleClose = () => {
    setIsPlaying(false);
    onStop();
  };
  
  return (
    <Card className="fixed bottom-4 right-4 w-64 shadow-lg z-50 bg-black/70 border-primary/30 backdrop-blur-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-white">Live Audio Stream</h3>
          <AnimatedButton 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </AnimatedButton>
        </div>
        
        <div className="flex items-center space-x-2">
          <AnimatedButton 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </AnimatedButton>
          
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-300 animate-pulse">● LIVE</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
