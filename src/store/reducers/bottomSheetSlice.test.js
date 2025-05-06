import reducer, {
    openBottomSheet,
    closeBottomSheet,
    toggleBottomSheet,
    setBottomSheetHeight,
  } from './bottomSheetSlice';
  
  describe('bottomSheetSlice', () => {
    const initialState = {
      isBottomSheetOpen: false,
      bottomSheetHeight: 0,
    };
  
    it('should return the initial state', () => {
      expect(reducer(undefined, { type: undefined })).toEqual(initialState);
    });
  
    it('should handle openBottomSheet', () => {
      const nextState = reducer(initialState, openBottomSheet());
      expect(nextState.isBottomSheetOpen).toBe(true);
    });
  
    it('should handle closeBottomSheet', () => {
      const prevState = { ...initialState, isBottomSheetOpen: true };
      const nextState = reducer(prevState, closeBottomSheet());
      expect(nextState.isBottomSheetOpen).toBe(false);
    });
  
    it('should handle toggleBottomSheet from false to true', () => {
      const nextState = reducer(initialState, toggleBottomSheet());
      expect(nextState.isBottomSheetOpen).toBe(true);
    });
  
    it('should handle toggleBottomSheet from true to false', () => {
      const prevState = { ...initialState, isBottomSheetOpen: true };
      const nextState = reducer(prevState, toggleBottomSheet());
      expect(nextState.isBottomSheetOpen).toBe(false);
    });
  
    it('should handle setBottomSheetHeight', () => {
      const height = 300;
      const nextState = reducer(initialState, setBottomSheetHeight(height));
      expect(nextState.bottomSheetHeight).toBe(height);
    });
  });
  