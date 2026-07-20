"use client";

import { Container } from "@/components/ui/container";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  type StepperType,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/registry/ui/stepper";

const steps = [
  {
    value: "account",
    title: "Account Setup",
    description: "Create your account",
    fields: ["username", "email"] as const,
  },
  {
    value: "profile",
    title: "Profile Info",
    description: "Complete your profile",
    fields: ["firstName", "lastName", "bio"] as const,
  },
  {
    value: "review",
    title: "Review",
    description: "Review your information",
    fields: [] as const,
  },
];

export default function Home() {
  return (
    <Container className="h-[200vh]">
      <Stepper defaultValue="account" className="w-full max-w-md">
        <StepperList>
          {steps.map((step) => (
            <StepperItem key={step.value} value={step.value}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col gap-1">
                  <StepperTitle>{step.title}</StepperTitle>
                  <StepperDescription>{step.description}</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator className="mx-4" />
            </StepperItem>
          ))}
        </StepperList>
        {steps.map((step) => (
          <StepperContent
            key={step.value}
            value={step.value}
            className="flex flex-col items-center gap-4 rounded-md border bg-card p-4 text-card-foreground"
          >
            <div className="flex flex-col items-center gap-px text-center">
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <p className="text-sm">Content for {step.title} goes here.</p>
          </StepperContent>
        ))}

        <StepperPrev>Previous</StepperPrev>

        <StepperNext>Next</StepperNext>
      </Stepper>
    </Container>
  );
}
