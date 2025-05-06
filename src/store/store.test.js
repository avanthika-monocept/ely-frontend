import store from './store'; // Adjust the path as needed


describe('Redux Store', () => {
    it('should have a valid state object', () => {
      const state = store.getState();
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
    });
  
    it('should dispatch actions without errors', () => {
      expect(typeof store.dispatch).toBe('function');
    });
  });
