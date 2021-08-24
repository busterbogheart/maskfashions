import React,{useRef, useState} from "react"
import {styles,filterModalStyles,theme} from '../styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Text, TouchableOpacity, View} from "react-native";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

export default Filters = (props) => {
	const filterSchema = props.filterSchema;
	const app = props.app;
	const multiSelectRef = useRef(null);
	const [selectedItems,setSelectedItems] = useState([]);
	const [selectedItemObjects,setSelectedItemObjects] = useState([]);

	//in case schema can't be fetched, just hide the filters
	if (filterSchema.length > 0) {
		return (
			<>
				<View name="filter buttons" style={styles.filterButtons}>
					<TouchableOpacity onPress={() => {multiSelectRef.current._toggleSelector()}} style={styles.filterButtonsFilter} >
						<Icon name='format-list-bulleted-type' color='#ddd' size={28} style={{paddingHorizontal: 7}} />
						<Text style={{color: '#ddd',textTransform: 'uppercase',fontWeight: 'bold',fontSize: 16}}>filter</Text>
					</TouchableOpacity>
					{selectedItems.length > 0 ?
						<TouchableOpacity delayPressIn={0} onPressIn={() => {
							setSelectedItems([]);
							setSelectedItemObjects([]);
							app.resetFlatList();
						}} style={styles.filterButtonsClear}>
							<Text style={{color: theme.colors.accent,fontSize: 16,fontWeight: 'bold'}}>clear</Text>
						</TouchableOpacity>
						: <></>
					}
				</View>
				<SectionedMultiSelect
					ref={multiSelectRef}
					styles={filterModalStyles}
					colors={{
						// confirm button bg, dropdown arrow color
						primary: theme.colors.primary,
						// check icon color
						success: '#2a2',
						// cancel button bg
						cancel: '#333',
						// main category bg
						itemBackground: '#fff',
						subItemBackground: '#fff',
						// button text
						selectToggleTextColor: theme.colors.text,
					}}
					items={filterSchema}
					IconRenderer={filterIconRenderer}
					uniqueKey="id"
					subKey="children"
					selectText=''
					//selectText={<><Text style={{textTransform: 'uppercase',fontWeight: 'bold',fontSize: 15}}>filter masks </Text><Icon name='format-list-bulleted-type' size={20} /></>}
					showDropDowns={true}
					selectChildren={false}
					// remove down arrow at start
					selectToggleIconComponent={<></>}
					// removeAllText={<Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>clear filters<Icon name='delete' size={18} /></Text>}
					expandDropDowns={false}
					// headerComponent={<View style={{backgroundColor:'#f4f',height:20}}><Text>header</Text></View>}
					// footerComponent={<View style={{backgroundColor:'#f4f',height:20}}><Text>foot</Text></View>}
					// stickyFooterComponent={<View style={{backgroundColor:'#bfd',padding:5,height:30}}><Text style={{textAlign:'right'}}>hot tip: Be hot.</Text></View>}
					readOnlyHeadings={false}
					showRemoveAll={true}
					animateDropDowns={false}
					modalAnimationType='slide'
					modalWithSafeAreaView={true}
					modalWithTouchable={true}
					hideSearch={true}
					hideSelect={true}
					showCancelButton={true}
					showChips={false}
					highlightChildren={true}
					confirmText='APPLY'
					selectedIconOnLeft={true}
					selectedIconComponent={<Icon name='check-bold' color='#2c2' style={{paddingRight: 3}} />}
					alwaysShowSelectText={false}
					// customChipsRenderer={(uniqueKey, subKey, displayKey, items, selectedItems, colors, styles)=>{}}
					onSelectedItemsChange={(items) => {
						console.debug('selecteditemschange:',JSON.stringify(items,null,1))
						setSelectedItems(items);
					}}
					onSelectedItemObjectsChange={(itemsObj) => {
						// returned as the original objects not just ids
						console.debug('selecteditemsobjectchange:',JSON.stringify(itemsObj,null,1))
						setSelectedItemObjects(itemsObj);
					}}
					selectedItems={selectedItems}
					onToggleSelector={(modalOpen) => {
						//console.log(`filter modal open? ${modalOpen}`);
						if (modalOpen == false) app.applyFilters(selectedItemObjects);
					}}
					onConfirm={() => app.applyFilters(selectedItemObjects)}
					onCancel={() => {
						setSelectedItems([]);
						setSelectedItemObjects([]);
						app.resetFlatList();
					}}
				/></>
		)
	}
	else return <></>
};

const filterIconRenderer = ({name,size = 18,style}) => {
	let iconName;
	switch (name) {
		case 'search':
			iconName = 'card-search'
			break
		case 'keyboard-arrow-up':
			iconName = 'arrow-up-thick'
			break
		case 'keyboard-arrow-down':
			iconName = 'arrow-down-thick'
			break
		case 'close':
			iconName = 'close-box'
			break
		case 'check':
			iconName = 'check-bold' //check
			break
		case 'cancel':
			iconName = 'close'
			break
		default:
			iconName = null
			break
	}
	return <Icon style={style} size={size} name={iconName} />
}
