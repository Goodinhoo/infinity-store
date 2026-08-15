'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Heading1, Heading2, ImageIcon, LinkIcon, Undo, Redo, FileCode2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function TipTapEditor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const [showHtml, setShowHtml] = useState(false)
  const [htmlValue, setHtmlValue] = useState(content)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setHtmlValue(html)
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4 bg-black/20 text-white rounded-b-xl border-x border-b border-white/10'
      }
    }
  })

  // Sincroniza o valor inicial se mudar externamente
  useEffect(() => {
    if (editor && content !== htmlValue) {
      editor.commands.setContent(content)
      setTimeout(() => setHtmlValue(content), 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor])

  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)
    
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value
    setHtmlValue(newHtml)
    onChange(newHtml)
    // Atualizar o editor TipTap silenciosamente
    editor.commands.setContent(newHtml)
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-1 p-2 bg-white/5 border border-white/10 rounded-t-xl items-center">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run() || showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bold') && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run() || showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('italic') && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run() || showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('strike') && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <Strikethrough size={16} />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 1 }) && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bulletList') && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('orderedList') && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('blockquote') && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <Quote size={16} />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={setLink}
          disabled={showHtml}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('link') && !showHtml ? 'bg-white/20 text-white' : 'text-gray-400'} disabled:opacity-50`}
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={addImage}
          disabled={showHtml}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 disabled:opacity-50"
        >
          <ImageIcon size={16} />
        </button>
        
        <div className="flex-1" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run() || showHtml}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 disabled:opacity-50"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run() || showHtml}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 disabled:opacity-50"
        >
          <Redo size={16} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Botão de Código Fonte HTML */}
        <button
          type="button"
          onClick={() => setShowHtml(!showHtml)}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold ${showHtml ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'text-gray-400'}`}
          title="Editar Código HTML"
        >
          <FileCode2 size={16} />
          {showHtml ? 'Modo Visual' : 'Código Fonte'}
        </button>
      </div>
      
      {showHtml ? (
        <textarea
          value={htmlValue}
          onChange={handleHtmlChange}
          className="w-full min-h-[300px] p-4 bg-black/40 text-gray-300 font-mono text-sm rounded-b-xl border-x border-b border-white/10 focus:outline-none focus:border-neon-blue/50 transition-colors resize-y"
          placeholder="<h1>Escreve o teu código HTML aqui...</h1>"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  )
}
