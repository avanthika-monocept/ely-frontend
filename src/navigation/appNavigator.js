import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import store from "../store/store";
import { ChatPage } from "../components/pages/ChatPage";
import PropTypes from "prop-types";
 
const AppNavigator = (props) => {
  const Stack = createStackNavigator();
 
  return (
    <Provider store={store}>
    <Stack.Navigator>
          <Stack.Screen
            name={"header"}
            component={ChatPage}
            options={{ headerShown: false }}
            initialParams={props.props}
          />
        </Stack.Navigator>
    </Provider>
  );
};
 
AppNavigator.propTypes = {
  props: PropTypes.shape({
    initialParams: PropTypes.object,
  }),
};
 
export default AppNavigator;