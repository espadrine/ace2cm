all:
	mkdir -p cm-rules
	node convert.js asciidoc ./ace-rules/asciidoc_highlight_rules.js '{"textRules":false}' > cm-rules/gen-asciidoc.js

.PHONY: all
