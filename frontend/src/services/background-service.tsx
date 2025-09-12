import { supabase } from '../lib/supabase';
import type { IBackground } from '../interfaces/IBackground';

export class BackgroundService {
    private bucketName = 'assets';
    private folder = 'backgrounds';

    async getFirstRandomBackground(): Promise<IBackground | null> {
        try {
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 2000)
            );
            
            const loadPromise = supabase.storage
                .from(this.bucketName)
                .list(this.folder, {
                    limit: 3,
                    offset: 0,
                });

            const { data: files, error } = await Promise.race([loadPromise, timeoutPromise]);

            if (error) throw error;
            const validFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder');
            
            if (validFiles.length === 0) return null;

            const randomIndex = Math.floor(Math.random() * validFiles.length);
            const file = validFiles[randomIndex];
            const filePath = `${this.folder}/${file.name}`;
            const { data } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension || '');

            return {
                id: file.id || file.name,
                name: `Background ${Math.floor(Math.random() * 1000)}`,
                url: data.publicUrl,
                filePath,
                type: isVideo ? 'video' : 'image',
                isActive: true,
                createdAt: file.created_at || new Date().toISOString(),
                updatedAt: file.updated_at || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching first background:', error);
            return null;
        }
    }

    private allFilesCache: any[] | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000;

    async getRemainingBackgroundsBatch(excludeFileName?: string, offset: number = 0, limit: number = 20): Promise<IBackground[]> {
        try {
            const now = Date.now();
            if (!this.allFilesCache || (now - this.cacheTimestamp) > this.CACHE_DURATION) {
                const { data: files, error } = await supabase.storage
                    .from(this.bucketName)
                    .list(this.folder, {
                        limit: 100,
                        offset: 0,
                    });

                if (error) throw error;
                this.allFilesCache = files.filter(file => file.name !== '.emptyFolderPlaceholder');
                this.cacheTimestamp = now;
            }

            const validFiles = this.allFilesCache.filter(file => 
                !excludeFileName || file.name !== excludeFileName
            );

            const batchFiles = validFiles.slice(offset, offset + limit);

            return batchFiles.map(file => {
                const filePath = `${this.folder}/${file.name}`;
                const { data } = supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(filePath);

                const fileExtension = file.name.split('.').pop()?.toLowerCase();
                const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension || '');

                return {
                    id: file.id || file.name,
                    name: `Background ${Math.floor(Math.random() * 1000)}`,
                    url: data.publicUrl,
                    filePath,
                    type: isVideo ? 'video' : 'image',
                    isActive: false,
                    createdAt: file.created_at || new Date().toISOString(),
                    updatedAt: file.updated_at || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error fetching remaining backgrounds:', error);
            return [];
        }
    }

    async getBackgroundsWithDefault(): Promise<{ backgrounds: IBackground[], defaultBackground: IBackground | null }> {
        try {
            const { data: files, error } = await supabase.storage
                .from(this.bucketName)
                .list(this.folder, {
                    limit: 100,
                    offset: 0,
                });

            if (error) throw error;
            const validFiles = files.filter(file => file.name !== '.emptyFolderPlaceholder');
            
            if (validFiles.length === 0) return { backgrounds: [], defaultBackground: null };

            const backgrounds: IBackground[] = validFiles.map(file => {
                const filePath = `${this.folder}/${file.name}`;
                const { data } = supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(filePath);

                const fileExtension = file.name.split('.').pop()?.toLowerCase();
                const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension || '');

                return {
                    id: file.id || file.name,
                    name: `Background ${Math.floor(Math.random() * 1000)}`,
                    url: data.publicUrl,
                    filePath,
                    type: isVideo ? 'video' : 'image',
                    isActive: false,
                    createdAt: file.created_at || new Date().toISOString(),
                    updatedAt: file.updated_at || new Date().toISOString()
                };
            });

            const randomIndex = Math.floor(Math.random() * backgrounds.length);
            const defaultBackground = { ...backgrounds[randomIndex], isActive: true };

            return { backgrounds, defaultBackground };
        } catch (error) {
            console.error('Error fetching backgrounds:', error);
            return { backgrounds: [], defaultBackground: null };
        }
    }

    async getFirstBackground(): Promise<IBackground | null> {
        try {
            const result = await this.getBackgroundsWithDefault();
            return result.defaultBackground;
        } catch (error) {
            console.error('Error fetching first background:', error);
            return null;
        }
    }

    async getRemainingBackgrounds(excludeFileName?: string): Promise<IBackground[]> {
        try {
            const result = await this.getBackgroundsWithDefault();
            return result.backgrounds.filter(bg => 
                excludeFileName ? !bg.filePath.includes(excludeFileName) : true
            );
        } catch (error) {
            console.error('Error fetching remaining backgrounds:', error);
            return [];
        }
    }

    async getBackgrounds(): Promise<IBackground[]> {
        try {
            const { data: files, error } = await supabase.storage
                .from(this.bucketName)
                .list(this.folder, {
                    limit: 100,
                    offset: 0,
                });

            if (error) throw error;
            const backgrounds: IBackground[] = files
                .filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => {
                    const filePath = `${this.folder}/${file.name}`;
                    const { data } = supabase.storage
                        .from(this.bucketName)
                        .getPublicUrl(filePath);

                    const fileExtension = file.name.split('.').pop()?.toLowerCase();
                    const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension || '');

                    return {
                        id: file.id || file.name,
                        name: `Background ${Math.floor(Math.random() * 1000)}`,
                        url: data.publicUrl,
                        filePath,
                        type: isVideo ? 'video' : 'image',
                        isActive: false,
                        createdAt: file.created_at || new Date().toISOString(),
                        updatedAt: file.updated_at || new Date().toISOString()
                    };
                });

            return backgrounds;
        } catch (error) {
            console.error('Error fetching backgrounds:', error);
            return [];
        }
    }

    async uploadBackground(file: File): Promise<IBackground | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${this.folder}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(this.bucketName)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExt?.toLowerCase() || '');

            return {
                id: fileName,
                name: `Background ${Math.floor(Math.random() * 1000)}`,
                url: data.publicUrl,
                filePath,
                type: isVideo ? 'video' : 'image',
                isActive: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error uploading background:', error);
            return null;
        }
    }

    async deleteBackground(filePath: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            return !error;
        } catch (error) {
            console.error('Error deleting background:', error);
            return false;
        }
    }

    getBackgroundUrl(filePath: string): string {
        const { data } = supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
}

export const backgroundService = new BackgroundService();