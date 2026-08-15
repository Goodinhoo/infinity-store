'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Swal from 'sweetalert2'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote,
  Undo,
  Redo,
  RemoveFormatting,
  Image as ImageIcon,
  Link as LinkIcon,
  FileCode2
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor, showHtml, setShowHtml }: { editor: Editor | null, showHtml: boolean, setShowHtml: (val: boolean) => void }) => {
  if (!editor) return null

  const addImage = async () => {
    const { value: url } = await Swal.fire({
      title: 'Inserir Imagem',
      input: 'url',
      inputLabel: 'Link da Imagem (URL)',
      inputPlaceholder: 'https://...',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Inserir',
      background: '#0a0a0f',
      color: '#fff',
      customClass: {
        popup: 'border border-white/10 rounded-2xl',
        input: 'bg-black/50 border border-white/10 text-white focus:border-neon-purple rounded-xl',
        confirmButton: 'bg-neon-purple text-white px-4 py-2 rounded-xl font-bold',
        cancelButton: 'bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold'
      }
    })

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = async () => {
    const previousUrl = editor.getAttributes('link').href
    
    const { value: url } = await Swal.fire({
      title: 'Inserir Link',
      input: 'url',
      inputLabel: 'Link de destino',
      inputValue: previousUrl,
      inputPlaceholder: 'https://...',
      showCancelButton: true,
      cancelButtonText: 'Remover',
      confirmButtonText: 'Guardar',
      background: '#0a0a0f',
      color: '#fff',
      customClass: {
        popup: 'border border-white/10 rounded-2xl',
        input: 'bg-black/50 border border-white/10 text-white focus:border-neon-purple rounded-xl',
        confirmButton: 'bg-neon-purple text-white px-4 py-2 rounded-xl font-bold',
        cancelButton: 'bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold'
      }
    })

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-black/40 border-b border-white/10 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run() || showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Negrito"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run() || showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Itálico"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run() || showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('strike') && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Rasurado"
      >
        <Strikethrough size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 1 }) && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Título 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Título 2"
      >
        <Heading2 size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Lista com marcas"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Lista numerada"
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('blockquote') && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Citação"
      >
        <Quote size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={setLink}
        disabled={showHtml}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('link') && !showHtml ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
        title="Inserir Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        type="button"
        onClick={addImage}
        disabled={showHtml}
        className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
        title="Inserir Imagem"
      >
        <ImageIcon size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        disabled={showHtml}
        className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-30"
        title="Limpar Formatação"
      >
        <RemoveFormatting size={16} />
      </button>

      <div className="flex-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run() || showHtml}
        className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
        title="Desfazer"
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run() || showHtml}
        className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
        title="Refazer"
      >
        <Redo size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={() => setShowHtml(!showHtml)}
        className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${showHtml ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
        title="Editar Código HTML"
      >
        <FileCode2 size={16} />
        <span className="hidden sm:inline">{showHtml ? 'Visual' : 'HTML'}</span>
      </button>
    </div>
  )
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showHtml, setShowHtml] = useState(false)
  const [htmlValue, setHtmlValue] = useState(content)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto border border-white/10 bg-black/40',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-neon-blue underline underline-offset-4 hover:text-white transition-colors cursor-pointer',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setHtmlValue(html)
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 prose-blockquote:my-2 max-w-none focus:outline-none min-h-[150px] p-4 text-sm text-gray-200'
      }
    }
  })

  // To update content if it changes externally (e.g. editing a different item)
  useEffect(() => {
    if (editor && content !== htmlValue) {
      if (content === '') {
        editor.commands.setContent('')
      } else {
        editor.commands.setContent(content)
      }
      setTimeout(() => setHtmlValue(content), 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor])

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value
    setHtmlValue(newHtml)
    onChange(newHtml)
    if (editor) {
      editor.commands.setContent(newHtml)
    }
  }

  return (
    <div className="flex flex-col w-full bg-black/50 border border-white/10 rounded-xl focus-within:border-neon-purple transition-colors overflow-hidden">
      <MenuBar editor={editor} showHtml={showHtml} setShowHtml={setShowHtml} />
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neon-purple/50">
        {showHtml ? (
          <textarea
            value={htmlValue}
            onChange={handleHtmlChange}
            className="w-full min-h-[150px] p-4 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-y"
            placeholder="<h1>Escreve o teu código HTML aqui...</h1>"
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  )
}
