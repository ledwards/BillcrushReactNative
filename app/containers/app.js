import React, { Component, Text } from 'react-native';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import * as reducers from '../reducers/index';
import Billcrush from './billcrush';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reducer = combineReducers(reducers);
const store = createStoreWithMiddleware(reducer);

export default class BillcrushReactNative extends Component {
  render() {
    return (
      <Provider store={store}>
        <Billcrush />
      </Provider>
    );
  }
}
