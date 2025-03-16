import React from 'react';
import { Card, CardContent } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { BarChart3, HelpCircle } from "lucide-react";

interface LivePollingProps {
  mode?: 'attendee' | 'organizer' | 'admin';
}

export default function LivePolling({ mode = 'attendee' }: LivePollingProps) {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Mock poll data
  const pollQuestion = "Which topic would you like to discuss next?";
  const pollOptions = [
    "Artificial Intelligence",
    "Blockchain Technology",
    "Cloud Computing",
    "Data Science"
  ];

  const handleVote = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);
      // In a real app, this would send the vote to the backend
      console.log(`Voted for option: ${pollOptions[selectedOption]}`);
    }
  };

  const resetPoll = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  // For organizer/admin view, show results
  if (mode === 'organizer' || mode === 'admin') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{pollQuestion}</h3>
          <AnimatedButton variant="outline" size="sm" onClick={resetPoll}>
            New Poll
          </AnimatedButton>
        </div>
        
        <div className="space-y-3">
          {pollOptions.map((option, index) => {
            // Mock vote percentages for visualization
            const votePercentage = [45, 25, 20, 10][index];
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{option}</span>
                  <span className="font-medium">{votePercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${votePercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground pt-2">
          <span>Total votes: 128</span>
          <span>Active: 45 seconds ago</span>
        </div>
      </div>
    );
  }

  // Attendee view
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">{pollQuestion}</h3>
      </div>
      
      {isSubmitted ? (
        <div className="space-y-4">
          <div className="bg-primary/10 text-primary rounded-lg p-4 text-center">
            <p>Thank you for your vote!</p>
            <p className="text-sm mt-1">You voted for: {pollOptions[selectedOption!]}</p>
          </div>
          
          <AnimatedButton 
            variant="outline" 
            className="w-full" 
            onClick={resetPoll}
          >
            Change Vote
          </AnimatedButton>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {pollOptions.map((option, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedOption === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedOption(index)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      selectedOption === index
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {selectedOption === index && (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>
          
          <AnimatedButton 
            className="w-full" 
            disabled={selectedOption === null}
            onClick={handleVote}
          >
            Submit Vote
          </AnimatedButton>
          
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-2">
            <HelpCircle className="h-3 w-3" />
            <span>Your response is anonymous</span>
          </div>
        </>
      )}
    </div>
  );
}
