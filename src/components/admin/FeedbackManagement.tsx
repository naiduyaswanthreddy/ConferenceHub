
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Search, Filter, Star, Calendar, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FeedbackData } from "@/utils/eventUtils";

// Use static data for presentations
const USE_STATIC_DATA = true;

export default function FeedbackManagement() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    if (user) {
      fetchFeedbacks();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      if (USE_STATIC_DATA) {
        // Use the static data with enhanced user and event info
        const enhancedFeedbacks = staticDemoData.feedbacks.map(feedback => ({
          ...feedback,
          // Ensure all required properties exist
          id: feedback.id || `feedback-${Date.now()}-${Math.random()}`,
          user_id: feedback.user_id || 'unknown',
          event_id: feedback.event_id || 'general',
          rating: feedback.rating || 0,
          comment: feedback.comment || '',
          created_at: feedback.created_at || new Date().toISOString(),
          // Ensure profiles and events exist
          profiles: feedback.profiles || { name: 'Unknown User' },
          events: feedback.events || { title: 'Unknown Event' }
        }));
        setFeedbacks(enhancedFeedbacks);
        setTimeout(() => setIsLoading(false), 500);
        return;
      }
      
      // For real Supabase implementation, this would need a 'feedbacks' table
      // Since it doesn't exist, we're using static data for demo purposes
      console.warn("Using static data - 'feedbacks' table doesn't exist in Supabase");
      
      // We'd use code like this if the table existed:
      // const { data, error } = await supabase
      //   .from('feedbacks')
      //   .select(`
      //     *,
      //     profiles:user_id (name),
      //     events:event_id (title)
      //   `)
      //   .order('created_at', { ascending: false });
      
      // Mock response with static data
      const mockData = staticDemoData.feedbacks.map(feedback => ({
        ...feedback,
        id: feedback.id || `feedback-${Date.now()}-${Math.random()}`,
        user_id: feedback.user_id || 'unknown',
        event_id: feedback.event_id || 'general',
        rating: feedback.rating || 0,
        comment: feedback.comment || '',
        created_at: feedback.created_at || new Date().toISOString(),
        profiles: feedback.profiles || { name: 'Unknown User' },
        events: feedback.events || { title: 'Unknown Event' }
      }));
      
      setFeedbacks(mockData);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Failed to load feedback data");
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredFeedbacks = () => {
    return feedbacks.filter(feedback => {
      // Apply rating filter
      if (ratingFilter !== 'all' && feedback.rating !== ratingFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          feedback.profiles?.name?.toLowerCase().includes(searchLower) ||
          feedback.events?.title?.toLowerCase().includes(searchLower) ||
          feedback.comment?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // For ratings 1-5
    
    feedbacks.forEach(feedback => {
      if (feedback.rating >= 1 && feedback.rating <= 5) {
        distribution[feedback.rating - 1]++;
      }
    });
    
    return distribution;
  };

  const getRatingPercentage = (count: number) => {
    if (feedbacks.length === 0) return 0;
    return Math.round((count / feedbacks.length) * 100);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{feedbacks.length}</p>
            <p className="text-sm text-muted-foreground">Submissions received</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="text-2xl font-bold mr-2">{calculateAverageRating()}</p>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-sm text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {feedbacks.length > 0 
                ? `${Math.max(...getRatingDistribution())} ⭐` 
                : '0 ⭐'}
            </p>
            <p className="text-sm text-muted-foreground">Most common rating</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search feedback..."
                    className="pl-9 bg-gray-900 border-gray-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-gray-400 mr-2" />
                  <select
                    className="bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm"
                    value={String(ratingFilter)}
                    onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-gray-400">Loading feedback...</p>
                </div>
              ) : getFilteredFeedbacks().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredFeedbacks().map((feedback) => (
                    <Card key={feedback.id} className="border border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center mb-1">
                              <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium">{feedback.profiles?.name || 'Unknown User'}</span>
                            </div>
                            <div className="text-sm text-gray-400 mb-1">
                              Event: {feedback.events?.title || 'General Feedback'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                          <div>
                            {renderStars(feedback.rating)}
                          </div>
                        </div>
                        
                        {feedback.comment && (
                          <div className="bg-gray-800 p-3 rounded-md">
                            <p className="text-gray-300">{feedback.comment}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900/50 rounded-lg">
                  <Star className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                  <p className="text-lg font-medium">No feedback found</p>
                  <p className="text-gray-500 text-sm">
                    {searchTerm || ratingFilter !== 'all' 
                      ? "Try changing your filters" 
                      : "No feedback has been submitted yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRatingDistribution().reverse().map((count, index) => {
                  const stars = 5 - index;
                  const percentage = getRatingPercentage(count);
                  
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center min-w-[70px]">
                        {stars} <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
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
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total ratings:</span>
                    <span>{feedbacks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average rating:</span>
                    <span>{calculateAverageRating()} / 5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AnimatedButton 
            variant="outline" 
            className="mt-4 w-full"
            onClick={fetchFeedbacks}
          >
            Refresh Data
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}
