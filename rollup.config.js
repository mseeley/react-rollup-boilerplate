/* eslint-env node */
import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import html from "@rollup/plugin-html";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import url from "@rollup/plugin-url";
import svgr from "@svgr/rollup";
import babel from "rollup-plugin-babel";
import del from "rollup-plugin-delete";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
// Installed but currently unused.
// import copy from "rollup-plugin-copy";

const dist = path.join(__dirname, "dist");
const node_modules = "node_modules/**";
const src = "src/**";
const port = 3000;
const title = "App Title";

// Magic naming convention to avoid unrecognized option warnings.
// See: https://github.com/rollup/rollup/issues/1662
const minify = "config-minify";
const reload = "config-reload";
const server = "config-server";
const verbose = "config-verbose";
const publicPath = "config-public-path";

export default (args) => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    [minify]: isProduction,
    [publicPath]: "",
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
    plugins: [
      del({
        runOnce: process.env.ROLLUP_WATCH === "true",
        targets: [dist],
        verbose: options[verbose],
      }),
      resolve(),
      babel({
        include: src,
      }),
      replace({
        // Execute `replace` before `commonjs`.
        // See: https://reactjs.org/docs/optimizing-performance.html#rollup
        __PRODUCTION__: isProduction,
        // See: https://github.com/rollup/rollup/issues/487#issuecomment-177596512
        "process.env.NODE_ENV": JSON.stringify(
          isProduction ? "production" : "development"
        ),
      }),
      commonjs({
        ignoreGlobal: true,
        include: node_modules,
        namedExports: {
          // See: https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module
          // See: https://github.com/rollup/rollup-plugin-commonjs/issues/290#issuecomment-537683484
          // See: https://github.com/facebook/react/issues/11503
          react: Object.keys(require("react")),
          "react-dom": Object.keys(require("react-dom")),
          "prop-types": Object.keys(require("prop-types")),
        },
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
        title,
        publicPath: options[publicPath],
      }),
      options[server] &&
        serve({
          contentBase: dist,
          port,
          verbose: options[verbose],
        }),
      options[reload] &&
        livereload({
          verbose: options[verbose],
          watch: [dist],
        }),
    ],
    watch: {
      clearScreen: true,
      include: src,
    },
  };
};
