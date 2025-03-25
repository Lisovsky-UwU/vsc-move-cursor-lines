import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('moveCursorLines.move', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Request the user to enter a value
            const input = await vscode.window.showInputBox({
                prompt: `Line: ${editor.selection.active.line} Character: ${editor.selection.active.character}. Enter number to navigate (+ for down, - for up)`
            });

            if (!input) {
                return; // If the user has canceled the entry
            }

            // Input Parsing
            const match = input.match(/^([+-]?)(\d+)$/);
            if (!match) {
                vscode.window.showErrorMessage("Invalid input format. Use N, +N or -N.");
                return;
            }

            const direction = match[1]; // Direction
            const lineNumber = parseInt(match[2], 10); // Number of lines

            // Calculate new position
            let newRow = !!direction ? editor.selection.active.line + (direction === '-' ? -lineNumber : lineNumber) : lineNumber - 1;
            
            const changeColumn = vscode.workspace.getConfiguration('moveCursorLines').get<string>('changeColumn', 'start');
            
            let newPosition;
            if (changeColumn == 'save') {
                newPosition = editor.selection.active.with({
                    line: newRow,
                    character: editor.selection.active.character
                });
            } else if (changeColumn == 'end') {
                newPosition = editor.document.lineAt(newRow).range.end;
            } else {
                newPosition = editor.document.lineAt(newRow).range.start;
            }
            
            // Moving the cursor
			editor.revealRange(new vscode.Range(newPosition, newPosition));
            editor.selection = new vscode.Selection(newPosition, newPosition);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}