
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Award, 
  Edit, 
  Save, 
  X,
  Upload 
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function AttendeeProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: 'San Francisco, CA',
    joinedDate: 'March 2024',
    interests: ['Tech', 'AI', 'Conference', 'Networking'],
    bio: 'Passionate tech enthusiast interested in the latest innovations and connecting with like-minded professionals.',
    phoneNumber: '+1 (555) 123-4567',
    company: 'TechInnovate Inc.',
    position: 'Product Manager'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setFormData({
      ...formData,
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-900/50 to-indigo-900/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "A"
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2 border border-gray-700 hover:bg-gray-700 transition">
                  <Upload size={16} />
                </button>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-xl font-bold mb-2 bg-gray-800 border-gray-700"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold mb-1">{formData.name}</h2>
              )}
              
              <div className="flex flex-col md:flex-row items-center gap-3 text-gray-300 mb-3">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-gray-400" />
                  {isEditing ? (
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="text-sm bg-gray-800 border-gray-700 h-8"
                    />
                  ) : (
                    <span>{formData.email}</span>
                  )}
                </div>
                <div className="hidden md:block text-gray-500">•</div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  {isEditing ? (
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="text-sm bg-gray-800 border-gray-700 h-8"
                    />
                  ) : (
                    <span>{formData.location}</span>
                  )}
                </div>
                <div className="hidden md:block text-gray-500">•</div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span>Joined {formData.joinedDate}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {formData.interests.map((interest, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <AnimatedButton size="sm" onClick={handleSave} variant="default">
                    <Save size={16} className="mr-1" />
                    Save
                  </AnimatedButton>
                  <AnimatedButton size="sm" onClick={handleCancel} variant="outline">
                    <X size={16} className="mr-1" />
                    Cancel
                  </AnimatedButton>
                </div>
              ) : (
                <AnimatedButton size="sm" onClick={() => setIsEditing(true)}>
                  <Edit size={16} className="mr-1" />
                  Edit Profile
                </AnimatedButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full min-h-[120px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200"
              />
            ) : (
              <p className="text-gray-300">{formData.bio}</p>
            )}
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail size={16} className="mr-3 text-gray-400" />
                    <span className="text-gray-300">{formData.email}</span>
                  </div>
                  <div className="flex items-center">
                    <User size={16} className="mr-3 text-gray-400" />
                    {isEditing ? (
                      <Input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="text-sm bg-gray-800 border-gray-700 h-8"
                      />
                    ) : (
                      <span className="text-gray-300">{formData.phoneNumber}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Professional Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Award size={16} className="mr-3 text-gray-400" />
                    {isEditing ? (
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="text-sm bg-gray-800 border-gray-700 h-8"
                      />
                    ) : (
                      <span className="text-gray-300">{formData.company}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Award size={16} className="mr-3 text-gray-400" />
                    {isEditing ? (
                      <Input
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="text-sm bg-gray-800 border-gray-700 h-8"
                      />
                    ) : (
                      <span className="text-gray-300">{formData.position}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-400 mb-1">12</div>
                <div className="text-sm text-gray-400">Events Attended</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-400 mb-1">5</div>
                <div className="text-sm text-gray-400">Questions Asked</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-400 mb-1">3</div>
                <div className="text-sm text-gray-400">Mic Requests</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-400 mb-1">8</div>
                <div className="text-sm text-gray-400">Polls Answered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row justify-between">
              <div>
                <h3 className="font-medium text-lg mb-1">Tech Summit 2024</h3>
                <div className="flex items-center text-gray-400 mb-2">
                  <Calendar size={14} className="mr-2" />
                  <span>Oct 15, 2024</span>
                  <span className="mx-2">•</span>
                  <MapPin size={14} className="mr-2" />
                  <span>Convention Center</span>
                </div>
                <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-400 rounded-md text-xs">
                  Registered
                </span>
              </div>
              <div className="mt-4 md:mt-0">
                <AnimatedButton size="sm">View Details</AnimatedButton>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row justify-between">
              <div>
                <h3 className="font-medium text-lg mb-1">AI Workshop</h3>
                <div className="flex items-center text-gray-400 mb-2">
                  <Calendar size={14} className="mr-2" />
                  <span>Jul 22, 2024</span>
                  <span className="mx-2">•</span>
                  <MapPin size={14} className="mr-2" />
                  <span>Innovation Hub</span>
                </div>
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">
                  Confirmed
                </span>
              </div>
              <div className="mt-4 md:mt-0">
                <AnimatedButton size="sm">View Details</AnimatedButton>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <AnimatedButton variant="outline" className="w-full">
            View All Events
          </AnimatedButton>
        </CardFooter>
      </Card>
    </div>
  );
}
