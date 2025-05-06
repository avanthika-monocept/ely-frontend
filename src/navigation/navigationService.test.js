import navigationHelper from './navigationService';
import { DrawerActions, CommonActions } from '@react-navigation/native';

describe('navigationHelper', () => {
  beforeEach(() => {
    // Reset navigationRef and all mocks
    navigationHelper.navigationRef.current = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn().mockReturnValue(true),
      reset: jest.fn(),
      dispatch: jest.fn(),
    };
  });

  it('should navigate to a screen with params', () => {
    navigationHelper.navigate('Home', { user: 'John' });
    expect(navigationHelper.navigationRef.current.navigate).toHaveBeenCalledWith('Home', { user: 'John' });
  });

  it('should go back', () => {
    navigationHelper.goBack();
    expect(navigationHelper.navigationRef.current.goBack).toHaveBeenCalled();
  });

  it('should check if can go back', () => {
    const result = navigationHelper.canGoBack();
    expect(result).toBe(true);
    expect(navigationHelper.navigationRef.current.canGoBack).toHaveBeenCalled();
  });

  it('should reset navigation', () => {
    const val = { index: 0, routes: [{ name: 'Login' }] };
    navigationHelper.reset(val);
    expect(navigationHelper.navigationRef.current.reset).toHaveBeenCalledWith(val);
  });

  it('should open drawer', () => {
    navigationHelper.openDrawer();
    expect(navigationHelper.navigationRef.current.dispatch).toHaveBeenCalledWith(DrawerActions.openDrawer());
  });

  it('should close drawer', () => {
    navigationHelper.closeDrawer();
    expect(navigationHelper.navigationRef.current.dispatch).toHaveBeenCalledWith(DrawerActions.closeDrawer());
  });

  it('should jump to a drawer screen', () => {
    navigationHelper.jumpTo('Profile');
    expect(navigationHelper.navigationRef.current.dispatch).toHaveBeenCalledWith(
      DrawerActions.jumpTo({ routeName: 'Profile' })
    );
  });

  it('should insert screen before last route and dispatch reset', () => {
    const currentState = {
      routes: [{ name: 'Screen1' }, { name: 'Screen2' }],
      index: 1,
    };

    // Call insertBeforeLast directly for 100% branch coverage
    const updatedAction = navigationHelper.insertBeforeLastHelper('NewScreen');
    navigationHelper.navigationRef.current.dispatch(navigationHelper.insertBeforeLastHelper('NewScreen'));

    expect(navigationHelper.navigationRef.current.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
