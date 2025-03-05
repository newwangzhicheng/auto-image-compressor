// import * as assert from 'assert';
// import * as sinon from 'sinon';
// import * as vscode from 'vscode';
// import * as path from 'path';
// import * as fs from 'fs';
// import * as os from 'os';

// // 引入测试配置
// import './mocha';

// // 引入需要的类型和函数
// import * as myExtension from '../extension';
// // 导入tinify类型
// import tinify from 'tinify';

// // Mocha测试套件
// suite('Auto Image Compressor Extension Test Suite', () => {
// 	// 测试用的沙箱环境
// 	const sandbox = sinon.createSandbox();
	
// 	// 在每次测试后恢复所有的stub和mock
// 	teardown(() => {
// 		sandbox.restore();
// 	});

// 	// 扩展激活测试
// 	test('扩展应该成功激活', async () => {
// 		// 获取扩展
// 		const extension = vscode.extensions.getExtension('jayep.auto-image-compressor');
// 		assert.ok(extension);
		
// 		// 如果扩展未激活，则激活它
// 		if (extension && !extension.isActive) {
// 			await extension.activate();
// 		}
		
// 		if (extension) {
// 			assert.strictEqual(extension.isActive, true);
// 		}
// 	});

// 	// 命令注册测试
// 	test('setApiKey命令应该已注册', async () => {
// 		// 确保命令被注册
// 		const commands = await vscode.commands.getCommands();
// 		assert.ok(commands.includes('autoImageCompressor.setApiKey'));
// 	});

// 	// API密钥检查功能测试
// 	test('checkApiKey 应在未设置密钥时显示提示', async function() {
// 		// 模拟vscode配置API返回空的API密钥
// 		const getConfigStub = sandbox.stub(vscode.workspace, 'getConfiguration').returns({
// 			get: sandbox.stub().returns(''),
// 			update: sandbox.stub().resolves()
// 		} as any);
		
// 		// 模拟显示信息提示对话框
// 		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves('Maybe later' as any);
		
// 		// 直接调用checkApiKey函数进行测试
// 		await myExtension.checkApiKey();
		
// 		// 验证函数行为
// 		assert.strictEqual(getConfigStub.called, true);
// 		assert.strictEqual(showInfoStub.called, true);
// 	});

// 	// API密钥设置测试
// 	test('setApiKey 应更新配置', async function() {
// 		// 模拟用户输入
// 		const inputBoxStub = sandbox.stub(vscode.window, 'showInputBox').resolves('test_api_key');
		
// 		// 模拟配置更新函数
// 		const updateStub = sandbox.stub().resolves();
// 		sandbox.stub(vscode.workspace, 'getConfiguration').returns({
// 			update: updateStub
// 		} as any);
		
// 		// 调用setApiKey函数
// 		await myExtension.setApiKey();
		
// 		// 验证配置被正确更新
// 		assert.strictEqual(inputBoxStub.called, true);
// 		assert.strictEqual(updateStub.called, true);
// 		assert.strictEqual(updateStub.firstCall.args[0], 'tinifyApiKey');
// 		assert.strictEqual(updateStub.firstCall.args[1], 'test_api_key');
// 	});

// 	// 图片压缩测试
// 	test('tinifyCompress 应正确压缩图片', async function() {
// 		// 此测试需要模拟tinify库和文件操作
// 		// 模拟配置获取
// 		sandbox.stub(vscode.workspace, 'getConfiguration').returns({
// 			get: sandbox.stub().returns('test_api_key')
// 		} as any);
		
// 		// 模拟进度显示
// 		const withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(
// 			async (_options, callback) => {
// 				return callback({
// 					report: sandbox.stub()
// 				});
// 			}
// 		);
		
// 		// 模拟文件状态
// 		const statSyncStub = sandbox.stub(fs, 'statSync');
// 		statSyncStub.onFirstCall().returns({ size: 1000 } as fs.Stats);
// 		statSyncStub.onSecondCall().returns({ size: 500 } as fs.Stats);
		
// 		// 模拟成功信息显示
// 		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');
		
// 		// 创建临时测试文件
// 		const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-image-compressor-test-'));
// 		const testImagePath = path.join(tmpDir, 'test.png');
// 		const outputImagePath = path.join(tmpDir, 'output.png');
		
// 		// 创建一个简单的测试图片文件
// 		fs.writeFileSync(testImagePath, Buffer.from('fake image data'));
		
// 		try {
// 			// 模拟tinify库
// 			const tinify = require('tinify');
// 			tinify.key = '';
			
// 			const tinifySourceMock = {
// 				preserve: sandbox.stub().returnsThis(),
// 				toFile: sandbox.stub().resolves()
// 			};
			
// 			// 模拟 tinify.fromFile 方法
// 			sandbox.stub(tinify, 'fromFile').returns(tinifySourceMock);
			
// 			// 调用压缩函数
// 			await myExtension.tinifyCompress(testImagePath, outputImagePath);
			
// 			// 验证函数行为
// 			assert.strictEqual(withProgressStub.called, true);
// 			assert.strictEqual(statSyncStub.calledTwice, true);
// 			assert.strictEqual(showInfoStub.called, true);
// 		} finally {
// 			// 清理临时文件
// 			try {
// 				fs.unlinkSync(testImagePath);
// 				if (fs.existsSync(outputImagePath)) {
// 					fs.unlinkSync(outputImagePath);
// 				}
// 				fs.rmdirSync(tmpDir);
// 			} catch (e) {
// 				console.error('清理测试文件失败', e);
// 			}
// 		}
// 	});

// 	// 错误处理测试
// 	test('tinifyCompress 在API密钥无效时应显示错误', async function() {
// 		// 模拟配置获取返回无效API密钥
// 		sandbox.stub(vscode.workspace, 'getConfiguration').returns({
// 			get: sandbox.stub().returns('invalid_api_key')
// 		} as any);
		
// 		// 模拟进度显示
// 		sandbox.stub(vscode.window, 'withProgress').callsFake(
// 			async (_options, callback) => {
// 				return callback({
// 					report: sandbox.stub()
// 				});
// 			}
// 		);
		
// 		// 模拟文件状态
// 		sandbox.stub(fs, 'statSync').returns({ size: 1000 } as fs.Stats);
		
// 		// 模拟显示错误信息
// 		const showErrorStub = sandbox.stub(vscode.window, 'showErrorMessage');
		
// 		// 模拟tinify库抛出错误
// 		const tinify = require('tinify');
// 		sandbox.stub(tinify, 'fromFile').throws(new Error('Invalid API key'));
		
// 		// 创建临时测试文件
// 		const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-image-compressor-test-'));
// 		const testImagePath = path.join(tmpDir, 'test.png');
		
// 		// 创建测试文件
// 		fs.writeFileSync(testImagePath, Buffer.from('fake image data'));
		
// 		try {
// 			// 调用压缩函数并捕获预期的错误
// 			try {
// 				await myExtension.tinifyCompress(testImagePath, testImagePath);
// 			} catch (error) {
// 				// 预期会失败
// 			}
			
// 			// 验证错误处理
// 			assert.strictEqual(showErrorStub.called, true);
// 		} finally {
// 			// 清理
// 			try {
// 				fs.unlinkSync(testImagePath);
// 				fs.rmdirSync(tmpDir);
// 			} catch (e) {
// 				console.error('清理测试文件失败', e);
// 			}
// 		}
// 	});
// });
