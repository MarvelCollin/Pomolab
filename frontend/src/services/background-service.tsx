import type { IBackground } from '../interfaces/IBackground';

export class BackgroundService {
    private folder = '/src/assets/backgrounds';
    
    private backgroundFiles = [
        'lofi-background-1.mp4',
        'lofi-background-2.mp4',
        'lofi-background-3.mp4',
        'lofi-background-4.mp4',
        'lofi-background-5.mp4',
        'lofi-background-6.mp4',
        'lofi-background-7.mp4'
    ];

    async getBackgroundsWithDefault(): Promise<{ backgrounds: IBackground[], defaultBackground: IBackground | null }> {
        try {
            const backgrounds: IBackground[] = this.backgroundFiles.map((fileName, index) => {
                const fileExtension = fileName.split('.').pop()?.toLowerCase();
                const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension || '');
                const filePath = `${this.folder}/${fileName}`;

                return {
                    id: `bg-${index + 1}`,
                    name: `Lofi Background ${index + 1}`,
                    url: filePath,
                    filePath,
                    type: isVideo ? 'video' : 'image',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            });

            if (backgrounds.length === 0) return { backgrounds: [], defaultBackground: null };

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
            const backgrounds: IBackground[] = this.backgroundFiles.map((fileName, index) => {
                const fileExtension = fileName.split('.').pop()?.toLowerCase();
                const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension || '');
                const filePath = `${this.folder}/${fileName}`;

                return {
                    id: `bg-${index + 1}`,
                    name: `Lofi Background ${index + 1}`,
                    url: filePath,
                    filePath,
                    type: isVideo ? 'video' : 'image',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            });

            return backgrounds;
        } catch (error) {
            console.error('Error fetching backgrounds:', error);
            return [];
        }
    }

    async uploadBackground(_file: File): Promise<IBackground | null> {
        console.warn('Upload functionality not available with local files');
        return null;
    }

    async deleteBackground(_filePath: string): Promise<boolean> {
        console.warn('Delete functionality not available with local files');
        return false;
    }

    getBackgroundUrl(filePath: string): string {
        return filePath;
    }
}

export const backgroundService = new BackgroundService();