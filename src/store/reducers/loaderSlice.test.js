import reducer, { showLoader, hideLoader } from './loaderSlice';

describe('loaderSlice', () => {
  const initialState = {
    isLoading: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle showLoader', () => {
    const nextState = reducer(initialState, showLoader());
    expect(nextState.isLoading).toBe(true);
  });

  it('should handle hideLoader', () => {
    const prevState = {
      isLoading: true,
    };
    const nextState = reducer(prevState, hideLoader());
    expect(nextState.isLoading).toBe(false);
  });
});
