import { isFuture, isPast } from "date-fns";
import { AdCampaign, AdItem } from "./AdsApiMapping";

//('creatives') //file names, ids, "media_group"? 
//('campaigns') //all campaigns aka "advertisement" in JSON, gives Advertiser name, id
//('schedules') //schedules only gives start/end, no link to ads, advertisers
//('zones') // just gives publisher, metadata
//('ad-items') // just all creatives and data, no links
export default class AdsApiAdButler {

  #activeAdItems = [];
  #campaignsById = new Map();
  #apiKeyTest = 'da81d8cf585242c7818d43bdddcd0769';
  #apiKeyLive = 'b87ea9fb1559cbea91d941f0be63ce9b';

  constructor() {
    // this.jsonApi_example();
    // this.restAPI_AdItems();
  }

  async fetchAll() {
    await this.#restAPI('campaign-assignments', true)
      .then(response => response.json())
      .then(json => {
        for (let k in json.data) {
          const ad = new AdItem(json.data[k].advertisement)
          this.#activeAdItems.push(ad);
          if (json.data[k].campaign) {
            const campaign = new AdCampaign(json.data[k].campaign);
            ad.campaignId = campaign.id;
            this.#campaignsById.set(campaign.id, campaign);
          }
        }
      })
  }

  //basically just for getting schedule data
  // this.adsAPI('placements', true, { limit: 9999 })
  //   .then((response) => response.json()).then((json) => {
  //     console.log(JSON.stringify(json));
  //     for (let k in json.data) {
  //       let schedule = json.data[k].schedule;
  //       // TIMEZONE IS LOS ANGELES
  //       let startDate = schedule.start_date ? parseJSON(schedule.start_date): null;
  //       let endDate = schedule.end_date ? parseJSON(schedule.end_date) : null;
  //       let unlimitedRun = startDate == null || endDate == null;
  //       let hide = !unlimitedRun && (isFuture(startDate) || isPast(endDate));
  //       // non-campaign objects returned include ad items (ad items without campaigns eg default zone ads)
  //       if (json.data[k].advertisement.object == "standard_campaign" && !hide) {
  //         // add valid, active ad items to the master list
  //         let campaignId = json.data[k].advertisement.id;
  //         if(adItemsByCampaign[campaignId]){
  //             activeAdItems.push(adItemsByCampaign[campaignId]);
  //         }
  //       }
  //     }

  // for (let k in this.activeAdItems) {
  //     console.log(`active: ${this.activeAdItems[k].name}`);
  //   }

  //   //check empty activeaditems
  // })

  //wrapper, utility
  async #adbutlerFetch(apiUrl = API_URLS.REST, params = {}, endpoint = '') {
    const apiKey = this.#apiKeyLive;
    console.log(`fetching ${apiUrl} with ${JSON.stringify(params)} to ${endpoint}`);
    if (apiUrl == API_URLS.REST) {
      const data = params ? new URLSearchParams(params) : '';
      const url = API_URLS.REST + endpoint + "?" + data;
      let response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + apiKey,
        },
      });
      return response;

    } else if (apiUrl == API_URLS.JSON) {
      let response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + apiKey,
        },
        body: JSON.stringify(params)
      })
      return response;

    }

    console.warn("No API method matching");
  }

  //ad items give image, meta, url, etc. but no start/end dates
  restAPI_AdItems = () => {
    this.#restAPI('ad-items', true)
      .then(response => response.json())
      .then(json => {
        console.log(json.data.length+" ad items fetched");
        for (const k in json.data) {
          // const e = new AdItem(json.data[k]);
        }
        console.log(JSON.stringify(json,null,1));
      })
      .catch((err) => console.warn(err));
  }

  //live: https://servedbyadbutler.com/adserve/;ID=181924;  size=0x0;     setID=492969; type=json //standard dynamic w/ Versace
  //live: https://servedbyadbutler.com/adserve/;ID=181924;  size=300x250; setID=490324; type=json
  //test: https://servedbyadbutler.com/adserve/;ID=181925;  size=300x250; setID=491194; type=json //standard zone
  //test: https://servedbyadbutler.com/adserve/;ID=181925;  size=0x0;     setID=491503; type=json //dynamic zone
  jsonApi_example = () => {
    // each successful call registers an impression
    this.#jsonApi({
      setID: '492969',
      type: 'jsonr', //jsonr for all
      ID: '181924',
    }) 
      .then(response => response.json(), reason => console.warn(reason))
      .then(json => console.log(JSON.stringify(json,null,1), reason => console.warn(reason)))
      .catch(err => {
        console.warn(err);
      });
  }

  //wrapper
  #restAPI(endpoint, expandAll = true, params = {}) {
    if (expandAll) {
      params = { ...params, ...{ expand: "all" } };
    }
    params = { ...params, ...{ limit: 9999 } }
    return this.#adbutlerFetch(API_URLS.REST, params, endpoint);
  }


  //wrapper
  #jsonApi(params = {}) {
    return this.#adbutlerFetch(API_URLS.JSON, params);
  }

}

class API_URLS {
  static get JSON() {
    return 'https://servedbyadbutler.com/adserve/';
  }
  static get REST() {
    return 'https://api.adbutler.com/v2/';
  }
}