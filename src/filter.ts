import * as vscode from "vscode";
import { generateColorFromText, generateSvgUri } from "./utils";

let _nextFilterId = 1;

// One filter corresponds to one line in the configuration file
export abstract class Filter {
    id: string; //random generated number

    isHighlighted = true; // if the matching lines will be highlighted
    isShown = true; //if the matching lines will be kept in focus mode
    count = 0; //count of lines which match the filter in the active editor

    color: string;
    iconPath: vscode.Uri; //dataUri representing the isHighlighted/isNotHighlighted svg icon

    constructor(colorHint: string) {
        this.id = `${_nextFilterId++}`;

        this.color = "";
        this.iconPath = vscode.Uri.parse("");
        this.setColorAndIcon(colorHint);
    }
    protected setColorAndIcon(colorHint: string) {
        this.color = generateColorFromText(colorHint);
        this.iconPath = generateSvgUri(this.color, this.isHighlighted);
    }

    abstract isMatch(line: string): boolean;
    abstract getLabel(): string;
    abstract edit(filterText: string): void;

    abstract toJSON(): any;
    protected baseToJSON(): any {
        return {
            color: this.color,
            isHighlighted: this.isHighlighted,
            isShown: this.isShown,
        };
    }

    static fromJSON(filterText: any): Filter {
        if (typeof filterText.color !== "string" ||
            typeof filterText.isHighlighted !== "boolean" ||
            typeof filterText.isShown !== "boolean"
        ) {
            throw new Error("Invalid entry: missing color, isHighlighted or isShown");
        }

        let filter: Filter;
        if (typeof filterText.categoryRegexText === "string") {
            filter = new CategoryFilter(
                filterText.categoryName as string,
                new RegExp(filterText.categoryRegexText)
            );
        }
        else if (typeof filterText.regexText === "string") {
            filter = new RegexFilter(
                new RegExp(filterText.regexText)
            );
        }
        else {
            throw new Error("Invalid entry: missing regexText or categoryRegexText");
        }

        filter.color = filterText.color as string;
        filter.isHighlighted = filterText.isHighlighted as boolean;
        filter.isShown = filterText.isShown as boolean;

        return filter;
    }
};
export class RegexFilter extends Filter {
    constructor(
        public regex: RegExp) 
    {
        super(regex.source);
    }

    isMatch(line: string): boolean {
        return this.regex.test(line);
    }

    getLabel(): string {
        return this.regex.toString();
    }

    edit(filterText: string): void {
        this.regex = new RegExp(filterText);
        this.setColorAndIcon(filterText);
    }

    toJSON(): any {
        const obj = this.baseToJSON();
        obj.regexText = this.regex.source;
        return obj;
    }
}

export class CategoryFilter extends Filter {
    constructor(
            public categoryName: string, 
            public readonly categoryRegex: RegExp) 
    {
        super(categoryName);
    }

    isMatch(line: string): boolean {
        const match = line.match(this.categoryRegex);
        if (!match) {
            // TODO: suppport a special "NO CATEGORY" filter
            return false;
        }
        // TODO: plaintext vs regex
        const catName = match[1].trim();
        return catName === this.categoryName;
    }

    getLabel(): string {
        return this.categoryName;
    }

    edit(filterText: string): void {
        this.categoryName = filterText;
        this.setColorAndIcon(filterText);
    }

    toJSON(): any {
        const obj = this.baseToJSON();
        obj.categoryRegexText = this.categoryRegex.source;
        obj.categoryName = this.categoryName;
        return obj;
    }
}
