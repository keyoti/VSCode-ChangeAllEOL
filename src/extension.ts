/*---------------------------------------------------------
 * Copyright (C) Keyoti Inc. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { posix } from 'path';


export function activate(context: vscode.ExtensionContext) {

	// Runs 'Change All End Of Line Sequence' on all files of specified type.
	vscode.commands.registerCommand('keyoti/changealleol', async function () {

		async function convertLineEndingsInFilesInFolder(folder: vscode.Uri, fileTypeArray: Array<string>, newEnding: string, blackList: Array<string>, whiteList: Array<string>): Promise<{ count: number }> {
			let count = 0;

			for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {

				if (type === vscode.FileType.File
					&& !blackList.includes(name)
					&& (!whiteList.length || whiteList.includes(name))
					&& fileTypeArray.filter( (el)=>{return name.endsWith(el);} ).length>0){
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

				if (type === vscode.FileType.Directory
					&& !blackList.includes(name)
					&& (!whiteList.length || whiteList.includes(name))
					&& !name.startsWith(".")){
					let newWhiteList: Array<string> =  whiteList.includes(name) ? [] : [...whiteList];
					count += (await convertLineEndingsInFilesInFolder(vscode.Uri.file(posix.join(folder.path, name)), fileTypeArray, newEnding, blackList, newWhiteList)).count;
				}
			}
			return { count };
		}

		let options: vscode.InputBoxOptions = {prompt: "File types to convert", placeHolder: ".cs, .txt", ignoreFocusOut: true};
		let fileTypes = await vscode.window.showInputBox(options);
		let blackWhiteOptions: vscode.InputBoxOptions = {prompt: "Add file/dir names for whitelist or blacklist (prefix with a !) (optional)", placeHolder: "!node_modules, src (no wildcards)", ignoreFocusOut: true};
		let blackWhite = (await vscode.window.showInputBox(blackWhiteOptions))!.split(/[ ,]+/);
		fileTypes = fileTypes!.replace(' ', '');
		let fileTypeArray: Array<string> = [];
		let whiteList: Array<string> = [];
		let blackList: Array<string> = [];
		for (let x of blackWhite) {
			if (x[0] === '!') {
				blackList.push(x.substring(1));
			} else if(x.length>0) {
				whiteList.push(x);
			}
		}

		let newEnding = await vscode.window.showQuickPick(["LF", "CRLF"]);

		if(fileTypes!==null && newEnding!==null){
			fileTypeArray = fileTypes!.split(/[ ,]+/);

			if(vscode.workspace.workspaceFolders!==null && vscode.workspace.workspaceFolders!.length>0){
				const folderUri = vscode.workspace.workspaceFolders![0].uri;
				const info = await convertLineEndingsInFilesInFolder(folderUri, fileTypeArray, newEnding!, blackList, whiteList);
				if(info!==null){
					vscode.window.showInformationMessage(info!.count+" files converted");
				}

			}
		}

	});

}
