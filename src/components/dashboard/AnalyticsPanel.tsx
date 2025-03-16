import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { staticDemoData } from "@/integrations/supabase/client";
import { Calendar, Users, Zap, Mail } from "lucide-react";

export default function AnalyticsPanel() {
  // Use static data for analytics
  const { eventAttendance, userGrowth, featureUsage, topEvents } = staticDemoData.analytics;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{topEvents.length}</p>
            <p className="text-sm text-muted-foreground">Total events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-purple-500" />
              Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {topEvents.reduce((sum, event) => sum + event.attendees, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total attendees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-500" />
              Fill Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round(topEvents.reduce((sum, event) => sum + event.fillRate, 0) / topEvents.length)}%
            </p>
            <p className="text-sm text-muted-foreground">Average fill rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Mail className="mr-2 h-5 w-5 text-green-500" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {featureUsage.reduce((sum, feature) => sum + feature.count, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total interactions</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Attendance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart 
              data={eventAttendance}
              index="name"
              categories={["attendees"]}
              colors={["purple"]}
              valueFormatter={(value) => `${value} attendees`}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <LineChart 
              data={userGrowth}
              index="name"
              categories={["users"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value} users`}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart 
              data={featureUsage}
              index="name"
              category="count"
              valueFormatter={(value) => `${value} uses`}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Event</th>
                    <th className="text-right py-3 px-4 font-medium">Attendees</th>
                    <th className="text-right py-3 px-4 font-medium">Capacity</th>
                    <th className="text-right py-3 px-4 font-medium">Fill Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topEvents.map((event) => (
                    <tr key={event.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">{event.title}</td>
                      <td className="py-3 px-4 text-right">{event.attendees}</td>
                      <td className="py-3 px-4 text-right">{event.capacity}</td>
                      <td className="py-3 px-4 text-right">{event.fillRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
