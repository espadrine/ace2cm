// Parts from Ace; see <https://raw.githubusercontent.com/ajaxorg/ace/master/LICENSE>
CodeMirror.defineMode("{{=it.modeName}}", function(cmCfg, modeCfg) {

  // Ace highlight rules function imported below.
  var HighlightRules = {{=it.rules}}

  {{? it.textRules }}
  // Ace's Text Highlighting Rules.
  // Some highlighters require it.

  var TextHighlightRules = function() {

      // regexp must not have capturing parentheses
      // regexps are ordered -> the first match is used

      this.$rules = {
          "start" : [{
              token : "empty_line",
              regex : '^$'
          }, {
              defaultToken : "text"
          }]
      };
  };

  (function() {

      this.addRules = function(rules, prefix) {
          if (!prefix) {
              for (var key in rules)
                  this.$rules[key] = rules[key];
              return;
          }
          for (var key in rules) {
              var state = rules[key];
              for (var i = 0; i < state.length; i++) {
                  var rule = state[i];
                  if (rule.next) {
                      if (typeof rule.next != "string") {
                          if (rule.nextState && rule.nextState.indexOf(prefix) !== 0)
                              rule.nextState = prefix + rule.nextState;
                      } else {
                          if (rule.next.indexOf(prefix) !== 0)
                              rule.next = prefix + rule.next;
                      }

                  }
              }
              this.$rules[prefix + key] = state;
          }
      };

      this.getRules = function() {
          return this.$rules;
      };

      this.embedRules = function (HighlightRules, prefix, escapeRules, states, append) {
          var embedRules = typeof HighlightRules == "function"
              ? new HighlightRules().getRules()
              : HighlightRules;
          if (states) {
              for (var i = 0; i < states.length; i++)
                  states[i] = prefix + states[i];
          } else {
              states = [];
              for (var key in embedRules)
                  states.push(prefix + key);
          }

          this.addRules(embedRules, prefix);

          if (escapeRules) {
              var addRules = Array.prototype[append ? "push" : "unshift"];
              for (var i = 0; i < states.length; i++)
                  addRules.apply(this.$rules[states[i]], lang.deepCopy(escapeRules));
          }

          if (!this.$embeds)
              this.$embeds = [];
          this.$embeds.push(prefix);
      };

      this.getEmbeds = function() {
          return this.$embeds;
      };

      var pushState = function(currentState, stack) {
          if (currentState != "start" || stack.length)
              stack.unshift(this.nextState, currentState);
          return this.nextState;
      };
      var popState = function(currentState, stack) {
          // if (stack[0] === currentState)
          stack.shift();
          return stack.shift() || "start";
      };

      this.normalizeRules = function() {
          var id = 0;
          var rules = this.$rules;
          function processState(key) {
              var state = rules[key];
              state.processed = true;
              for (var i = 0; i < state.length; i++) {
                  var rule = state[i];
                  if (!rule.regex && rule.start) {
                      rule.regex = rule.start;
                      if (!rule.next)
                          rule.next = [];
                      rule.next.push({
                          defaultToken: rule.token
                      }, {
                          token: rule.token + ".end",
                          regex: rule.end || rule.start,
                          next: "pop"
                      });
                      rule.token = rule.token + ".start";
                      rule.push = true;
                  }
                  var next = rule.next || rule.push;
                  if (next && Array.isArray(next)) {
                      var stateName = rule.stateName;
                      if (!stateName)  {
                          stateName = rule.token;
                          if (typeof stateName != "string")
                              stateName = stateName[0] || "";
                          if (rules[stateName])
                              stateName += id++;
                      }
                      rules[stateName] = next;
                      rule.next = stateName;
                      processState(stateName);
                  } else if (next == "pop") {
                      rule.next = popState;
                  }

                  if (rule.push) {
                      rule.nextState = rule.next || rule.push;
                      rule.next = pushState;
                      delete rule.push;
                  }

                  if (rule.rules) {
                      for (var r in rule.rules) {
                          if (rules[r]) {
                              if (rules[r].push)
                                  rules[r].push.apply(rules[r], rule.rules[r]);
                          } else {
                              rules[r] = rule.rules[r];
                          }
                      }
                  }
                  if (rule.include || typeof rule == "string") {
                      var includeName = rule.include || rule;
                      var toInsert = rules[includeName];
                  } else if (Array.isArray(rule))
                      toInsert = rule;

                  if (toInsert) {
                      var args = [i, 1].concat(toInsert);
                      if (rule.noEscape)
                          args = args.filter(function(x) {return !x.next;});
                      state.splice.apply(state, args);
                      // skip included rules since they are already processed
                      //i += args.length - 3;
                      i--;
                      toInsert = null;
                  }
                  
                  if (rule.keywordMap) {
                      rule.token = this.createKeywordMapper(
                          rule.keywordMap, rule.defaultToken || "text", rule.caseInsensitive
                      );
                      delete rule.defaultToken;
                  }
              }
          }
          Object.keys(rules).forEach(processState, this);
      };

      this.createKeywordMapper = function(map, defaultToken, ignoreCase, splitChar) {
          var keywords = Object.create(null);
          Object.keys(map).forEach(function(className) {
              var a = map[className];
              if (ignoreCase)
                  a = a.toLowerCase();
              var list = a.split(splitChar || "|");
              for (var i = list.length; i--; )
                  keywords[list[i]] = className;
          });
          // in old versions of opera keywords["__proto__"] sets prototype
          // even on objects with __proto__=null
          if (Object.getPrototypeOf(keywords)) {
              keywords.__proto__ = null;
          }
          this.$keywordList = Object.keys(keywords);
          map = null;
          return ignoreCase
              ? function(value) {return keywords[value.toLowerCase()] || defaultToken }
              : function(value) {return keywords[value] || defaultToken };
      };

      this.getKeywords = function() {
          return this.$keywords;
      };

  }).call(TextHighlightRules.prototype);

  // Presumably, we only need this because of inheritance.
  HighlightRules.prototype = new TextHighlightRules();
  {{?}}

  {{? it.mixedMode }}
  // FIXME: add mixed modes support.
  var aliases = {
    html: "htmlmixed",
    js: "javascript",
    json: "application/json",
    c: "text/x-csrc",
    "c++": "text/x-c++src",
    java: "text/x-java",
    csharp: "text/x-csharp",
    "c#": "text/x-csharp",
    scala: "text/x-scala"
  };
  {{?}}

  // Ace's Syntax Tokenizer.

  // tokenizing lines longer than this makes editor very slow
  var MAX_TOKEN_COUNT = 1000;
  var Tokenizer = function(rules) {
      this.states = rules;

      this.regExps = {};
      this.matchMappings = {};
      for (var key in this.states) {
          var state = this.states[key];
          var ruleRegExps = [];
          var matchTotal = 0;
          var mapping = this.matchMappings[key] = {defaultToken: "text"};
          var flag = "g";

          var splitterRurles = [];
          for (var i = 0; i < state.length; i++) {
              var rule = state[i];
              if (rule.defaultToken)
                  mapping.defaultToken = rule.defaultToken;
              if (rule.caseInsensitive)
                  flag = "gi";
              if (rule.regex == null)
                  continue;

              if (rule.regex instanceof RegExp)
                  rule.regex = rule.regex.toString().slice(1, -1);

              // Count number of matching groups. 2 extra groups from the full match
              // And the catch-all on the end (used to force a match);
              var adjustedregex = rule.regex;
              var matchcount = new RegExp("(?:(" + adjustedregex + ")|(.))").exec("a").length - 2;
              if (Array.isArray(rule.token)) {
                  if (rule.token.length == 1 || matchcount == 1) {
                      rule.token = rule.token[0];
                  } else if (matchcount - 1 != rule.token.length) {
                      throw new Error("number of classes and regexp groups in '" + 
                          rule.token + "'\n'" + rule.regex +  "' doesn't match\n"
                          + (matchcount - 1) + "!=" + rule.token.length);
                  } else {
                      rule.tokenArray = rule.token;
                      rule.token = null;
                      rule.onMatch = this.$arrayTokens;
                  }
              } else if (typeof rule.token == "function" && !rule.onMatch) {
                  if (matchcount > 1)
                      rule.onMatch = this.$applyToken;
                  else
                      rule.onMatch = rule.token;
              }

              if (matchcount > 1) {
                  if (/\\\d/.test(rule.regex)) {
                      // Replace any backreferences and offset appropriately.
                      adjustedregex = rule.regex.replace(/\\([0-9]+)/g, function(match, digit) {
                          return "\\" + (parseInt(digit, 10) + matchTotal + 1);
                      });
                  } else {
                      matchcount = 1;
                      adjustedregex = this.removeCapturingGroups(rule.regex);
                  }
                  if (!rule.splitRegex && typeof rule.token != "string")
                      splitterRurles.push(rule); // flag will be known only at the very end
              }

              mapping[matchTotal] = i;
              matchTotal += matchcount;

              ruleRegExps.push(adjustedregex);

              // makes property access faster
              if (!rule.onMatch)
                  rule.onMatch = null;
          }
          
          splitterRurles.forEach(function(rule) {
              rule.splitRegex = this.createSplitterRegexp(rule.regex, flag);
          }, this);

          this.regExps[key] = new RegExp("(" + ruleRegExps.join(")|(") + ")|($)", flag);
      }
  };

  (function() {
      this.$setMaxTokenCount = function(m) {
          MAX_TOKEN_COUNT = m | 0;
      };
      
      this.$applyToken = function(str) {
          var values = this.splitRegex.exec(str).slice(1);
          var types = this.token.apply(this, values);

          // required for compatibility with old modes
          if (typeof types === "string")
              return [{type: types, value: str}];

          var tokens = [];
          for (var i = 0, l = types.length; i < l; i++) {
              if (values[i])
                  tokens[tokens.length] = {
                      type: types[i],
                      value: values[i]
                  };
          }
          return tokens;
      },

      this.$arrayTokens = function(str) {
          if (!str)
              return [];
          var values = this.splitRegex.exec(str);
          if (!values)
              return "text";
          var tokens = [];
          var types = this.tokenArray;
          for (var i = 0, l = types.length; i < l; i++) {
              if (values[i + 1])
                  tokens[tokens.length] = {
                      type: types[i],
                      value: values[i + 1]
                  };
          }
          return tokens;
      };

      this.removeCapturingGroups = function(src) {
          var r = src.replace(
              /\[(?:\\.|[^\]])*?\]|\\.|\(\?[:=!]|(\()/g,
              function(x, y) {return y ? "(?:" : x;}
          );
          return r;
      };

      this.createSplitterRegexp = function(src, flag) {
          if (src.indexOf("(?=") != -1) {
              var stack = 0;
              var inChClass = false;
              var lastCapture = {};
              src.replace(/(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g, function(
                  m, esc, parenOpen, parenClose, square, index
              ) {
                  if (inChClass) {
                      inChClass = square != "]";
                  } else if (square) {
                      inChClass = true;
                  } else if (parenClose) {
                      if (stack == lastCapture.stack) {
                          lastCapture.end = index+1;
                          lastCapture.stack = -1;
                      }
                      stack--;
                  } else if (parenOpen) {
                      stack++;
                      if (parenOpen.length != 1) {
                          lastCapture.stack = stack
                          lastCapture.start = index;
                      }
                  }
                  return m;
              });

              if (lastCapture.end != null && /^\)*$/.test(src.substr(lastCapture.end)))
                  src = src.substring(0, lastCapture.start) + src.substr(lastCapture.end);
          }
          return new RegExp(src, (flag||"").replace("g", ""));
      };

      /**
      * Returns an object containing two properties: `tokens`, which contains all the tokens; and `state`, the current state.
      * @returns {Object}
      **/
      this.getLineTokens = function(line, startState) {
          if (startState && typeof startState != "string") {
              var stack = startState.slice(0);
              startState = stack[0];
          } else
              var stack = [];

          var currentState = startState || "start";
          var state = this.states[currentState];
          if (!state) {
              currentState = "start";
              state = this.states[currentState];
          }
          var mapping = this.matchMappings[currentState];
          var re = this.regExps[currentState];
          re.lastIndex = 0;

          var match, tokens = [];
          var lastIndex = 0;

          var token = {type: null, value: ""};

          while (match = re.exec(line)) {
              var type = mapping.defaultToken;
              var rule = null;
              var value = match[0];
              var index = re.lastIndex;

              if (index - value.length > lastIndex) {
                  var skipped = line.substring(lastIndex, index - value.length);
                  if (token.type == type) {
                      token.value += skipped;
                  } else {
                      if (token.type)
                          tokens.push(token);
                      token = {type: type, value: skipped};
                  }
              }

              for (var i = 0; i < match.length-2; i++) {
                  if (match[i + 1] === undefined)
                      continue;

                  rule = state[mapping[i]];

                  if (rule.onMatch)
                      type = rule.onMatch(value, currentState, stack);
                  else
                      type = rule.token;

                  if (rule.next) {
                      if (typeof rule.next == "string")
                          currentState = rule.next;
                      else
                          currentState = rule.next(currentState, stack);

                      state = this.states[currentState];
                      if (!state) {
                          window.console && console.error && console.error(currentState, "doesn't exist");
                          currentState = "start";
                          state = this.states[currentState];
                      }
                      mapping = this.matchMappings[currentState];
                      lastIndex = index;
                      re = this.regExps[currentState];
                      re.lastIndex = index;
                  }
                  break;
              }

              if (value) {
                  if (typeof type == "string") {
                      if ((!rule || rule.merge !== false) && token.type === type) {
                          token.value += value;
                      } else {
                          if (token.type)
                              tokens.push(token);
                          token = {type: type, value: value};
                      }
                  } else if (type) {
                      if (token.type)
                          tokens.push(token);
                      token = {type: null, value: ""};
                      for (var i = 0; i < type.length; i++)
                          tokens.push(type[i]);
                  }
              }

              if (lastIndex == line.length)
                  break;

              lastIndex = index;

              if (tokens.length > MAX_TOKEN_COUNT) {
                  // chrome doens't show contents of text nodes with very long text
                  while (lastIndex < line.length) {
                      if (token.type)
                          tokens.push(token);
                      token = {
                          value: line.substring(lastIndex, lastIndex += 2000),
                          type: "overflow"
                      };
                  }
                  currentState = "start";
                  stack = [];
                  break;
              }
          }

          if (token.type)
              tokens.push(token);
          
          if (stack.length > 1) {
              if (stack[0] !== currentState)
                  stack.unshift(currentState);
          }
          return {
              tokens : tokens,
              state : stack.length ? stack : currentState
          };
      };

  }).call(Tokenizer.prototype);

  // Token conversion.
  // See <https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode#common-tokens>
  // This is not an exact match nor the best match that can be made.
  var tokenFromAceToken = {
    empty: null,
    text: null,

    // Keyword
    keyword: 'keyword',
      control: 'keyword',
      operator: 'operator',

    // Constants
    constant: 'atom',
      numeric: 'number',
      character: 'atom',
        escape: 'atom',

    // Variables
    variable: 'variable',
    parameter: 'variable-3',
    language: 'variable-2',  // Python's `self` uses that.

    // Comments
    comment: 'comment',
      line: 'comment',
        'double-slash': 'comment',
        'double-dash': 'comment',
        'number-sign': 'comment',
        percentage: 'comment',
      block: 'comment',
        documentation: 'comment',

    // String
    string: 'string',
      quoted: 'string',
        single: 'string',
        double: 'string',
        triple: 'string',
      unquoted: 'string',
      interpolated: 'string',
      regexp: 'string-2',

    meta: 'meta',
    literal: 'qualifier',
    support: 'builtin',

    // Markup
    markup: 'tag',
    underline: 'link',
    link: 'link',
    bold: 'strong',
    heading: 'header',
    italic: 'em',
    list: 'variable-2',
    numbered: 'variable-2',
    unnumbered: 'variable-2',
    quote: 'quote',
    raw: 'variable-2',  // Markdown's raw block uses that.

    // Invalid
    invalid: 'error',
    illegal: 'invalidchar',
    deprecated: 'error'
  };

  // Takes a list of Ace tokens, returns a (string) CodeMirror token.
  var cmTokenFromAceTokens = function(tokens) {
    var token = null;
    for (var i = 0; i < tokens.length; i++) {
      // Find the most specific token.
      if (tokenFromAceToken[tokens[i]] !== undefined) {
        token = tokenFromAceToken[tokens[i]];
      }
    }
    return token;
  };

  // Consume a token from plannedTokens.
  var consumeToken = function(stream, state) {
    var plannedToken = state.plannedTokens.shift();
    if (plannedToken === undefined) {
      return null;
    }
    stream.match(plannedToken.value);
    var tokens = plannedToken.type.split('.');
    return cmTokenFromAceTokens(tokens);
  };

  var matchToken = function(stream, state) {
    // Anormal start: we already have planned tokens to consume.
    if (state.plannedTokens.length > 0) {
      return consumeToken(stream, state);
    }

    // Normal start.
    var currentState = state.current;
    var currentLine = stream.match(/.*$/, false)[0];
    var tokenized = tokenizer.getLineTokens(currentLine, currentState);
    // We got a {tokens, state} object.
    // Each token is a {value, type} object.
    state.plannedTokens = tokenized.tokens;
    state.current = tokenized.state;

    // Consume a token.
    return consumeToken(stream, state);
  }

  // Initialize all state.
  var aceHighlightRules = new HighlightRules();
  var tokenizer = new Tokenizer(aceHighlightRules.$rules);

  return {
    startState: function() {
      return {
        current: 'start',
        // List of {value, type}, with type being an Ace token string.
        plannedTokens: []
      };
    },
    blankLine: function(state) { matchToken('', state); },
    token: matchToken
  };
});

CodeMirror.defineMIME("text/x-{{=it.modeName}}", "{{=it.modeName}}");
