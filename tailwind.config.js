/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./*.html", // Ini akan memindai code-cite.html dan index.html
		"./components/**/*.html", // Ini akan memindai semua file .html di dalam folder components
		"./app.js", // Ini akan memindai file app.js Anda
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
