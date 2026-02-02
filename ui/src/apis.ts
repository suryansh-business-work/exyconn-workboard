/**
 * Centralized API Endpoints Configuration
 *
 * This file centralizes all API endpoints for the application.
 * In development, it uses localhost URLs.
 * In production, it uses the production domain URLs.
 */

// Determine if we're in development by checking the URL
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

// Base URLs for different environments
const DEV_API_BASE = 'http://localhost:4011';
const PROD_API_BASE = 'https://workboard-api.exyconn.com';

// Select the appropriate base URL
export const API_BASE_URL = isLocalhost ? DEV_API_BASE : PROD_API_BASE;

// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: `${API_BASE_URL}/health`,

  // Add workboard-specific endpoints here
  // Example:
  // BOARDS: `${API_BASE_URL}/api/boards`,
  // TASKS: `${API_BASE_URL}/api/tasks`,
  // PROJECTS: `${API_BASE_URL}/api/projects`,
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
