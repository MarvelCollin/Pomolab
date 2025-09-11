export interface IBackground {
    id: string;
    name: string;
    url: string;
    filePath: string;
    type: 'image' | 'video';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}