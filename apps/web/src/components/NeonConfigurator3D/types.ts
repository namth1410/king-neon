// Types for per-character styling in NeonConfigurator3D

/**
 * Individual character with its own styling properties.
 * Each character can have a unique color and font.
 */
export interface StyledChar {
  char: string; // The character (single char or newline)
  color: string; // Color value, e.g., "#ff3366" or "rainbow"
  fontFamily: string; // Font family, e.g., "'Dancing Script', cursive"
}

/**
 * Selection range for characters.
 * Uses standard text selection semantics: start is inclusive, end is exclusive.
 */
export interface CharSelection {
  start: number; // Start index (inclusive)
  end: number; // End index (exclusive)
}

export type TextAlign = "left" | "center" | "right";

// Helper functions for converting between formats

/**
 * Convert a plain text string to an array of StyledChars with uniform styling
 */
export function stringToStyledChars(
  text: string,
  color: string,
  fontFamily: string
): StyledChar[] {
  return text.split("").map((char) => ({
    char,
    color,
    fontFamily,
  }));
}

/**
 * Convert StyledChars array back to plain text string
 */
export function styledCharsToString(chars: StyledChar[]): string {
  return chars.map((c) => c.char).join("");
}

/**
 * Split StyledChars into lines (by newline character)
 */
export function splitStyledCharsIntoLines(chars: StyledChar[]): StyledChar[][] {
  const lines: StyledChar[][] = [];
  let currentLine: StyledChar[] = [];

  for (const char of chars) {
    if (char.char === "\n") {
      lines.push(currentLine);
      currentLine = [];
    } else {
      currentLine.push(char);
    }
  }

  // Add the last line if not empty or if there are no lines yet
  if (currentLine.length > 0 || lines.length === 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Apply new styling to selected characters
 */
export function applyStyleToSelection(
  chars: StyledChar[],
  selection: CharSelection,
  updates: Partial<Pick<StyledChar, "color" | "fontFamily">>
): StyledChar[] {
  return chars.map((char, index) => {
    if (index >= selection.start && index < selection.end) {
      return { ...char, ...updates };
    }
    return char;
  });
}

/**
 * Apply styling to all characters
 */
export function applyStyleToAll(
  chars: StyledChar[],
  updates: Partial<Pick<StyledChar, "color" | "fontFamily">>
): StyledChar[] {
  return chars.map((char) => ({ ...char, ...updates }));
}

/**
 * Apply styling to characters by indices (for Set-based selection)
 */
export function applyStyleToIndices(
  chars: StyledChar[],
  indices: Set<number>,
  updates: Partial<Pick<StyledChar, "color" | "fontFamily">>
): StyledChar[] {
  return chars.map((char, index) => {
    if (indices.has(index)) {
      return { ...char, ...updates };
    }
    return char;
  });
}
