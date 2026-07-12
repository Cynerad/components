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

type SortableChipType = {
  id: string;
  index: number;
};

function SortableChip({ id, index }: SortableChipType) {
  const { ref } = useSortable({ id, index });

  return (
    <ComboboxChip key={id} ref={ref}>
      {id}
    </ComboboxChip>
  );
}

export type TagsInputType = {
  items?: string[];
  selectedItems?: string[];
  setSelectedItemsAction?: (value: string[]) => void;
};

export function TagsInput({ items = [], selectedItems = [], setSelectedItemsAction }: TagsInputType) {
  const anchor = useComboboxAnchor();

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
                <ComboboxChipsInput />
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
