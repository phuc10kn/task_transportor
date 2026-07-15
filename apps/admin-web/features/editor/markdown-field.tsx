"use client";

import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";

type MarkdownFieldProps = {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const inlineCommands = new Set(["bold", "italic", "strikethrough", "code", "link"]);

export function MarkdownField({ ariaLabel, value, onChange, disabled = false }: MarkdownFieldProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="markdown-field mt-2 overflow-hidden rounded-lg border" data-color-mode="light">
      <div className="flex items-center justify-between border-b bg-[var(--surface-muted)] px-3 py-2">
        <button
          aria-label={`Switch Markdown mode (currently ${mode})`}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          disabled={disabled}
          onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
          type="button"
        >
          {mode === "edit" ? "Preview" : "Edit"}
        </button>
        <span className="text-subtle text-xs">Markdown</span>
      </div>
      <MDEditor
        className="markdown-field__editor"
        commandsFilter={(command) => {
          if (command.name === "preview" || command.name === "live") return false;
          if (!command.name || !inlineCommands.has(command.name) || !command.execute) return command;
          const execute = command.execute;
          return {
            ...command,
            execute: (state, api, dispatch, executeState, shortcuts) => {
              let end = state.selection.end;
              while (end > state.selection.start && /[\r\n]/.test(state.text.charAt(end - 1))) end -= 1;
              if (end === state.selection.end) return execute(state, api, dispatch, executeState, shortcuts);
              return execute({ ...state, selectedText: state.text.slice(state.selection.start, end), selection: { ...state.selection, end } }, api, dispatch, executeState, shortcuts);
            },
          };
        }}
        height={260}
        onChange={(nextValue) => onChange(nextValue || "")}
        preview={mode}
        textareaProps={{ "aria-label": ariaLabel, disabled, placeholder: "Write Markdown…" }}
        value={value}
      />
    </div>
  );
}
