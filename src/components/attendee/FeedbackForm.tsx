
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Star, CheckCircle, Send } from "lucide-react";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { FeedbackData } from "@/utils/eventUtils";

interface FeedbackFormProps {
  mode?: "attendee" | "organizer" | "admin";
}

const USE_STATIC_DATA = true;

export default function FeedbackForm({ mode = "attendee" }: FeedbackFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = React.useState<number>(0);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [feedback, setFeedback] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async () => {
    if (rating > 0) {
      try {
        // Save feedback to database or static data
        if (USE_STATIC_DATA) {
          // Add to static demo data
          const newFeedback: FeedbackData = {
            id: `feedback-${Date.now()}`,
            user_id: user?.id || 'anonymous',
            event_id: 'general',
            rating: rating,
            comment: feedback,
            created_at: new Date().toISOString(),
            profiles: { name: user?.name || 'Anonymous User' },
            events: { title: 'General Feedback' }
          };
          
          // Add to static data for demo purposes
          staticDemoData.feedbacks = [...(staticDemoData.feedbacks || []), newFeedback];
          
          console.log(`Submitted feedback with rating: ${rating}, comment: ${feedback}`);
          toast.success("Thank you for your feedback!");
          setIsSubmitted(true);
          return;
        }
        
        // If not using static data, submit to Supabase
        if (user) {
          // In a real implementation, this would insert to a valid "feedbacks" table
          // For now, we're just using static data
          console.log("Would submit to database:", {
            user_id: user.id,
            event_id: 'general',
            rating: rating,
            comment: feedback
          });
        }
        
        setIsSubmitted(true);
        toast.success("Thank you for your feedback!");
      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast.error("Failed to submit feedback. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setRating(0);
    setFeedback('');
    setIsSubmitted(false);
  };

  // For organizer/admin mode, show feedback results
  if (mode === 'organizer' || mode === 'admin') {
    // Get feedback data from static demo or database
    const feedbacks = USE_STATIC_DATA 
      ? staticDemoData.feedbacks || []
      : []; // Would fetch from Supabase in a real implementation
    
    // Calculate ratings distribution
    const ratingCounts = [0, 0, 0, 0, 0]; // 5 elements for 5 stars
    feedbacks.forEach(feedback => {
      if (feedback.rating >= 1 && feedback.rating <= 5) {
        ratingCounts[feedback.rating - 1]++;
      }
    });
    
    const totalFeedbacks = feedbacks.length;
    const percentages = ratingCounts.map(count => 
      totalFeedbacks > 0 ? Math.round((count / totalFeedbacks) * 100) : 0
    ).reverse(); // Reverse to have 5 stars first
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Feedback Summary</h3>
          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
            {totalFeedbacks} responses
          </span>
        </div>
        
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars, index) => {
            const percentage = percentages[index];
            
            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center min-w-[100px]">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  {Array.from({ length: 5 - stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 border rounded-lg divide-y">
          {feedbacks.length > 0 ? (
            feedbacks.slice(0, 5).map(feedback => (
              <div key={feedback.id} className="p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{feedback.comment ? feedback.comment.substring(0, 30) + (feedback.comment.length > 30 ? '...' : '') : 'No comment'}</span>
                  <div className="flex">
                    {Array.from({ length: feedback.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    {Array.from({ length: 5 - feedback.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-gray-300" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{feedback.comment || 'No additional comments'}</p>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">No feedback submissions yet</div>
          )}
        </div>
      </div>
    );
  }

  // Attendee view
  return (
    <div className="space-y-4">
      {isSubmitted ? (
        <div className="bg-green-50 rounded-lg p-6 flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-center">Thank You!</h3>
          <p className="text-sm text-center text-muted-foreground">
            Your feedback has been submitted successfully.
          </p>
          <AnimatedButton 
            variant="outline" 
            size="sm" 
            onClick={resetForm}
          >
            Submit Another Feedback
          </AnimatedButton>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              How would you rate your experience?
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium mb-2">
              Additional comments (optional)
            </label>
            <textarea
              id="feedback"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Share your thoughts about the event..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          
          <AnimatedButton 
            className="w-full flex items-center justify-center gap-2"
            disabled={rating === 0}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
            <span>Submit Feedback</span>
          </AnimatedButton>
        </>
      )}
    </div>
  );
}
