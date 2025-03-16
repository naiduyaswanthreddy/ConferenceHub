
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export default function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <Card 
      className={cn(
        "hover-scale border-none shadow-lg cursor-pointer transition-all", 
        index % 3 === 0 ? "shadow-primary/5" : 
        index % 3 === 1 ? "shadow-blue-500/5" : "shadow-purple-500/5"
      )}
    >
      <CardHeader>
        <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
