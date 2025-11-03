/**
 * Scroll position manager for category -> project -> category transitions
 */

const SCROLL_POSITION_KEY = 'category_scroll_positions';
const ACTIVE_PROJECT_KEY = 'active_project_index';

interface ScrollPosition {
  categorySlug: string;
  scrollLeft: number;
  projectSlug?: string;
  projectIndex?: number;
  timestamp: number;
}

export class ScrollPositionManager {
  private static instance: ScrollPositionManager;
  
  private constructor() {}
  
  static getInstance(): ScrollPositionManager {
    if (!ScrollPositionManager.instance) {
      ScrollPositionManager.instance = new ScrollPositionManager();
    }
    return ScrollPositionManager.instance;
  }

  /**
   * Save scroll position for a category
   */
  savePosition(categorySlug: string, scrollLeft: number, projectSlug?: string, projectIndex?: number): void {
    if (typeof window === 'undefined') return;

    try {
      const positions = this.getAllPositions();
      positions[categorySlug] = {
        categorySlug,
        scrollLeft,
        projectSlug,
        projectIndex,
        timestamp: Date.now(),
      };

      sessionStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('Failed to save scroll position:', error);
    }
  }

  /**
   * Get saved scroll position for a category
   */
  getPosition(categorySlug: string): ScrollPosition | null {
    if (typeof window === 'undefined') return null;

    try {
      const positions = this.getAllPositions();
      const position = positions[categorySlug];

      if (!position) return null;

      // Expire positions older than 30 minutes
      const thirtyMinutes = 30 * 60 * 1000;
      if (Date.now() - position.timestamp > thirtyMinutes) {
        this.clearPosition(categorySlug);
        return null;
      }

      return position;
    } catch (error) {
      console.error('Failed to get scroll position:', error);
      return null;
    }
  }

  /**
   * Clear scroll position for a category
   */
  clearPosition(categorySlug: string): void {
    if (typeof window === 'undefined') return;

    try {
      const positions = this.getAllPositions();
      delete positions[categorySlug];
      sessionStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('Failed to clear scroll position:', error);
    }
  }

  /**
   * Clear all scroll positions
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(SCROLL_POSITION_KEY);
      sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
    } catch (error) {
      console.error('Failed to clear all positions:', error);
    }
  }

  /**
   * Get all saved positions
   */
  private getAllPositions(): Record<string, ScrollPosition> {
    try {
      const data = sessionStorage.getItem(SCROLL_POSITION_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get all positions:', error);
      return {};
    }
  }

  /**
   * Save active project for URL state
   */
  saveActiveProject(categorySlug: string, projectSlug: string, projectIndex: number): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify({
        categorySlug,
        projectSlug,
        projectIndex,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to save active project:', error);
    }
  }

  /**
   * Get active project
   */
  getActiveProject(): { categorySlug: string; projectSlug: string; projectIndex: number } | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = sessionStorage.getItem(ACTIVE_PROJECT_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Expire after 30 minutes
      const thirtyMinutes = 30 * 60 * 1000;
      if (Date.now() - parsed.timestamp > thirtyMinutes) {
        sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to get active project:', error);
      return null;
    }
  }
}

export const scrollPositionManager = ScrollPositionManager.getInstance();
