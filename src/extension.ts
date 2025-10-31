import * as vscode from "vscode";
import {
    addFilter,
    applyHighlight,
    deleteFilter,
    editFilter,
    exportFilters,
    importFilters,
    refreshEditors,
    setHighlight,
    setVisibility,
    turnOnFocusMode,
} from "./commands";

import { FilterTreeViewProvider } from "./filterTreeViewProvider";
import { FocusProvider } from "./focusProvider";
import { extractCategoryFilters } from "./category_filters";
import { Filter } from "./filter";

export type State = {
    inFocusMode: boolean;
    filterArr: Filter[];
    decorations: vscode.TextEditorDecorationType[];
    disposableFoldingRange: vscode.Disposable | null;
    filterTreeViewProvider: FilterTreeViewProvider;
    focusProvider: FocusProvider;
};

export function activate(context: vscode.ExtensionContext) {
    //internal globals
    const filterArr: Filter[] = [];
    const state: State = {
        inFocusMode: false,
        filterArr,
        decorations: [],
        disposableFoldingRange: null,
        filterTreeViewProvider: new FilterTreeViewProvider(filterArr),
        focusProvider: new FocusProvider(filterArr),
    };
    //tell vs code to open focus:... uris with state.focusProvider
    const disposableFocus = vscode.workspace.registerTextDocumentContentProvider(
        "focus",
        state.focusProvider
    );
    context.subscriptions.push(disposableFocus);
    //register filterTreeViewProvider under id 'filters' which gets attached
    //to the file explorer according to package.json's contributes>views>explorer
    const treeView = vscode.window.createTreeView("filters", {
        treeDataProvider: state.filterTreeViewProvider,
    });

    // Handle checkbox state changes
    const disposableCheckboxChange = treeView.onDidChangeCheckboxState((event) => {
        for (const [item, checkboxState] of event.items) {
            const isShown = checkboxState === vscode.TreeItemCheckboxState.Checked;
            setVisibility(isShown, item, state);
        }
    });
    context.subscriptions.push(disposableCheckboxChange);

    //Add events listener
    var disposableOnDidChangeVisibleTextEditors =
        vscode.window.onDidChangeVisibleTextEditors((event) => {
            refreshEditors(state);
        });
    context.subscriptions.push(disposableOnDidChangeVisibleTextEditors);

    var disposableOnDidChangeTextDocument =
        vscode.workspace.onDidChangeTextDocument((event) => {
            refreshEditors(state);
        });
    context.subscriptions.push(disposableOnDidChangeTextDocument);

    var disposableOnDidChangeActiveTextEditor =
        vscode.window.onDidChangeActiveTextEditor((event) => {
            //update the filter counts for the current activate editor
            applyHighlight(state, vscode.window.visibleTextEditors);
            state.filterTreeViewProvider.refresh();
        });
    context.subscriptions.push(disposableOnDidChangeActiveTextEditor);

    //register commands
    let disposableExport = vscode.commands.registerCommand(
        "log-analysis.exportFilters",
        () => exportFilters(state)
    );
    context.subscriptions.push(disposableExport);

    let disposableImport = vscode.commands.registerCommand(
        "log-analysis.importFilters",
        () => importFilters(state)
    );
    context.subscriptions.push(disposableImport);

    let disposableTurnOnFocusMode = vscode.commands.registerCommand(
        "log-analysis.turnOnFocusMode",
        () => turnOnFocusMode(state)
    );
    context.subscriptions.push(disposableTurnOnFocusMode);

    let disposableExtractFilters = vscode.commands.registerCommand(
        "log-analysis.extractFilters",
        () => extractCategoryFilters(state)
    );
    context.subscriptions.push(disposableExtractFilters);

    let disposibleAddFilter = vscode.commands.registerCommand(
        "log-analysis.addFilter",
        () => addFilter(state)
    );
    context.subscriptions.push(disposibleAddFilter);

    let disposibleEditFilter = vscode.commands.registerCommand(
        "log-analysis.editFilter",
        (filterTreeItem: vscode.TreeItem) => editFilter(filterTreeItem, state)
    );
    context.subscriptions.push(disposibleEditFilter);

    let disposibleDeleteFilter = vscode.commands.registerCommand(
        "log-analysis.deleteFilter",
        (filterTreeItem: vscode.TreeItem) => deleteFilter(filterTreeItem, state)
    );
    context.subscriptions.push(disposibleDeleteFilter);

    let disposibleEnableHighlight = vscode.commands.registerCommand(
        "log-analysis.enableHighlight",
        (filterTreeItem: vscode.TreeItem) =>
            setHighlight(true, filterTreeItem, state)
    );
    context.subscriptions.push(disposibleEnableHighlight);

    let disposibleDisableHighlight = vscode.commands.registerCommand(
        "log-analysis.disableHighlight",
        (filterTreeItem: vscode.TreeItem) =>
            setHighlight(false, filterTreeItem, state)
    );
    context.subscriptions.push(disposibleDisableHighlight);
}

// this method is called when your extension is deactivated
export function deactivate() { }
