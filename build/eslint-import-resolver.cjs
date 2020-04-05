/* eslint-env node */
const resolve = require("resolve");

const aliasPatterns = new Map();
const resolveCache = new Map();
const expression = /\/(.*)\/(.*)/;

exports.interfaceVersion = 2;

exports.resolve = (source, file, config) => {
  if (!resolveCache.has(source)) {
    const { pattern, replacement } = config;

    if (!aliasPatterns.get(pattern)) {
      aliasPatterns.set(
        pattern,
        new RegExp(...pattern.match(expression).slice(1))
      );
    }

    const aliasPattern = aliasPatterns.get(pattern);
    const module = aliasPattern.test(source)
      ? source.replace(aliasPattern, replacement)
      : source;

    try {
      resolveCache.set(source, { found: true, path: resolve.sync(module) });
    } catch (err) {
      resolveCache.set(source, { found: false });
    }
  }

  return resolveCache.get(source);
};
