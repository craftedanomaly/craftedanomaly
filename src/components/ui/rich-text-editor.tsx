'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  rows = 6,
  className 
}: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = displayValue.substring(start, end);
    
    let newText;
    if (selectedText) {
      // Wrap selected text
      newText = displayValue.substring(0, start) + openTag + selectedText + closeTag + displayValue.substring(end);
    } else {
      // Insert tags at cursor position
      newText = displayValue.substring(0, start) + openTag + closeTag + displayValue.substring(end);
    }
    
    setDisplayValue(newText);
    if (isHtmlMode) {
      onChange(newText);
    }
    
    // Set cursor position after the opening tag
    setTimeout(() => {
      const newCursorPos = selectedText ? start + openTag.length + selectedText.length + closeTag.length : start + openTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isHtmlMode && (e.key === 'Enter' || e.key === ' ')) {
      // Explicitly insert newline or space to avoid any upstream prevention
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const insertChar = e.key === 'Enter' ? '\n' : ' ';
      const newText = displayValue.substring(0, start) + insertChar + displayValue.substring(end);
      setDisplayValue(newText);
      // Restore caret
      requestAnimationFrame(() => {
        const pos = start + 1;
        textarea.setSelectionRange(pos, pos);
      });
      return;
    } else if (e.key === 'Enter' && !e.shiftKey && isHtmlMode) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const beforeCursor = displayValue.substring(0, start);
      const afterCursor = displayValue.substring(start);
      
      // Check if we're inside a paragraph tag
      const lastPOpen = beforeCursor.lastIndexOf('<p>');
      const lastPClose = beforeCursor.lastIndexOf('</p>');
      
      let newText;
      if (lastPOpen > lastPClose) {
        // We're inside a paragraph, close it and start a new one
        newText = beforeCursor + '</p><p>' + afterCursor;
      } else {
        // Start a new paragraph
        newText = beforeCursor + '<p></p>' + afterCursor;
      }
      
      setDisplayValue(newText);
      onChange(newText);
      
      // Position cursor inside the new paragraph
      setTimeout(() => {
        const newPos = lastPOpen > lastPClose ? start + 7 : start + 3; // '</p><p>' or '<p>'
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
  };

  const formatValue = (val: string) => {
    if (!val) return val;
    
    // Auto-wrap content in paragraphs if not already wrapped
    if (!val.includes('<p>') && !val.includes('<div>') && !val.includes('<h1>')) {
      const lines = val.split('\n').filter(line => line.trim());
      if (lines.length === 1) {
        return `<p>${val}</p>`;
      } else if (lines.length > 1) {
        return lines.map(line => `<p>${line.trim()}</p>`).join('');
      }
    }
    
    return val;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    
    if (isHtmlMode) {
      onChange(newValue);
    } else {
      // In normal mode, do not propagate plain text immediately.
      // We'll convert to HTML on blur to preserve spaces/newlines.
      // Keep parent value unchanged while typing.
    }
  };

  const handleBlur = () => {
    // Auto-format on blur if not in HTML mode
    if (!isHtmlMode) {
      // Convert plain text to HTML paragraphs, preserving blank lines
      const lines = displayValue.split('\n');
      const htmlValue = lines
        .map((line) => (line === '' ? '<p><br/></p>' : `<p>${line}</p>`))
        .join('');
      onChange(htmlValue);
    }
  };

  // Update display value when value prop changes or mode changes
  useEffect(() => {
    if (isHtmlMode) {
      setDisplayValue(value);
    } else {
      // Convert HTML to plain text for display (do NOT trim to preserve trailing spaces/newlines)
      const plainText = value
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '');
      setDisplayValue(plainText);
    }
  }, [value, isHtmlMode]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag('<strong>', '</strong>')}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag('<em>', '</em>')}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag('<u>', '</u>')}
          className="h-8 w-8 p-0"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag('<ul><li>', '</li></ul>')}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag('<ol><li>', '</li></ol>')}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag('<a href="">', '</a>')}
          className="h-8 w-8 p-0"
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        <div className="ml-auto">
          <Button
            type="button"
            variant={isHtmlMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className="h-8 text-xs"
            title="Toggle HTML Mode"
          >
            <Type className="h-3 w-3 mr-1" />
            HTML
          </Button>
        </div>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={isHtmlMode ? "Enter HTML content..." : placeholder}
        rows={rows}
        className={cn(
          "resize-none",
          isHtmlMode ? "font-mono text-sm bg-slate-950 text-green-400" : "font-sans text-sm"
        )}
      />
      
      {!isHtmlMode && (
        <p className="text-xs text-muted-foreground">
          Press Enter to create new paragraphs. Use toolbar buttons to format selected text.
        </p>
      )}
    </div>
  );
}
