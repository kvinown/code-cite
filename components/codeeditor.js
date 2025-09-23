const { useEffect, useRef, useState } = React;

window.CodeEditor = ({ file, onAddCitation, citations }) => {
	const [lines, setLines] = useState([]);
	const [dragStart, setDragStart] = useState(null);
	const [dragEnd, setDragEnd] = useState(null);
	const [isDragging, setIsDragging] = useState(false);

	const editorRef = useRef(null);
	const rafRef = useRef(null);
	const lastMouseEventRef = useRef(null);

	// Refs untuk data supaya handler global bisa mengakses nilai terbaru
	const linesRef = useRef([]);
	const dragStartRef = useRef(null);
	const dragEndRef = useRef(null);
	const isDraggingRef = useRef(false);
	const onAddCitationRef = useRef(onAddCitation);

	useEffect(() => {
		onAddCitationRef.current = onAddCitation;
	}, [onAddCitation]);

	useEffect(() => {
		linesRef.current = lines;
	}, [lines]);

	useEffect(() => {
		dragStartRef.current = dragStart;
	}, [dragStart]);

	useEffect(() => {
		dragEndRef.current = dragEnd;
	}, [dragEnd]);

	useEffect(() => {
		isDraggingRef.current = isDragging;
	}, [isDragging]);

	const handleGlobalMouseUp = (e) => {
		if (isDraggingRef.current && dragStartRef.current != null && dragEndRef.current != null) {
			const start = Math.min(dragStartRef.current, dragEndRef.current);
			const end = Math.max(dragStartRef.current, dragEndRef.current);
			const codeBlock = linesRef.current.slice(start - 1, end).join("\n");
			if (onAddCitationRef.current) {
				onAddCitationRef.current({
					file: file.name,
					start,
					end,
					code: codeBlock,
				});
			}
		}
		resetDrag();
	};

	// Gunakan useRef untuk menyimpan referensi stabil ke handleGlobalMouseUp
	const globalMouseUpHandlerRef = useRef(handleGlobalMouseUp);
	useEffect(() => {
		globalMouseUpHandlerRef.current = handleGlobalMouseUp;
	}, [file, lines]); // Update jika dependensi berubah

	const resetDrag = () => {
		setDragStart(null);
		setDragEnd(null);
		setIsDragging(false);
		window.removeEventListener("mouseup", globalMouseUpHandlerRef.current);
	};

	useEffect(() => {
		if (file) {
			setLines(file.content.split("\n"));
			resetDrag();
		} else {
			setLines([]);
		}
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener("mouseup", globalMouseUpHandlerRef.current);
		};
	}, [file]);

	const handleMouseDown = (lineNumber) => {
		setDragStart(lineNumber);
		setDragEnd(lineNumber);
		setIsDragging(true);
		window.addEventListener("mouseup", globalMouseUpHandlerRef.current);
	};

	const handleMouseEnter = (lineNumber) => {
		if (isDragging) {
			setDragEnd(lineNumber);
		}
	};

	const updateDragEndFromPoint = (clientX, clientY) => {
		const editor = editorRef.current;
		if (!editor) return;

		let el = document.elementFromPoint(clientX, clientY);
		if (el) {
			const lineEl = el.closest(".code-line");
			if (lineEl && lineEl.dataset && lineEl.dataset.line) {
				const ln = Number(lineEl.dataset.line);
				setDragEnd(ln);
				return;
			}
		}
	};

	const handleMouseMove = (e) => {
		if (!isDragging) return;
		lastMouseEventRef.current = e;
		if (rafRef.current) return;

		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null;
			const ev = lastMouseEventRef.current;
			if (!ev || !editorRef.current) return;

			const rect = editorRef.current.getBoundingClientRect();
			const zone = 60;
			const maxSpeed = 35;
			const speedFactor = 3.5;
			const topEdge = rect.top + zone;
			const bottomEdge = rect.bottom - zone;

			if (ev.clientY < topEdge) {
				const distance = Math.max(1, topEdge - ev.clientY);
				const speed = Math.min(maxSpeed, distance / speedFactor);
				editorRef.current.scrollTop -= speed;
			} else if (ev.clientY > bottomEdge) {
				const distance = Math.max(1, ev.clientY - bottomEdge);
				const speed = Math.min(maxSpeed, distance / speedFactor);
				editorRef.current.scrollTop += speed;
			}
			updateDragEndFromPoint(ev.clientX, ev.clientY);
		});
	};

	const handleMouseUp = (e) => {
		globalMouseUpHandlerRef.current(e);
	};

	const getHighlightColor = (lineNumber) => {
		const citation = citations.find((c) => c.file === file.name && lineNumber >= c.start && lineNumber <= c.end);
		if (citation) return citation.color;

		if (isDragging && dragStart != null && dragEnd != null) {
			const start = Math.min(dragStart, dragEnd);
			const end = Math.max(dragStart, dragEnd);
			if (lineNumber >= start && lineNumber <= end) {
				return "bg-cyan-900/40";
			}
		}
		return "";
	};

	if (!file) {
		return React.createElement("div", { className: "col-span-12 md:col-span-6 bg-[#282c34] rounded-md flex flex-col h-full overflow-y-auto items-center justify-center text-gray-400" }, "Pilih file untuk ditampilkan");
	}

	return React.createElement(
		"div",
		{
			className: "col-span-12 md:col-span-6 bg-[#282c34] rounded-md flex flex-col h-full overflow-hidden font-mono text-sm select-none",
			onMouseUp: handleMouseUp,
			onMouseMove: handleMouseMove,
		},
		React.createElement("div", { className: "bg-gray-700 text-white p-2 rounded-t-md flex-shrink-0" }, file.name),
		React.createElement(
			"div",
			{
				ref: editorRef,
				className: "flex-1 overflow-auto text-gray-200",
			},
			lines.map((line, i) => {
				const lineNumber = i + 1;
				const highlightClass = getHighlightColor(lineNumber) || "hover:bg-gray-700/50";
				return React.createElement(
					"div",
					{
						key: i,
						"data-line": lineNumber,
						className: `code-line flex group cursor-pointer ${highlightClass}`,
						onMouseDown: () => handleMouseDown(lineNumber),
						onMouseEnter: () => handleMouseEnter(lineNumber),
					},
					React.createElement("div", { className: "w-12 text-right pr-4 text-gray-500 select-none sticky left-0 bg-[#282c34]" }, lineNumber),
					React.createElement(
						"pre",
						{ className: "flex-1 whitespace-pre-wrap py-0 px-2" },
						React.createElement("code", {
							dangerouslySetInnerHTML: {
								__html: hljs.highlight(line, { language: file.name.split(".").pop(), ignoreIllegals: true }).value,
							},
						})
					)
				);
			})
		)
	);
};
