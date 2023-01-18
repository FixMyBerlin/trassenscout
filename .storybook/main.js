const path = require("path")

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      src: path.resolve(__dirname, "../src"),
      db: path.resolve(__dirname, "../db"),
      // blitz: path.resolve(__dirname, "../node_modules/blitz/dist/index-server"),
    }
    console.log(config.resolve.alias)

    return config
  },
}
