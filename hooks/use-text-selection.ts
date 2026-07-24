import { useCallback, useEffect, useState } from "react";

type SelectionRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function useTextSelection() {
  const [text, setText] = useState("");
  const [rect, setRect] = useState<SelectionRect | null>(null);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();

    // Clear state if no valid selection exists
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setText("");
      setRect(null);
      return;
    }

    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    const clientRect = range.getBoundingClientRect();

    setText(selectedText);
    setRect({
      top: clientRect.top + window.scrollY,
      left: clientRect.left + window.scrollX,
      width: clientRect.width,
      height: clientRect.height,
    });
  }, []);

  useEffect(() => {
    // Listen to native DOM selection changes
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return { text, rect };
}

export default useTextSelection;
