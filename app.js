const { useState, useEffect } = React;

const App = () => {
	const [project, setProject] = useState(null);

	const buildFileTree = async (files) => {
		const root = {};
		for (const relativePath in files) {
			if (files[relativePath].dir) continue;

			const parts = relativePath.split("/").filter((p) => p);
			let current = root;

			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				const isFile = i === parts.length - 1;

				if (isFile) {
					const content = await files[relativePath].async("string");
					current[part] = { name: part, type: "file", content };
				} else {
					current[part] = current[part] || { name: part, type: "folder", children: {} };
					current = current[part].children;
				}
			}
		}
		return root;
	};

	const handleUpload = async (file, projectName) => {
		try {
			const zip = await JSZip.loadAsync(file);
			const fileTree = await buildFileTree(zip.files);

			setProject({
				name: projectName,
				children: fileTree,
				type: "folder",
				originalFile: file,
			});
		} catch (error) {
			console.error("Gagal memproses file zip:", error);
		}
	};

	return (
		// Mengubah div terluar menjadi flex container dengan tinggi seukuran layar
		React.createElement(
			"div",
			{ className: "flex flex-col h-screen bg-gray-100" },
			React.createElement(window.Header),
			React.createElement(window.Navbar),
			// "main" akan mengisi sisa ruang yang tersedia dan menangani overflow internal
			React.createElement(
				"main",
				{ className: "px-6 py-6 flex-1 overflow-hidden" },
				!project
					? React.createElement(window.UploadScreen, { onUpload: handleUpload })
					: // Workspace sekarang akan mengisi area 'main' ini sepenuhnya
					  React.createElement(window.Workspace, { project: project })
			)
		)
	);
};

ReactDOM.render(React.createElement(App), document.getElementById("root"));
