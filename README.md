# c-hierarchy README

The extension generates C call hierarchy with your GTAGS. It is recommended to use it with the extension [C/C++ GNU Global](https://marketplace.visualstudio.com/items?itemName=jaycetyle.vscode-gnu-global).

## Features

Callee

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

This extension contributes the following settings:

* `c-hierarchy.globalExecutable`: enable/disable this extension
* `c-hierarchy.gtagDbDirPrefix`: set to `blah` to do something

## Known Issues

The precision of `gtags` is not the same as `ctags`. Some symbol will refer to its declaration and hard to figure out that. In such case, it will show a wrong function/symbol.

Besides, `gtags` also cannot directly find what functions the given function calls.

The extension [C Call Hierarchy](https://marketplace.visualstudio.com/items?itemName=AbdAlMoniem-AlHifnawy.c-call-hierarchy) can provide a better expeirence. I did not find a good extension work with `ctags` and do not want too many tags eat my memory.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release.


-----------------------------------------------------------------------------------------------------------
## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
