// shareLoaderSlice.test.js
import { startSharing, endSharing } from './shareLoader';
import shareLoaderReducer from './shareLoader';

describe('shareLoaderSlice', () => {
  describe('initial state', () => {
    it('should have initial state of isSharing: false', () => {
      const initialState = shareLoaderReducer(undefined, {});
      expect(initialState).toEqual({ isSharing: false });
    });
  });

  describe('actions', () => {
    it('startSharing action should have correct type', () => {
      expect(startSharing()).toEqual({
        type: 'shareLoader/startSharing'
      });
    });

    it('endSharing action should have correct type', () => {
      expect(endSharing()).toEqual({
        type: 'shareLoader/endSharing'
      });
    });
  });

  describe('reducer', () => {
    it('should handle startSharing action', () => {
      const initialState = { isSharing: false };
      const newState = shareLoaderReducer(initialState, startSharing());
      expect(newState).toEqual({ isSharing: true });
    });

    it('should handle endSharing action', () => {
      const initialState = { isSharing: true };
      const newState = shareLoaderReducer(initialState, endSharing());
      expect(newState).toEqual({ isSharing: false });
    });

    it('should return current state for unknown action', () => {
      const initialState = { isSharing: true };
      const newState = shareLoaderReducer(initialState, { type: 'UNKNOWN_ACTION' });
      expect(newState).toEqual(initialState);
    });
  });

  describe('state transitions', () => {
    let state;
    
    beforeEach(() => {
      state = shareLoaderReducer(undefined, {});
    });

    it('should transition from false to true with startSharing', () => {
      expect(state.isSharing).toBe(false);
      state = shareLoaderReducer(state, startSharing());
      expect(state.isSharing).toBe(true);
    });

    it('should transition from true to false with endSharing', () => {
      state = shareLoaderReducer(state, startSharing());
      expect(state.isSharing).toBe(true);
      state = shareLoaderReducer(state, endSharing());
      expect(state.isSharing).toBe(false);
    });

    it('should handle multiple transitions', () => {
      expect(state.isSharing).toBe(false);
      
      state = shareLoaderReducer(state, startSharing());
      expect(state.isSharing).toBe(true);
      
      state = shareLoaderReducer(state, endSharing());
      expect(state.isSharing).toBe(false);
      
      state = shareLoaderReducer(state, startSharing());
      expect(state.isSharing).toBe(true);
    });
  });
});