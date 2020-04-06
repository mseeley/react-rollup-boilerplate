/* eslint-env node */
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import html from "@rollup/plugin-html";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import url from "@rollup/plugin-url";
import svgr from "@svgr/rollup";
import path from "path";
import babel from "rollup-plugin-babel";
import del from "rollup-plugin-delete";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
// Installed but currently unused.
// import copy from "rollup-plugin-copy";

const dist = path.join(__dirname, "dist");
const src = path.join(__dirname, "src");
const srcGlob = "src/**/*";
const nodeModulesGlobs = ["node_modules/**", "../../node_modules/**"];

// No default, uses the default port if this env var is undefined.
const reloadPort = undefined;
const serverHost = "0.0.0.0";
const serverPort = 3000;
const title = "App Title";

// Magic naming convention to avoid unrecognized option warnings.
// See: https://github.com/rollup/rollup/issues/1662
const minify = "config-minify";
const reload = "config-reload";
const server = "config-server";
const verbose = "config-verbose";
const publicPath = "config-public-path";

function createNamedExports(modules) {
  return modules.reduce(
    (acc, name) => Object.assign(acc, { [name]: Object.keys(require(name)) }),
    {}
  );
}

export default (args) => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    [minify]: isProduction,
    [publicPath]: "/",
    [reload]: false,
    [server]: false,
    [verbose]: false,
    ...args,
  };

  options[verbose] &&
    console.log("Options: ", JSON.stringify(options, null, 2));

  return {
    input: "src/main.js",
    output: [
      {
        compact: true,
        dir: dist,
        format: "es",
        sourcemap: isProduction ? "hidden" : true,
      },
    ],
    manualChunks(id) {
      return id.includes("node_modules") ? "vendor" : undefined;
    },
    plugins: [
      del({
        runOnce: process.env.ROLLUP_WATCH === "true",
        // Remove the contents but not the dist dir to avoid permissions error
        // when dist/ is a Docker volume.
        targets: [`${dist}/**/*`],
        verbose: options[verbose],
      }),
      alias({
        // Alias configuration can also be found in .eslintrc.
        entries: [{ find: "~", replacement: src }],
      }),
      resolve(),
      babel({
        include: srcGlob,
      }),
      replace({
        // Execute `replace` before `commonjs`.
        // See: https://reactjs.org/docs/optimizing-performance.html#rollup
        include: nodeModulesGlobs,
        // See: https://github.com/rollup/rollup/issues/487#issuecomment-177596512
        "process.env.NODE_ENV": JSON.stringify(
          isProduction ? "production" : "development"
        ),
      }),
      replace({
        __DEV__: !isProduction,
        __PRODUCTION__: isProduction,
        include: srcGlob,
      }),
      commonjs({
        ignoreGlobal: true,
        // Must address own and hoisted cjs node_modules.
        include: nodeModulesGlobs,
        namedExports: createNamedExports([
          // See: https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module
          // See: https://github.com/rollup/rollup-plugin-commonjs/issues/290#issuecomment-537683484
          // See: https://github.com/facebook/react/issues/11503
          "react",
          "react-dom",
          "prop-types",
        ]),
        sourceMap: false,
      }),
      url({
        destDir: dist,
        // Copy all binary image types.
        include: ["**/*.png", "**/*.jpg", "**/*.gif"],
        limit: 0,
        publicPath: options[publicPath],
      }),
      svgr({
        icon: true,
        memo: true,
      }),
      options[minify] && terser(),
      html({
        publicPath: options[publicPath],
        title,
      }),
      options[server] &&
        serve({
          contentBase: dist,
          historyApiFallback: true,
          host: serverHost,
          port: serverPort,
          verbose: options[verbose],
        }),
      options[reload] &&
        livereload({
          debug: options[verbose],
          port: reloadPort,
          verbose: options[verbose],
          watch: [dist],
        }),
    ],
    watch: {
      clearScreen: true,
      include: srcGlob,
    },
  };
};
