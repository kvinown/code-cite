const { useState, useRef } = React;

// Komponen Pesan Error
const ErrorMessage = ({ message, onClear }) => {
	if (!message) return null;
	return React.createElement(
		"div",
		{ className: "mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", role: "alert" },
		React.createElement("span", { className: "block sm:inline" }, message),
		React.createElement(
			"span",
			{ className: "absolute top-0 bottom-0 right-0 px-4 py-3", onClick: onClear },
			React.createElement(
				"svg",
				{ className: "fill-current h-6 w-6 text-red-500", role: "button", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
				React.createElement("title", null, "Close"),
				React.createElement("path", {
					d: "M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z",
				})
			)
		)
	);
};

window.UploadScreen = ({ onUpload }) => {
	const [file, setFile] = useState(null);
	const [projectName, setProjectName] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState("");
	const fileInputRef = useRef(null);

	const handleFileSelect = (selectedFile) => {
		setError("");
		if (selectedFile && selectedFile.name.endsWith(".zip")) {
			setFile(selectedFile);
			if (!projectName) {
				setProjectName(selectedFile.name.replace(/\.zip$/, ""));
			}
		} else {
			setError("Hanya mendukung file .zip");
		}
	};

	const handleFileChange = (e) => {
		if (e.target.files.length > 0) {
			handleFileSelect(e.target.files[0]);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files.length > 0) {
			handleFileSelect(e.dataTransfer.files[0]);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleSubmit = () => {
		if (file && projectName) {
			setIsUploading(true);
			setProgress(0);
			const interval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) {
						clearInterval(interval);
						setTimeout(() => {
							setIsUploading(false);
							onUpload(file, projectName);
						}, 500);
						return 100;
					}
					return prev + 10;
				});
			}, 100);
		} else {
			setError("Harap pilih file .zip dan beri nama proyek");
		}
	};

	const UploadIcon = () => React.createElement("i", { "data-lucide": "upload-cloud", className: isDragging ? "text-cyan-500" : "text-gray-400" });

	return React.createElement(
		"div",
		{ className: "bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center" },
		React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-4" }, "Mulai Proyek Sitasi Baru"),
		React.createElement("p", { className: "text-gray-600 mb-6" }, "Beri nama proyek Anda dan unggah file .zip yang berisi kode sumber."),
		React.createElement(
			"div",
			{ className: "mb-4 text-left" },
			React.createElement("label", { htmlFor: "projectName", className: "block text-sm font-medium text-gray-700 mb-1" }, "Nama Proyek"),
			React.createElement("input", {
				type: "text",
				id: "projectName",
				value: projectName,
				onChange: (e) => setProjectName(e.target.value),
				className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500",
				placeholder: "Contoh: Tugas Akhir Bab 4",
			})
		),
		React.createElement(
			"div",
			{
				className: `border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center ${
					isDragging ? "border-cyan-500 bg-cyan-50" : "border-gray-300 bg-gray-50 hover:border-cyan-400"
				}`,
				onClick: () => fileInputRef.current.click(),
				onDrop: handleDrop,
				onDragOver: handleDragOver,
				onDragLeave: handleDragLeave,
			},
			React.createElement("input", { type: "file", accept: ".zip", ref: fileInputRef, onChange: handleFileChange, className: "hidden" }),
			React.createElement("div", { className: `mb-3 ${isDragging ? "animate-bounce" : ""}` }, React.createElement(UploadIcon)),
			file
				? React.createElement("p", { className: "text-gray-700" }, "File terpilih: ", React.createElement("span", { className: "font-semibold" }, file.name))
				: React.createElement("p", { className: "text-gray-500" }, "Klik atau drag & drop file ", React.createElement("span", { className: "font-semibold" }, ".zip"), " di sini")
		),
		React.createElement(ErrorMessage, { message: error, onClear: () => setError("") }),
		isUploading &&
			React.createElement(
				"div",
				{ className: "mt-6 w-full bg-gray-200 rounded-full h-3 overflow-hidden" },
				React.createElement("div", {
					className: "bg-cyan-600 h-3",
					style: { width: `${progress}%`, transition: "width 0.3s ease-in-out" },
				})
			),
		React.createElement(
			"button",
			{
				onClick: handleSubmit,
				disabled: !file || !projectName || isUploading,
				className: "mt-6 w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 disabled:bg-gray-400 transition-colors",
			},
			isUploading ? "Mengupload..." : "Mulai Proses Sitasi"
		)
	);
};
