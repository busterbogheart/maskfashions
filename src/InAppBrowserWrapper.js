import InAppBrowser from "react-native-inappbrowser-reborn"


export default class InAppBrowserWrapper {

  static async onLogin() {
    // const deepLink = this.getDeepLink("callback")
    // const url = `https://maskfashions.app?redirect_uri=${deepLink}`
    const url = 'https://google.com';
    try {
      if (await InAppBrowser.isAvailable()) {
        console.debug('using IN-APP-BROWSER');
        InAppBrowser.open(url, {
          //## iOS Properties ##
          dismissButtonStyle: 'close', //also 'done'
          preferredBarTintColor: '#33d',
          preferredControlTintColor: '#fff', //button/link text color
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'formSheet',
          modalTransitionStyle: 'coverVertical', //dont use 'partialCurl'
          modalEnabled: true,
          enableBarCollapsing: false, //like android enableurlbarhiding, when scrolling
          //## Android Properties ##
          showTitle: true,
          toolbarColor: '#00f',
          secondaryToolbarColor: "#0f0",
          navigationBarColor: '#f00',
          navigationBarDividerColor: '#ff6',
          enableUrlBarHiding: false,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          hasBackButton: false, //otherwise an X
          showInRecents: true,
        }).then((response) => {
          console.log(response);
          if (response.type === 'success' && response.url) {
            console.warn('using native linking?');
            // Linking.openURL(response.url)
          }
        })
      } else { //inappbrowser not available
        console.warn('using native Linking');
        // Linking.openURL(url)
      }
    } catch (error) {
      console.warn('using Linking (error): ' + error.toString());
      // Linking.openURL(url)
    }
  }

  static getDeepLink = (path = "") => {
    const scheme = 'my-scheme'
    const prefix = Platform.OS == 'android' ? `${scheme}://my-host/` : `${scheme}://`
    return prefix + path
  }


  
}