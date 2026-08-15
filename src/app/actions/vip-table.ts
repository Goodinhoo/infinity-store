'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --------------------------------
// Gestão de Funcionalidades (Features)
// --------------------------------

export async function getVipFeatures() {
  return prisma.vipFeature.findMany({
    orderBy: [
      { group: 'asc' },
      { order: 'asc' }
    ]
  })
}

export async function createVipFeature(data: { name: string; description?: string; group: string; order: number }) {
  await prisma.vipFeature.create({ data })
  revalidatePath('/admin/vips')
  revalidatePath('/vips')
}

export async function updateVipFeature(id: number, data: { name: string; description?: string; group: string; order: number }) {
  await prisma.vipFeature.update({
    where: { id },
    data
  })
  revalidatePath('/admin/vips')
  revalidatePath('/vips')
}

export async function deleteVipFeature(id: number) {
  await prisma.vipFeature.delete({ where: { id } })
  revalidatePath('/admin/vips')
  revalidatePath('/vips')
}

// --------------------------------
// Gestão de Produtos na Tabela VIP
// --------------------------------

export async function getProductsForVipTable() {
  return prisma.product.findMany({
    where: { 
      showInVipTable: true,
      isHidden: false
    },
    include: {
      vipFeatureValues: true
    },
    orderBy: { price: 'asc' }
  })
}

export async function getAllProductsForVipAdmin() {
  // Para que o admin possa selecionar quem vai para a tabela
  return prisma.product.findMany({
    orderBy: { price: 'asc' }
  })
}

export async function toggleProductInVipTable(productId: number, show: boolean) {
  await prisma.product.update({
    where: { id: productId },
    data: { showInVipTable: show }
  })
  revalidatePath('/admin/vips')
  revalidatePath('/vips')
}

// --------------------------------
// Preencher a Matriz
// --------------------------------

export async function saveProductVipFeatureValue(
  productId: number, 
  featureId: number, 
  data: { type: string; booleanValue: boolean; textValue?: string }
) {
  await prisma.productVipFeatureValue.upsert({
    where: {
      productId_featureId: {
        productId,
        featureId
      }
    },
    create: {
      productId,
      featureId,
      ...data
    },
    update: {
      ...data
    }
  })
  revalidatePath('/admin/vips')
  revalidatePath('/vips')
}
