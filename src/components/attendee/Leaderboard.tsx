
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { useAuth } from "@/context/AuthContext";
import { staticDemoData } from "@/integrations/supabase/client";
import { Trophy, Medal, Star, Award, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
  badgeCount?: number;
  eventCount?: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("all-time");
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [currentTab]);

  const fetchLeaderboardData = () => {
    setIsLoading(true);
    
    // Generate leaderboard data from our static demo data
    // In a real app, this would be an API call to fetch the actual leaderboard
    setTimeout(() => {
      // Use the existing users data to create a leaderboard
      const allUsers = staticDemoData.users;
      
      // Generate random points for each user
      const leaderboardUsers = allUsers.map((demoUser) => {
        // Generate random points based on tab
        const basePoints = Math.floor(Math.random() * 1000);
        const points = currentTab === "monthly" 
          ? Math.floor(basePoints / 3) 
          : currentTab === "weekly" 
            ? Math.floor(basePoints / 10)
            : basePoints;
            
        return {
          id: demoUser.id,
          name: demoUser.name,
          points,
          rank: 0, // Will be calculated after sorting
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(demoUser.name)}&background=8B5CF6&color=fff`,
          badgeCount: Math.floor(Math.random() * 5),
          eventCount: Math.floor(Math.random() * 10) + 1
        };
      });
      
      // Sort by points (highest first)
      const sortedUsers = [...leaderboardUsers].sort((a, b) => b.points - a.points);
      
      // Assign ranks
      sortedUsers.forEach((user, index) => {
        user.rank = index + 1;
      });
      
      // Set the users state
      setUsers(sortedUsers);
      
      // Find the current user in the leaderboard
      if (user) {
        const foundUser = sortedUsers.find(u => u.name === user.name);
        setCurrentUser(foundUser || null);
      }
      
      setIsLoading(false);
    }, 800);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-400">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center">
              <Trophy className="mr-2 text-yellow-500" /> Leaderboard
            </CardTitle>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="all-time">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-pulse text-center">
                <p>Loading leaderboard...</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Top 3 Performers */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {users.slice(0, 3).map((leader, index) => (
                  <Card key={leader.id} className={`border-0 ${index === 0 ? 'bg-gradient-to-br from-yellow-500/10 to-amber-600/10' : 'bg-black/20'}`}>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <div className="relative">
                          <Avatar className="w-16 h-16 border-2 border-white/10">
                            <AvatarImage src={leader.avatar} alt={leader.name} />
                            <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1">
                            {index === 0 ? (
                              <Trophy className="w-5 h-5 text-yellow-500" />
                            ) : index === 1 ? (
                              <Medal className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Medal className="w-5 h-5 text-amber-700" />
                            )}
                          </div>
                        </div>
                      </div>
                      <h3 className="font-bold mt-2 truncate">{leader.name}</h3>
                      <p className="text-sm text-gray-400">{leader.points} pts</p>
                      <div className="flex justify-center mt-2 gap-1">
                        {Array.from({ length: leader.badgeCount || 0 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Full Leaderboard */}
              <div className="overflow-hidden rounded-md border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-black/20">
                      <th className="px-4 py-3 text-left">Rank</th>
                      <th className="px-4 py-3 text-left">Attendee</th>
                      <th className="px-4 py-3 text-center">Events</th>
                      <th className="px-4 py-3 text-center">Badges</th>
                      <th className="px-4 py-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((leaderboardUser) => (
                      <tr 
                        key={leaderboardUser.id} 
                        className={`hover:bg-gray-800/50 transition-colors ${
                          user && leaderboardUser.name === user.name 
                            ? 'bg-purple-900/20'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center">
                            {getRankIcon(leaderboardUser.rank)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={leaderboardUser.avatar} alt={leaderboardUser.name} />
                              <AvatarFallback>{leaderboardUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{leaderboardUser.name}</span>
                            {user && leaderboardUser.name === user.name && (
                              <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
                                You
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span>{leaderboardUser.eventCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span>{leaderboardUser.badgeCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {leaderboardUser.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Points Key */}
              <div className="mt-6 px-4 py-3 bg-black/20 rounded-md">
                <h3 className="font-medium mb-2">How to Earn Points</h3>
                <ul className="text-sm space-y-1 text-gray-400">
                  <li>• Attend an event: 100 points</li>
                  <li>• Submit feedback: 50 points</li>
                  <li>• Ask questions: 25 points</li>
                  <li>• Complete session polls: 15 points</li>
                  <li>• Early check-in: 10 bonus points</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
