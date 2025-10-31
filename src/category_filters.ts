import { refreshEditors } from "./commands";
import { State } from "./extension";
import * as vscode from "vscode";
import { CategoryFilter } from "./filter";

export function extractCategoryFilters(state: State) {
    // TODO: make the filter configurable
    // 12:42:01.371 install:reso 
    const categoryRegex = /^[^ ]+ ([^ ]+) /;

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("No active editor found.");
        return;
    }

    const documentText = editor.document.getText();
    const lines = documentText.split(/\r?\n/);

    const categories = new Set<string>();
    for (const line of lines) {
        const match = line.match(categoryRegex);
        if (match) {
            // TODO: plaintext vs regex
            const catName = match[1].trim();
            categories.add(catName);
        }
    }

    for (const cat of categories) {
        const filter = new CategoryFilter(cat, categoryRegex);
        state.filterArr.push(filter);
    }
    refreshEditors(state);
}

