import sharp from 'sharp';
import fs from 'fs';
import tinify from 'tinify';
import * as vscode from 'vscode';
import * as path from 'path';
class ImageCompressor {
    private tinifyApiKey: string;
    constructor() {
        this.tinifyApiKey = vscode.workspace.getConfiguration('autoImageCompressor').get('tinifyApiKey') || '';
    }
   
    async compress(input: string, output: string) {
      await this.tinifyCompress(input, output);
    }
    /**
     * 使用sharp压缩图片，会替换图片
     * @param input 图片路径
     * @param output 压缩后的图片路径
     */
    async sharpCompress(input: string, output: string) {
        const image = sharp(input);
        const metadata = await image.metadata();
        await image.toFormat(metadata.format as keyof sharp.FormatEnum, {
            compressionLevel: 9
        });
        const buffer = await image.toBuffer();
        fs.writeFileSync(output, buffer);
    }

    /**
     * 使用tinify压缩图片，会替换图片
     * @param input 图片路径
     * @param output 压缩后的图片路径
     */
    async tinifyCompress(input: string, output: string) {
        if(!this.tinifyApiKey) {
            throw new Error('tinify api key is not set');
        }
        const filename = path.basename(input);
        // 获取输入文件的压缩信息
        const statOrigin = fs.statSync(input);
        const originSize = statOrigin.size;
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Tinify',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({increment: 0, message: `Compressing ${filename}...`});
                tinify.key = this.tinifyApiKey;
                const source = tinify.fromFile(input);
                progress.report({increment: 30, message: `Compressing ${filename}...`});
                await source.preserve('copyright', 'creation', 'location').toFile(output);
                progress.report({ increment: 100, message: `Compressing ${filename} done` });
                // 获取压缩信息
                const statCompressed = fs.statSync(output);
                const savedPercent = Math.round((1 - statCompressed.size / originSize) * 100);
                vscode.window.showInformationMessage(`Compressing ${filename} done, saved ${savedPercent}%`);
                return true;
            } catch (error) {
                console.error(error);
                vscode.window.showErrorMessage(`Compressing ${filename} failed, Please check your tinify api key`);
                return false;
            }
        });
    
    }

    async updateApiKey(apiKey: string) {
        this.tinifyApiKey = apiKey;
    }
}

export default ImageCompressor; 