const { url } = require("inspector");

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero': "url('https://cdn.discordapp.com/attachments/897257085551669279/979143746211942430/ADAO_BG_CIRC.png')"
      }
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#00487d",
          secondary: "#00487d",
          accent: "#00487d",
          neutral: "#b4c4d8",
          "base-200": "#00487d",
          "base-100": "#b4c4d8",
          "base-content": "#00487d",
        },
      },
      "dark",
      "cupcake",
    ],
  },
  plugins: [require("daisyui"), require('tailwind-scrollbar')],
}
