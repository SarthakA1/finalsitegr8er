import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

export type ContentItem = {
    id: string;
    title: string;
    description: string;
    url: string; // The "preview" image or actual file URL
    thumbnail: string;
    price: number;
    type: "pdf" | "video" | "image";
    createdAt: any;
};

// MOCK DATA
const MOCK_CONTENT: ContentItem[] = [
    {
        id: "item_1",
        title: "Complete Algebra II Study Guide",
        description: "A comprehensive guide to mastering Algebra II, including practice problems and clear explanations.",
        url: "/assets/content/content-item-1.png", // Using the uploaded image as the file/preview for now
        thumbnail: "/assets/content/content-item-1.png",
        price: 5.00,
        type: "image",
        createdAt: new Date(),
    },
    {
        id: "item_2",
        title: "Physics Mechanics Cheat Sheet",
        description: "The ultimate cheat sheet for Physics Mechanics. All formulas and concepts on one page.",
        url: "/assets/content/content-item-2.jpg",
        thumbnail: "/assets/content/content-item-2.jpg",
        price: 5.00,
        type: "image",
        createdAt: new Date(),
    },
];

const useContentLibrary = () => {
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getContentItems = async () => {
        setLoading(true);
        try {
            const contentQuery = query(
                collection(firestore, "content_library"),
                orderBy("createdAt", "desc")
            );
            const contentDocs = await getDocs(contentQuery);
            const items = contentDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            // Format timestamps or other data if necessary
            const formattedItems = items.map((item: any) => ({
                ...item,
                createdAt: item.createdAt?.toDate ? item.createdAt.toDate() : new Date(), // Handle Firestore Timestamp
            })) as ContentItem[];

            setContentItems(formattedItems);
        } catch (error: any) {
            console.error("getContentItems error", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getContentItems();
    }, []);

    return { contentItems, loading, error, refreshContent: getContentItems };
};

export default useContentLibrary;
