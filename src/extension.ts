/*---------------------------------------------------------
 * Copyright (C) Keyoti Inc. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { posix } from 'path';


export function activate(context: vscode.ExtensionContext) {

	// Runs 'Change All End Of Line Sequence' on all files of specified type.
	vscode.commands.registerCommand('keyoti/changealleol', async function () {

		async function convertLineEndingsInFilesInFolder(folder: vscode.Uri, fileTypeArray: Array<string>, newEnding: string, ignoreArray: Array<string>): Promise<{ count: number }> {
			let count = 0;

			for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {

				if (type === vscode.FileType.File && !ignoreArray.includes(name) && fileTypeArray.filter( (el)=>{return name.endsWith(el);} ).length>0){
					const filePath = posix.join(folder.path, name);

					var doc = await vscode.workspace.openTextDocument(filePath);

					await vscode.window.showTextDocument(doc);
					if(vscode.window.activeTextEditor!==null){
						await vscode.window.activeTextEditor!.edit(builder => {
							if(newEnding==="LF"){
								builder.setEndOfLine(vscode.EndOfLine.LF);
							} else {
								builder.setEndOfLine(vscode.EndOfLine.CRLF);
							}
							count ++;
						});

					} else {
						vscode.window.showInformationMessage(doc.uri.toString());
					}
				}

				if (type === vscode.FileType.Directory && !ignoreArray.includes(name) && !name.startsWith(".")){
					count += (await convertLineEndingsInFilesInFolder(vscode.Uri.file(posix.join(folder.path, name)), fileTypeArray, newEnding, ignoreArray)).count;
				}
			}
			return { count };
		}

		let options: vscode.InputBoxOptions = {prompt: "File types to convert", placeHolder: ".cs, .txt", ignoreFocusOut: true};
		let fileTypes = await vscode.window.showInputBox(options);
		let optionsIgnore: vscode.InputBoxOptions = {prompt: "Name of ignore file (optional)", placeHolder: "Use a file in the project's root directory with a line separated list of directories & files (no wildcards) to ignore", ignoreFocusOut: true};
		let ignoreFile = await vscode.window.showInputBox(optionsIgnore);
		fileTypes = fileTypes!.replace(' ', '');
		let fileTypeArray: Array<string> = [];

		let newEnding = await vscode.window.showQuickPick(["LF", "CRLF"]);

		const ignoreList = await vscode.workspace.openTextDocument(posix.join(vscode.workspace.workspaceFolders![0].uri.path, ignoreFile));
		const ignoreArray: Array<string>  = [];
		await vscode.window.showTextDocument(ignoreList);
		if (vscode.window.activeTextEditor !== null) {
			for (let i = 0; i < vscode.window.activeTextEditor!.document.lineCount; i++) {
					ignoreArray.push(vscode.window.activeTextEditor!.document.lineAt(i).text);
			}
		}

		if(fileTypes!==null && newEnding!=null){
			fileTypeArray = fileTypes!.split(',');

			if(vscode.workspace.workspaceFolders!==null && vscode.workspace.workspaceFolders!.length>0){
				const folderUri = vscode.workspace.workspaceFolders![0].uri;
				const info = await convertLineEndingsInFilesInFolder(folderUri, fileTypeArray, newEnding, ignoreArray);
				vscode.window.showInformationMessage(info.count+" files converted");

			}
		}

	});

}
