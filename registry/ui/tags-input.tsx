"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { KeyboardEvent, useState } from "react";

type SortableChipType = {
  id: string;
  index: number;
};

export type TagsInputType = {
  items?: string[];
  selectedItems?: string[];
  setSelectedItemsAction?: (value: string[]) => void;
  canAddExtraTag?: boolean;
};

function SortableChip({ id, index }: SortableChipType) {
  const { ref } = useSortable({ id, index });

  return (
    <ComboboxChip key={id} ref={ref}>
      {id}
    </ComboboxChip>
  );
}

export function TagsInput({ items = [], selectedItems = [], setSelectedItemsAction, canAddExtraTag = true }: TagsInputType) {
  const [inputValue, setInputValue] = useState("");
  const anchor = useComboboxAnchor();

  function add(event: KeyboardEvent<HTMLInputElement>) {
    if (!canAddExtraTag) return;

    if (event.key !== "Enter") return;

    const value = inputValue.trim();
    if (!value) return;
    if (selectedItems.includes(value)) {
      setInputValue("");
      return;
    }

    setSelectedItemsAction?.([...selectedItems, value]);
    setInputValue("");
  }

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (!event.canceled && setSelectedItemsAction) {
          setSelectedItemsAction(move(selectedItems, event));
        }
      }}
    >
      <Combobox multiple autoHighlight items={items} value={selectedItems} onValueChange={setSelectedItemsAction}>
        <ComboboxChips ref={anchor} className="w-full max-w-xs">
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value: string, index: number) => (
                  <SortableChip key={value} id={value} index={index} />
                ))}
                <ComboboxChipsInput value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={add} />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </DragDropProvider>
  );
}
