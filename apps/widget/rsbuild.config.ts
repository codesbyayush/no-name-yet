import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginUmd } from "@rsbuild/plugin-umd";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginUmd({
      name: "OmniFeedbackWidget",
      export: "default",
    }),
  ],
  source: {
    entry: {
      "omnifeedback-widget": "./src/widget.tsx",
    },
  },
  html: {
    template: "./src/index.html",
  },
});