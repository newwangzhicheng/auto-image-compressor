import * as vscode from 'vscode';
class ImageFileWatcher {
    private watcher: vscode.FileSystemWatcher;
    constructor(context: vscode.ExtensionContext) {
        // 监听创建、修改
        this.watcher = vscode.workspace.createFileSystemWatcher('**/*.{png,jpg,jpeg,gif,webp}', false, false, true);
        context.subscriptions.push(this.watcher);
    }

    public onDidCreate(callback: (uri: vscode.Uri) => void): void {
        this.watcher.onDidCreate(callback);
    }

    public onDidChange(callback: (uri: vscode.Uri) => void): void {
        this.watcher.onDidChange(callback);
    }
}

export default ImageFileWatcher;