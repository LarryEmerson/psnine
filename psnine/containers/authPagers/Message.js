import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  Image,
  ToastAndroid,
  Dimensions,
  TouchableNativeFeedback,
  RefreshControl,
  InteractionManager,
  ToolbarAndroid,
} from 'react-native';

import { connect } from 'react-redux';
import { getTopicList } from '../../actions/community.js';
import { standardColor, nodeColor, idColor  } from '../../config/colorConfig';

import CommunityTopic from '../../components/CommunityTopic';

import { getTopicURL, fetchMessages,  } from '../../dao/dao';
import moment from '../../utils/moment';

const ds = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2,
});

let toolbarActions = [];

class Message extends Component {
    constructor(props){
        super(props);
        this.state = {
            messages: [],
        }
    }

  onNavClicked = (rowData) => {
    const { navigator } = this.props;
    if (navigator) {
      navigator.pop();
    }
  }

  _pressRow = (rowData) => {
    const { navigator } = this.props;
    let URL;
    let type = rowData.type;
    switch (type) {
      case 'topic':
        URL = getTopicURL(rowData.tid);
        navigator.push({
          component: CommunityTopic,
          params: {
            URL,
            title: rowData.content,
            rowData
          }
        });
        break;
      case 'gene':
        URL = getGeneURL(rowData.tid);
        navigator.push({
          component: GeneTopic,
          params: {
            URL,
            title: rowData.content,
            rowData
          }
        });
        break;
      default:
        ToastAndroid.show(`type '${rowData.type}' not implement yet.`,2000);
        break;
    }
  }


  _renderRow = (rowData,
    sectionID: number | string,
    rowID: number | string,
    highlightRow: (sectionID: number, rowID: number) => void
  ) => {

    let uri;
    if (rowData.profilepicture == '') {
      let path = rowData.avatar.toString().replace('\\', '');
      uri = `http://photo.d7vg.com/avatar/${path}.png@50w.png`;
    } else {
      uri = `http://photo.d7vg.com/avaself/${rowData.psnid}.png@50w.png`;
    }
    let time = parseInt(rowData.date);
    time *= 1000;
    let date = new Date(time);
    let fromNow = moment(date).fromNow();

    let TouchableElement = TouchableNativeFeedback;

    return (
      <View rowID={ rowID } style={{              
            marginTop: 7,
            backgroundColor: this.props.modeInfo.backgroundColor,
            elevation: 1,
        }}>
        <TouchableElement  
          delayPressIn={0}
          background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
          onPress={()=>this._pressRow(rowData)}
          >
          <View style={{ flex: 1, flexDirection: 'row',  padding: 12 }}>
            <Image
              source={{ uri: uri }}
              style={styles.avatar}
              />

            <View style={{ marginLeft: 10, flex: 1, flexDirection: 'column'}}>
              <Text
                ellipsizeMode={'tail'}
                numberOfLines={3}
                style={{ flex: 2.5,color: this.props.modeInfo.titleTextColor, }}>
                {rowData.content}
              </Text>

              <View style={{ flex: 1.1, flexDirection: 'row', justifyContent :'space-between' }}>
                <Text style={{ flex: -1, color: idColor,textAlign : 'center', textAlignVertical: 'center' }}>{rowData.psnid}</Text>
                <Text style={{ flex: -1,color: this.props.modeInfo.titleTextColor,textAlign : 'center', textAlignVertical: 'center' }}>{fromNow}</Text>
              </View>

            </View>

          </View>
        </TouchableElement>
      </View>
    )
  }

  componentWillMount = async () => {
      this.fetchMessages();
  }

  async fetchMessages () {
    const data = await fetchMessages(this.props.psnid);
    this.setState({
        messages: data.data,
    });
  }

  render(){
    // console.log('Message.js rendered');
    return (
          <View 
            style={{flex:1,backgroundColor:this.props.modeInfo.brighterLevelOne}}
            onStartShouldSetResponder={() => false}
            onMoveShouldSetResponder={() => false}
            >
              <ToolbarAndroid
                navIcon={require('image!ic_back_white')}
                overflowIcon={require('image!ic_more_white')}
                title={'我的消息'}
                style={[styles.toolbar, {backgroundColor: this.props.modeInfo.standardColor,}]}
                actions={toolbarActions}
                onIconClicked={this.onNavClicked}
              />
              <ListView
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.messages.length == 0 ? true : false}
                    colors={[standardColor]}
                    progressBackgroundColor={this.props.modeInfo.backgroundColor}
                    />
                }
                pageSize = {32}
                removeClippedSubviews={false}
                enableEmptySections={true}
                dataSource={ ds.cloneWithRows(this.state.messages) }
                renderRow={this._renderRow}
                />
         </View>     
    )
  }

}

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
  },
  toolbar: {
    backgroundColor: standardColor,
    height: 56,
    elevation: 4,
  },
});


// function mapStateToProps(state) {
//     return {
//       community: state.community,
//     };
// }

// export default connect(
//   mapStateToProps
// )(Community);

export default Message;
