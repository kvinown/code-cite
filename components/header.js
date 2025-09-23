window.Header = () =>
	React.createElement(
		"header",
		{ className: "bg-white shadow-sm" },
		React.createElement(
			"div",
			{ className: "max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center" },
			React.createElement(
				"div",
				{ className: "flex items-center" },
				React.createElement(
					"svg",
					{
						className: "w-10 h-10 text-cyan-500",
						viewBox: "0 0 24 24",
						fill: "none",
					},
					React.createElement("path", {
						d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4v-6h2v6h-2z",
						fill: "currentColor",
					})
				),
				React.createElement("span", { className: "ml-3 text-2xl font-bold text-gray-800" }, "Code Cite")
			),
			React.createElement("div", { className: "text-gray-600" }, "Hello KEVIN OWEN, You logged in as student.")
		)
	);
