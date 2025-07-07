// rollup.config.js
export default {
  input: "src/main.jsx",
  output: {
    file: "dist/final.jsx",
    format: "iife", // AE用に即時実行形式にする
    intro: '//@target aftereffects\n',
  },
};
