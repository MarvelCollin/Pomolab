import { useState } from 'react'
import { storageService } from '../services/storage-service'

export const useStorage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (folder: 'backgrounds' | 'effects' | 'musics', file: File, fileName?: string) => {
    setLoading(true)
    setError(null)
    try {
      const filePath = await storageService.uploadFile(folder, file, fileName)
      const url = await storageService.getFileUrl(filePath!)
      return { filePath, url }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getFileUrl = async (filePath: string) => {
    setLoading(true)
    setError(null)
    try {
      return await storageService.getFileUrl(filePath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get file URL')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (filePath: string) => {
    setLoading(true)
    setError(null)
    try {
      return await storageService.deleteFile(filePath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const listFiles = async (folder: 'backgrounds' | 'effects' | 'musics') => {
    setLoading(true)
    setError(null)
    try {
      return await storageService.listFiles(folder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list files')
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    uploadFile,
    getFileUrl,
    deleteFile,
    listFiles,
    loading,
    error
  }
}