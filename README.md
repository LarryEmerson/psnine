# P9-app
Android App for [P9](http://psnine.com/) written by React Native

# Release 分支说明

此分支为版本发布分支 

release分支的源码与master分支完全一致,但会额外修改react-native的部分源码,以解决一些应用层无法修正的严重BUG

注意, 修改的react-native源码如果不是JS层而是Native(例如.java文件)层, 修改后必须重新从源码中构建react-native, 否则修改不会生效

# 通过修改源码解决的BUG列表

- [x] PanResponder Outside ListView监听冲突
- [x] TouchableNativeFeedback无法在点击时唤出涟漪
- [x] BackAndroid无法删除已注册事件

# 从源码中构建react-native

> [http://facebook.github.io/react-native/docs/android-building-from-source.html](http://facebook.github.io/react-native/docs/android-building-from-source.html)

官方文档比较全, 但有些地方仍然有坑, 注意如下几点即可

- NDK版本
    - 必须使用ndk-r10e版本(下载地址在上面文档中), react-native不支持ndk的r11或r12版本
- 不配置local.properties
    - sdk.dir和ndk.dir路径在windows环境下有路径转译的问题, 因此最好使用环境变量, 配置好`ANDROID_HOME`和`ANDROID_NDK`即可, 不需要创建local.properties文件
- 不需要clone或者下载react-native源码
    - 我们只是自己修复BUG, 只需要在`npm install`后, 直接修改/node_modules/react-native的源码, 之后构建即可

之后就是完全按照文档的流程了. PSNINE没有第三方依赖, 因此不必考虑这部分.


# BUG: PanResponder Outside ListView

如果你直接从master分支构建app, 那么在首页的社区栏目下, 很容易发现如下BUG:

> 上拉ListView触发工具栏的隐藏后, ListView仍然在滑动的情况下, 如果此时立即下拉ListView, 工具栏将无法被拉出来正常显示

在PSNINE中, PanResponder注册在ViewPagerAndroid上, 首页五个View都为ViewPagerAndroid的子组件, 因此这是属于PanResponder Outside ListView的手势冲突问题

## 解决方法 

修改文件: `/node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/views/scroll/ReactScrollView.java`

将Line #161的`NativeGestureUtil.notifyNativeGestureStarted(this, ev);`语句注释掉, 如下:
```java
  @Override
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    if (!mScrollEnabled) {
      return false;
    }

    if (super.onInterceptTouchEvent(ev)) {
      NativeGestureUtil.notifyNativeGestureStarted(this, ev);  // 注释掉此行
      ReactScrollViewHelper.emitScrollBeginDragEvent(this);
      mDragging = true;
      enableFpsListener();
      return true;
    }

    return false;
  }
```

保存后, 从源码中构建react-native一次即可

## BUG分析

这个严重BUG出现在所有使用`ScrollResponder.js`的组件中, 例如ListView, ScrollView, ViewPager等等, 影响范围很大.

它既不是`react-native`的`ScrollResponder.js`手势冲突导致的, 也不是`react`的`ResponderEventPlugin.js`冒泡错误导致的.而是`RCTScrollView.java`中, 滑动中的触摸操作触发了Android原生手势事件,导致JS层注册的手势被直接夺取了权限. 

此BUG出现时, 只会触发PanResponder的`onPanResponderTerminate`, 不会触发`onPanResponderTerminationRequest`, 与[官方文档](http://facebook.github.io/react-native/releases/0.32/docs/view.html#onresponderterminate)描述一致


# BUG: TouchableNativeFeedback无法在点击时唤出涟漪

> `TouchableNativeFeedback`一点也不Native

这个BUG真让人无语, 如果点击时没涟漪, 还要你`TouchableNativeFeedback`干什么, 黑人问号??

现在大众的临时解决办法是将`TouchableNativeFeedback`的`delayPressIn`设置为`0`, 但是这样滑动ListView的时候又会触发涟漪, 这同样并不Native

## 解决方法

修改文件: `node_modules/react-native/Libraries/Components/Touchable/Touchable.js`

将Line #715的`this.touchableHandlePress(e)` 修改为`this.touchableHandlePress(curState, nextState, signal,e)`

再修改文件: `node_modules/react-native/Libraries/Components/Touchable/TouchableNativeFeedback.android.js`

将`touchableHandlePress`方法修改为如下语句:

```javascript
  touchableHandlePress: function(curState, nextState, signal,e: Event) {

    if (curState==='RESPONDER_ACTIVE_LONG_PRESS_IN'&& nextState=== 'NOT_RESPONDER' && signal=== 'RESPONDER_RELEASE'){
      this.props.onPress && this.props.onPress(e);
      return;
    }else if(curState=== 'RESPONDER_INACTIVE_PRESS_IN'&& nextState==='NOT_RESPONDER'&& signal===  'RESPONDER_RELEASE'){
      this._performSideEffectsForTransition( 'RESPONDER_INACTIVE_PRESS_IN', 'RESPONDER_ACTIVE_PRESS_IN', 'DELAY',e);
      this._performSideEffectsForTransition( 'RESPONDER_ACTIVE_PRESS_IN', 'RESPONDER_ACTIVE_PRESS_IN', 'ENTER_PRESS_RECT',e);
      this._performSideEffectsForTransition( 'RESPONDER_ACTIVE_PRESS_IN', 'RESPONDER_ACTIVE_LONG_PRESS_IN', 'LONG_PRESS_DETECTED',e);
      this._performSideEffectsForTransition( 'RESPONDER_ACTIVE_LONG_PRESS_IN', 'RESPONDER_ACTIVE_LONG_PRESS_IN', 'ENTER_PRESS_RECT',e);
      this._performSideEffectsForTransition( 'RESPONDER_ACTIVE_LONG_PRESS_IN', 'NOT_RESPONDER', 'RESPONDER_TERMINATED',e);
      this.pressOutDelayTimeout = setTimeout(() => {
          this.props.onPress && this.props.onPress(e);
      }, 0);
      return;
    }

    this.props.onPress && this.props.onPress(e);
  },
```

## BUG分析

这个BUG说白了就是react-native在瞬间点击时触发`onPress`后直接结束事件, 没有涟漪的出现和结束过程, 因此我们自己把这个过程加上就好

但是源码里面逻辑比较乱, 涉及好多状态机, 因此我直接选择了模拟状态来触发涟漪动画, 最后用`setTimeout(()=>{},0)`的形式,在动画结束的正确时机触发onPress


# BUG: BackAndroid无法删除已注册事件

如果直接构建master的源码, 很容易发现, 点击`创建讨论`页面的退出虚拟键, 将直接退出App而不是退出该页面. 原因在于这些页面并不是push到navigator中, 而是在首屏组件树中的.

创建新监听事件前必须清除已经存在的事件(因为源码中用的是ES6的Set有序列表而不是Array), 但是删除时需要除了需要事件名, 还需要事件函数, 因为`BackAndroid`的事件一般都与`Navigator`搭配使用在App最顶层, 因此很容易出现循环引用的错误

## 解决方法

打开文件: `/react-native/Libraries/Utilities/BackAndroid.android.js`

在Line #83 添加如下代码:

```javascript
  clearAllListeners: function(){
     _backPressSubscriptions.clear();
  }
```

## BUG分析

这个问题说BUG其实也不算,  虽然`BackAndroid.addEventListener`返回值里已经有一个remove对象, 但是为了避免ES6循环引用时静态解析出错, 我还是修改了一下源码, 用以应付`BackAndroid和Navigator`强耦合的问题



