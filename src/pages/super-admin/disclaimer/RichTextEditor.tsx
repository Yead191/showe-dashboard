import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Maximize2,
  Minimize2,
  Code2,
  Eye,
  Type,
} from "lucide-react";
import { Tooltip, Input, Modal } from "antd";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your legal text here...",
  disabled = false,
  minHeight = 520,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    h1: false,
    h2: false,
    h3: false,
  });

  // Keep internal content synchronized with external value
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    setRawHtml(value || "");
  }, [value, isHtmlMode]);

  // Sync format states based on caret position / selection
  const updateActiveFormats = useCallback(() => {
    if (!document.getSelection() || isHtmlMode) return;
    try {
      const getBlock = () => {
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode) return "";
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = (node as HTMLElement).tagName.toLowerCase();
            if (tag === "h1" || tag === "h2" || tag === "h3") return tag;
          }
          node = node.parentNode;
        }
        return "";
      };

      const block = getBlock();

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        h1: block === "h1",
        h2: block === "h2",
        h3: block === "h3",
      });
    } catch {
      // Ignore security errors in sandboxed frames
    }
  }, [isHtmlMode]);

  const executeCommand = (
    command: string,
    value: string | undefined = undefined,
  ) => {
    if (disabled || isHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setRawHtml(next);
    onChange(next);
  };

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching back to visual mode: push rawHtml to editor
      setIsHtmlMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = rawHtml;
        }
      }, 0);
    } else {
      // Switching to HTML mode
      if (editorRef.current) {
        setRawHtml(editorRef.current.innerHTML);
      }
      setIsHtmlMode(true);
    }
  };

  const openInsertLink = () => {
    setLinkUrl("");
    setLinkModalOpen(true);
  };

  const handleConfirmLink = () => {
    if (linkUrl.trim()) {
      executeCommand("createLink", linkUrl.trim());
    }
    setLinkModalOpen(false);
  };

  const toggleHeading = (tag: "h1" | "h2" | "h3") => {
    const isCurrent =
      (tag === "h1" && activeFormats.h1) ||
      (tag === "h2" && activeFormats.h2) ||
      (tag === "h3" && activeFormats.h3);

    if (isCurrent) {
      executeCommand("formatBlock", "<p>");
    } else {
      executeCommand("formatBlock", `<${tag}>`);
    }
  };

  const toggleBlockquote = () => {
    executeCommand("formatBlock", "<blockquote>");
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      executeCommand("insertHTML", "&emsp;");
    }
  };

  return (
    <div
      className={`rounded-2xl border border-line bg-surface-raised transition-all flex flex-col ${
        isFullscreen
          ? "fixed inset-4 z-50 shadow-2xl bg-white flex flex-col"
          : "relative shadow-soft"
      }`}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-sunken/60 px-4 py-2.5 rounded-t-2xl">
        <div className="flex flex-wrap items-center gap-1">
          {/* History */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-line">
            <Tooltip title="Undo (Ctrl+Z)">
              <button
                type="button"
                onClick={() => executeCommand("undo")}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <button
                type="button"
                onClick={() => executeCommand("redo")}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <RotateCw size={15} />
              </button>
            </Tooltip>
          </div>

          {/* Heading levels */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-line">
            <Tooltip title="Paragraph / Normal Text">
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<p>")}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Type size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Heading 1 (Main Section)">
              <button
                type="button"
                onClick={() => toggleHeading("h1")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.h1
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <Heading1 size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Heading 2 (Sub-clause)">
              <button
                type="button"
                onClick={() => toggleHeading("h2")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.h2
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <Heading2 size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Heading 3 (Item title)">
              <button
                type="button"
                onClick={() => toggleHeading("h3")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.h3
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <Heading3 size={15} />
              </button>
            </Tooltip>
          </div>

          {/* Inline formats */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-line">
            <Tooltip title="Bold (Ctrl+B)">
              <button
                type="button"
                onClick={() => executeCommand("bold")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.bold
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <Bold size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Italic (Ctrl+I)">
              <button
                type="button"
                onClick={() => executeCommand("italic")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.italic
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <Italic size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Underline (Ctrl+U)">
              <button
                type="button"
                onClick={() => executeCommand("underline")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.underline
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <Underline size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Strikethrough">
              <button
                type="button"
                onClick={() => executeCommand("strikeThrough")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.strikeThrough
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <Strikethrough size={15} />
              </button>
            </Tooltip>
          </div>

          {/* Lists & structural */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-line">
            <Tooltip title="Bulleted List">
              <button
                type="button"
                onClick={() => executeCommand("insertUnorderedList")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.insertUnorderedList
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <List size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Numbered List">
              <button
                type="button"
                onClick={() => executeCommand("insertOrderedList")}
                disabled={disabled || isHtmlMode}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFormats.insertOrderedList
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-offset"
                }`}
              >
                <ListOrdered size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Blockquote">
              <button
                type="button"
                onClick={toggleBlockquote}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Quote size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Horizontal Divider">
              <button
                type="button"
                onClick={() => executeCommand("insertHorizontalRule")}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Minus size={15} />
              </button>
            </Tooltip>
          </div>

          {/* Links & code */}
          <div className="flex items-center gap-0.5 px-1.5">
            <Tooltip title="Insert Link">
              <button
                type="button"
                onClick={openInsertLink}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <LinkIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Remove Link">
              <button
                type="button"
                onClick={() => executeCommand("unlink")}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Unlink size={15} />
              </button>
            </Tooltip>
            <Tooltip title="Clear Formatting">
              <button
                type="button"
                onClick={() => executeCommand("removeFormat")}
                disabled={disabled || isHtmlMode}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors disabled:opacity-30 cursor-pointer"
              >
                <RemoveFormatting size={15} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5">
          <Tooltip
            title={
              isHtmlMode ? "Switch to Visual Editor" : "Switch to Raw HTML Mode"
            }
          >
            <button
              type="button"
              onClick={toggleHtmlMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                isHtmlMode
                  ? "bg-accent-50 border-accent/40 text-accent-700"
                  : "bg-surface-raised border-line text-ink-muted hover:text-ink"
              }`}
            >
              {isHtmlMode ? (
                <>
                  <Eye size={13} />
                  <span>Visual</span>
                </>
              ) : (
                <>
                  <Code2 size={13} />
                  <span>HTML Source</span>
                </>
              )}
            </button>
          </Tooltip>

          <Tooltip
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus"}
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-offset transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Editor Canvas ── */}
      <div className="relative flex-1 min-h-0 bg-white rounded-b-2xl overflow-hidden">
        {isHtmlMode ? (
          <textarea
            value={rawHtml}
            onChange={handleRawHtmlChange}
            disabled={disabled}
            placeholder="Edit raw HTML markup..."
            style={{
              minHeight: isFullscreen
                ? "calc(100vh - 140px)"
                : `${minHeight}px`,
            }}
            className="w-full h-full p-6 font-mono text-xs text-ink bg-[#1E1E1E] outline-none resize-y selection:bg-primary-300"
            spellCheck={false}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            style={{
              minHeight: isFullscreen
                ? "calc(100vh - 140px)"
                : `${minHeight}px`,
            }}
            className="showe-prose w-full p-8 md:p-10 outline-none text-ink text-[15px] leading-relaxed overflow-y-auto cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-ink-faint empty:before:pointer-events-none"
          />
        )}
      </div>

      {/* Link Insertion Modal */}
      <Modal
        title="Insert Hyperlink"
        open={linkModalOpen}
        onOk={handleConfirmLink}
        onCancel={() => setLinkModalOpen(false)}
        okText="Insert Link"
        okButtonProps={{ className: "bg-primary! text-white!" }}
        destroyOnClose
        centered
      >
        <div className="py-4 space-y-3">
          <label className="text-xs font-semibold text-ink-muted">
            Destination URL
          </label>
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onPressEnter={handleConfirmLink}
            autoFocus
            className="rounded-xl h-11"
          />
        </div>
      </Modal>
    </div>
  );
}
