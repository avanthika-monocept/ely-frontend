import { rootReducers } from './index';
import bottomSheetSlice from './bottomSheetSlice';
import chatSlice from './chatSlice';
import loaderSlice from './loaderSlice';

describe('rootReducers', () => {
  it('should return the initial combined state', () => {
    const initialState = rootReducers(undefined, { type: undefined });

    expect(initialState).toEqual({
      bottomSheet: {
        isBottomSheetOpen: false,
        bottomSheetHeight: 0,
      },
      chat: {
        messages: [],
      },
      loader: {
        isLoading: false,
      },
    });
  });
});
