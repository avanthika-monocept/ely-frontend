import { configureStore } from '@reduxjs/toolkit';
import appReducer, { setIsMessageSent, appStates } from './reducer';
import { ApiResponseConstant } from '../constants/StringConstants';
import { getData } from '../store/actions';  // Adjust this path if needed

// Mocking the action payloads
const mockApiResponse = {
  payload: {
    status: ApiResponseConstant.success,
  },
};

describe('appSlice', () => {
  // Setting up a test store
  const store = configureStore({
    reducer: {
      root: appReducer,
    },
  });

  it('should set messageSent to true when setIsMessageSent is dispatched with true', () => {
    // Dispatch action to set messageSent
    store.dispatch(setIsMessageSent(true));

    // Get the updated state
    const state = store.getState().root;

    // Assert if messageSent is true
    expect(state.messageSent).toBe(true);
  });

  it('should handle getData.fulfilled and update the state for success status', () => {
    // Dispatching the fulfilled action with the success status
    store.dispatch(getData.fulfilled(mockApiResponse.payload));

    // Get the updated state
    const state = store.getState().root;

    // Assert that some state update occurred
    // Add specific checks based on how your state should update after a successful response
    // For example, if the success status should trigger an update:
    expect(state.someUpdatedState).toBeDefined(); // Adjust as needed
  });

  it('should not modify state for non-success status', () => {
    // Simulating a non-success status
    const mockFailureResponse = {
      payload: {
        status: ApiResponseConstant.failure,
      },
    };

    // Dispatch the non-success action
    store.dispatch(getData.fulfilled(mockFailureResponse.payload));

    // Get the current state
    const state = store.getState().root;

    // Assert that the state has not been modified inappropriately
    expect(state.someUpdatedState).toBeNull() // Adjust as needed
  });

  it('should return the root state correctly from appStates', () => {
    const state = store.getState();

    // Check if appStates returns the correct root state
    expect(appStates(state)).toEqual(state.root);
  });
});
