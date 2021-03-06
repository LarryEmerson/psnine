import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  Image,
  DrawerLayoutAndroid,
  ToolbarAndroid,
  ToastAndroid,
  BackAndroid,
  TouchableOpacity,
  Dimensions,
  TouchableNativeFeedback,
  RefreshControl,
  WebView,
  KeyboardAvoidingView,
} from 'react-native';

import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { standardColor } from '../config/colorConfig';

let toolbarActions = [
  {title: '收藏', iconName: 'md-star' ,show: 'always'},
  {title: '刷新', iconName: 'md-refresh', show: 'always'},
  {title: '感谢', iconName: 'md-thumbs-up', show: 'never'},
  {title: '分享', show: 'never' },
];
let title = "TOPIC";
let WEBVIEW_REF = `WEBVIEW_REF`;

class HappyPlusOne extends Component {

  constructor(props){
    super(props);
    this.state = {
      isLogIn: false,
      canGoBack: false,
      icon: false
    }
  }

  _onActionSelected = (index) => {
    switch(index){
      case 0 :
        return;
      case 1 :
        return this.refs[WEBVIEW_REF].reload();
      case 2 :
        return;
      case 3 :
        return;
    }
  }

  _pressButton = () => {
    if(this.state.canGoBack)
      this.refs[WEBVIEW_REF].goBack();
    else
      this.props.navigator.pop();
  }

  onNavigationStateChange = (navState) => {
    if(navState.url.indexOf(this.props.URL) !== -1 ){
      this.setState({
        canGoBack: navState.canGoBack,
      });
    }else{
      // let replyFloorURL = ``;
      // let replyMainURL = ``;
      // let emotionURL = ``;
      // console.log('Target URL:',navState);
      this.setState({
        canGoBack: navState.canGoBack,
      });
      this.refs[WEBVIEW_REF].stopLoading();
    }//return false;
  }

  render() {
    // console.log('HappyPlusOne.js rendered');
    return ( 
          <View style={{flex:1}}>
              <Ionicons.ToolbarAndroid
                navIconName="md-arrow-back"
                overflowIconName="md-more"                 iconColor={this.props.modeInfo.isNightMode ? '#000' : '#fff'}
                title={this.props.title}
                style={[styles.toolbar, {backgroundColor: this.props.modeInfo.standardColor,}]}
                actions={toolbarActions}
                onIconClicked={this._pressButton}
                onActionSelected={this._onActionSelected}
              />
              <KeyboardAvoidingView
                behavior={'padding'}
                style={{flex:3}}
                >
                <WebView
                    ref={WEBVIEW_REF}
                    source={{uri: this.props.URL}} 
                    style={{flex:3}}
                    scalesPageToFit={true}
                    domStorageEnabled={true}
                    onNavigationStateChange={this.onNavigationStateChange}
                    startInLoadingState={true}  
                    injectedJavaScript={`$('.header').hide()`}
                />
              </KeyboardAvoidingView>
          </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF',
  },
  toolbar: {
    backgroundColor: standardColor,
    height: 56,
    elevation: 4,
  },
  selectedTitle:{
    //backgroundColor: '#00ffff'
    //fontSize: 20
  },
  avatar: {
    width: 50,
    height: 50,
  }
});


export default HappyPlusOne