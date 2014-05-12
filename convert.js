var fs = require('fs');
var dot = require('dot');

function fetchHighlightRules(aceSheet) {
  var lines = (''+aceSheet).split('\n');
  var beforeStart = true;  // Before the start of the function we fetch.
  var beforeEnd = true;
  var functionName = '';  // Name of the real *HighlightRules function.
  var result = 'function() {\n';
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (beforeStart) {
      if (line.match(/HighlightRules = function/)) {
        functionName = line.match(/ ([a-zA-Z\$_]+HighlightRules) =/)[1];
        beforeStart = false;
      }
    } else if (beforeEnd) {
      if (line.match(/^oop\.inherits/)) {
        beforeEnd = false;
      } else {
        // Indent it properly.
        result += '  ' + line.replace(functionName, 'HighlightRules') + '\n';
      }
    } else { break; }
  }
  return result;
}

var modeConf = {};

// Read all arguments.
// eg, ./ace2cm asciidoc ./asciidoc_highlight_rules.js '{"textRules":false}'

// The mode name is first.
modeConf.modeName = process.argv[2] || 'mode';
modeConf.rules = fetchHighlightRules(fs.readFileSync(process.argv[3]));

// Defaults.
modeConf.textRules = true;
modeConf.mixedMode = false;

// The last argument is a JSON object.
function addOtherConf(modeConf, otherConf) {
  for (var key in otherConf) {
    modeConf[key] = otherConf[key];
  }
}
addOtherConf(modeConf, JSON.parse(process.argv[4]));

// Fetch the template.
var template = ''+fs.readFileSync('mode-template.js');
dot.templateSettings.strip = false;

process.stdout.write(dot.template(template)(modeConf));
