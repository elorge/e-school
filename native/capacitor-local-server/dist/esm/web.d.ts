import { WebPlugin } from '@capacitor/core';
import type { LocalServerPlugin, SlideData } from './definitions';
export declare class LocalServerWeb extends WebPlugin implements LocalServerPlugin {
    start(_options: {
        slides: SlideData[];
    }): Promise<{
        viewerUrl: string;
    }>;
    setSlideIndex(_options: {
        index: number;
    }): Promise<void>;
    getConnectedCount(): Promise<{
        count: number;
    }>;
    stop(): Promise<void>;
}
