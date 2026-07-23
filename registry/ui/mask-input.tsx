"use client";

import { Input } from "@/components/ui/input";
import { useAsRef } from "@/hooks/use-as-ref";
import { useComposedRefs } from "@/hooks/use-composed-refs";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChangeEvent, ComponentProps, useEffect, useState } from "react";
import { useIMask } from "react-imask";

type MaskOptionsType = {
  maskOptions?: Parameters<typeof useIMask>[0];
};

type MaskInputType = MaskOptionsType & useRender.ComponentProps<"input"> & ComponentProps<"input">;

function MaskInput({
  render = <Input />,
  value: valueProp,
  maskOptions = { mask: "(000) 000-0000" },
  defaultValue,
  onChange: onChangeProp,
  ref: refProp,
  ...props
}: MaskInputType) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const { ref, setValue } = useIMask(maskOptions, {
    defaultValue: String(value ?? ""),
    onAccept: (_, mask) => {
      if (!isControlled) setInternalValue(mask.value);

      const syntheticEvent = {
        target: { value: mask.unmaskedValue },
      } as ChangeEvent<HTMLInputElement>;

      propsRef.current.onChange?.(syntheticEvent);
    },
  });

  const propsRef = useAsRef({
    onChange: onChangeProp,
  });

  const composedRef = useComposedRefs(refProp, ref);

  useEffect(() => {
    if (isControlled && typeof valueProp === "string") {
      setValue(valueProp);
    }
  }, [isControlled, valueProp, setValue]);

  const element = useRender({
    defaultTagName: "input",
    render,
    props: mergeProps<"input">(
      {
        ref: composedRef,
      },
      props,
    ),
    state: {
      slot: "masked-input",
    },
  });

  return element;
}
export { MaskInput };
