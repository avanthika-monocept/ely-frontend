import * as React from "react";
import { DrawerActions, CommonActions } from "@react-navigation/native";

const navigationRef = React.createRef();

const insertBeforeLast = (routeName, params) => (state) => {
  const routes = [
    ...state.routes.slice(0, -1),
    { name: routeName, params },
    state.routes[state.routes.length - 1],
  ];

  return CommonActions.reset({
    ...state,
    routes,
    index: routes.length - 1,
  });
};

function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

function goBack() {
  return navigationRef.current?.goBack();
}

function canGoBack() {
  return navigationRef.current?.canGoBack();
}

function reset(val) {
  return navigationRef.current?.reset(val);
}

function openDrawer() {
  navigationRef.current?.dispatch(DrawerActions.openDrawer());
}

function closeDrawer() {
  navigationRef.current?.dispatch(DrawerActions.closeDrawer());
}

function jumpTo(screen) {
  navigationRef.current?.dispatch(DrawerActions.jumpTo({ routeName: screen }));
}

function insertBeforeLastHelper(screen) {
  navigationRef.current?.dispatch(insertBeforeLast(screen));
}

export default {
  navigate,
  goBack,
  openDrawer,
  closeDrawer,
  reset,
  jumpTo,
  insertBeforeLastHelper,
  canGoBack,
  navigationRef,
};
