"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Editable, EditableArea, EditableCancel, EditableInput, EditablePreview, EditableSubmit } from "@/registry/ui/editable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  title: z.string().min(5, "Bug title must be at least 5 characters.").max(32, "Bug title must be at most 32 characters."),
});

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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">title</FieldLabel>
              <Editable {...field}>
                <EditableArea>
                  <EditablePreview />
                  <EditableInput />
                </EditableArea>
                <div className="flex items-center gap-1">
                  <EditableSubmit>Edit</EditableSubmit>
                  <EditableCancel>Cancel</EditableCancel>
                </div>
              </Editable>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit">submit</Button>
      </form>
    </Container>
  );
}
