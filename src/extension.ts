// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ImageFileWatcher from './ImageFileWatcher';
import ImageCompressor from './ImageCompressor';
import * as path from 'path';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "auto-image-compressor" is now active!');

	const watcher = new ImageFileWatcher(context);
	const compressor = new ImageCompressor();
	watcher.onDidCreate(async(uri) => {
		console.log('detected image added', uri.fsPath);
		const result = await vscode.window.showInformationMessage(`Image ${uri.fsPath} has been added, do you want to compress it?`, 'Yes', 'No');
		if (result === 'Yes') {
			compressor.compress(uri.fsPath, path.resolve(uri.fsPath, '../', 'out.png'));
		}
	});
	watcher.onDidChange(async (uri) => {
		console.log('detected image modified', uri.fsPath);
		const result = await vscode.window.showInformationMessage(`Image ${uri.fsPath} has been modified, do you want to compress it?`, 'Yes', 'No');
		if (result === 'Yes') {
			console.log('compressing image');
		}
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('auto-image-compressor.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from auto-image-compressor!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
