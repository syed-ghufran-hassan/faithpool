/**
 * Page exports
 * All page components are exported as named exports for better tree-shaking
 * and explicit imports throughout the application.
 */

// Main pages
export { default as Home } from './Home';
export { default as Dashboard } from './Dashboard';
export { default as Profile } from './Profile';
export { default as Settings } from './Settings';

// Circle pages
export { default as Circles } from './Circles';
export { default as CircleDetail } from './CircleDetail';
export { default as CreateCircle } from './CreateCircle';

// Info pages
export { default as About } from './About';
export { default as FAQ } from './FAQ';

// Error pages
export { default as NotFound } from './NotFound';
