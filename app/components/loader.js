'use strict';
import React, {
  Component,
  Text,
  View,
  StyleSheet,
} from 'react-native';

module.exports = class LoadingView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: this.props.message,
      load: this.props.load,
    };
  }

  // TODO: blue box shows up even when no error message
  // TODO: fetchData not defined here...figure that shit out
  // TODO: How do I set the state.message here from the ios app?

  onPressReload(event) {
    this.fetchData()
  }

  render() {
    return (
      <View style={styles.loader}>
        <Text style={[styles.reload, this.state.message ? false : styles.hidden]} onPress={this.onPressReload}>{this.state.message}</Text>
        <Text style={this.state.message ? styles.hidden : false}>Loading group...</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  },
  reload: {
    backgroundColor: 'blue',
    color: 'white',
    fontSize: 20,
    padding: 5,
  },
  hidden: {
    opacity: 0,
  },
});

exports.title = '<LoadingView>';
exports.description = 'Loading spinner';
exports.displayName = 'LoadingView';

