import { supabase } from '../lib/supabase';
import type { IBackground } from '../interfaces/IBackground';

export class BackgroundService {
    private bucketName = 'assets';
    private folder = 'backgrounds';

    async getBackgrounds(): Promise<IBackground[]> {
        try {
            const { data: files, error } = await supabase.storage
                .from(this.bucketName)
                .list(this.folder, {
                    limit: 100,
                    offset: 0,
                });

            console.log(files, error);  


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
                        name: file.name.split('.')[0],
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
                name: file.name.split('.')[0],
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