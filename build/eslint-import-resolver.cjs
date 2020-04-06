/* eslint-env node */
const path = require("path");
const resolve = require("resolve");

const resolveCache = new Map();
const relativePattern = /^[./]+/;
const aliasPattern = /^~\//;
const srcDir = path.resolve(__dirname, "../src");

exports.interfaceVersion = 2;

exports.resolve = (source, file, config) => {
  if (resolveCache.has(source)) {
    return resolveCache.get(source);
  }

  let basedir;
  let module;
  let result;

  if (aliasPattern.test(source)) {
    basedir = srcDir;
    module = source.replace(aliasPattern, "./");
  } else if (relativePattern.test(source)) {
    basedir = path.dirname(file);
    module = source;
  } else {
    module = source;
  }

  try {
    result = {
      found: true,
      path: resolve.sync(module, { basedir }),
    };
  } catch (error) {
    console.error("Cannot resolve", source, "using", module, "from", file);
    result = { found: false };
  }

  resolveCache.set(source, result);

  return result;
};
