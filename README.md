# P9-app
Android App for [P9](http://psnine.com/) written by React Native

# Release 分支说明

此分支为版本发布分支 

release分支的源码与master分支完全一致,但会额外修改react-native的部分源码,以解决一些JS层无法修正的严重BUG

注意, 修改react-native源码后, 必须重新从源码中构建react-native, 否则修改不会生效

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

## BUG: PanResponder Outside ListView

如果你直接从master分支构建app, 那么在首页的社区栏目下, 很容易发现如下BUG:

> 上拉ListView触发工具栏的隐藏后, ListView仍然在滑动的情况下, 如果此时立即下拉ListView, 工具栏将无法被拉出来正常显示

在PSNINE中, PanResponder注册在ViewPagerAndroid上, 首页五个View都为ViewPagerAndroid的子组件, 因此这是属于PanResponder Outside ListView的手势冲突问题

这个属于ScrollView的BUG非常严重.它既不是react-native层的ScrollResponder.js手势冲突导致的, 也不是react的ResponderEventPlugin.js冒泡错误导致的.而是RCTScrollView.java中, 滑动中的触摸操作触发了Android原生手势事件,导致JS层注册的手势被直接夺取了权限. 此BUG出现时, 只会触发PanResponder的onPanResponderTerminate, 不会触发onPanResponderTerminationRequest, 与[官方文档](http://facebook.github.io/react-native/releases/0.32/docs/view.html#onresponderterminate)描述一致

因此, 打开如下文件: `/Psnine/node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/views/scroll/ReactScrollView.java`

将Line #161的`NativeGestureUtil.notifyNativeGestureStarted(this, ev);`语句注释掉, 保存后, 重新构建一次react-native即可

另外, 按照这种办法重新构建后, 滑动ListView会触发Touchable点击效果的问题也会被修复一半: 在滑动速度较快时不会触发Touchable的点击


