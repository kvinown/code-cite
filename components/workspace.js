const { useState } = React;

const COLORS = ["bg-cyan-900/60", "bg-green-900/60", "bg-purple-900/60", "bg-pink-900/60", "bg-yellow-700/60"];

window.Workspace = ({ project }) => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [citations, setCitations] = useState([]);
	const [sources, setSources] = useState([]); // State baru untuk menyimpan sumber referensi

	const handleAddCitation = (citationData) => {
		// Cek duplikasi sebelum menambahkan form baru
		const isDuplicate = citations.some(
			(c) =>
				c.file === citationData.file &&
				!c.isEditing && // Abaikan sitasi lain yang sedang diedit
				Math.max(c.start, citationData.start) <= Math.min(c.end, citationData.end)
		);
		if (isDuplicate) {
			console.error("Sebagian atau seluruh baris ini sudah disitasi.");
			return;
		}

		const newCitation = {
			id: "cite-" + Date.now(),
			...citationData,
			note: "",
			sourceId: null,
			color: COLORS[citations.length % COLORS.length],
			isEditing: true, // Mulai dalam mode edit
		};
		setCitations((prev) => [...prev, newCitation]);
	};

	const handleDeleteCitation = (citationId) => {
		setCitations((prev) => prev.filter((c) => c.id !== citationId));
	};

	const handleToggleEdit = (citationId) => {
		setCitations((prev) => prev.map((c) => (c.id === citationId ? { ...c, isEditing: true } : c)));
	};

	const handleCancelEdit = (citationId) => {
		const citation = citations.find((c) => c.id === citationId);
		// Jika sitasi belum punya sourceId, berarti ini sitasi baru yg dibatalkan, jadi hapus saja.
		if (!citation.sourceId) {
			handleDeleteCitation(citationId);
		} else {
			// Jika sudah ada, kembalikan ke mode display
			setCitations((prev) => prev.map((c) => (c.id === citationId ? { ...c, isEditing: false } : c)));
		}
	};

	const handleSaveCitation = (citationId, saveData) => {
		let newSourceId = saveData.selectedSource;
		let updatedSources = [...sources];

		if (saveData.selectedSource === "new") {
			const newSource = {
				id: "source-" + Date.now(),
				title: saveData.newSourceTitle,
				type: saveData.newSourceType,
				value: saveData.newSourceValue,
			};
			updatedSources.push(newSource);
			setSources(updatedSources);
			newSourceId = newSource.id;
		}

		const updatedCitations = citations.map((c) => {
			if (c.id === citationId) {
				return {
					...c,
					sourceId: newSourceId,
					note: saveData.note,
					isEditing: false, // Keluar dari mode edit
				};
			}
			return c;
		});
		setCitations(updatedCitations);
	};

	const handleExport = () => {
		const dataToExport = {
			sources: sources,
			citations: citations.map(({ isEditing, ...rest }) => rest), // Hapus properti 'isEditing'
		};
		const jsonString = JSON.stringify(dataToExport, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${project.name}.codesite.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return React.createElement(
		"div",
		{ className: "bg-white p-4 rounded-lg shadow-lg h-[80vh] flex flex-col" },
		React.createElement("h2", { className: "text-xl font-bold text-gray-800 mb-4" }, "Proyek: " + project.name),
		React.createElement(
			"div",
			{ className: "grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 h-[70vh]" },

			// File Explorer
			React.createElement(
				"div",
				{
					className: "col-span-12 md:col-span-3 bg-gray-100 rounded-md flex flex-col h-full overflow-y-auto",
				},
				React.createElement("h3", { className: "font-semibold p-2 sticky top-0 bg-gray-100 z-10" }, "File Explorer"),
				React.createElement(
					"div",
					{ className: "p-2" },
					React.createElement(window.FileExplorer, {
						node: project,
						onSelectFile: setSelectedFile,
					})
				)
			),

			// Code Editor
			React.createElement(window.CodeEditor, {
				file: selectedFile,
				onAddCitation: handleAddCitation,
				citations: citations.filter((c) => !c.isEditing), // Hanya kirim sitasi yg sudah disimpan ke editor
			}),

			// Citation Panel
			React.createElement(
				"div",
				{
					className: "col-span-12 md:col-span-3 bg-gray-100 rounded-md flex flex-col h-full overflow-hidden",
				},

				// Header
				React.createElement(
					"div",
					{
						className: "flex justify-between items-center p-2 sticky top-0 bg-gray-100 z-10",
					},
					React.createElement("h3", { className: "font-semibold" }, "Panel Sitasi"),
					React.createElement(
						"button",
						{
							onClick: handleExport,
							className: "text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600",
						},
						"Export to .json"
					)
				),

				// Info text
				React.createElement("div", { className: "text-sm text-gray-600 mb-2 px-2" }, "Klik dan drag pada kode untuk menambahkan sitasi."),

				// Scrollable list
				React.createElement(
					"div",
					{ className: "flex-1 overflow-y-auto px-2 pb-2" },
					React.createElement(
						"ul",
						{ className: "space-y-3" },
						citations.map((c) =>
							React.createElement(window.CitationItem, {
								key: c.id,
								citation: c,
								source: sources.find((s) => s.id === c.sourceId),
								allSources: sources,
								onSave: handleSaveCitation,
								onCancel: handleCancelEdit,
								onDelete: handleDeleteCitation,
								onEdit: handleToggleEdit,
							})
						)
					)
				)
			)
		)
	);
};
