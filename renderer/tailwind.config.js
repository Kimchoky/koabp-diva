module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS 변수를 Tailwind 색상으로 등록
        primary: 'var(--color-primary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',

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
