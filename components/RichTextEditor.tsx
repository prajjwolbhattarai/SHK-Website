import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Heading1, Heading2, Heading3, 
  Quote, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, 
  Undo, Redo, Minus, Type
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder = "Start writing here..." }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // This ref prevents the component from re-rendering the innerHTML 
  // while the user is actively typing, which causes the cursor to jump/crash.
  const isLocked = useRef(false);

  useEffect(() => {
    // Only update the innerHTML from props if:
    // 1. The editor exists
    // 2. We are NOT currently typing (locked)
    // 3. The content is actually different (prevent loops)
    if (editorRef.current && !isLocked.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      isLocked.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      
      // Unlock after a short delay to allow external updates (like loading a new article)
      // but prevent race conditions during rapid typing.
      setTimeout(() => {
        isLocked.current = false;
      }, 100);
    }
  };

  // Ensure lock is active when focused to prevent any external re-renders interfering
  const handleFocus = () => {
    isLocked.current = true;
  };

  const handleBlur = () => {
    isLocked.current = false;
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
        handleInput();
    }
  };

  const ToolbarButton: React.FC<{ 
    icon: React.ReactNode, 
    command: string, 
    value?: string, 
    title?: string 
  }> = ({ icon, command, value, title }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); 
        execCommand(command, value);
      }}
      className="p-2 text-gray-600 hover:text-brand-copper hover:bg-gray-100 rounded-sm transition"
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-sm bg-white overflow-hidden flex flex-col h-[600px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-1">
          <ToolbarButton icon={<Undo className="w-4 h-4" />} command="undo" title="Undo" />
          <ToolbarButton icon={<Redo className="w-4 h-4" />} command="redo" title="Redo" />
        </div>
        
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-1">
          <ToolbarButton icon={<Heading1 className="w-4 h-4" />} command="formatBlock" value="H2" title="Heading 1" />
          <ToolbarButton icon={<Heading2 className="w-4 h-4" />} command="formatBlock" value="H3" title="Heading 2" />
          <ToolbarButton icon={<Heading3 className="w-4 h-4" />} command="formatBlock" value="H4" title="Heading 3" />
          <ToolbarButton icon={<Type className="w-4 h-4" />} command="formatBlock" value="P" title="Paragraph" />
        </div>

        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-1">
          <ToolbarButton icon={<Bold className="w-4 h-4" />} command="bold" title="Bold" />
          <ToolbarButton icon={<Italic className="w-4 h-4" />} command="italic" title="Italic" />
          <ToolbarButton icon={<Underline className="w-4 h-4" />} command="underline" title="Underline" />
        </div>

        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-1">
          <ToolbarButton icon={<List className="w-4 h-4" />} command="insertUnorderedList" title="Bullet List" />
          <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} command="insertOrderedList" title="Numbered List" />
          <ToolbarButton icon={<Quote className="w-4 h-4" />} command="formatBlock" value="BLOCKQUOTE" title="Quote" />
        </div>

        <div className="flex items-center space-x-1">
          <ToolbarButton icon={<Minus className="w-4 h-4" />} command="insertHorizontalRule" title="Section Break" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              const url = prompt('Enter link URL:');
              if (url) execCommand('createLink', url);
            }}
            className="p-2 text-gray-600 hover:text-brand-copper hover:bg-gray-100 rounded-sm transition"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editable Area */}
      <div 
        className="flex-grow p-8 overflow-y-auto outline-none prose prose-slate max-w-none focus:bg-gray-50/30 transition relative"
        contentEditable
        ref={editorRef}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ minHeight: '300px' }}
      ></div>
      
      {!content && (
         <div className="px-8 pb-4 text-gray-300 italic pointer-events-none -mt-4">
             {placeholder}
         </div>
      )}

      <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 flex justify-between">
        <span>WYSIWYG Mode Active</span>
        <span>HTML/Rich Text</span>
      </div>
    </div>
  );
};

export default RichTextEditor;