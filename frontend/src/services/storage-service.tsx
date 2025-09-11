import { supabase } from '../lib/supabase'

export class StorageService {
  private bucketName = 'assets'

  async uploadFile(folder: 'backgrounds' | 'effects' | 'musics', file: File, fileName?: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const finalFileName = fileName || `${Math.random()}.${fileExt}`
    const filePath = `${folder}/${finalFileName}`

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(filePath, file)

    if (error) {
      throw new Error(error.message)
    }

    return filePath
  }

  async getFileUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  async deleteFile(filePath: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([filePath])

    return !error
  }

  async listFiles(folder: 'backgrounds' | 'effects' | 'musics'): Promise<any[]> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(folder)

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  async downloadFile(filePath: string): Promise<Blob | null> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .download(filePath)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }
}

export const storageService = new StorageService()