"use client";

import { EyeClosed, EyeOffIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ComponentProps, useState } from "react";

type PasswordInputType = {
  name: string;
} & ComponentProps<typeof InputGroupInput>;

export function PasswordInput({ name, ...props }: PasswordInputType) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput name={name} type={showPassword ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={() => setShowPassword((p) => !p)}>{showPassword ? <EyeClosed /> : <EyeOffIcon />}</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
