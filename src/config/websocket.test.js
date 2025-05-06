// socket.test.js
import { initializeSocket } from './websocket';
import io from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
  };
  return jest.fn(() => mockSocket);
});

describe('initializeSocket', () => {
  const mockSocket = io();
  const testUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });



  it('should use correct connection options', () => {
    initializeSocket(testUserId);
    expect(io).toHaveBeenCalledWith(expect.any(String), {
      query: { userId: testUserId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      forceNew: true
    });
  });

  it('should include userId in query parameters', () => {
    initializeSocket(testUserId);
    const callArgs = io.mock.calls[0];
    expect(callArgs[1].query).toEqual({ userId: testUserId });
  });

  it('should return socket instance', () => {
    const socket = initializeSocket(testUserId);
    expect(socket).toBe(mockSocket);
  });

  it('should handle undefined userId', () => {
    initializeSocket(); // No userId provided
    const callArgs = io.mock.calls[0];
    expect(callArgs[1].query).toEqual({ userId: undefined });
  });
});