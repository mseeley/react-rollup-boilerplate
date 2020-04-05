import React from "react";
import ReactDOM from "react-dom";
import Acid from "~/acid.svg";

import("~/helpers/helloWorld.js").then(({ default: greeting }) =>
  console.log(`${greeting()}!! - environment: ${JSON.stringify({}, null, 2)}`)
);

function render() {
  const app = document.createElement("div");

  ReactDOM.render(
    <h1>
      Hello, world
      <br />
      <Acid />
    </h1>,
    app
  );

  document.body.appendChild(app);
}

// Mount the app within a function to avoid this warning caused by
// `babel-plugin-transform-react-jsx-self` when `@babel/preset-react` is in
// development mode.
// https://rollupjs.org/guide/en/#error-this-is-undefined
render();
