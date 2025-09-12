import { supabase } from '../lib/supabase';
import type { IMusic } from '../interfaces/IMusic';

export class MusicService {
    private bucketName = 'assets';
    private folder = 'musics';
    private audioElement: HTMLAudioElement | null = null;

    async getFirstMusic(): Promise<IMusic | null> {
        try {
            const { data: files, error } = await supabase.storage
                .from(this.bucketName)
                .list(this.folder, {
                    limit: 100,
                    offset: 0,
                });

            if (error) throw error;
            const validFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder');
            
            if (validFiles.length === 0) return null;

            const randomIndex = Math.floor(Math.random() * validFiles.length);
            const file = validFiles[randomIndex];
            const filePath = `${this.folder}/${file.name}`;
            const { data } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            return {
                id: file.id || file.name,
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: data.publicUrl,
                filePath,
                isActive: false,
                createdAt: file.created_at || new Date().toISOString(),
                updatedAt: file.updated_at || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching first music:', error);
            return null;
        }
    }

    async getRemainingMusics(excludeFileName?: string): Promise<IMusic[]> {
        try {
            const { data: files, error } = await supabase.storage
                .from(this.bucketName)
                .list(this.folder, {
                    limit: 100,
                    offset: 0,
                });

            if (error) throw error;
            const validFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder' && file.name !== excludeFileName);
            
            return validFiles.map(file => {
                const filePath = `${this.folder}/${file.name}`;
                const { data } = supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(filePath);

                return {
                    id: file.id || file.name,
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    url: data.publicUrl,
                    filePath,
                    isActive: false,
                    createdAt: file.created_at || new Date().toISOString(),
                    updatedAt: file.updated_at || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error fetching remaining musics:', error);
            return [];
        }
    }

    async getMusics(): Promise<IMusic[]> {
        try {
            const { data: files, error } = await supabase.storage
                .from(this.bucketName)
                .list(this.folder);

            if (error) throw error;
            
            const validFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder');
            
            return validFiles.map(file => {
                const filePath = `${this.folder}/${file.name}`;
                const { data } = supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(filePath);

                return {
                    id: file.id || file.name,
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    url: data.publicUrl,
                    filePath,
                    isActive: false,
                    createdAt: file.created_at || new Date().toISOString(),
                    updatedAt: file.updated_at || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error fetching musics:', error);
            return [];
        }
    }

    async uploadMusic(file: File): Promise<IMusic | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${this.folder}/${fileName}`;

            const { error } = await supabase.storage
                .from(this.bucketName)
                .upload(filePath, file);

            if (error) throw error;

            const { data } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            return {
                id: fileName,
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: data.publicUrl,
                filePath,
                isActive: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error uploading music:', error);
            return null;
        }
    }

    async deleteMusic(filePath: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            return !error;
        } catch (error) {
            console.error('Error deleting music:', error);
            return false;
        }
    }

    createAudioElement(url: string): HTMLAudioElement {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
            this.audioElement.removeAttribute('data-connected');
        }
        
        this.audioElement = new Audio(url);
        this.audioElement.crossOrigin = 'anonymous';
        this.audioElement.preload = 'auto';
        return this.audioElement;
    }

    getAudioElement(): HTMLAudioElement | null {
        return this.audioElement;
    }

    destroyAudioElement(): void {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
            this.audioElement = null;
        }
    }
}

export const musicService = new MusicService();