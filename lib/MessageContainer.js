import React from "react";
import PropTypes from "prop-types";
import { FlatList, View, StyleSheet, TouchableOpacity, Text, Platform, Animated, } from "react-native";
import { LoadEarlier } from "./LoadEarlier";
import Message from "./Message";
import Color from "./Color";
import TypingIndicator from "./TypingIndicator";
import { StylePropType } from "./utils";
import { warning } from "./logging";
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerAlignTop: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    contentContainerStyle: {
        flexGrow: 1,
        justifyContent: "flex-start",
    },
    emptyChatContainer: {
        flex: 1,
        transform: [{ scaleY: -1 }],
    },
    headerWrapper: {
        flex: 1,
    },
    listStyle: {
        flex: 1,
    },
    scrollToBottomStyle: {
        opacity: 0.8,
        position: "absolute",
        right: 10,
        bottom: 30,
        zIndex: 999,
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: Color.white,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Color.black,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 1,
    },
});
class MessageContainer extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.isInialized = false;
        this.viewRef = React.createRef();
        this.paddingAnimation = new Animated.Value(0);
        this.state = {
            showScrollBottom: false,
            hasScrolled: false,
            listViewHeight: 0,
            index0: 0,
            index1: 0,
        };
        this.renderTypingIndicator = () => {
            if (this.props.renderTypingIndicator)
                return this.props.renderTypingIndicator();
            return <TypingIndicator isTyping={this.props.isTyping || false}/>;
        };
        this.renderFooter = () => {
            // console.log(this.state.listViewHeight, this.state.index0, this.state.index1);
            const XComp = this.props.shouldStickMessageToTop && this.props.messages.length > 1 ? (<Animated.View style={{
                    paddingBottom: this.paddingAnimation,
                }} ref={this.viewRef}/>) : null;
            if (this.props.renderFooter)
                return (<>
          {this.props.renderFooter(this.props)}
          {XComp}
        </>);
            return (<>
        {this.renderTypingIndicator()} {XComp}
      </>);
        };
        this.renderLoadEarlier = (props) => {
            if (this.props.loadEarlier === true) {
                if (this.props.renderLoadEarlier)
                    return this.props.renderLoadEarlier(props);
                return <LoadEarlier {...props}/>;
            }
            return null;
        };
        this.scrollToBottom = (animated = true) => {
            const { inverted } = this.props;
            if (inverted)
                this.scrollTo({ offset: 0, animated });
            else if (this.props.forwardRef?.current)
                this.props.forwardRef.current.scrollToEnd({ animated });
        };
        this.handleOnScroll = (event) => {
            this.props.handleOnScroll?.(event);
            const { nativeEvent: { contentOffset: { y: contentOffsetY }, contentSize: { height: contentSizeHeight }, layoutMeasurement: { height: layoutMeasurementHeight }, }, } = event;
            const { scrollToBottomOffset } = this.props;
            if (this.props.inverted)
                if (contentOffsetY > scrollToBottomOffset)
                    this.setState({ showScrollBottom: true, hasScrolled: true });
                else
                    this.setState({ showScrollBottom: false, hasScrolled: true });
            else if (contentOffsetY < scrollToBottomOffset &&
                contentSizeHeight - layoutMeasurementHeight > scrollToBottomOffset)
                this.setState({ showScrollBottom: true, hasScrolled: true });
            else
                this.setState({ showScrollBottom: false, hasScrolled: true });
        };
        this.renderRow = ({ item, index, }) => {
            if (!item._id && item._id !== 0)
                warning("GiftedChat: `_id` is missing for message", JSON.stringify(item));
            if (!item.user) {
                if (!item.system)
                    warning("GiftedChat: `user` is missing for message", JSON.stringify(item));
                item.user = { _id: 0 };
            }
            const { messages, user, inverted, ...restProps } = this.props;
            if (messages && user) {
                const previousMessage = (inverted ? messages[index + 1] : messages[index - 1]) || {};
                const nextMessage = (inverted ? messages[index - 1] : messages[index + 1]) || {};
                const messageProps = {
                    ...restProps,
                    user,
                    currentMessage: item,
                    previousMessage,
                    inverted,
                    nextMessage,
                    position: item.user._id === user._id ? "right" : "left",
                };
                if (this.props.renderMessage)
                    return this.props.renderMessage(messageProps);
                return (<View key={item._id.toString()} onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        if (index === 0 && messages.length <= 1) {
                            this.setState({
                                index0: 0,
                                index1: 0,
                            });
                            return;
                        }
                        if (index === 0 || index === 1) {
                            // console.log(`Height of item ${index}:  `, height);
                            if (index === 0) {
                                if (!this.state.index1 && this.isInialized) {
                                    this.setState({
                                        index1: height,
                                    });
                                }
                                else {
                                    this.setState({
                                        index1: this.props.messages.length <= 3 ? this.state.index1 : 0,
                                        index0: height,
                                    });
                                }
                            }
                            else {
                                this.setState({
                                    [`index${index}`]: height,
                                });
                            }
                            index === 1 && (this.isInialized = true);
                        }
                    }} style={{ flex: 1 }}>
          <Message key={item._id.toString()} {...messageProps}/>
        </View>);
            }
            return null;
        };
        this.renderChatEmpty = () => {
            if (this.props.renderChatEmpty)
                return this.props.inverted ? (this.props.renderChatEmpty()) : (<View style={styles.emptyChatContainer}>
          {this.props.renderChatEmpty()}
        </View>);
            return <View style={styles.container}/>;
        };
        this.renderHeaderWrapper = () => (<View style={styles.headerWrapper}>
      {this.renderLoadEarlier({ ...this.props })}
    </View>);
        this.onLayoutList = (event) => {
            const listViewHeight = event.nativeEvent.layout.height;
            if (listViewHeight !== this.state.listViewHeight) {
                this.setState({
                    listViewHeight,
                });
            }
            if (!this.props.inverted &&
                !!this.props.messages &&
                this.props.messages.length)
                setTimeout(() => this.scrollToBottom && this.scrollToBottom(false), 15 * this.props.messages.length);
        };
        this.onEndReached = ({ distanceFromEnd }) => {
            const { loadEarlier, onLoadEarlier, infiniteScroll, isLoadingEarlier } = this.props;
            if (infiniteScroll &&
                (this.state.hasScrolled || distanceFromEnd > 0) &&
                distanceFromEnd <= 100 &&
                loadEarlier &&
                onLoadEarlier &&
                !isLoadingEarlier &&
                Platform.OS !== "web")
                onLoadEarlier();
        };
        this.keyExtractor = (item) => `${item._id}`;
    }
    scrollTo(options) {
        if (this.props.forwardRef?.current && options)
            this.props.forwardRef.current.scrollToOffset(options);
    }
    renderScrollBottomComponent() {
        const { scrollToBottomComponent } = this.props;
        if (scrollToBottomComponent)
            return scrollToBottomComponent();
        return <Text>{"V"}</Text>;
    }
    renderScrollToBottomWrapper() {
        const propsStyle = this.props.scrollToBottomStyle || {};
        return (<View style={[styles.scrollToBottomStyle, propsStyle]}>
        <TouchableOpacity onPress={() => this.scrollToBottom()} hitSlop={{ top: 5, left: 5, right: 5, bottom: 5 }}>
          {this.renderScrollBottomComponent()}
        </TouchableOpacity>
      </View>);
    }
    componentDidMount() {
        // Initialize the padding animation value
        const { listViewHeight, index0, index1 } = this.state;
        const { shouldStickMessageToTop, messages } = this.props;
        if (shouldStickMessageToTop && messages.length > 1) {
            const initialPadding = listViewHeight - ((index0 || 80) + (index1 || 80) || listViewHeight);
            this.paddingAnimation.setValue(initialPadding);
        }
    }
    componentDidUpdate(_prevProps, prevState) {
        // Animate padding when state changes
        const { listViewHeight, index0, index1 } = this.state;
        const { shouldStickMessageToTop, messages } = this.props;
        if (shouldStickMessageToTop && messages.length > 1) {
            const newPadding = listViewHeight - ((index0 || 80) + (index1 || 80) || listViewHeight);
            // Only animate if the value has changed
            if (prevState.listViewHeight !== listViewHeight ||
                prevState.index0 !== index0 ||
                prevState.index1 !== index1) {
                Animated.timing(this.paddingAnimation, {
                    toValue: newPadding,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            }
        }
        else {
            // Reset padding to 0 if conditions aren't met
            Animated.timing(this.paddingAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }
    render() {
        const { inverted } = this.props;
        return (<View style={this.props.alignTop ? styles.containerAlignTop : styles.container}>
        <FlatList ref={this.props.forwardRef} extraData={[this.props.extraData, this.props.isTyping]} keyExtractor={this.keyExtractor} automaticallyAdjustContentInsets={false} inverted={inverted} data={this.props.messages} style={styles.listStyle} contentContainerStyle={styles.contentContainerStyle} renderItem={this.renderRow} {...this.props.invertibleScrollViewProps} ListEmptyComponent={this.renderChatEmpty} ListFooterComponent={inverted ? this.renderHeaderWrapper : this.renderFooter} ListHeaderComponent={inverted ? this.renderFooter : this.renderHeaderWrapper} onScroll={this.handleOnScroll} scrollEventThrottle={100} onLayout={this.onLayoutList} onEndReached={this.onEndReached} onEndReachedThreshold={0.1} {...this.props.listViewProps}/>
        {this.state.showScrollBottom && this.props.scrollToBottom
                ? this.renderScrollToBottomWrapper()
                : null}
      </View>);
    }
}
MessageContainer.defaultProps = {
    messages: [],
    user: {},
    isTyping: false,
    renderChatEmpty: null,
    renderFooter: null,
    renderMessage: null,
    onLoadEarlier: () => { },
    onQuickReply: () => { },
    inverted: true,
    loadEarlier: false,
    listViewProps: {},
    invertibleScrollViewProps: {},
    extraData: null,
    scrollToBottom: false,
    scrollToBottomOffset: 200,
    alignTop: false,
    scrollToBottomStyle: {},
    infiniteScroll: false,
    isLoadingEarlier: false,
};
MessageContainer.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.object),
    isTyping: PropTypes.bool,
    user: PropTypes.object,
    renderChatEmpty: PropTypes.func,
    renderFooter: PropTypes.func,
    renderMessage: PropTypes.func,
    renderLoadEarlier: PropTypes.func,
    onLoadEarlier: PropTypes.func,
    listViewProps: PropTypes.object,
    inverted: PropTypes.bool,
    loadEarlier: PropTypes.bool,
    invertibleScrollViewProps: PropTypes.object,
    extraData: PropTypes.object,
    scrollToBottom: PropTypes.bool,
    scrollToBottomOffset: PropTypes.number,
    scrollToBottomComponent: PropTypes.func,
    alignTop: PropTypes.bool,
    scrollToBottomStyle: StylePropType,
    infiniteScroll: PropTypes.bool,
};
export default MessageContainer;
//# sourceMappingURL=MessageContainer.js.map