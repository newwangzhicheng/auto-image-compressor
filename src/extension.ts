// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import tinify from 'tinify';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "auto-image-compressor" is now active!');

	const imageWatcher = vscode.workspace.createFileSystemWatcher('**/*.{png,jpg,jpeg,gif,webp}', false, true, true);
	context.subscriptions.push(imageWatcher);
	
	await checkApiKey();
	
	// 注册图片创建事件监听器
	imageWatcher.onDidCreate(async (uri) => {
		const apiKey = vscode.workspace.getConfiguration('autoImageCompressor').get<string>('tinifyApiKey');
		if (!apiKey) {
			return;
		}
		const result = await vscode.window.showInformationMessage(`Image ${uri.fsPath} has been added, do you want to compress it?`, 'Compress and Override', 'No');
		if (result === 'Compress and Override') {
			tinifyCompress(uri.fsPath, uri.fsPath);
		}
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('autoImageCompressor.setApiKey', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Setting tinify api key for auto-image-compressor!');
		await setApiKey();
	});

	context.subscriptions.push(disposable);

	console.log('auto-image-compressor active finished');
}

// 导出供测试使用
export async function checkApiKey() {
	const apiKey = vscode.workspace.getConfiguration('autoImageCompressor').get('tinifyApiKey');
	if (!apiKey) {
		const result = await vscode.window.showInformationMessage('Please set the tinify api key, or run Set Tinify API Key command later, you can get it from https://tinypng.com/developers', 'Set API Key', 'Maybe later');
		if (result === 'Set API Key') {
			await setApiKey();
		}
	}
}

// 导出供测试使用
export async function setApiKey() {
	const apiKey = await vscode.window.showInputBox({
		prompt: 'Please enter the tinify api key',
	});
	if (apiKey) {
		await vscode.workspace.getConfiguration('autoImageCompressor').update('tinifyApiKey', apiKey, vscode.ConfigurationTarget.Global);
	}
}

// 导出供测试使用
export async function tinifyCompress(input: string, output: string) {
	const apiKey = vscode.workspace.getConfiguration('autoImageCompressor').get<string>('tinifyApiKey');
	if (!apiKey) {
		throw new Error('tinify api key is not set');
	}
	const filename = path.basename(input);
	// 获取输入文件的压缩信息
	const statOrigin = fs.statSync(input);
	return vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: 'Tinify',
		cancellable: false
	}, async (progress) => {
		try {
			progress.report({ increment: 0, message: `Compressing ${filename}...` });
			tinify.key = apiKey;
			const source = tinify.fromFile(input);
			progress.report({ increment: 30, message: `Compressing ${filename}...` });
			await source.preserve('copyright', 'creation', 'location').toFile(output);
			progress.report({ increment: 100, message: `Compressing ${filename} done` });
			// 获取压缩信息
			const statCompressed = fs.statSync(output);

			const savedPercent = Math.round((1 - statCompressed.size / statOrigin.size) * 100);
			vscode.window.showInformationMessage(`Tinify ${filename}: ${(statOrigin.size / 1024).toFixed(1)}KB -> ${(statCompressed.size / 1024).toFixed(1)}KB, saved ${savedPercent}%`);
			return true;
		} catch (error) {
			console.error(error);
			vscode.window.showErrorMessage(`Compressing ${filename} failed, Please check your tinify api key`);
			return false;
		}
	});

}

// This method is called when your extension is deactivated
export function deactivate() {}
