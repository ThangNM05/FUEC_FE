import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Automatically scrolls to top of page on every route change.
 * Pages with intentional scroll behavior (e.g. TeacherCourseDetails auto-scrolling
 * to the current slot) handle their own scroll logic internally, so this is safe
 * to apply globally.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Try scrolling the main scroll container first (sidebar layouts use overflow-y-auto)
        const scrollContainer = document.querySelector('.overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
        }
        // Also scroll window itself as a fallback
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
}
