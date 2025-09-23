const {cn} = require("./components/utils/cn");
module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#01B7CF',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#1d73e3',


        // 또는 직접 색상 값 정의
        brand: {
          50: '#f0fdff',
          100: '#ccf7fe',
          500: '#01B7CF',
          600: '#0891b2',
          900: '#164e63',
        }
      }
    },
  },
  plugins: [],
}
