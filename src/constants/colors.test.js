import colors from './Colors.js';

describe('Color Config Object', () => {
  it('should have primaryColors defined with required keys', () => {
    expect(colors.primaryColors).toBeDefined();
    expect(colors.primaryColors.orange).toBe("#F27930");
    expect(colors.primaryColors.black).toBe("#000000");
    expect(colors.primaryColors.white).toBe("#FFFFFF");
  });

  it('should include secondaryColors with correct values', () => {
    expect(colors.secondaryColors.cyberYellow).toBe("#ffd639");
    expect(colors.secondaryColors.punch).toBe("#D93025");
  });

  it('should contain gradient objects', () => {
    expect(colors.gradient.primary.jaffa).toEqual(["#D44300", "#F27930"]);
    expect(colors.gradient.others.expandedCard).toEqual([
      "rgba(255, 255, 255, 0.00)",
      "rgba(235, 245, 253, 0.50)",
    ]);
  });

  it('should contain Extended_Palette with correct nested values', () => {
    expect(colors.Extended_Palette.Orange.o100).toBe("#FEF2EA");
    expect(colors.Extended_Palette.malachite.m800).toBe("#3aae72");
  });

  it('should have rgba colors defined properly', () => {
    expect(colors.rgba.modalShadow).toBe("rgba(80, 86, 98, 0.12)");
    expect(colors.rgba.modalOverlayColor).toBe("rgba(0, 0, 0, 0.5)");
  });

  it('should contain contactProfileCircleColors with proper color list', () => {
    expect(Array.isArray(colors.contactProfileCircleColors)).toBe(true);
    expect(colors.contactProfileCircleColors.length).toBeGreaterThan(0);
  });
});
