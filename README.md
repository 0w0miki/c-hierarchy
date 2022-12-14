# GNU C Call Hierarchy README

The extension generates C call hierarchy with your `GTAGS`. It is recommended to use it with the extension [C/C++ GNU Global](https://marketplace.visualstudio.com/items?itemName=jaycetyle.vscode-gnu-global).

## Features

This extension provides a call hierachy for C code.
* Data based on [GNU Global](https://www.gnu.org/software/global/).
* Register to VS Code native "Show Call Hierachy" command.
* Compatible with other extension using GTAGS.

## Requirements

You need to ensure `glboal` are installed on your device.

You have to first generate `GTAGS`, `GPATH` and `GRTAGS` via `gtags` command.

## Usage
1. Prepare your Gtag database via `gtags` command.
2. Right click the function you want to trace and click "Show Call Hierarchy".
3. Trace the callers in "References" pane.

![demo](screenshot/demo.gif)

## Extension Settings

This extension contributes the following settings:

* `Global Executable`: The path of `global` binary.
* `Gtag Database Dir Prefix`: If this config is set to `prefixDir`, it will read the GTAGS DB under `prefixDir/project_dir`. This is the same as `Obj Dir Prefix` config of the extension [C/C++ GNU Global](https://marketplace.visualstudio.com/items?itemName=jaycetyle.vscode-gnu-global).

## Known Issues

The precision of `gtags` is not the same as `ctags`. Some symbol will refer to its declaration and hard to figure out that. In such case, it will show a wrong function/symbol.

Besides, `gtags` also cannot directly find what functions the given function calls.

The extension [C Call Hierarchy](https://marketplace.visualstudio.com/items?itemName=AbdAlMoniem-AlHifnawy.c-call-hierarchy) can provide a better expeirence. I did not find a good extension work with `ctags` and do not want too many tags eat my storage.

## Release Notes

### 0.0.1

Initial release.