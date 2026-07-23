"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { MaskInput } from "@/registry/ui/mask-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  card: z.string().max(16).min(16),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      card: "fdas fasd fasjd",
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
      <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="card"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="card">Card label</FieldLabel>
              <MaskInput {...field} id="card" type="string" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Container>
  );
}
