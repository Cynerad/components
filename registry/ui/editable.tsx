"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  ChangeEvent,
  ChangeEventHandler,
  ComponentProps,
  createContext,
  Dispatch,
  FocusEvent,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";

type EditableType = {
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
  placeholder?: string;
} & useRender.ComponentProps<"div"> &
  ComponentProps<"div">;

type EditableContextType = {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  editing: boolean;
  edit: () => void;
  save: () => void;
  cancel: () => void;
  placeholder: string;
};

const EditableContext = createContext<EditableContextType | null>(null);

const ROOT_NAME = "Editable";

function useEditableContext(consumerName: string) {
  const context = useContext(EditableContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function Editable({ value, defaultValue, onChange, placeholder, className, render, ...props }: EditableType) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState<string>(value ?? defaultValue ?? "");
  const savedText = useRef(text);

  const placeholderInput = placeholder ?? "Press to Edit";

  function edit() {
    savedText.current = text;
    setEditing(true);
  }

  function save() {
    setEditing(false);
    onChange?.({ target: { value: text } } as ChangeEvent<HTMLInputElement>);
  }

  function cancel() {
    setText(savedText.current);
    setEditing(false);
  }

  const contextValue: EditableContextType = {
    text,
    setText,
    editing,
    edit,
    save,
    cancel,
    placeholder: placeholderInput,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        className: cn("flex min-w-0 flex-col gap-2", className),
        onBlur: (e: FocusEvent<HTMLDivElement>) => {
          if (!e.currentTarget.contains(e.relatedTarget)) save();
        },
      },
      props,
    ),
    state: {
      slot: "editable",
    },
  });

  return <EditableContext value={contextValue}>{element}</EditableContext>;
}

type EditableAreaType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

function EditableArea({ render, className, ...props }: EditableAreaType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        role: "group",
        className: cn("relative inline-block min-w-0 data-disabled:cursor-not-allowed data-disabled:opacity-50", className),
      },
      props,
    ),
  });
  return element;
}

type EditablePreviewType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

function EditablePreview({ render = <Button variant="ghost" />, className, ...props }: EditablePreviewType) {
  const { text, placeholder, edit, editing } = useEditableContext("EditablePreview");

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        onClick: edit,
        className: cn("justify-start text-base", className),
        children: text ? text : <span className="text-muted-foreground">{placeholder}</span>,
      },
      props,
    ),
  });

  if (editing) return null;

  return element;
}

type EditableInputType = useRender.ComponentProps<"input"> & ComponentProps<"input">;

function EditableInput({ render = <Input />, ...props }: EditableInputType) {
  const { text, setText, save, cancel, editing } = useEditableContext("EditableInput");

  const element = useRender({
    defaultTagName: "input",
    render,
    props: mergeProps<"input">(
      {
        autoFocus: true,
        onKeyDown: (e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        },
        value: text,
        onChange: (e) => setText(e.target.value),
      },
      props,
    ),
  });

  if (!editing) return null;

  return element;
}

type EditableSubmitType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

function EditableSubmit({ render = <Button variant="default" />, ...props }: EditableSubmitType) {
  const { save, editing } = useEditableContext("EditableSubmit");

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        onClick: save,
      },
      props,
    ),
  });

  if (!editing) return null;

  return element;
}

type EditableCancelType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

function EditableCancel({ render = <Button variant="ghost" />, ...props }: EditableCancelType) {
  const { cancel, editing } = useEditableContext("EditableCancel");

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        onClick: cancel,
      },
      props,
    ),
  });

  if (!editing) return null;

  return element;
}

export { Editable, EditableArea, EditableCancel, EditableInput, EditablePreview, EditableSubmit };
