import * as Font from 'expo-font';
import { loadFonts } from './loadFonts';

// Mock expo-font
jest.mock('expo-font');

describe('loadFonts', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should load all fonts successfully', async () => {
    // Mock the loadAsync function to resolve successfully
    Font.loadAsync.mockResolvedValueOnce();

    await loadFonts();

    // Verify loadAsync was called with the correct font map
    expect(Font.loadAsync).toHaveBeenCalledWith({
      "NotoSans-Bold": require("../../assets/fonts/NotoSans-Bold.ttf"),
      "NotoSans-ExtraBoldItalic": require("../../assets/fonts/NotoSans-ExtraBoldItalic.ttf"),
      "NotoSans-ExtraLight": require("../../assets/fonts/NotoSans-ExtraLight.ttf"),
      "NotoSans-ExtraLightItalic": require("../../assets/fonts/NotoSans-ExtraLightItalic.ttf"),
      "NotoSans-Italic": require("../../assets/fonts/NotoSans-Italic.ttf"),
      "NotoSans-Light": require("../../assets/fonts/NotoSans-Light.ttf"),
      "NotoSans-LightItalic": require("../../assets/fonts/NotoSans-LightItalic.ttf"),
      "NotoSans-Medium": require("../../assets/fonts/NotoSans-Medium.ttf"),
      "NotoSans-MediumItalic": require("../../assets/fonts/NotoSans-MediumItalic.ttf"),
      "NotoSans-Regular": require("../../assets/fonts/NotoSans-Regular.ttf"),
      "NotoSans-SemiBold": require("../../assets/fonts/NotoSans-SemiBold.ttf"),
      "NotoSans-SemiBoldItalic": require("../../assets/fonts/NotoSans-SemiBoldItalic.ttf"),
      "NotoSans-Thin": require("../../assets/fonts/NotoSans-Thin.ttf"),
      "NotoSans-ThinItalic": require("../../assets/fonts/NotoSans-ThinItalic.ttf"),
    });
  });

  it('should throw an error when font loading fails', async () => {
    // Mock the loadAsync function to reject with an error
    const mockError = new Error('Font loading failed');
    Font.loadAsync.mockRejectedValueOnce(mockError);

    // Verify the error is thrown
    await expect(loadFonts()).rejects.toThrow(mockError);
  });

  it('should load exactly 14 fonts', async () => {
    Font.loadAsync.mockResolvedValueOnce();

    await loadFonts();

    // Get the font map that was passed to loadAsync
    const fontMap = Font.loadAsync.mock.calls[0][0];
    const fontCount = Object.keys(fontMap).length;
    
    expect(fontCount).toBe(14);
  });
});