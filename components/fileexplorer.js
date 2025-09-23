const { useState } = React;

window.FileExplorer = ({ node, onSelectFile }) => {
	const [expanded, setExpanded] = useState(true);

	if (node.type === "file") {
		return React.createElement(
			"div",
			{
				className: "pl-4 py-1 cursor-pointer hover:bg-gray-200 rounded",
				onClick: () => onSelectFile(node),
			},
			`📄 ${node.name}`
		);
	}

	return React.createElement(
		"div",
		{ className: "pl-2" },
		React.createElement(
			"div",
			{
				className: "font-semibold cursor-pointer flex items-center hover:bg-gray-200 rounded px-1",
				onClick: () => setExpanded(!expanded),
			},
			`${expanded ? "📂" : "📁"} ${node.name}`
		),

		expanded &&
			React.createElement(
				"div",
				{ className: "pl-4" },
				Object.values(node.children).map((child) =>
					React.createElement(FileExplorer, {
						key: child.name,
						node: child,
						onSelectFile: onSelectFile,
					})
				)
			)
	);
};
