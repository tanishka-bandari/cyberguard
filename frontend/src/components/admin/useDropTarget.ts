import { useState, type DragEvent } from "react";

// Drag-over handling shared by the board columns and the staff chips.
// Only a valid target (enabled) accepts the drop.
export function useDropTarget(enabled: boolean, onDrop: () => void) {
  const [over, setOver] = useState(false);

  return {
    isOver: enabled && over,
    handlers: {
      onDragOver: (e: DragEvent) => {
        if (!enabled) return;
        e.preventDefault();
        setOver(true);
      },
      onDragLeave: (e: DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        if (enabled) onDrop();
      },
    },
  };
}
