/**
 * Admin Config Validator
 * ----------------------
 * Decap CMS loads admin/config.yml in the browser at runtime - if that file
 * has a YAML syntax error or is missing required keys, the whole admin panel
 * breaks for the user. This script validates the file BEFORE deployment so a
 * bad config fails the build instead of shipping broken.
 *
 * Checks:
 *   1. The file parses as valid YAML (tab characters, bad indentation,
 *      missing colons, unclosed quotes, etc.)
 *   2. Required Decap structure: backend (name + branch), media_folder,
 *      public_folder, and at least one collection with name, label, folder
 *      and a non-empty fields list. Select widgets must define options.
 *
 * Exit codes: 0 = valid, 1 = invalid (with a readable error list).
 * Runs as part of the Netlify build (see netlify.toml).
 * Manual usage:
 *   node scripts/validate-config.js                # validates admin/config.yml
 *   node scripts/validate-config.js path/to.yml    # validates any other file
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = path.join(__dirname, '..', 'admin', 'config.yml');

function YamlError(message) {
  const e = new Error(message);
  e.name = 'YamlError';
  return e;
}

// ---------------------------------------------------------------------------
// Minimal dependency-free YAML parser (block style only).
// Supports the subset of YAML that Decap configs actually use:
//   - nested maps via indentation
//   - lists ("- item" and "- key: value" with continuation keys)
//   - inline lists ([a, b, c])
//   - quoted / unquoted scalars, numbers, booleans, null (~ or empty)
// Unsupported syntax fails loudly with a line number instead of silently
// misparsing: anchors/aliases, block scalars (| and >), flow mappings,
// inline comments, and lists written on the same line as their key.
// ---------------------------------------------------------------------------

function parseYaml(text) {
  let lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((raw, i) => ({ raw: raw.replace(/\s+$/), no: i + 1 }))
    .filter((l) => {
      const t = l.raw.trim();
      return t !== '' && !t.startsWith('#');
    });

  const tabbed = lines.find((l) => l.raw.startsWith('\t'));
  if (tabbed) throw new YamlError('tab character used for indentation (YAML requires spaces) at line ' + tabbed.no);

  let pos = 0; // cursor into `lines`

  function err(msg, line) {
    return new YamlError(msg + ' (line ' + (line ? line.no : '?') + '): ' + (line ? line.raw.trim() : ''));
  }

  // Split a flow-collection body on top-level commas only - commas inside
  // quotes (e.g. ".{0,160}") or nested brackets/braces don't split.
  function splitFlow(s, line) {
    const parts = [];
    let depth = 0;
    let quote = null;
    let start = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (quote) {
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === '[' || c === '{') { depth++; continue; }
      if (c === ']' || c === '}') { depth--; continue; }
      if (c === ',' && depth === 0) {
        parts.push(s.slice(start, i));
        start = i + 1;
      }
    }
    if (quote) throw err('unclosed quote in flow collection', line);
    if (depth !== 0) throw err('unclosed bracket in flow collection', line);
    parts.push(s.slice(start));
    return parts.map((p) => p.trim()).filter((p) => p !== '');
  }

  function indentOf(line) {
    return line.raw.length - line.raw.trimStart().length;
  }

  // Strip quotes and coerce scalar types. `line` is only for error reporting.
  function scalar(value, line) {
    const v = value.trim();
    if (v === '' || v === '~' || v === 'null') return null;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      if (v.length < 2) throw err('unclosed quote', line);
      return v.slice(1, -1);
    }
    if (v.startsWith('"') || v.startsWith("'")) throw err('unclosed quote', line);
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    if (v.startsWith('[')) {
      if (!v.endsWith(']')) throw err('unclosed inline list', line);
      return splitFlow(v.slice(1, -1), line).map((s) => scalar(s, line));
    }
    if (v.includes(' #')) {
      throw err('inline comments after unquoted values are not supported - quote the value', line);
    }
    return v;
  }

  // Parse whatever block starts at lines[pos], provided its indent >= minIndent.
  function parseBlock(minIndent) {
    if (pos >= lines.length) return null;
    const indent = indentOf(lines[pos]);
    if (indent < minIndent) return null;
    if (lines[pos].raw.trim().startsWith('-')) return parseList(indent);
    return parseMap(indent);
  }

  function parseMap(indent) {
    const map = {};
    while (pos < lines.length) {
      const line = lines[pos];
      const cur = indentOf(line);
      if (cur < indent) break;
      if (cur > indent) throw err('unexpected indentation', line);
      const t = line.raw.trim();
      if (t.startsWith('-')) break; // list item - belongs to an enclosing list

      const idx = t.indexOf(':');
      if (idx === -1) throw err('missing colon - not a valid mapping line', line);
      const key = t.slice(0, idx).trim().replace(/^["']|["']$/g, '');
      const rest = t.slice(idx + 1).trim();

      pos++;
      if (rest === '') {
        // Nested map or list on the following lines
        map[key] = parseBlock(indent + 1);
      } else if (rest.startsWith('-')) {
        throw err('lists must start on the line after their key ("' + key + ':")', line);
      } else {
        map[key] = scalar(rest, line);
      }
    }
    return map;
  }

  // Parse a list whose first "- " line is lines[pos] at exactly `indent`.
  function parseList(indent) {
    const items = [];
    while (pos < lines.length) {
      const line = lines[pos];
      const cur = indentOf(line);
      if (cur !== indent || !line.raw.trim().startsWith('-')) break;
      const t = line.raw.trim().slice(1).trim(); // content after the dash
      pos++;
      if (t === '') {
        // Dash on its own line; item body follows at deeper indent
        items.push(parseBlock(indent + 1));
      } else if (t.startsWith('{')) {
        // Flow mapping item, e.g.  - { label: "Title", name: "title" }
        if (!t.endsWith('}')) throw err('unclosed flow mapping', line);
        const map = {};
        splitFlow(t.slice(1, -1), line).forEach((pair) => {
          const cidx = pair.indexOf(':');
          if (cidx === -1) throw err('missing colon in flow mapping item', line);
          const k = pair.slice(0, cidx).trim().replace(/^["']|["']$/g, '');
          map[k] = scalar(pair.slice(cidx + 1), line);
        });
        items.push(map);
      } else if (t.includes(':')) {
        // List item that is itself a mapping, e.g.
        //   - label: "X"        <- dash line
        //     value: "Y"        <- continuation key at the same depth
        // Reparse with the dash replaced by spaces so the continuation keys
        // align into the same map, consuming exactly this item's lines.
        const savedLines = lines;
        const savedPos = pos;
        const syntheticIndent = cur + (line.raw.length - line.raw.trimStart().length === cur ? 2 : 2);
        lines = [Object.assign({}, line, { raw: ' '.repeat(syntheticIndent) + t })].concat(lines.slice(savedPos));
        pos = 0;
        const map = parseMap(syntheticIndent);
        const consumedVirtual = pos; // virtual index of first unconsumed line
        lines = savedLines;
        pos = savedPos + (consumedVirtual - 1); // virtual 0 was the dash line
        items.push(map);
      } else {
        items.push(scalar(t, line));
      }
    }
    return items;
  }

  const root = parseBlock(0);
  if (pos < lines.length) throw err('could not parse remaining lines', lines[pos]);
  return root;
}

// ---------------------------------------------------------------------------
// Structural validation for the Decap CMS config.
// ---------------------------------------------------------------------------

function isMap(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function isList(v) { return Array.isArray(v); }
function isStr(v) { return typeof v === 'string' && v.trim() !== ''; }

function validate(cfg, errors) {
  if (!isMap(cfg)) {
    errors.push('config.yml must be a YAML mapping at the top level');
    return;
  }

  // backend
  if (!isMap(cfg.backend)) {
    errors.push('missing "backend:" section');
  } else {
    if (!isStr(cfg.backend.name)) errors.push('backend.name is missing or empty (e.g. git-gateway)');
    if (!isStr(cfg.backend.branch)) errors.push('backend.branch is missing or empty (e.g. main)');
  }

  // media
  if (!isStr(cfg.media_folder)) errors.push('media_folder is missing or empty');
  if (!isStr(cfg.public_folder)) errors.push('public_folder is missing or empty');

  // collections
  if (!isList(cfg.collections) || cfg.collections.length === 0) {
    errors.push('collections must be a non-empty list');
    return;
  }

  cfg.collections.forEach((col, i) => {
    const where = 'collections[' + i + ']' + (isMap(col) && isStr(col.name) ? ' ("' + col.name + '")' : '');
    if (!isMap(col)) {
      errors.push(where + ' must be a mapping');
      return;
    }
    if (!isStr(col.name)) errors.push(where + ' is missing "name"');
    if (!isStr(col.label)) errors.push(where + ' is missing "label"');
    if (col.folder !== undefined) {
      if (!isStr(col.folder)) errors.push(where + ' has a non-string "folder"');
    } else if (col.files === undefined) {
      errors.push(where + ' needs either "folder" or "files"');
    }
    if (!isList(col.fields) || col.fields.length === 0) {
      errors.push(where + ' must define a non-empty "fields" list');
    } else {
      col.fields.forEach((field, j) => {
        const fwhere = where + ' fields[' + j + ']' + (isMap(field) && isStr(field.name) ? ' ("' + field.name + '")' : '');
        if (!isMap(field)) {
          errors.push(fwhere + ' must be a mapping');
          return;
        }
        if (!isStr(field.label)) errors.push(fwhere + ' is missing "label"');
        if (!isStr(field.name)) errors.push(fwhere + ' is missing "name"');
        if (field.widget === 'select' && !isList(field.options)) {
          errors.push(fwhere + ' is a select widget but has no "options" list');
        }
      });
    }
  });
}

// ---------------------------------------------------------------------------

function main() {
  const target = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_CONFIG;

  if (!fs.existsSync(target)) {
    console.error('✗ ' + target + ' not found - the CMS admin panel cannot work without it.');
    process.exit(1);
  }

  const raw = fs.readFileSync(target, 'utf8');
  const errors = [];

  let cfg;
  try {
    cfg = parseYaml(raw);
  } catch (e) {
    console.error('✗ ' + target + ' is NOT valid YAML:');
    console.error('  - ' + e.message);
    process.exit(1);
  }

  validate(cfg, errors);

  if (errors.length) {
    console.error('✗ ' + target + ' parsed, but has structural problems:');
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }

  const cols = cfg.collections.map((c) => c.name).join(', ');
  console.log('✓ ' + target + ' is valid YAML (' + cfg.collections.length + ' collection' +
    (cfg.collections.length === 1 ? '' : 's') + ': ' + cols + ')');
}

main();
