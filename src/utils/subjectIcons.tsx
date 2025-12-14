import {
    IoBook,
    IoGlobe,
    IoPeople,
    IoFlask,
    IoShapes,
    IoColorPalette,
    IoFitness,
    IoBulb,
    IoCodeSlash,
    IoMagnet,
    IoLeaf,
    IoRocket,
    IoMap,
    IoHourglass,
    IoCalculator,
    IoTrendingUp,
    IoGitNetwork,
    IoConstruct,
    IoCash,
    IoChatbubbles,
} from "react-icons/io5";

export const resolveMypIcon = (subjectId: string) => {
    const lower = subjectId.toLowerCase();

    // --- Mathematics (Differentiated) ---
    if (lower.includes("extended") && lower.includes("math")) {
        return { icon: IoTrendingUp, bgGradient: "linear(to-br, red.600, red.800)", color: "white" };
    }
    if (lower.includes("standard") && lower.includes("math")) {
        return { icon: IoCalculator, bgGradient: "linear(to-br, orange.500, red.500)", color: "white" };
    }
    if (lower.includes("math")) { // Fallback Math
        return { icon: IoShapes, bgGradient: "linear(to-br, red.500, pink.500)", color: "white" };
    }

    // --- Sciences (Differentiated) ---
    if (lower.includes("phys")) {
        return { icon: IoMagnet, bgGradient: "linear(to-br, purple.500, purple.700)", color: "white" };
    }
    if (lower.includes("chem")) {
        return { icon: IoFlask, bgGradient: "linear(to-br, green.400, teal.500)", color: "white" };
    }
    if (lower.includes("bio") || lower.includes("living")) {
        return { icon: IoLeaf, bgGradient: "linear(to-br, green.500, green.700)", color: "white" };
    }
    if (lower.includes("sci")) { // Fallback Science
        return { icon: IoFlask, bgGradient: "linear(to-br, teal.400, green.400)", color: "white" };
    }

    // --- Individuals & Societies (Differentiated) ---
    if (lower.includes("hist")) {
        return { icon: IoHourglass, bgGradient: "linear(to-br, yellow.600, orange.700)", color: "white" };
    }
    if (lower.includes("geo")) {
        return { icon: IoMap, bgGradient: "linear(to-br, green.300, blue.400)", color: "white" };
    }
    if (lower.includes("econ") || lower.includes("business")) {
        return { icon: IoCash, bgGradient: "linear(to-br, yellow.400, orange.400)", color: "white" };
    }
    if (lower.includes("indiv") || lower.includes("soc")) { // Fallback I&S
        return { icon: IoPeople, bgGradient: "linear(to-br, orange.400, pink.500)", color: "white" };
    }

    // --- Language ---
    if (lower.includes("english") || (lower.includes("lang") && lower.includes("lit"))) {
        // English / L&L
        return { icon: IoBook, bgGradient: "linear(to-br, blue.500, blue.700)", color: "white" };
    }
    if (lower.includes("acquistion") || lower.includes("french") || lower.includes("spanish") || lower.includes("german") || lower.includes("mandarin")) {
        // Foreign Language
        return { icon: IoChatbubbles, bgGradient: "linear(to-br, pink.400, purple.400)", color: "white" };
    }

    // --- Design ---
    if (lower.includes("design") || lower.includes("tech")) {
        return { icon: IoConstruct, bgGradient: "linear(to-br, gray.500, gray.700)", color: "white" };
    }

    // --- Arts ---
    if (lower.includes("music")) {
        return { icon: IoColorPalette, bgGradient: "linear(to-br, pink.500, purple.500)", color: "white" };
    }
    if (lower.includes("art") || lower.includes("drama") || lower.includes("film")) {
        return { icon: IoColorPalette, bgGradient: "linear(to-br, pink.400, pink.600)", color: "white" };
    }

    // --- PHE ---
    if (lower.includes("health") || lower.includes("sport") || lower.includes("phe")) {
        return { icon: IoFitness, bgGradient: "linear(to-br, cyan.500, blue.500)", color: "white" };
    }

    // --- Core / Other ---
    if (lower.includes("tok") || lower.includes("theory")) { // TOK
        return { icon: IoBulb, bgGradient: "linear(to-br, yellow.400, orange.300)", color: "white" };
    }
    if (lower.includes("ee") || lower.includes("extended essay")) { // EE
        return { icon: IoBook, bgGradient: "linear(to-br, gray.600, gray.800)", color: "white" };
    }
    if (lower.includes("personal") || lower.includes("project")) {
        return { icon: IoRocket, bgGradient: "linear(to-br, purple.600, cyan.600)", color: "white" };
    }
    if (lower.includes("inter") || lower.includes("idu")) {
        return { icon: IoGitNetwork, bgGradient: "linear(to-br, indigo.500, purple.500)", color: "white" };
    }

    // Default Fallback
    return { icon: IoGlobe, bgGradient: "linear(to-br, gray.400, gray.600)", color: "white" };
};
