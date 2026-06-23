"use client";

import Container from "@/components/ui/container";
import { Field, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/registry/ui/password-input";

export default function Home() {
  return (
    <Container>
      <Field className="max-w-sm">
        <FieldLabel htmlFor="password">Input</FieldLabel>
        <PasswordInput name="password" id="password" />
      </Field>
    </Container>
  );
}
