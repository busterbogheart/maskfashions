import React, { Component } from "react";
import { View } from "react-native";
import { Button, IconButton } from "react-native-paper";
import DropDown from "./components/DropDown";

export default class MFDropdown extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedValues: '',
            showDropDown: false,
        }
        this.data = this.props.data;
    }

    render() {
        return (
            <View style={{ flexDirection: 'row', justifyContent:'center', 
                alignItems:'stretch', backgroundColor: 'transparent'}}>
                <DropDown
                    inputProps={{ style: { backgroundColor: '#ffc', width:200, height:40} }}
                    // dropDownContainerHeight={400}
                    dropDownItemSelectedStyle={{backgroundColor:'#ffffff44'}}
                    dropDownStyle={{ backgroundColor: 'transparent',}}
                    dropDownItemStyle={{ backgroundColor: 'transparent', }}
                    dropDownItemTextStyle={{ color: '#000', }}
                    activeColor='#00f' 
                    label='categories.'
                    mode='outlined'
                    iconup='chevrons-up'
                    icondown='chevrons-down'
                    list={this.data}
                    visible={this.state.showDropDown}
                    value={this.state.selectedValues}
                    setValue={(values) => {
                        this.setState({ selectedValues: values });
                    }}
                    showDropDown={() => {
                        this.setState({ showDropDown: true });
                    }}
                    onDismiss={() => {
                        this.setState({ showDropDown: false });
                    }}
                    multiSelect
                />
                <IconButton size={26} onPress={()=>{this.setState({selectedValues:'',showDropDown:false})}} icon='x-circle' 
                    style={{}} color='#020' />
            </View>
        )

    }


}