"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { StyledChar, CharSelection } from "./types";
import styles from "./NeonConfigurator3D.module.scss";

interface CharacterEditorProps {
  styledChars: StyledChar[];
  selection: CharSelection | null;
  onSelectionChange: (sel: CharSelection | null) => void;
  onCharsChange: (chars: StyledChar[]) => void;
  defaultColor: string;
  defaultFontFamily: string;
}

export default function CharacterEditor({
  styledChars,
  selection,
  onSelectionChange,
  onCharsChange,
  defaultColor,
  defaultFontFamily,
}: CharacterEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Handle mouse down on a character - start selection
  const handleCharMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      setIsSelecting(true);
      setSelectionStart(index);
      onSelectionChange({ start: index, end: index + 1 });
      hiddenInputRef.current?.focus();
    },
    [onSelectionChange]
  );

  // Handle mouse enter while selecting - extend selection
  const handleCharMouseEnter = useCallback(
    (index: number) => {
      if (isSelecting && selectionStart !== null) {
        const start = Math.min(selectionStart, index);
        const end = Math.max(selectionStart, index) + 1;
        onSelectionChange({ start, end });
      }
    },
    [isSelecting, selectionStart, onSelectionChange]
  );

  // Handle mouse up - end selection
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  // Global mouse up listener
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // Insert character at current position (defined first to avoid dependency issues)
  const insertCharacter = useCallback(
    (char: string) => {
      const newChar: StyledChar = {
        char,
        color: defaultColor,
        fontFamily: defaultFontFamily,
      };

      if (selection && selection.start !== selection.end) {
        // Replace selection with new character
        const newChars = [
          ...styledChars.slice(0, selection.start),
          newChar,
          ...styledChars.slice(selection.end),
        ];
        onCharsChange(newChars);
        onSelectionChange({
          start: selection.start + 1,
          end: selection.start + 1,
        });
      } else if (selection) {
        // Insert at cursor position
        const newChars = [
          ...styledChars.slice(0, selection.start),
          newChar,
          ...styledChars.slice(selection.start),
        ];
        onCharsChange(newChars);
        onSelectionChange({
          start: selection.start + 1,
          end: selection.start + 1,
        });
      } else {
        // Append to end
        onCharsChange([...styledChars, newChar]);
        onSelectionChange({
          start: styledChars.length + 1,
          end: styledChars.length + 1,
        });
      }
    },
    [
      styledChars,
      selection,
      defaultColor,
      defaultFontFamily,
      onCharsChange,
      onSelectionChange,
    ]
  );

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key;

      if (key === "Backspace") {
        e.preventDefault();
        if (selection && selection.start !== selection.end) {
          // Delete selected characters
          const newChars = [
            ...styledChars.slice(0, selection.start),
            ...styledChars.slice(selection.end),
          ];
          onCharsChange(newChars);
          onSelectionChange(null);
        } else if (selection && selection.start > 0) {
          // Delete character before cursor
          const deleteIndex = selection.start - 1;
          const newChars = [
            ...styledChars.slice(0, deleteIndex),
            ...styledChars.slice(deleteIndex + 1),
          ];
          onCharsChange(newChars);
          onSelectionChange({ start: deleteIndex, end: deleteIndex });
        } else if (!selection && styledChars.length > 0) {
          // No selection, delete last character
          onCharsChange(styledChars.slice(0, -1));
        }
      } else if (key === "Delete") {
        e.preventDefault();
        if (selection && selection.start !== selection.end) {
          // Delete selected characters
          const newChars = [
            ...styledChars.slice(0, selection.start),
            ...styledChars.slice(selection.end),
          ];
          onCharsChange(newChars);
          onSelectionChange(null);
        } else if (selection && selection.start < styledChars.length) {
          // Delete character at cursor
          const newChars = [
            ...styledChars.slice(0, selection.start),
            ...styledChars.slice(selection.start + 1),
          ];
          onCharsChange(newChars);
        }
      } else if (key === "Enter") {
        e.preventDefault();
        insertCharacter("\n");
      } else if (key === "Escape") {
        e.preventDefault();
        onSelectionChange(null);
        hiddenInputRef.current?.blur();
      } else if (key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // Select all
        if (styledChars.length > 0) {
          onSelectionChange({ start: 0, end: styledChars.length });
        }
      } else if (key === "ArrowLeft") {
        e.preventDefault();
        if (selection) {
          const newPos = Math.max(0, selection.start - 1);
          if (e.shiftKey) {
            // Extend selection left
            onSelectionChange({ start: newPos, end: selection.end });
          } else {
            // Move cursor left
            onSelectionChange({ start: newPos, end: newPos });
          }
        }
      } else if (key === "ArrowRight") {
        e.preventDefault();
        if (selection) {
          const newPos = Math.min(styledChars.length, selection.end);
          if (e.shiftKey) {
            // Extend selection right
            onSelectionChange({
              start: selection.start,
              end: Math.min(styledChars.length, selection.end + 1),
            });
          } else {
            // Move cursor right
            onSelectionChange({ start: newPos, end: newPos });
          }
        }
      }
    },
    [styledChars, selection, onCharsChange, onSelectionChange, insertCharacter]
  );

  // Handle text input
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value) {
        // Insert each character
        for (const char of value) {
          insertCharacter(char);
        }
        // Clear the hidden input
        e.target.value = "";
      }
    },
    [insertCharacter]
  );

  // Handle container click to focus
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // If clicking on the container itself (not a character), put cursor at end
      if (e.target === containerRef.current) {
        hiddenInputRef.current?.focus();
        onSelectionChange({
          start: styledChars.length,
          end: styledChars.length,
        });
      }
    },
    [styledChars.length, onSelectionChange]
  );

  // Check if a character index is within selection
  const isSelected = (index: number): boolean => {
    if (!selection) return false;
    return index >= selection.start && index < selection.end;
  };

  // Render characters with their individual styles
  const renderCharacters = () => {
    if (styledChars.length === 0) {
      return <span className={styles.placeholder}>Click to add text...</span>;
    }

    return styledChars.map((styledChar, index) => {
      if (styledChar.char === "\n") {
        return (
          <span key={index} className={styles.charWrapper}>
            <span
              className={`${styles.char} ${styles.newlineChar} ${isSelected(index) ? styles.selected : ""}`}
              onMouseDown={(e) => handleCharMouseDown(index, e)}
              onMouseEnter={() => handleCharMouseEnter(index)}
              style={{
                color:
                  styledChar.color === "rainbow" ? "#ff00ff" : styledChar.color,
              }}
            >
              ↵
            </span>
            <br />
          </span>
        );
      }

      return (
        <span
          key={index}
          className={`${styles.char} ${isSelected(index) ? styles.selected : ""}`}
          onMouseDown={(e) => handleCharMouseDown(index, e)}
          onMouseEnter={() => handleCharMouseEnter(index)}
          style={{
            color:
              styledChar.color === "rainbow" ? "#ff00ff" : styledChar.color,
            fontFamily: styledChar.fontFamily,
          }}
        >
          {styledChar.char}
        </span>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.characterEditor} ${isFocused ? styles.focused : ""}`}
      onClick={handleContainerClick}
    >
      {/* Hidden input for keyboard capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        className={styles.hiddenInput}
        onKeyDown={handleKeyDown}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Render characters */}
      <div className={styles.charsContainer}>{renderCharacters()}</div>

      {/* Selection info */}
      {selection && selection.start !== selection.end && (
        <div className={styles.selectionInfo}>
          {selection.end - selection.start} char(s) selected
        </div>
      )}
    </div>
  );
}
