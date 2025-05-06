// src/constants/dimentions.test.js

const {
    spacing,
    size,
    spacingModerateScale, spacingVerticalScale, minusSpacing, imageSize, sizeWithoutScale, borderRadius, borderWidth,
    sizeCircleShape, rightLeft, topBottom, numOfColumns, extraSpacing,
    shadowOpacityElevation,
    ShadowRadius,
    logoSize,
    flex,
  } = require('./Dimensions');
  
  const { scale, moderateScale, verticalScale } = require('react-native-size-matters');
  
  describe('Raw Spacing Constants', () => {
    test('Raw spacing values are correct', () => {
      expect(spacing.space_s0).toBe(0);
      expect(spacing.space_s1).toBe(2);
      expect(spacing.space_m2).toBe(16);
      expect(spacing.space_xl2).toBe(96);
    });
  });
  
  describe('Moderate Scale Spacing Constants', () => {
    test('Spacing values are moderately scaled correctly', () => {
      expect(spacingModerateScale.space_s0).toBe(moderateScale(0));
      expect(spacingModerateScale.space_s1).toBe(moderateScale(2));
      expect(spacingModerateScale.space_m2).toBe(moderateScale(16));
      expect(spacingModerateScale.space_l4).toBe(moderateScale(64));
      expect(spacingModerateScale.space_xl2).toBe(moderateScale(96));
    });
  });
  
  describe('Vertical Scale Spacing Constants', () => {
    test('Spacing values are vertically scaled correctly', () => {
      expect(spacingVerticalScale.space_s0).toBe(verticalScale(0));
      expect(spacingVerticalScale.space_s1).toBe(verticalScale(2));
      expect(spacingVerticalScale.space_s3).toBe(verticalScale(5));
      expect(spacingVerticalScale.space_m4).toBe(verticalScale(24));
      expect(spacingVerticalScale.space_xl2).toBe(verticalScale(96));
    });
  
    describe('Size Constants', () => {
        test('Width values are scaled correctly', () => {
          expect(size.width10).toBe(moderateScale(10));
          expect(size.width24).toBe(moderateScale(24));
          expect(size.width_80).toBe(scale(80));
          expect(size.width_140).toBe(scale(140));
        });
      
        test('Height values are scaled correctly', () => {
          expect(size.height4).toBe(verticalScale(4));
          expect(size.height24).toBe(verticalScale(24));
          expect(size.height60).toBe(verticalScale(60));
        });
      
        test('Percentage width values are stored as strings', () => {
          expect(size.hundredPercent).toBe("100%");
          expect(size.seventyPercent).toBe("70%");
          expect(size.fortyNinePercent).toBe("49%");
        });
      
        test('Hardcoded numbers are correct', () => {
          expect(size.width65).toBe(65);
          expect(size.height_120).toBe(100); // note: seems like a possible mistake in the name!
          expect(size.height_158).toBe(158);
        });
      });

      describe('Minus Spacing Constants', () => {
        test('Minus spacing values are correct', () => {
          expect(minusSpacing.minus_space_s1).toBe(-2);
          expect(minusSpacing.minus_space_s2).toBe(-4);
          expect(minusSpacing.minus_space_base).toBe(-8);
          expect(minusSpacing.minus_space_m4).toBe(-24);
          expect(minusSpacing.minus_space100).toBe(-50);
          expect(minusSpacing.minus_29).toBe(-29);
        });
      });
      
      describe('Image Size Constants', () => {
        test('Image widths are correctly scaled or raw', () => {
          expect(imageSize.nine).toBe(9);
          expect(imageSize.width11).toBe(11);
          expect(imageSize.width15).toBe(moderateScale(15));
          expect(imageSize.width16).toBe(moderateScale(16));
          expect(imageSize.width32).toBe(moderateScale(32));
          expect(imageSize.width44).toBe(44);
          expect(imageSize.width96).toBe(moderateScale(96));
        });
      
        test('Image heights are correctly scaled or raw', () => {
          expect(imageSize.height6).toBe(6);
          expect(imageSize.height15).toBe(verticalScale(15));
          expect(imageSize.height24).toBe(verticalScale(24));
          expect(imageSize.height158).toBe(verticalScale(158));
          expect(imageSize.height40).toBe(40);
          expect(imageSize.height250).toBe(250);
        });
      });

      describe('sizeWithoutScale', () => {
        test('should return correct static width values', () => {
          expect(sizeWithoutScale.width0).toBe(0);
          expect(sizeWithoutScale.width44).toBe(44);
          expect(sizeWithoutScale.width328).toBe(328);
        });
      
        test('should return correct static height values', () => {
          expect(sizeWithoutScale.height1).toBe(1);
          expect(sizeWithoutScale.height160).toBe(160);
          expect(sizeWithoutScale.height400).toBe(400);
        });
      });
      
      describe('borderRadius', () => {
        test('should return correct raw border radius values', () => {
          expect(borderRadius.borderRadius4).toBe(4);
          expect(borderRadius.borderRadius10).toBe(10);
          expect(borderRadius.borderRadius50).toBe(50);
          expect(borderRadius.borderRadius0).toBe(0);
        });
      
        test('should return correct scaled border radius values', () => {
          expect(borderRadius.borderRadius28_circle_m).toBe(moderateScale(28));
        });
      });
      
      describe('borderWidth', () => {
        test('should return correct border width values', () => {
          expect(borderWidth.borderWidth2).toBe(2);
          expect(borderWidth.borderWidth0_5).toBe(0.5);
          expect(borderWidth.borderWidth0).toBe(0);
          expect(borderWidth.borderWidth10).toBe(10);
        });
      });

      describe('sizeCircleShape', () => {
        test('should return correct static circle sizes', () => {
          expect(sizeCircleShape.size56).toBe(56);
          expect(sizeCircleShape.size65).toBe(65);
          expect(sizeCircleShape.size30_5).toBe(30.5);
        });
      
        test('should return correctly scaled circle sizes', () => {
          expect(sizeCircleShape.size28_circle_m).toBe(moderateScale(28));
          expect(sizeCircleShape.size56_circle_m).toBe(moderateScale(56));
        });
      });
      
      describe('rightLeft', () => {
        test('should return correct right/left values', () => {
          expect(rightLeft.zero).toBe(0);
          expect(rightLeft.thirtyEight).toBe(38);
          expect(rightLeft.eightyEight_minus).toBe(-88);
          expect(rightLeft.oneEighty180).toBe(180);
          expect(rightLeft.fourty_minus).toBe(-40);
        });
      });
      
      describe('topBottom', () => {
        test('should return correct top/bottom values', () => {
          expect(topBottom.six).toBe(6);
          expect(topBottom.Eleven).toBe(11);
          expect(topBottom.sixtyFour).toBe(64);
        });
      });
      
      describe('numOfColumns', () => {
        test('should return correct number of columns', () => {
          expect(numOfColumns.two).toBe(2);
          expect(numOfColumns.five).toBe(5);
          expect(numOfColumns.twelve).toBe(12);
        });
      });

      describe('extraSpacing', () => {
        test('should return correct raw spacing values', () => {
          expect(extraSpacing.space_1).toBe(1);
          expect(extraSpacing.space_30).toBe(30);
          expect(extraSpacing.space_600).toBe(600);
          expect(extraSpacing.spaceMinus_600).toBe(-600);
        });
      
        test('should return correct vertically scaled values', () => {
          expect(extraSpacing.space_85).toBe(verticalScale(85));
          expect(extraSpacing.space_95).toBe(verticalScale(95));
        });
      });
      
      describe('shadowOpacityElevation', () => {
        test('should return correct opacity values', () => {
          expect(shadowOpacityElevation.opacity0).toBe(0);
          expect(shadowOpacityElevation.opacity0_5).toBe(0.5);
          expect(shadowOpacityElevation.opacity1).toBe(1);
        });
      
        test('should return correct elevation values', () => {
          expect(shadowOpacityElevation.elevation1).toBe(1);
          expect(shadowOpacityElevation.elevation10).toBe(10);
        });
      });
      
      describe('ShadowRadius', () => {
        test('should return correct shadow radius values', () => {
          expect(ShadowRadius.shadowRadius3).toBe(3);
          expect(ShadowRadius.shadowRadius16).toBe(16);
        });
      });
      
      describe('logoSize', () => {
        test('should return scaled logo dimensions', () => {
          expect(logoSize.width).toBe(moderateScale(110));
          expect(logoSize.height).toBe(verticalScale(77));
          expect(logoSize.width232).toBe(moderateScale(232));
          expect(logoSize.height180).toBe(verticalScale(180));
        });
      });
      
      describe('flex', () => {
        test('should return correct flex values', () => {
          expect(flex.one).toBe(1);
          expect(flex.sixteen).toBe(16);
        });
      });

  });
  