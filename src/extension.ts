// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ImageFileWatcher from './ImageFileWatcher';
import ImageCompressor from './ImageCompressor';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "auto-image-compressor" is now active!');

	const watcher = new ImageFileWatcher(context);
	const compressor = new ImageCompressor();
	
	// 首次安装检测
	// const isFirstTime = context.globalState.get('autoImageCompressor.firstInstall', true);
	// if (isFirstTime) {
	// 	await vscode.commands.executeCommand('auto-image-compressor.setApiKey');
	// 	context.globalState.update('autoImageCompressor.firstInstall', false);
	// }
	checkApiKey(compressor);
	watcher.onDidCreate(async(uri) => {
		console.log('detected image added', uri.fsPath);
		const result = await vscode.window.showInformationMessage(`Image ${uri.fsPath} has been added, do you want to compress it?`, 'Override', 'No');
		if (result === 'Override') {
			compressor.compress(uri.fsPath, uri.fsPath);
		}
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('auto-image-compressor.setApiKey', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Setting tinify api key for auto-image-compressor!');
		setApiKey(compressor);
	});

	context.subscriptions.push(disposable);
}

async function checkApiKey(compressor: ImageCompressor) {
	const apiKey = vscode.workspace.getConfiguration('autoImageCompressor').get('tinifyApiKey');
	if (!apiKey) {
		const result = await vscode.window.showInformationMessage('Please set the tinify api key, you can get it from https://tinypng.com/developers', 'Set API Key', 'Maybe later');
		if (result === 'Set API Key') {
			await setApiKey(compressor);
		}
	}
}

async function setApiKey(compressor: ImageCompressor) {
	const apiKey = await vscode.window.showInputBox({
		prompt: 'Please enter the tinify api key',
	});
	if (apiKey) {
		vscode.workspace.getConfiguration('autoImageCompressor').update('tinifyApiKey', apiKey, vscode.ConfigurationTarget.Global);
		compressor.updateApiKey(apiKey);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
