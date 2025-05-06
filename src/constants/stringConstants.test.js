import {
    navigationscreen,
    ApiResponseConstant,
    stringConstants,
  } from './StringConstants'; // Adjust the path as needed
  
  describe('navigationscreen', () => {
    test('should contain correct navigation keys', () => {
      expect(navigationscreen.header).toBe('header');
    });
  });
  
  describe('ApiResponseConstant', () => {
    test('should contain correct API response values', () => {
      expect(ApiResponseConstant.success).toBe('success');
      expect(ApiResponseConstant.fail).toBe('fail');
    });
  });
  
  describe('stringConstants', () => {
    test('should contain correct string constants', () => {
      expect(stringConstants.suggested).toBe('Suggested');
    });
  });
  