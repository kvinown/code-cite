const { useState, useEffect } = React;

window.CitationItem = ({ citation, source, allSources, onSave, onCancel, onDelete, onEdit }) => {
	// State untuk form di dalam item ini
	const [selectedSource, setSelectedSource] = useState("new");
	const [newSourceTitle, setNewSourceTitle] = useState("");
	const [newSourceType, setNewSourceType] = useState("url");
	const [newSourceValue, setNewSourceValue] = useState("");
	const [note, setNote] = useState(citation.note || "");

	// useEffect untuk me-reset form state saat mode edit diaktifkan
	useEffect(() => {
		if (citation.isEditing) {
			// Jika sitasi sudah punya sumber, set dropdown ke sumber tsb
			if (citation.sourceId) {
				setSelectedSource(citation.sourceId);
			} else {
				setSelectedSource("new");
			}
			setNote(citation.note || "");
			setNewSourceTitle("");
			setNewSourceType("url");
			setNewSourceValue("");
		}
	}, [citation.isEditing, citation.sourceId, citation.note, allSources]);

	const handleSaveClick = () => {
		// Validasi: Judul wajib diisi jika membuat sumber baru
		if (selectedSource === "new" && !newSourceTitle.trim()) {
			// Di aplikasi nyata, gunakan UI non-blocking, bukan alert.
			console.error("Judul referensi wajib diisi saat membuat sumber baru.");
			return;
		}
		onSave(citation.id, {
			selectedSource,
			newSourceTitle,
			newSourceType,
			newSourceValue,
			note,
		});
	};

	// Tampilan Mode Edit
	if (citation.isEditing) {
		return React.createElement(
			"li",
			{ className: "bg-white shadow-md p-3 rounded-lg border text-xs space-y-2" },
			// Dropdown Pemilihan Sumber
			React.createElement(
				"div",
				null,
				React.createElement("label", { className: "block font-medium mb-1" }, "Sumber Referensi"),
				React.createElement(
					"select",
					{
						value: selectedSource,
						onChange: (e) => setSelectedSource(e.target.value),
						className: "w-full border p-1 rounded",
					},
					React.createElement("option", { value: "new" }, "--- Buat Sumber Baru ---"),
					allSources.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.title))
				)
			),

			// Form untuk Sumber Baru (muncul kondisional)
			selectedSource === "new" &&
				React.createElement(
					"div",
					{ className: "border p-2 rounded space-y-2 bg-gray-50" },
					React.createElement("input", {
						type: "text",
						placeholder: "Judul / ID Referensi (e.g., Gemini, StackOverflow)",
						value: newSourceTitle,
						onChange: (e) => setNewSourceTitle(e.target.value),
						className: "w-full border p-1 rounded",
					}),
					React.createElement(
						"select",
						{
							value: newSourceType,
							onChange: (e) => setNewSourceType(e.target.value),
							className: "w-full border p-1 rounded",
						},
						React.createElement("option", { value: "url" }, "Link / URL"),
						React.createElement("option", { value: "ai" }, "AI (Kecerdasan Buatan)"),
						React.createElement("option", { value: "other" }, "Lainnya (Teks)")
					),
					newSourceType === "url" && React.createElement("input", { type: "text", placeholder: "https://example.com", value: newSourceValue, onChange: (e) => setNewSourceValue(e.target.value), className: "w-full border p-1 rounded" }),
					newSourceType === "ai" && React.createElement("input", { type: "text", placeholder: "e.g., ChatGPT 4, Gemini", value: newSourceValue, onChange: (e) => setNewSourceValue(e.target.value), className: "w-full border p-1 rounded" }),
					newSourceType === "other" &&
						React.createElement("textarea", { placeholder: "e.g., Bantuan dari teman, kode dari tugas lama", value: newSourceValue, onChange: (e) => setNewSourceValue(e.target.value), className: "w-full border p-1 rounded", rows: 2 })
				),

			// Kolom Catatan
			React.createElement(
				"div",
				null,
				React.createElement("label", { className: "block font-medium mb-1" }, "Catatan (Notes)"),
				React.createElement("textarea", {
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: "Tambahkan detail, misal: prompt yang digunakan...",
					className: "w-full border p-1 rounded text-gray-700",
					rows: 3,
				})
			),

			// Tombol Aksi
			React.createElement(
				"div",
				{ className: "flex justify-end space-x-2 pt-2" },
				React.createElement("button", { onClick: () => onCancel(citation.id), className: "bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded" }, "Batal"),
				React.createElement("button", { onClick: handleSaveClick, className: "bg-cyan-600 text-white hover:bg-cyan-700 px-3 py-1 rounded" }, "Simpan")
			)
		);
	}

	// Tampilan Mode Normal (Display)
	return React.createElement(
		"li",
		{
			key: citation.id,
			className: "bg-white shadow-sm p-3 rounded-md border text-xs space-y-1",
		},
		React.createElement(
			"div",
			{ className: "flex justify-between items-start" },
			React.createElement(
				"div",
				null,
				React.createElement("strong", { className: "text-sm" }, source ? source.title : React.createElement("span", { className: "text-red-500" }, "Sumber belum diatur")),
				React.createElement("div", { className: "text-gray-500 text-[11px]" }, `(${source ? source.type : "N/A"})`)
			),
			React.createElement(
				"div",
				{ className: "flex space-x-2" },
				React.createElement("button", { onClick: () => onEdit(citation.id), className: "text-blue-500 text-xs hover:underline" }, "Ubah"),
				React.createElement("button", { onClick: () => onDelete(citation.id), className: "text-red-500 text-xs hover:underline" }, "Hapus")
			)
		),
		React.createElement("div", { className: "text-gray-600 font-semibold" }, `${citation.file} (Baris ${citation.start}–${citation.end})`),
		React.createElement("pre", { className: "bg-gray-100 p-1.5 rounded mt-1 overflow-x-auto text-[11px]" }, React.createElement("code", null, citation.code)),
		citation.note && React.createElement("div", { className: "mt-1 pt-1 border-t" }, React.createElement("p", { className: "whitespace-pre-wrap" }, citation.note))
	);
};
