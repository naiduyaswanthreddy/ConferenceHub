
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  index: number;
}

export default function PricingCard({ plan, index }: PricingCardProps) {
  return (
    <Card 
      className={cn(
        "flex flex-col h-full",
        plan.popular && "relative border-primary shadow-lg shadow-primary/10 z-10 scale-105 md:-mt-4 md:-mb-4"
      )}
      glass={plan.popular}
    >
      {plan.popular && (
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
          Most Popular
        </span>
      )}
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.price !== "Custom" && <span className="text-sm text-muted-foreground">/month</span>}
        </CardTitle>
        <h3 className="text-xl font-semibold mt-2">{plan.name}</h3>
        <p className="text-muted-foreground">{plan.description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <AnimatedButton 
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
        >
          {plan.cta}
        </AnimatedButton>
      </CardFooter>
    </Card>
  );
}
