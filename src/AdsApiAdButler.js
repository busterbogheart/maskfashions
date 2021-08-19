import {isFuture,isPast} from "date-fns";
import {AdCampaign,AdItem} from "./AdsApiMapping";

//('creatives/image') //file names only, ids, "media_group"? 
//('campaigns') //all campaigns aka "advertisement" in JSON, gives Advertiser name, id
//('schedules') //schedules only gives start/end, no link to ads, advertisers
//('zones') // just gives publisher, metadata
//('ad-items') // just all creatives and data, no links
export default class AdsApiAdButler {

  #allAdItems = [];
  #allTrackingUrls = [];
  #campaignsById = new Map();
  #apiKey = 'b87ea9fb1559cbea91d941f0be63ce9b'; //test: da81d8cf585242c7818d43bdddcd0769
  #filterSchema = {};
  #urlJSON = 'https://servedbyadbutler.com/adserve/';
  #urlREST = 'https://api.adbutler.com/v2/';
  // the data given to the FlatList, should be [{url:'', impUrl:'', clickUrl:'', adId:''}, ...]
  #allActiveAdItems = [];

  // JSON call for tracking URLs
  // REST call(s) for ad items and scheduling, filter schema
  // 

  constructor() {
    // this.restAPI_Creatives();
    // this.restAPI_AdItems();
    // this.restAPI_SelfserveInfo();
  }

  restAPI_SelfserveInfo = () => {
    this.#restAPI('self-serve/portals/405/orders',true)
      .then(response => response.json())
      .then(json => {
        console.log(JSON.stringify(json,null,1));
      })
      .catch((err) => console.warn(err));
  }

  async fetchAll() {
    await this.#restAPI('campaign-assignments',true)
      .then(response => response.json())
      .then(json => {
        for (let k in json.data) {
          const ad = new AdItem(json.data[k].advertisement)
          this.#allAdItems.push(ad);
          if (json.data[k].campaign) {
            const campaign = new AdCampaign(json.data[k].campaign);
            ad.campaignId = campaign.id;
            this.#campaignsById.set(campaign.id,campaign);
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

  #adbutlerFetch = async (apiUrl = this.#urlREST,params = {},endpoint = '') => {
    console.log(`fetching ${apiUrl} with ${JSON.stringify(params)} to ${endpoint}`);
    const data = params ? new URLSearchParams(params) : '';
    const url = this.#urlREST + endpoint + "?" + data;
    let response = await fetch(url,{
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + this.#apiKey,
      },
    });
    return response;
  }

  //ad items give image, meta, url, etc. but no start/end dates
  #restAPI_AdItems = async () => {
    let res = await this.#restAPI('ad-items',true);
    if (res.status != 200) {
      console.error('restapi failed');
    }
    let json = await res.json();
    console.log(json.data.length + " ad items fetched");

    for (const k in json.data) {
      const e = new AdItem(json.data[k]);
      if (e.creative) { // some don't have creative data (not added from Library)
        e.creative_url = `https://servedbyadbutler.com/getad.img/;libID=${e.creative.id}`;
      }
      if (e.name == 'Default Ad Item') {
        continue;
      }
      // the all important filter schema
      if (e.id == '520484750') {
        for (const k in e.metadata) {
          let arr = e.metadata[k].split(',');
          let noEmpties = arr.filter( el => el!='');
          this.#filterSchema[k] = noEmpties.map(str => str.trim());
        }
        continue;
      }
      this.#allAdItems.push(e);
    }
  };

  getFilterSchema() {
    if (this.#filterSchema.length == 0) console.error('empty schema');
    return this.#filterSchema;
  }

  putItAllTogether = () => {
    for (let ad of this.#allAdItems) {
      console.log(ad);
    }
  }

  getAdItemsWithSchema = async () => {
    // cached?
    // TODO actual asyncstorage cache
    if (this.#allAdItems.length > 1) {
      return this.#allAdItems;
    }
    // or no
    await this.#restAPI_AdItems();
    return this.#allAdItems;
  }

  restAPI_Creatives = () => {
    this.#restAPI('creatives/image',true)
      .then(response => response.json())
      .then(json => {
        for (const k in json.data) {
        }
        console.log(JSON.stringify(json,null,1));
      })
      .catch((err) => console.warn(err));
  }

  restAPI_ManualTracking = () => {
    this.#restAPI('manual-tracking-links',true,{ad_item: '520485932',placement: '1589807'})
      .then(response => response.json())
      .then(json => {
        for (const k in json.data) {
        }
        //console.log(JSON.stringify(json,null,1));
      })
      .catch((err) => console.warn(err));
  }

  //wrapper
  #restAPI = async (endpoint,expandAll = true,params = {}) => {
    if (expandAll) {
      params = {...params,...{expand: "all"}};
    }
    params = {...params,...{limit: 9999}}
    return this.#adbutlerFetch(this.#urlREST,params,endpoint);
  }
  
  //live: https://servedbyadbutler.com/adserve/;ID=181924;  size=0x0;     setID=492969; type=json //standard dynamic w/ Versace
  //live: https://servedbyadbutler.com/adserve/;ID=181924;  size=300x250; setID=490324; type=json
  //test: https://servedbyadbutler.com/adserve/;ID=181925;  size=300x250; setID=491194; type=json //standard zone
  //test: https://servedbyadbutler.com/adserve/;ID=181925;  size=0x0;     setID=491503; type=json //dynamic zone

  // JSON API only gets ad items that are ASSIGNED to zones and NOT IN EXPIRED campaigns
  #jsonAPI = async (params) => {
    console.log(`fetching ${this.#urlJSON} with ${JSON.stringify(params)}`);
    let response = await fetch(this.#urlJSON, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + this.#apiKey,
      },
      body: JSON.stringify(params)
    })
    return response;
  }


  getAdTrackingURLS = async() => {
    this.#jsonAPI({
      setID: '492969', //set = zone
      type: 'jsonr',
      ID: '181924',
    })
      .then(response => response.json())
      .then(json => {
        if (json.status != "SUCCESS") throw Error('JSON api failed');
        for (let placement of json.placements) {
          let impUrl = placement.accupixel_url;
          let clickUrl = placement.redirect_url;
          let id = placement.banner_id;
          this.#allTrackingUrls.push({
            id, impUrl, clickUrl
          });
        }
        //console.log(JSON.stringify(this.#allTrackingUrls,null,1))
      })
      .catch(err => {
        console.warn(err);
      });
  }

}
