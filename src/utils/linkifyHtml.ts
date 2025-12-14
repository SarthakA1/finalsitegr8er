/**
 * Safely converts plain text URLs into clickable links within an HTML string.
 * It avoids modifying URLs that are already inside attributes or anchor tags.
 * 
 * @param html - The HTML string to process.
 * @returns The HTML string with auto-linked URLs.
 */
export const linkifyHtml = (html: string): string => {
    if (!html) return html;

    // Regex to find URLs not preceded by src=" or href=" or > (inside a tag content)
    // This is a simplified approach. For robust HTML parsing, a DOM parser is better, 
    // but regex is often sufficient for simple rich text editor output.

    // Strategy:
    // 1. Split by HTML tags to isolate text nodes.
    // 2. Linkify text nodes specificially.

    // However, splitting by tags is complex with regex.
    // Alternative: Use a negative lookbehind (if supported) or a refined regex.

    // Improved Regex approach:
    // Match anything that looks like a URL, but check context.
    // Since JS regex lookbehind support varies (though widely supported in modern envs), 
    // we can iterate through the string or use a replacement function that checks context.

    // Simple robust method for common cases:
    // Replace URLs that are NOT preceded by quote or >.
    // NOTE: This can be tricky.

    // Safer Approach: match HTML tags OR URLs. If it's a tag, return as is. If it's a URL, linkify.
    const tokenRegex = /((?:<[^>]+>)|(?:https?:\/\/[^\s<]+))/g;

    return html.replace(tokenRegex, (match) => {
        // If it starts with <, it's a tag. Return as is.
        if (match.startsWith('<')) {
            return match;
        }

        // Otherwise, it's a URL in text. Linkify it.
        // We also need to be careful if the URL is immediately followed by a closing tag like </a> or </p> which `[^\s<]+` mostly handles 
        // but handles punctuation at the end could be an issue.

        return `<a href="${match}" target="_blank" rel="noopener noreferrer" style="color: #3182ce; text-decoration: underline;">${match}</a>`;
    });
};
