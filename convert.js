var fs = require('fs');
var path = require('path');
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

// Given a file located at `filePath` containing `text` (which includes a
// define() clause), take out the define() clause into a format we can use.
function fetchDefine(filePath, text) {
  // Ignore all lines until define(), and take everything from there
  // up to the end of the file.
  var lines = (''+text).split('\n');
  var beforeDefine = true;
  var result = '  define(' + JSON.stringify(filePath)
      + ', function(require, exports, module) {\n';
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (beforeDefine) {
      if (line.match(/^define\(/)) {
        // We have already added the define() start we wanted. Skipping it.
        beforeDefine = false;
      }
    } else { result += '    ' + line + '\n'; }
  }
  return result;
}

// Functions to find all dependencies.

// Given a define() module, return a list of all paths that are require()'d.
function fetchRequire(text) {
  var requires = [];
  var lines = (''+text).split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var match = line.match(/var .+ = require\((.+)\)/);
    if (match != null) {
      requires.push(JSON.parse(match[1]) + '.js');
    }
  }
  return requires;
}

// Return a list of the code for each `define()` module
// and the modules it requires, recursively.
// modulePath: string path of the module to fetch.
// text: source code of the module.
function fetchModule(modulePath, text, modules, hasModules) {
  modules = modules || [];
  hasModules = hasModules || Object.create(null);
  // Fetch the requirements.
  var requires = fetchRequire(text);
  for (var i = 0; i < requires.length; i++) {
    var file = fs.readFileSync(path.join(aceHighlightDir, requires[i]));
    fetchModule(requires[i], file, modules, hasModules);
  }
  // Store the current module.
  if (hasModules[modulePath] === undefined) {
    // This module hasn't been included yet.
    modules.push(fetchDefine(modulePath, text));
    hasModules[modulePath] = true;
  }
  return modules;
}


// Read arguments.


var modeConf = {};

// Read all arguments.
// eg, ./ace2cm asciidoc /path/to/ace/ '{"modeName":"asciidoc"}'

// The mode name is first.
modeConf.modeName = process.argv[2] || 'mode';
modeConf.aceDir = process.argv[3];

// Defaults.
modeConf.aceName = modeConf.modeName;
modeConf.textRules = true;
modeConf.mixedMode = false;  // FIXME: implement mixed mode.

// The last argument is a JSON object.
function addOtherConf(modeConf, otherConf) {
  for (var key in otherConf) {
    modeConf[key] = otherConf[key];
  }
}
addOtherConf(modeConf, JSON.parse(process.argv[4] || '{}'));

var aceHighlightRelativeDir = 'lib/ace/mode';
var aceHighlightDir = path.join(modeConf.aceDir, aceHighlightRelativeDir);
var aceHighlightBasename = modeConf.aceName + '_highlight_rules';
var aceHighlightFile = fs.readFileSync(path.join(aceHighlightDir,
    aceHighlightBasename + '.js'));
// Find all required modules' path.
modeConf.rules = fetchHighlightRules(aceHighlightFile);
modeConf.dependencies = fetchModule(aceHighlightBasename,
    aceHighlightFile).join('\n');


// Fetch the template.
var template = ''+fs.readFileSync('mode-template.js');
dot.templateSettings.strip = false;

process.stdout.write(dot.template(template)(modeConf));
