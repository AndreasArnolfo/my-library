'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Snippet } from '@/lib/types'

// CREATE
export async function createSnippet(data: Omit<Snippet, 'id' | 'createdAt'>) {
  try {
    const newSnippet = await prisma.snippet.create({
      data: {
        ...data,
        tabs: data.tabs ? (data.tabs as any) : undefined,
      },
    })
    revalidatePath('/')
    return { success: true, data: { ...newSnippet, tabs: newSnippet.tabs as Snippet['tabs'] } }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error creating snippet:', msg)
    return { success: false, error: msg }
  }
}

// READ ALL
export async function getSnippets() {
  try {
    const snippets = await prisma.snippet.findMany({
      orderBy: { createdAt: 'desc' },
    })
    // Cast explicitly
    const parsedSnippets = snippets.map((s: any) => ({
      ...s,
      tabs: s.tabs as Snippet['tabs']
    })) as Snippet[]
    return { success: true, data: parsedSnippets }
  } catch (error) {
    console.error('Error fetching snippets:', error)
    return { success: false, error: 'Failed to fetch snippets' }
  }
}

// READ ONE
export async function getSnippetById(id: string) {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
    })
    if (!snippet) return { success: false, error: 'Snippet not found' }
    return { success: true, data: { ...snippet, tabs: snippet.tabs as Snippet['tabs'] } as unknown as Snippet }
  } catch (error) {
    console.error('Error fetching snippet:', error)
    return { success: false, error: 'Failed to fetch snippet' }
  }
}

// UPDATE
export async function updateSnippet(id: string, data: Partial<Omit<Snippet, 'id' | 'createdAt'>>) {
  try {
    const updatedSnippet = await prisma.snippet.update({
      where: { id },
      data: {
        ...data,
        tabs: data.tabs ? (data.tabs as any) : undefined,
      },
    })
    revalidatePath('/')
    return { success: true, data: { ...updatedSnippet, tabs: updatedSnippet.tabs as Snippet['tabs'] } as unknown as Snippet }
  } catch (error) {
    console.error('Error updating snippet:', error)
    return { success: false, error: 'Failed to update snippet' }
  }
}

// DELETE
export async function deleteSnippet(id: string) {
  try {
    await prisma.snippet.delete({
      where: { id },
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return { success: false, error: 'Failed to delete snippet' }
  }
}
