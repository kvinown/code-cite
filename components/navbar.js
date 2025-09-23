window.Navbar = () => {
	const navItems = ["Dashboard", "My Projects", "Account", "About", "Logout"];
	return React.createElement(
		"nav",
		{ className: "bg-cyan-600" },
		React.createElement(
			"div",
			{ className: "max-w-7xl mx-auto px-2 sm:px-6 lg:px-8" },
			React.createElement(
				"div",
				{ className: "relative flex items-center justify-start h-12" },
				React.createElement(
					"div",
					{ className: "flex items-center space-x-4" },
					navItems.map((item) =>
						React.createElement(
							"a",
							{
								key: item,
								href: "#",
								className: "text-white hover:bg-cyan-700 px-3 py-2 rounded-md text-sm font-medium",
							},
							item
						)
					)
				)
			)
		)
	);
};
