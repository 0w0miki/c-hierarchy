import * as vscode from "vscode";
import { getWorkspaceRootPath, showMessage, LogLevel, getWordRange, execCmd, parseGlobalOutput } from "./utils";

let globalCmd = "global";

export function getGlobal(): string {
  return globalCmd;
}

export function setGlobal(path: string) {
  globalCmd = path;
}

class SymbolInfo {
  name: string;         // the name of the symbol
  funName: string;      // which function the symbol is located in.
  filePath: string;     // the relative filePath
  line: number;         // line number
  symbolRange?: vscode.Range; // the symbol range in the line

  constructor(funName: string, filePath: string, line: number, name?: string) {
    // if the name is lack, it is the defination of function.
    this.funName = funName ?? '';
    this.filePath = filePath ?? '';
    this.line = line ?? -1;
    this.name = name ?? funName;
  }

  public get fileName(): string {
    return this.filePath.split('/').slice(-1)[0];
  }


  public get fullFilePath(): string {
    return `${getWorkspaceRootPath()}/${this.filePath}`;
  }

  public get description(): string {
    return `${this.fileName}: ${this.line}`;
  }

  private async setSymbolRange() {
    if (this.symbolRange === undefined) {
      this.symbolRange =  await getWordRange(`${this.fullFilePath}`, this.line - 1, this.name);
    }
  }

  public async convert2CHierarchyItem() {
    await this.setSymbolRange();
    return new CHierarchyItem(
      vscode.SymbolKind.Function, // cannot get symbol type from gtags
      this.funName,
      this.description,
      vscode.Uri.file(this.fullFilePath),
      this.symbolRange!,
      this.symbolRange!
    );
  }

  public async convert2CallHierarchyIncomingCall() {
    return new vscode.CallHierarchyIncomingCall(
        await this.convert2CHierarchyItem(),
        [this.symbolRange!]
      );
  }

  public async convert2CallHierarchyOutgoingCall() {
    return new vscode.CallHierarchyOutgoingCall(
        await this.convert2CHierarchyItem(),
        [this.symbolRange!]
      );
  }
}

export class CHierarchyItem extends vscode.CallHierarchyItem {
  constructor(
    public readonly kind: vscode.SymbolKind,
    public readonly name: string,
    public readonly detail: string,
    public readonly uri: vscode.Uri,
    public readonly range: vscode.Range,
    public readonly selectionRange: vscode.Range,
  ) {
    super(kind, name, detail, uri, range, selectionRange);
  }
}

export class CHierarchyGenerator implements vscode.CallHierarchyProvider {
  async prepareCallHierarchy(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise <CHierarchyItem | CHierarchyItem[] | undefined> {
    const wordRange = document.getWordRangeAtPosition(position);

    if (wordRange === undefined) {
      return undefined;
    }

    let symbol = new SymbolInfo(
      document.getText(wordRange),
      document.fileName.replace(getWorkspaceRootPath(), ''),
      position.line + 1
    );

    return symbol.convert2CHierarchyItem();
  }

  async provideCallHierarchyIncomingCalls(
    item: CHierarchyItem,
    token: vscode.CancellationToken
  ): Promise<vscode.CallHierarchyIncomingCall[]> {
    let incomingCalls: vscode.CallHierarchyIncomingCall[] = [];
    const callers = await findCaller(item.name);

    for (let callerSymbol of callers) {
      incomingCalls.push(await callerSymbol.convert2CallHierarchyIncomingCall());
    };

    return incomingCalls;
  }

  async provideCallHierarchyOutgoingCalls(
    item: CHierarchyItem,
    token: vscode.CancellationToken
  ): Promise<vscode.CallHierarchyOutgoingCall[]> {
    let outgoingCalls: vscode.CallHierarchyOutgoingCall[] = [];
    const callees = await findCallee(item.name);

    for (let calleeSymbol of callees) {
      outgoingCalls.push(await calleeSymbol.convert2CallHierarchyOutgoingCall());
    };

    return outgoingCalls;
  }
}

async function findCaller(funcName: string): Promise<SymbolInfo[]> {
  let callers: SymbolInfo[] = [];
  let file = '';
  let fileSymbols: any[] = [];
  let lastIndex: number = 0;
  let results = parseGlobalOutput((await execCmd(`${globalCmd} -xr ${funcName}`)));

  for (let i = 0; i < results.length; i++) {
    // Get the function name
    // NOTE Go through all symbols in the file. Find the last one, and regard
    // that symbol as the function name.
    // Assume all symbols in the same file are list in order.
    if (results[i]!.file !== file) {
      file = results[i]!.file;
      fileSymbols = parseGlobalOutput(await execCmd(`${globalCmd} -f ${file}`));
      lastIndex = 0;
    }
    for (let j = lastIndex; j < fileSymbols?.length && results[i]!.line > fileSymbols[j].line; j++) {
      lastIndex = j;
    }

    // FIXME There are cases that the declaration is regarded as reference.
    // In this case the symbol could be something else.
    if (fileSymbols[lastIndex].name === funcName) {
      // skip function defination or declaration
      continue;
    }

    callers.push(
      new SymbolInfo(
        fileSymbols[lastIndex].name,
        file,
        results[i]!.line,
        funcName,
      )
    );
  }
  return callers;
}

async function findCallee(funcName: string): Promise<SymbolInfo[]> {
  return [];
}
