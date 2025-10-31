import * as vscode from "vscode";
const crypto = require('crypto');

function getStringHash(text: string): number {
    if (text.length === 0) { return 0; }
    return parseInt(crypto.createHash('sha1').update(text).digest('hex').slice(0, 8), 16);
}

export function generateColorFromText(seedText: string): string {
    const hash = getStringHash(seedText);
    const MAX_32BIT_INT = 2147483648; // 2^31
    const factor = Math.abs(hash) / MAX_32BIT_INT; // Convert hash to 0-1 range
    return `hsl(${Math.floor(360 * factor)}, 40%, 40%)`;
}

// Creates an svg icon representing a filter: a filled circle if the filter is highlighted, or an empty circle otherwise.
// this icon is stored as a dataUri.
export function generateSvgUri(
    color: string,
    isHighlighted: boolean
): vscode.Uri {
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="${color}" cx="50" cy="50" r="50"/></svg>`;
    const emptySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle stroke="${color}" fill="transparent" stroke-width="10" cx="50" cy="50" r="45"/></svg>`;
    const svgContent = isHighlighted ? fullSvg : emptySvg;
    const dataUri = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    return vscode.Uri.parse(dataUri);
}
