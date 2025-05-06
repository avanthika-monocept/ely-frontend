import {
    fontType,
    fontSize,
    fontStyle,
    fontStyle as styles,
    lineHeight,
    letterSpacing,
  } from './Fonts.js'; // Adjust path as needed
  
  import { RFValue } from 'react-native-responsive-fontsize';
  import { scale } from 'react-native-size-matters';
  import { Dimensions } from 'react-native';
  
  const standardScreenHeight = Dimensions.get("window").height;
  
  describe('fontType', () => {
    test('should contain correct font family values', () => {
      expect(fontType.notoBold).toBe('NotoSans-Bold');
      expect(fontType.notoRegular).toBe('NotoSans-Regular');
      expect(Object.keys(fontType)).toContain('notoExtraLightItalic');
    });
  });
  
  describe('fontSize', () => {
    test('should calculate correct responsive font sizes', () => {
      expect(fontSize.font10).toBe(RFValue(10, standardScreenHeight));
      expect(fontSize.font62).toBe(RFValue(62, standardScreenHeight));
    });
  });
  
  describe('lineHeight', () => {
    test('should return correctly scaled line height values', () => {
      expect(lineHeight.lineHeight20).toBe(scale(20));
      expect(lineHeight.lineHeight56).toBe(scale(56));
    });
  });
  
  describe('letterSpacing', () => {
    test('should return correctly scaled negative letter spacing', () => {
      expect(letterSpacing.minus0042).toBe(scale(-0.042));
      expect(letterSpacing.minus0056).toBe(scale(-0.056));
    });
  });
  
  
  