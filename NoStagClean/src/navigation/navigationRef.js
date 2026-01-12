import { createNavigationContainerRef } from '@react-navigation/native';

// 1. Create the ref object
export const navigationRef = createNavigationContainerRef();

// 2. Helper to navigate to a specific screen
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// 3. Helper to reset the stack (e.g., for Logout)
export function resetToLogin() {
  if (navigationRef.isReady()) {
    // Resets the navigation state to a fresh stack with only the Login screen (or Welcome)
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Welcome' }], 
    });
  }
}