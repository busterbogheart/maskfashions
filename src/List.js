import React, { Component } from 'react'
import { FlatList, Text, TextInput, View } from 'react-native'
import PropTypes from 'prop-types';

// stateless component that passes state into ListControls and ListView
export class MyList extends Component {

    render() {
        // DECLARE custom props here, necessary.....
        const {data,onFilter} = this.props;
        return (
            <FlatList
                data={data}
                ListHeaderComponent={<ListControls {...{ onFilter }} />}
                renderItem={({ item }) => <Text>item.value</Text>} >
            </FlatList>
        )
    }
}


// overall container for the list
export class ListContainer extends Component {
    constructor(props) {
        super(props);
        // initial data
        this.state = {
            data: new Array(100).fill(null).map((v, i, a) => `item #${i}`),
            filterParam: '',
        };
    }

    mapItems(items) {
        let mapped = items.map((value, i) => ({ key: i.toString(), value }));
        return mapped;
    }

    filterAndSort(data, text, asc=true) {
        return data
            .filter((i) => text.length === 0 || i.includes(text))
            .sort(
                asc ? (a, b) => (b > a ? -1 : a === b ? 0 : 1)
                    : (a, b) => (a > b ? -1 : a === b ? 0 : 1)
            );
    }

    render() {
        const newData = this.mapItems(this.state.data);
        const {onFilter} = this.props;
        return (
            <MyList 
                data={newData}
                onFilter={(text) => {
                    this.setState({
                        filterParam: text,
                        data: this.filterAndSort(this.state.data, text),
                    });
                }}
            />
        )
    }
}

// holds controls that change the state
class ListControls extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {onFilter} = this.props;
        return (
            <View style={{ backgroundColor: '#bff', padding: 5, width:200}}>
                <ListFilter onFilter={onFilter} />
            </View>
        )
    }
}

// input for filtering data
class ListFilter extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {onFilter} = this.props;
        return (
            <View>
                <TextInput autoFocus placeholder='HI!!!' onChangeText={onFilter} />
            </View>
        )
    }
}