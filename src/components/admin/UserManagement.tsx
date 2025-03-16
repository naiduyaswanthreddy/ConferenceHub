
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { UserPlus, Filter, Download, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// Use static data for demos
const USE_STATIC_DATA = true;

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      
      try {
        if (USE_STATIC_DATA) {
          setUsers(staticDemoData.users as UserData[]);
          
          setTimeout(() => setIsLoading(false), 500);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <AnimatedButton size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </AnimatedButton>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <AnimatedButton variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </AnimatedButton>
              <AnimatedButton variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </AnimatedButton>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Joined</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user => 
                      user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">{user.name || 'N/A'}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'organizer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <AnimatedButton variant="outline" size="sm">View</AnimatedButton>
                            <AnimatedButton variant="subtle" size="sm">Edit</AnimatedButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
