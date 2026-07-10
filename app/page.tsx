"use client";

import { Container } from "@/components/ui/container";
import { SpeedDial, SpeedDialContent, SpeedDialItem, SpeedDialTrigger } from "@/registry/ui/speed-dial";
import { Copy, Plus, Share } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  title: z.string().max(9),
});
const timelineItems = [
  {
    id: "project-kickoff",
    dateTime: "2025-01-15",
    date: "January 15, 2025",
    title: "Project Kickoff",
    description: "Initial meeting to define scope.",
  },
  {
    id: "design-phase",
    dateTime: "2025-02-01",
    date: "February 1, 2025",
    title: "Design Phase",
    description: "Created wireframes and mockups.",
  },
  {
    id: "development",
    dateTime: "2025-03-01",
    date: "March 1, 2025",
    title: "Development",
    description: "Building core features.",
  },
];

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  }
  return (
    <Container>
      {/*<form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">Bug Title</FieldLabel>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit">submit</Button>
      </form>*/}
      <div className="fixed bottom-5 right-5">
        <SpeedDial>
          <SpeedDialTrigger>
            <Plus />
          </SpeedDialTrigger>
          <SpeedDialContent>
            <SpeedDialItem onClick={() => console.log("copy")}>
              <Copy />
            </SpeedDialItem>
            <SpeedDialItem onClick={() => console.log("share")}>
              <Share />
            </SpeedDialItem>
          </SpeedDialContent>
        </SpeedDial>
      </div>
    </Container>
  );
}
