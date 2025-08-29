'use client';

import { motion as motionImport, AnimatePresence as AnimatePresenceImport } from 'framer-motion';

// Re-exporting with different names to potentially avoid conflicts, though default export is the main change.
export const motion = motionImport;
export const AnimatePresence = AnimatePresenceImport;

// Export motion as default as well
export default motionImport; 