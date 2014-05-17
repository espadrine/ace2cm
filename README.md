# Ace to CodeMirror Converter

*Convert your Ace syntax highlighter to CodeMirror!*

Ace has a number of syntax sheets to provide support for those languages in
their editor. CodeMirror does as well. However, Ace has some sheets that
CodeMirror does not (and inversely).

This software translates Ace syntax sheets to CodeMirror's format.

## Install

* [Download](https://github.com/espadrine/ace2cm/archive/master.zip) and extract
* Navigate to folder `cd ace2cm`
* Run `npm install` command to install required dependencies

## Use

Either run `make`, or something like this:

    node convert.js mode-name /path/to/mode_highlight_rules.js > generated-mode-file.js

## Related information

Under MIT license.

Portions of this project are covered by the BSD license of the Ace project.
Find the license here: <https://raw.githubusercontent.com/ajaxorg/ace/master/LICENSE>.
