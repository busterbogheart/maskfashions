
export class AdsApiAdserverOnline {

  getAditems = () => {
    this.adsAPI()
      .then((response) => response.json())
      .then((json) => {
        // console.log(json.data.length+" ad items fetched");
        for (const k in json.data) {
          // const e = new AdItem(json.data[k]);
        }
        console.log(JSON.stringify(json));
      })
      .catch((err) => console.warn(err));
  }

  adItemsByCampaign = {};
  activeAdItems = [];

  adsAPI = async(endpoint = 'bidder', data = {}) => {
    let zoneId = "75166";
    const url = `https://srv.aso1.net/rtb/${endpoint}?zid=${zoneId}&ckey=bs9vm`;
    const params = data ? new URLSearchParams(data) : '';
    let response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ',
      },
    });
    return response;
  }


}