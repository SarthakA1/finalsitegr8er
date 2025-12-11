
export const getSketchAvatarUrl = (seed: string) => {
    // specific vibrant background colors to match the refined aesthetic
    // using dicebear 'notionists' style for that hand-drawn sketch look
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc&radius=50`;
};
