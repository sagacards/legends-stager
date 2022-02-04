import create from 'zustand';

type ViewMode = 'side-by-side' | 'animated' | 'free';
interface Color {
    name    : string;
    base    : string;
    specular: string;
    emissive: string;
};

interface Store {
    
    viewMode    : ViewMode;
    setViewMode : (m : ViewMode) => void;

    colors      : Color[];
    setColors   : (c : Color[]) => void;

    

};

const useStore = create<Store>()