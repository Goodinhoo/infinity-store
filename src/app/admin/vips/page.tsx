'use client'

import { useState, useEffect } from 'react'
import { getVipFeatures, createVipFeature, updateVipFeature, deleteVipFeature, getProductsForVipTable, getAllProductsForVipAdmin, toggleProductInVipTable, saveProductVipFeatureValue } from '@/app/actions/vip-table'
import { Plus, Loader2, Edit, Trash2, Check, X, Settings2, Table, Box, GripVertical } from 'lucide-react'
import { Toast } from '@/lib/toast'

type VipFeature = {
  id: number
  name: string
  description: string | null
  group: string
  order: number
}

type Product = {
  id: number
  name: string
  price: number
  showInVipTable: boolean
}

type ProductWithFeatures = Product & {
  vipFeatureValues: {
    featureId: number
    type: string
    booleanValue: boolean
    textValue: string | null
  }[]
}

export default function AdminVipsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'features' | 'matrix'>('products')
  const [loading, setLoading] = useState(true)

  const [features, setFeatures] = useState<VipFeature[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [tableProducts, setTableProducts] = useState<ProductWithFeatures[]>([])

  // Modal de Features
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null)
  const [fName, setFName] = useState('')
  const [fDescription, setFDescription] = useState('')
  const [fGroup, setFGroup] = useState('Geral')
  const [fOrder, setFOrder] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const f = await getVipFeatures()
      const allP = await getAllProductsForVipAdmin()
      const tP = await getProductsForVipTable()
      setFeatures(f)
      setAllProducts(allP)
      setTableProducts(tP)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar dados.' })
    } finally {
      setLoading(false)
    }
  }

  // --- TAB: PRODUCTS ---
  const handleToggleProduct = async (productId: number, currentState: boolean) => {
    const p = allProducts.find(x => x.id === productId)
    if (!p) return
    const newState = !currentState
    // Otimistic UI
    setAllProducts(allProducts.map(x => x.id === productId ? { ...x, showInVipTable: newState } : x))
    try {
      await toggleProductInVipTable(productId, newState)
      // Recarregar os tableProducts para atualizar a matriz
      const tP = await getProductsForVipTable()
      setTableProducts(tP)
    } catch {
      setAllProducts(allProducts.map(x => x.id === productId ? { ...x, showInVipTable: currentState } : x))
      Toast.fire({ icon: 'error', title: 'Erro ao atualizar produto.' })
    }
  }

  // --- TAB: FEATURES ---
  const handleOpenFeatureModal = (feat?: VipFeature) => {
    if (feat) {
      setEditingFeatureId(feat.id)
      setFName(feat.name)
      setFDescription(feat.description || '')
      setFGroup(feat.group)
      setFOrder(feat.order)
    } else {
      setEditingFeatureId(null)
      setFName('')
      setFDescription('')
      setFGroup('Geral')
      setFOrder(0)
    }
    setIsFeatureModalOpen(true)
  }

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = { name: fName, description: fDescription || undefined, group: fGroup, order: fOrder }
      if (editingFeatureId) {
        await updateVipFeature(editingFeatureId, data)
        Toast.fire({ icon: 'success', title: 'Vantagem atualizada!' })
      } else {
        await createVipFeature(data)
        Toast.fire({ icon: 'success', title: 'Vantagem criada!' })
      }
      setIsFeatureModalOpen(false)
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar vantagem.' })
    }
  }

  const handleDeleteFeature = async (id: number) => {
    if (!confirm('Eliminar esta vantagem?')) return
    try {
      await deleteVipFeature(id)
      Toast.fire({ icon: 'success', title: 'Eliminada com sucesso.' })
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao eliminar.' })
    }
  }

  // --- TAB: MATRIX ---
  const handleMatrixToggle = async (productId: number, featureId: number, currentType: string, currentVal: boolean) => {
    const newVal = !currentVal
    try {
      await saveProductVipFeatureValue(productId, featureId, {
        type: 'BOOLEAN',
        booleanValue: newVal
      })
      // Otimistic Update
      setTableProducts(tableProducts.map(p => {
        if (p.id !== productId) return p
        const existing = p.vipFeatureValues.find(v => v.featureId === featureId)
        if (existing) {
          existing.booleanValue = newVal
          existing.type = 'BOOLEAN'
        } else {
          p.vipFeatureValues.push({ featureId, type: 'BOOLEAN', booleanValue: newVal, textValue: null })
        }
        return p
      }))
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao atualizar matriz.' })
    }
  }

  const handleMatrixTextChange = async (productId: number, featureId: number, newText: string) => {
    try {
      await saveProductVipFeatureValue(productId, featureId, {
        type: 'TEXT',
        booleanValue: false, // ignored
        textValue: newText
      })
      // Otimistic
       setTableProducts(tableProducts.map(p => {
        if (p.id !== productId) return p
        const existing = p.vipFeatureValues.find(v => v.featureId === featureId)
        if (existing) {
          existing.textValue = newText
          existing.type = 'TEXT'
        } else {
          p.vipFeatureValues.push({ featureId, type: 'TEXT', booleanValue: false, textValue: newText })
        }
        return p
      }))
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao atualizar matriz.' })
    }
  }

  // Group features for Matrix
  const groupedFeatures = features.reduce((acc, feat) => {
    if (!acc[feat.group]) acc[feat.group] = []
    acc[feat.group].push(feat)
    return acc
  }, {} as Record<string, VipFeature[]>)

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-neon-blue" size={32} /></div>
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Gestão da Tabela VIP</h1>
          <p className="text-sm text-gray-400 mt-1">Configura os produtos, vantagens e constrói a tabela comparativa.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-black/40 rounded-xl w-fit border border-white/5">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-neon-blue text-white shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Box size={16} /> Seleção de Ranks
        </button>
        <button 
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'features' ? 'bg-neon-purple text-white shadow-[0_0_15px_-5px_rgba(188,19,254,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Settings2 size={16} /> Vantagens / Comandos
        </button>
        <button 
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'matrix' ? 'bg-yellow-500 text-white shadow-[0_0_15px_-5px_rgba(234,179,8,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Table size={16} /> Editor da Matriz
        </button>
      </div>

      {/* TAB: Produtos */}
      {activeTab === 'products' && (
        <div className="gale-panel p-6 border border-white/10 flex flex-col gap-4">
          <p className="text-sm text-gray-400 mb-2">Seleciona quais os produtos (Ranks/VIPs) que devem aparecer na tabela comparativa pública.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-white">{product.name}</h4>
                  <p className="text-xs text-neon-blue">{product.price.toFixed(2)}€</p>
                </div>
                <button
                  onClick={() => handleToggleProduct(product.id, product.showInVipTable)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${product.showInVipTable ? 'bg-neon-blue' : 'bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${product.showInVipTable ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Features */}
      {activeTab === 'features' && (
        <div className="gale-panel p-6 border border-white/10 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400 max-w-xl">Cria as vantagens ou comandos que serão listados nas linhas da tabela (ex: &quot;Kit Mensal&quot;, &quot;/fly&quot;). Agrupa-os para uma melhor leitura.</p>
            <button onClick={() => handleOpenFeatureModal()} className="px-4 py-2 bg-neon-purple text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-neon-purple/80 transition-colors">
              <Plus size={16} /> Nova Vantagem
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {Object.keys(groupedFeatures).length === 0 && (
              <div className="text-center py-10 text-gray-500">Nenhuma vantagem criada ainda.</div>
            )}
            {Object.entries(groupedFeatures).map(([groupName, groupFeats]) => (
              <div key={groupName} className="flex flex-col gap-3">
                <h3 className="text-sm font-black text-neon-purple uppercase tracking-widest pl-2">{groupName}</h3>
                <div className="flex flex-col gap-2">
                  {groupFeats.map(feat => (
                    <div key={feat.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <GripVertical size={16} className="text-gray-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{feat.name}</span>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400">Ordem: {feat.order}</span>
                          </div>
                          {feat.description && <p className="text-xs text-gray-500 mt-0.5">{feat.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenFeatureModal(feat)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteFeature(feat.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Matriz */}
      {activeTab === 'matrix' && (
        <div className="gale-panel p-6 border border-white/10 flex flex-col gap-4 overflow-x-auto">
          <p className="text-sm text-gray-400 mb-4">Preenche a tabela. Clica nos botões X/V para alternar, ou clica no ícone &quot;Texto&quot; para introduzir valores específicos (ex: &quot;5&quot;, &quot;Ilimitado&quot;).</p>
          
          {tableProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Seleciona pelo menos um produto na aba &quot;Seleção de Ranks&quot;.</div>
          ) : features.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Cria vantagens na aba &quot;Vantagens&quot; primeiro.</div>
          ) : (
            <div className="min-w-[800px]">
              {/* Cabeçalho */}
              <div className="flex items-end mb-4 border-b border-white/10 pb-4">
                <div className="w-[300px] flex-shrink-0 font-bold text-gray-400 text-sm uppercase tracking-wider pl-4">Funcionalidade</div>
                <div className="flex-1 flex">
                  {tableProducts.map(p => (
                    <div key={p.id} className="flex-1 px-2 text-center flex flex-col items-center">
                      <span className="font-black text-neon-blue">{p.name}</span>
                      <span className="text-xs text-gray-500">{p.price.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corpo da Tabela */}
              <div className="flex flex-col gap-1">
                {Object.entries(groupedFeatures).map(([groupName, groupFeats]) => (
                  <div key={groupName} className="mb-4">
                    <div className="w-full bg-white/5 py-1.5 px-4 rounded-lg mb-2">
                      <span className="text-xs font-black text-neon-purple uppercase tracking-widest">{groupName}</span>
                    </div>
                    {groupFeats.map((feat, idx) => (
                      <div key={feat.id} className={`flex items-center py-3 ${idx % 2 === 0 ? 'bg-black/20' : ''} rounded-lg hover:bg-white/5 transition-colors`}>
                        <div className="w-[300px] flex-shrink-0 pl-4 pr-2">
                          <p className="font-bold text-white text-sm">{feat.name}</p>
                          {feat.description && <p className="text-[10px] text-gray-500 line-clamp-1">{feat.description}</p>}
                        </div>
                        <div className="flex-1 flex">
                          {tableProducts.map(p => {
                            const val = p.vipFeatureValues.find(v => v.featureId === feat.id)
                            const isText = val?.type === 'TEXT'
                            const isTrue = val?.booleanValue === true
                            const textVal = val?.textValue || ''

                            return (
                              <div key={`${feat.id}-${p.id}`} className="flex-1 px-2 flex justify-center items-center group relative">
                                {isText ? (
                                  <div className="flex items-center gap-1">
                                    <input 
                                      type="text" 
                                      className="w-16 sm:w-20 bg-black/60 border border-white/10 rounded-md px-2 py-1 text-xs text-center text-white focus:border-neon-blue"
                                      defaultValue={textVal}
                                      onBlur={(e) => handleMatrixTextChange(p.id, feat.id, e.target.value)}
                                      placeholder="-"
                                    />
                                    <button 
                                      onClick={() => handleMatrixToggle(p.id, feat.id, 'BOOLEAN', false)}
                                      className="text-gray-500 hover:text-white"
                                      title="Mudar para Sim/Não"
                                    >
                                      <Settings2 size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleMatrixToggle(p.id, feat.id, 'BOOLEAN', isTrue)}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isTrue ? 'bg-green-500/20 text-green-500' : 'bg-red-500/10 text-red-500/50 hover:bg-red-500/20 hover:text-red-400'}`}
                                    >
                                      {isTrue ? <Check size={16} /> : <X size={16} />}
                                    </button>
                                    <button 
                                      onClick={() => handleMatrixTextChange(p.id, feat.id, '')}
                                      className="text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Mudar para Texto Livre"
                                    >
                                      <Settings2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Modal */}
      {isFeatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="gale-panel p-6 w-full max-w-md border border-white/10 flex flex-col gap-4 animate-scale-in relative">
            <button onClick={() => setIsFeatureModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white">{editingFeatureId ? 'Editar Vantagem' : 'Nova Vantagem'}</h2>
            
            <form onSubmit={handleSaveFeature} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Nome da Vantagem / Comando</label>
                <input required type="text" value={fName} onChange={e => setFName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-purple" placeholder="Ex: Comando /fly" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Descrição Pequena (Opcional)</label>
                <input type="text" value={fDescription} onChange={e => setFDescription(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-purple" placeholder="Ex: Permite voar nos lobbys" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-400 mb-1 block">Grupo (Categoria)</label>
                  <input required type="text" value={fGroup} onChange={e => setFGroup(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-purple" placeholder="Ex: Comandos" />
                </div>
                <div className="w-24">
                  <label className="text-xs font-bold text-gray-400 mb-1 block">Ordem</label>
                  <input required type="number" value={fOrder} onChange={e => setFOrder(parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-purple" />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 py-3 bg-neon-purple text-white rounded-lg font-bold text-sm hover:bg-neon-purple/80 transition-colors">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
