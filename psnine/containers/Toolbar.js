import React, { Component } from 'react';
import {
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
  InteractionManager,
  Animated,
  Easing,
  PanResponder,
  TouchableHighlight,
  TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import nativeImageSource from 'nativeImageSource';

import { connect } from 'react-redux';

import NavigatorDrawer from './NavigatorDrawer';
import SegmentedView from './SegmentedView';

import Community from './viewPagers/Community';
import Gene from './viewPagers/Gene';

import NewBattle from '../components/new/NewBattle';
import NewGene from '../components/new/NewGene';
import NewTopic from '../components/new/NewTopic';

import { changeSegmentIndex, changeCommunityType, changeGeneType, changeScrollType } from '../actions/app';

import { standardColor, accentColor } from '../config/colorConfig';

let screen = Dimensions.get('window');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = screen;

let title = "PSNINE";
let isMounted = false;
let indexWithFloatButton = [0,1,3,4];
let indexWithoutFloatButton = [2];

const searchAction = { title: '搜索', iconName: 'md-search', value: '', show: 'always' }

let communityActions = [
  searchAction,
  { title: '全部', value: '', show: 'never' },
  { title: '新闻', value: 'news',show: 'never' },
  { title: '攻略', value: 'guide',show: 'never' },
  { title: '测评', value: 'review',show: 'never' },
  { title: '心得', value: 'exp',show: 'never' },
  { title: 'Plus', value: 'plus',show: 'never' },
  { title: '开箱', value: 'openbox',show: 'never' },
  { title: '游列', value: 'gamelist',show: 'never' },
  { title: '活动', value: 'event',show: 'never' },
  { title: '火星', value: 'mars',show: 'never'},
];

let gameActions = [
  searchAction,
];

let rankActions = [
  searchAction,
];

let battleActions = [
  searchAction,
];

let geneActions = [
  searchAction,
  { title: '全部', value: 'all', show: 'never' },
  { title: '图文类',value: 'photo', show: 'never' },
  { title: '音乐类',value: 'music', show: 'never' },
  { title: '影视类',value: 'movie', show: 'never' },
  { title: '视频类',value: 'video', show: 'never' },
];

let toolbarActions = [communityActions,gameActions,rankActions,battleActions,geneActions]

let titlesArr = ["社区", "问答", "游戏",  "约战", "机因"];

const ds = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2,
});

let clamp = (value,min, max) => {
  return Math.min(Math.max(value, min), max);
};


let toolbarHeight = 56;
let releasedMarginTop = 0;
let config = {tension: 30, friction: 7, ease: Easing.in(Easing.ease(1,0,1,1)), duration: 200};
const timeout = 190
const delay = 50


class Toolbar extends Component {


  constructor(props) {
    super(props);

    this.state = {
      rotation: new Animated.Value(1),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      marginTop: new Animated.Value(0),
      openVal: new Animated.Value(0),
      innerMarginTop: new Animated.Value(0)
    }
  }

  _renderSegmentedView = () =>{
    return (
      <SegmentedView
        {...{
            communityType: this.props.app.communityType, 
            geneType: this.props.app.geneType,
            navigator:this.props.navigator, 
            toolbarDispatch: this.props.dispatch,
            segmentedIndex: this.props.app.segmentedIndex,
            modeInfo:this.props.modeInfo,
            setMarginTop: this.setMarginTop
        }} 
        titles={titlesArr}
        index={0}
        style={styles.segmentedView}
        stretch
        switchTo={this.switchTo}
        scrollTo={this.scrollTo}
        duration={200}
        restWidth={10}
        barPosition='bottom'
        underlayColor='#000'
        barColor='#fff'
        titleStyle={{ fontSize:15 }}
        titleWidth={Dimensions.get('window').width/titlesArr.length}
        />
    )
  }

  componentWillReceiveProps(nextProps) {
    this.props.app = nextProps.app;
  }

  onActionSelected = (index) => {
    const { segmentedIndex } = this.props.app;
    const { dispatch } = this.props;
    if(segmentedIndex == 0){
      let type = toolbarActions[segmentedIndex][index].value;
      dispatch(changeCommunityType(type));
    }else if(segmentedIndex == 4){
      let type = toolbarActions[segmentedIndex][index].value;
      dispatch(changeGeneType(type));
    }
  }

  componentDidMount() {

  }

  setMarginTop = (value, isFlatten, isGetMarginTop) => {
    // console.log(value, this.state.marginTop._offset)
    if (typeof isGetMarginTop === 'boolean' && isGetMarginTop) {
      return releasedMarginTop
    }
    if (isFlatten) {
      this.state.marginTop.flattenOffset();
      releasedMarginTop = this.state.marginTop._value;
      return;
    }
    this.state.marginTop.setValue(value)
  }

  parallelFadeOut = (toValue) => {
    let spring = Animated.spring;
    let timing = Animated.timing;
    Animated.parallel(['opacity','rotation','scale'].map(property => {
        if(property == 'rotation' || property == 'scale'){
          return spring(this.state[property], {
                      toValue: toValue,
                      easing: Easing.elastic(2),
                 });
        }else if(property == 'opacity'){
          return timing(this.state[property], {
                      toValue: toValue,
                      delay: 200,
                      duration: 0,
                 });
        }
    })).start();
  }

  parallelFadeIn = (toValue) => {
    let spring = Animated.spring;
    let timing = Animated.timing;
    Animated.parallel(['opacity','rotation','scale'].map(property => {
        if(property == 'rotation' || property == 'scale'){
          return spring(this.state[property], {
                      toValue: toValue,
                      easing: Easing.elastic(2),
                 });
        }else if(property == 'opacity'){
          return timing(this.state[property], {
                      toValue: toValue,
                      duration: 0,
                 });
        }
    })).start();
  }

  switchTo = (fromIndex,toIndex) => {
    if (indexWithFloatButton.indexOf(fromIndex) != -1 && indexWithoutFloatButton.indexOf(toIndex) !=-1){
      
      this.parallelFadeOut(0);

    }else if(indexWithoutFloatButton.indexOf(fromIndex) != -1 && indexWithFloatButton.indexOf(toIndex) !=-1){
      
      this.parallelFadeIn(1);

    }else if(indexWithoutFloatButton.indexOf(fromIndex) != -1 && indexWithoutFloatButton.indexOf(toIndex) !=-1){

    }else if(indexWithFloatButton.indexOf(fromIndex) != -1 && indexWithFloatButton.indexOf(toIndex) !=-1){
      
      let value = this.state.rotation._value;
      if(fromIndex < toIndex)
        targetValue = value - 1/4;
      else
        targetValue = value + 1/4;
      Animated.timing(this.state.rotation, {
            toValue: targetValue,
            easing: Easing.elastic(2),
      }).start();

    }
    
  }

  scrollTo = (fromIndex,toIndex, value) => {
    if (isMounted == false){
      isMounted = true;
      return;
    }

    if (indexWithFloatButton.indexOf(fromIndex) != -1 && indexWithoutFloatButton.indexOf(toIndex) !=-1){
      
      if (fromIndex < toIndex){

        this.state.opacity.setValue(1-value);
        this.state.rotation.setValue(1-value);
        this.state.scale.setValue(1-value);
      }else{

        this.state.opacity.setValue(value);
        this.state.rotation.setValue(1-value);
        this.state.scale.setValue(value);
      }

    }else if(indexWithoutFloatButton.indexOf(fromIndex) != -1 && indexWithFloatButton.indexOf(toIndex) !=-1){
      
      if (fromIndex < toIndex){

        this.state.opacity.setValue(value);
        this.state.rotation.setValue(1-value);
        this.state.scale.setValue(value);

      }else{

        this.state.opacity.setValue(1-value);
        this.state.rotation.setValue(1-value);
        this.state.scale.setValue(1-value);

      }

    }else if(indexWithoutFloatButton.indexOf(fromIndex) != -1 && indexWithoutFloatButton.indexOf(toIndex) !=-1){

    }else if(indexWithFloatButton.indexOf(fromIndex) != -1 && indexWithFloatButton.indexOf(toIndex) !=-1){
      this.state.rotation.setValue((1-value)/4);
    }

  }

  _animateToolbar = (value, cb) => {
    const ratationPreValue = this.state.rotation._value

    const rotationValue = value === 0 ? ratationPreValue - 3/8 : ratationPreValue + 3/8
    const scaleAnimation = Animated.timing(this.state.rotation, {toValue: rotationValue, ...config})
    const moveAnimation = Animated.timing(this.state.openVal, {toValue: value, ...config})
    const target = [
      moveAnimation
    ]
    if (value !== 0 || value !== 1) target.unshift(scaleAnimation)
    const type = value === 1 ? 'sequence' : 'parallel'
    Animated[type](target).start(() => typeof cb === 'function' && cb())
  }  

  _pressToolbarNew = () => {
    const { navigator } = this.props;
    const { segmentedIndex } = this.props.app;

    switch (segmentedIndex) {
      case 0 : 
        this.pressNew(() => {
          navigator.push({
            component: NewTopic,
            withoutAnimation: true,
            shouldForbidPressNew: true,
          })
        });
        break;

      case 1 : 

        break;
      case 3 : 
        this.pressNew(() => {
          navigator.push({
            component: NewBattle,
            withoutAnimation: true,
            shouldForbidPressNew: true,
          })
        });

        break;
      case 4 : 
        this.pressNew(() => {
          navigator.push({
            component: NewGene,
            withoutAnimation: true,
            shouldForbidPressNew: true,
          })
        });

        break;
        
    }
  }

  pressNew = (cb) => {

    const { segmentedIndex } = this.props.app;

    if (segmentedIndex == 1 || segmentedIndex == 2){
      return;
    }
    
    const { navigator: _navigator } = this.props;

    let routes = _navigator.getCurrentRoutes();

    let shouldForbidPressNew = routes.some(value=>{
      return typeof value.shouldForbidPressNew !='undefined' && value.shouldForbidPressNew == true; 
    });

    if (shouldForbidPressNew==true){
      return;
    }

    if (this.state.openVal._value === 0) {
      this.removeListener = BackAndroid.addEventListener('hardwareBackPress',  () => {
        let value = this.state.innerMarginTop._value;
        if (Math.abs(value) >= 50) {
          Animated.timing(this.state.innerMarginTop, {toValue: 0, ...config}).start();
        }else{
          this.removeListener && this.removeListener.remove  && this.removeListener.remove();
          this._animateToolbar(0)
        }
        return true;
      });
      this._animateToolbar(1, cb)
    } else {
      this.removeListener && this.removeListener.remove  && this.removeListener.remove();
      this._animateToolbar(0, cb)
    }
  }

  closeMask = () => {
    this.removeListener && this.removeListener.remove  && this.removeListener.remove();
    this._animateToolbar(0)
  }

  render() {
    const { app: appReducer, switchModeOnRoot } = this.props;
    const { segmentedIndex } = this.props.app;
    const { openVal } = this.state
    const tipHeight =  toolbarHeight * 0.8

    return (
      <Animated.View 
        style={[styles.container,{
          marginTop: this.state.marginTop,
        }]} 
      >
        <Icon.ToolbarAndroid
          navIconName="md-menu"
          title={title}
          style={[styles.toolbar, {backgroundColor: this.props.modeInfo.standardColor}]}
          titleColor={this.props.modeInfo.isNightMode ? '#000' : '#fff'}
          overflowIconName="md-more"
          iconColor={this.props.modeInfo.isNightMode ? '#000' : '#fff'}
          actions={toolbarActions[appReducer.segmentedIndex]}
          onActionSelected={this.onActionSelected}
          onIconClicked={this.props._callDrawer() }
          />
          {this._renderSegmentedView() }
          <TouchableWithoutFeedback onPress={this.closeMask}>
            <Animated.View 
                ref={mask=>this.mask=mask}
                collapsable ={false}
                style={{
                  opacity: openVal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1]
                  }),
                  width:openVal.interpolate({inputRange: [0, 1], outputRange: [0, SCREEN_WIDTH]}),
                  height:openVal.interpolate({inputRange: [0, 1], outputRange: [0, SCREEN_HEIGHT]}),
                  position:'absolute',
                  zIndex: 1
              }}/>
            </TouchableWithoutFeedback>
           <Animated.View 
                ref={float=>this.float1=float}
                collapsable ={false}
                style={{
                  opacity: openVal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1]
                  }),
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: accentColor,
                  position:'absolute',
                  bottom: Animated.add(
                    openVal.interpolate({inputRange: [0, 1], outputRange: [24,  56 + 10 + 16 * 2]}),
                    this.props.tipBarMarginBottom.interpolate({
                      inputRange: [0, 1], 
                      outputRange: [0 , tipHeight]
                    })
                  ),
                  right: 24,
                  elevation: openVal.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0, 1]
                  }) ,
                  zIndex: 1,
                  opacity: Animated.multiply(this.state.openVal.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 1]
                  }), this.state.opacity)
              }}>
                
                <TouchableNativeFeedback 
                  onPress={this._pressToolbarNew}
                  background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
                  onPressIn={()=>{
                    this.float1.setNativeProps({
                      style :{
                      elevation: 12,
                    }});
                  }}
                  onPressOut={()=>{
                    this.float1.setNativeProps({
                      style :{
                      elevation: 6,
                    }});
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    flex:1,
                    zIndex: 1,
                    backgroundColor: accentColor,
                  }}>
                  <View style={{borderRadius: 20,width: 40,height: 40,justifyContent: 'center',alignItems: 'center',}}>
                    <Icon name="ios-add" size={30} color='#fff'/>
                  </View>
                </TouchableNativeFeedback>
            </Animated.View>

            <Animated.View 
                ref={float=>this.float2=float}
                collapsable ={false}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: accentColor,
                  position:'absolute',
                  bottom: Animated.add(
                    openVal.interpolate({inputRange: [0, 1], outputRange: [24,  56 + 10 + 16 * 2  + 50]}),
                    this.props.tipBarMarginBottom.interpolate({
                      inputRange: [0, 1], 
                      outputRange: [0 , tipHeight]
                    })
                  ),
                  right: 24,
                  elevation: openVal.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0, 1]
                  }) ,
                  zIndex: 1,
                  opacity: Animated.multiply(this.state.openVal.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 1]
                  }), this.state.opacity)
              }}>
                
                <TouchableNativeFeedback 
                  onPress={this.pressNew}
                  background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
                  onPressIn={()=>{
                    this.float2.setNativeProps({
                      style :{
                      elevation: 12,
                    }});
                  }}
                  onPressOut={()=>{
                    this.float2.setNativeProps({
                      style :{
                      elevation: 6,
                    }});
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    flex:1,
                    zIndex: 1,
                    backgroundColor: accentColor,
                  }}>
                  <View style={{borderRadius: 20,width: 40,height: 40,justifyContent: 'center',alignItems: 'center',}}>
                    <Icon name="ios-exit-outline" size={25} color='#fff'/>
                  </View>
                </TouchableNativeFeedback>
            </Animated.View>

        <Animated.View 
            ref={float=>this.float=float}
            collapsable ={false}
            style={{
              width: 56,
              height: 56,
              borderRadius: 30,
              backgroundColor: accentColor,
              position:'absolute',
              bottom: this.props.tipBarMarginBottom.interpolate({
                inputRange: [0, 1], 
                outputRange: [16 , 16 + tipHeight]
              }),
              right: 16,
              elevation: 6 ,
              zIndex: 1,
              opacity: this.state.opacity,

              transform: [{
                scale: this.state.scale,                        
              },{
                rotateZ: this.state.rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                }),
              }]
          }}>
          
          <TouchableNativeFeedback 
            onPress={this.pressNew}
            // delayPressIn={0}
            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
            onPressIn={()=>{
              this.float.setNativeProps({
                style :{
                elevation: 12,
              }});
            }}
            onPressOut={()=>{
              this.float.setNativeProps({
                style :{
                elevation: 6,
              }});
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 30,
              flex:1,
              zIndex: 1,
              backgroundColor: accentColor,
            }}>
            <View style={{borderRadius: 30,width: 56,height: 56,flex:-1,justifyContent: 'center',alignItems: 'center',}}>
              <Icon name="ios-add" size={40} color='#fff'/>
            </View>
          </TouchableNativeFeedback>
        </Animated.View>
      </Animated.View>
    )
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
    height: toolbarHeight,
    elevation: 4,
  },
  segmentedView: {
    backgroundColor: '#F5FCFF',
  },
  selectedTitle: {
    //backgroundColor: '#00ffff'
    //fontSize: 20
  },
  avatar: {
    width: 50,
    height: 50,
  }
});

function mapStateToProps(state) {
    return {
      app: state.app,
    };
}

export default connect(
  mapStateToProps
)(Toolbar);

