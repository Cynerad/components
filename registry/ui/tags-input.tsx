"use client";

import { Button } from "@/components/ui/button";
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
import { PlusIcon, RefreshCcw } from "lucide-react";
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

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    add();
  }

  function add() {
    if (!canAddExtraTag) return;

    const value = inputValue.trim();
    if (!value) return;
    if (selectedItems.includes(value)) {
      setInputValue("");
      return;
    }

    setSelectedItemsAction?.([...selectedItems, value]);
    setInputValue("");
  }

  function clear() {
    setSelectedItemsAction?.([]);
    setInputValue("");
  }

  const showClearButton = selectedItems.length > 0;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (!event.canceled && setSelectedItemsAction) {
          setSelectedItemsAction(move(selectedItems, event));
        }
      }}
    >
      <div className="flex flex-col md:flex-row items-center gap-2 rounded-xs">
        <Combobox multiple autoHighlight items={items} value={selectedItems} onValueChange={setSelectedItemsAction}>
          <ComboboxChips ref={anchor} className="w-full">
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value: string, index: number) => (
                    <SortableChip key={value} id={value} index={index} />
                  ))}
                  <ComboboxChipsInput value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>

          <ComboboxContent anchor={anchor}>
            {!canAddExtraTag && <ComboboxEmpty>No items found.</ComboboxEmpty>}
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start w-full gap-1">
          {canAddExtraTag && (
            <Button size="sm" variant="outline" onClick={add} className="w-full md:w-auto" disabled={inputValue.trim().length === 0}>
              <PlusIcon />
            </Button>
          )}

          {showClearButton && (
            <Button size="sm" variant="outline" onClick={clear} className="w-full md:w-auto">
              <RefreshCcw />
              Clear
            </Button>
          )}
        </div>
      </div>
    </DragDropProvider>
  );
}
