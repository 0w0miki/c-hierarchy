import { workspace, window, Position, Range, env } from "vscode";
import * as childProcess from "child_process";

export enum LogLevel {
  Error,
  Warn,
  Info,
  Debug,
}

const showMsgFun = [
  window.showInformationMessage,
  window.showWarningMessage,
  window.showErrorMessage,
];

export function getWorkspaceRootPath(): string {
  return workspace.workspaceFolders !== undefined ? workspace.workspaceFolders[0].uri.fsPath : '';
}

export function showMessage(msg: string, logLevel: LogLevel = LogLevel.Info): void {
  showMsgFun[logLevel](msg);
}

export async function getWordRange(filePath: string, line: number, word: string): Promise<Range> {
  const document = await workspace.openTextDocument(filePath);
  const text = document.lineAt(line);
  let wordStart = 0;
  let wordEnd = 0;

  const wordMatch = new RegExp(`\\b${word}\\b`, "i").exec(text.text);

  if (wordMatch !== null) {
    wordStart = wordMatch.index;
    wordEnd = wordMatch.index + word.length;
  }

  const wordRangeStart = new Position(line, wordStart);
  const wordRangeEnd = new Position(line, wordEnd);
  let wordRange = new Range(wordRangeStart, wordRangeEnd);

  return wordRange;
}

export async function execCmd(command: string): Promise<string> {
  const dir = getWorkspaceRootPath();

  return new Promise((resolve, reject) => {
     childProcess.exec(
        command,
        { cwd: dir, shell: env.shell },
        async (error: childProcess.ExecException | null, stdout: string, stderr: string) => {
           if (error) {
              reject(stderr);
              showMessage(stderr, LogLevel.Error);
           } else {
              resolve(stdout);
           }
        });
  });
}

export function parseGlobalOutput(output: string): Array<{name: string, file: string, line: number } | undefined> {
  const lines = output.trimEnd().split('\n');
  const reg = /^(\S+)\s+(\d+) (.*?) (.*)/;

  return lines.map((line: string) => {
    let groups = reg.exec(line);
    if (groups !== null) {
      return { name: groups[1], file: groups[3], line: Number(groups[2]) };
    }
  });
}