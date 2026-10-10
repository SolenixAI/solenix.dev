// PostCSS runs Tailwind. Turbopack (the builder for dev and build) reads postcss.config.ts.
const config = { plugins: { "@tailwindcss/postcss": {} } }
export default config
