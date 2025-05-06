import chatReducer, { initializeMessages, addMessage, clearMessages, updateActivity, addChatHistory } from './chatSlice';

describe('chatSlice reducer', () => {
  // Test for initializeMessages action
  it('should initialize messages with provided payload', () => {
    const initialState = { messages: [] };
    const payload = [
      { messageId: 'msg001', messageTo: 'bot', content: 'Hello' },
      { messageId: 'msg002', messageTo: 'user', content: 'Hi' },
    ];
    const nextState = chatReducer(initialState, initializeMessages(payload));
    expect(nextState.messages).toEqual(payload);
  });

  // Test for addMessage action
  it('should add a new message to the messages array', () => {
    const initialState = { messages: [] };
    const newMessage = { messageId: 'msg001', messageTo: 'bot', content: 'Hello' };
    const nextState = chatReducer(initialState, addMessage(newMessage));
    expect(nextState.messages).toContainEqual(newMessage);
  });

  // Test for clearMessages action
  it('should clear all messages', () => {
    const initialState = {
      messages: [
        { messageId: 'msg001', messageTo: 'bot', content: 'Hello' },
        { messageId: 'msg002', messageTo: 'user', content: 'Hi' },
      ],
    };
    const nextState = chatReducer(initialState, clearMessages());
    expect(nextState.messages).toEqual([]);
  });

  // Test for updateActivity action
  it('should update the activity of the message with the specified messageId', () => {
    const initialState = {
      messages: [
        { messageId: 'msg001', messageTo: 'bot', content: 'Hello', activity: 'like' },
        { messageId: 'msg002', messageTo: 'user', content: 'Hi', activity: 'dislike' },
      ],
    };
    const payload = { messageId: 'msg001', activity: 'favorite' };
    const nextState = chatReducer(initialState, updateActivity(payload));
    expect(nextState.messages[0].activity).toBe('favorite');
  });

  // Test for addChatHistory action
  it('should add new messages and avoid duplicates based on messageId', () => {
    const initialState = {
      messages: [
        { messageId: 'msg001', messageTo: 'bot', content: 'Hello' },
        { messageId: 'msg002', messageTo: 'user', content: 'Hi' },
      ],
    };
    const newMessages = [
      { messageId: 'msg003', messageTo: 'bot', content: 'How are you?' },
      { messageId: 'msg002', messageTo: 'user', content: 'Hi' }, // Duplicate based on messageId
      { messageId: 'msg004', messageTo: 'bot', content: 'What is up?' },
    ];
    const nextState = chatReducer(initialState, addChatHistory(newMessages));
    expect(nextState.messages).toEqual([
      { messageId: 'msg004', messageTo: 'bot', content: 'What is up?' },
      { messageId: 'msg003', messageTo: 'bot', content: 'How are you?' },
      { messageId: 'msg001', messageTo: 'bot', content: 'Hello' },
      { messageId: 'msg002', messageTo: 'user', content: 'Hi' },
    ]);
    expect(nextState.messages.length).toBe(4); // Only 4 unique messages
  });
});
