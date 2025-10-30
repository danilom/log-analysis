import { addFilter, createFilter, refreshEditors } from "./commands";
import { State } from "./extension";
import * as vscode from "vscode";

export function extractFilters(state: State) {
  // TODO: make the filter configurable
  // 12:42:01.371 install:reso 
  const filterRegex = /^[^ ]+ ([^ ]+) /;

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No active editor found.");
    return;
  }

  const documentText = editor.document.getText();
  const lines = documentText.split(/\r?\n/);

  const filterTexts = new Set<string>();
  for (const line of lines) {
    const match = line.match(filterRegex);
    if (match) {
      // TODO: plaintext vs regex
      const filterText = match[1].trim();
      filterTexts.add(filterText);
    }
  }

  for (const filterText of filterTexts) {
    createFilter(filterText, state);
  }
  refreshEditors(state);
}

