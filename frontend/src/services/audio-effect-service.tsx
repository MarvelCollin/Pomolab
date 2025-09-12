import { supabase } from '../lib/supabase';
import type { IAudioEffect } from '../interfaces/IAudioEffect';

export class AudioEffectService {
    private bucketName = 'assets';
    private folder = 'effects';
    private audioElements: Map<string, HTMLAudioElement> = new Map();

    async getAudioEffects(): Promise<IAudioEffect[]> {
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
                    name: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                    url: data.publicUrl,
                    filePath,
                    isActive: false,
                    volume: 0.5,
                    isMuted: false,
                    createdAt: file.created_at || new Date().toISOString(),
                    updatedAt: file.updated_at || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error fetching audio effects:', error);
            return [];
        }
    }

    createAudioElement(effectId: string, url: string): HTMLAudioElement {
        const existingAudio = this.audioElements.get(effectId);
        if (existingAudio) {
            existingAudio.pause();
            existingAudio.src = '';
        }
        
        const audioElement = new Audio(url);
        audioElement.crossOrigin = 'anonymous';
        audioElement.loop = true;
        audioElement.preload = 'auto';
        
        this.audioElements.set(effectId, audioElement);
        return audioElement;
    }

    getAudioElement(effectId: string): HTMLAudioElement | null {
        return this.audioElements.get(effectId) || null;
    }

    destroyAudioElement(effectId: string): void {
        const audioElement = this.audioElements.get(effectId);
        if (audioElement) {
            audioElement.pause();
            audioElement.src = '';
            this.audioElements.delete(effectId);
        }
    }

    destroyAllAudioElements(): void {
        this.audioElements.forEach((audio, effectId) => {
            this.destroyAudioElement(effectId);
        });
        this.audioElements.clear();
    }

    async uploadAudioEffect(file: File): Promise<IAudioEffect | null> {
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
                name: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                url: data.publicUrl,
                filePath,
                isActive: false,
                volume: 0.5,
                isMuted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error uploading audio effect:', error);
            return null;
        }
    }

    async deleteAudioEffect(filePath: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            return !error;
        } catch (error) {
            console.error('Error deleting audio effect:', error);
            return false;
        }
    }

    setEffectVolume(effectId: string, volume: number): void {
        const audioElement = this.audioElements.get(effectId);
        if (audioElement) {
            audioElement.volume = Math.max(0, Math.min(1, volume));
        }
    }

    setEffectMuted(effectId: string, muted: boolean): void {
        const audioElement = this.audioElements.get(effectId);
        if (audioElement) {
            audioElement.muted = muted;
        }
    }

    playEffect(effectId: string): Promise<void> {
        const audioElement = this.audioElements.get(effectId);
        if (audioElement) {
            return audioElement.play();
        }
        return Promise.reject('Audio element not found');
    }

    pauseEffect(effectId: string): void {
        const audioElement = this.audioElements.get(effectId);
        if (audioElement) {
            audioElement.pause();
        }
    }

    stopEffect(effectId: string): void {
        const audioElement = this.audioElements.get(effectId);
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    }

    pauseAllEffects(): void {
        this.audioElements.forEach(audio => {
            audio.pause();
        });
    }

    stopAllEffects(): void {
        this.audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }
}

export const audioEffectService = new AudioEffectService();