// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as cHierarchyGenerator from './hierarchyGenerator';
import { getWorkspaceRootPath, LogLevel, showMessage } from './utils';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "c-hierarchy" is now active!');

	loadConfig();

	initSubscription(context);

}

async function initSubscription(context: vscode.ExtensionContext) {
	const hierarchyGenerator = new cHierarchyGenerator.CHierarchyGenerator();

	context.subscriptions.push(
		vscode.languages.registerCallHierarchyProvider(
			{
				scheme: 'file',
				language: 'c'
			},
			hierarchyGenerator
		),
		vscode.languages.registerCallHierarchyProvider(
			{
				scheme: 'file',
				language: 'cpp'
			},
			hierarchyGenerator
		)
	);
}

function loadConfig() {
	const config = vscode.workspace.getConfiguration('c-hierarchy');
	const dirPrefix = config.gtagDbDirPrefix;
	if (config.globalExecutable) {
		cHierarchyGenerator.setGlobal(config.globalExecutable);
	}

	if (!dirPrefix) {
		return;
	}
	// Check path accessibility
	const gtagsDbPath = `${dirPrefix}${getWorkspaceRootPath()}`;
	if (!fs.existsSync(gtagsDbPath)) {
		showMessage('gtag DB Dir Prefix is wrong. Path does not exsist. Use workspace root path.', LogLevel.Warn);
	} else if (fs.statSync(`${gtagsDbPath}/GTAGS`, {throwIfNoEntry: false}) === undefined) {
		showMessage('No tags DB file found. Use workspace root path.', LogLevel.Warn);
	} else {
		process.env.GTAGSROOT = getWorkspaceRootPath();
		process.env.GTAGSDBPATH = `${gtagsDbPath}`;
	}
}
// this method is called when your extension is deactivated
export function deactivate() {}
