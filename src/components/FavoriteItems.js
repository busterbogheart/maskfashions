import React,{useState} from "react"
import MaskedView from "@react-native-masked-view/masked-view";
import {Image,ScrollView,Text,TouchableOpacity,View} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles,theme} from '../styles';

export default FavoriteItems = (props) => {
	const {favs: favsArrAdIds,adItems,sideMenuWidth,app} = props;
	const noFavs = favsArrAdIds.length == 0;
	const maskSize = sideMenuWidth;
	const maskMaskScale = .7;
	// initial state: filter from the master list of ad items
	const [favItems, setFavItems] = useState(adItems.filter(item => favsArrAdIds.includes(item.adId)));
	console.debug('favs',favsArrAdIds,favItems);

	const removeFav = (item) => {
		const newFavs = favItems.filter(el => el.adId !== item.adId);
		setFavItems(newFavs);
		app.removeFromFavorites(item);
	}

	if (noFavs) {
		return (
			<View style={{justifyContent: 'center',alignItems: 'center',}}>
				<Text style={{fontSize: 16}}>No favorites saved.{`\n\n`}Hit the <Icon name='heart-plus' size={28}/> on a mask you like!</Text>
			</View>
		);
	} else {
		return (
			<ScrollView showsVerticalScrollIndicator={false} decelerationRate={.96} snapToInterval={maskSize/2} contentContainerStyle={{justifyContent: 'center',alignItems: 'center',}}>
				{favItems.map(item => {
					return (
						<View key={item.adId} style={{justifyContent:'center',alignItems:'center'}}>
							<TouchableOpacity style={{width: maskSize,height: maskSize,marginBottom: 0}}
								onPressIn={() => {app.switchTexture(item)}} delayPressIn={80} activeOpacity={.5} >
								<MaskedView key={Number(item.adId)} maskElement={
									<View style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
										<Image key={Date.now() + item.adId}
											style={{width: maskSize * maskMaskScale,height: maskSize * maskMaskScale}}
											width={maskSize * maskMaskScale} height={maskSize * maskMaskScale}
											source={require('../../assets/images/maskmask.png')} defaultSource={require('../../assets/images/maskmask.png')} />
									</View>
								}>
									<Image
										fadeDuration={100} progressiveRenderingEnabled={true} style={{width: maskSize,height: maskSize,top: -(maskSize * .12)}} key={Date.now() + item.adId}
										width={maskSize} height={maskSize} source={{uri: item.url}} />
								</MaskedView>
							</TouchableOpacity>
							<View style={{flexDirection: 'row',bottom: 40,opacity: .5}}>
								<TouchableOpacity onLongPress={() => removeFav(item)} activeOpacity={.1}><Icon style={{paddingHorizontal: 11}} name='heart-remove' color={theme.colors.bad} size={34} /></TouchableOpacity>
								<TouchableOpacity onPressIn={() => {app.switchTexture(item)}} activeOpacity={.1} delayPressIn={80}><Icon style={{paddingHorizontal: 11}}
									//name='face-recognition'
									name='face'
									color={'#000'} size={34} /></TouchableOpacity>
							</View>
						</View>)
				})}
			</ScrollView>
		);
	}
}