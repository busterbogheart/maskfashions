import {AdCampaign,AdItem} from "./AdsApiMapping";
import Config from 'react-native-config';
import {isFuture, isPast, parseJSON} from "date-fns";

//('creatives/image') //file names only, ids, "media_group"? 
//('campaigns') //all campaigns aka "advertisement" in JSON, gives Advertiser name, id
//('schedules') //schedules only gives start/end, no link to ads, advertisers
//('zones') // just gives publisher, metadata
//('ad-items') // just all creatives and data, no links
export default class AdsApiAdButler {

  constructor() {
    console.debug('ADBUTLER <<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + Config.IS_RELEASE);
    this.#apiKey = Config.ADBUTLER_API_KEY + (Config.ASTROBAGEL_KEY.substr(0,2));
  }

  #allAdItems = [];
  #adItemsInCampaigns = {};
  #advertisers = {};
  #allTrackingUrls = {}; //keyed on banner id aka adId
  #apiKey;
  #accountNo = Config.ADBUTLER_ACCT;
  #filterSchema = {};
  #urlJSON = 'https://servedbyadbutler.com/adserve/';
  #urlREST = 'https://api.adbutler.com/v2/';
  #RESTlimit = 100;
  #mainZoneId = Config.ADBUTLER_MAIN_ZONE;


  // represents ad items and campaign id relationship
  fetchCampaignAssignments = async () => {
    await this.#restAPI('campaign-assignments',true)
      .then(response => response.json())
      .then(json => {
        //console.debug(json.data.length + ' campaign assignments fetched')
        //console.log("CAMPAIGNS\n\n",JSON.stringify(json.data,null,1));
        for (const k of json.data) {
          if (k.object == 'campaign_assignment' && k.advertisement && k.campaign) {
            const adId = k.advertisement.id;
            const weight = k.weight;
            const advertiserId = k.campaign.advertiser;
            const campaignId = k.campaign.id;
            this.#adItemsInCampaigns[adId] = {
              weight,advertiserId,campaignId
            };
          }
        }
      })
  }

  fetchAdvertisers = async () => {
    await this.#restAPI('advertisers',true)
      .then(response => response.json())
      .then(json => {
        for (const adr of json.data) {
          if (adr.object == 'advertiser') {
            this.#advertisers[adr.id] = {
              name: adr.name,
            };
          }
        }
      })
      .catch((err) => console.warn(err));
  }

  fetchPlacements = async () => {
    await this.#restAPI('placements',true)
      .then(response => response.json())
      .then(json => {
        //console.log(JSON.stringify(json,null,1));
        for (const k in json.data) {
          const placement = json.data[k];
          if (placement && placement.object == 'placement' && placement.advertisement.object == 'standard_campaign') {
            // adId is not in this response
            const isActive = placement.active; //for ad items, not campaigns
            const schedule = placement.schedule;
            const campaign = placement.advertisement;
            const advertiserId = campaign.advertiser;
            const campaignId = campaign.id;
            const campName = campaign.name;
            // TIMEZONE IS LOS ANGELES
            let startDate = schedule.start_date ? parseJSON(schedule.start_date) : null;
            let endDate = schedule.end_date ? parseJSON(schedule.end_date) : null;
            let unlimitedRun = startDate == null || endDate == null;
            let hide = !unlimitedRun && (isFuture(startDate) || isPast(endDate));
            // add schedule data to individual ad items
            for (const adId in this.#adItemsInCampaigns) {
              const ad = this.#adItemsInCampaigns[adId];
              if (ad.campaignId == campaignId) {
                ad.isEnded = isPast(endDate);
                ad.isFuture = isFuture(startDate);
                ad.unlimitedRun = unlimitedRun;
                ad.campName = campName;
                ad.isActive = !hide;
              }
            }
          }
        }
      })
      .catch((err) => console.warn(err));
  }

  #adbutlerFetch = async (apiUrl = this.#urlREST,params = {},endpoint = '') => {
    console.log(`fetching REST api with ${JSON.stringify(params)} to ${endpoint}`);
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
    await this.fetchCampaignAssignments();
    await this.fetchAdvertisers();
    await this.fetchPlacements();
    if (res.status != 200) {
      throw Error('REST API status not 200')
    }
    let json = await res.json();
    if (json.has_more == true) {
      console.warn('hit REST limit');
    }
    //console.log(json.data.length + " ad items fetched");
    //console.log("AD ITEMS\n\n",JSON.stringify(json.data,null,1));
    for (const k in json.data) {
      const e = new AdItem(json.data[k]);
      if (e.creative) { // some don't have creative data (not added from Library)
        e.creative_url = `https://servedbyadbutler.com/getad.img/;libID=${e.creative.id}`;
      }
      if (e.name == 'Default Ad Item') {
        continue;
      }
      // the all important filter schema, prod and test env respectively
      if (e.id == '520484750' || e.id == '520496803') {
        for (const k in e.metadata) {
          let arr = e.metadata[k].split(',');
          let noEmpties = arr.filter(el => el != '');
          this.#filterSchema[k] = noEmpties.map(str => str.trim());
        }
        continue;
      }

      if (this.#adItemsInCampaigns[e.id]) {
        const cmp = this.#adItemsInCampaigns[e.id];
        Object.assign(e,cmp);
        this.#allAdItems.push(e);
      }
      if (this.#advertisers[e.advertiserId] && this.#advertisers[e.advertiserId].name) {
        const adv = this.#advertisers[e.advertiserId];
        e.advertiserName = adv.name;
        //add brand in metadata for filtering
        e.metadata.brand = adv.name;
      }
    }
    //console.log(JSON.stringify(this.#allAdItems,null,1))
  };

  getFilterSchema() {
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
        //console.log(JSON.stringify(json,null,1));
      })
      .catch((err) => console.warn(err));
  }

  restAPI_Campaigns = () => {
    this.#restAPI('campaigns',true)
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
    params = {...params,...{limit: this.#RESTlimit}}
    return this.#adbutlerFetch(this.#urlREST,params,endpoint);
  }

  // JSON API only gets ad items that are ASSIGNED to zones and NOT IN EXPIRED campaigns
  #jsonAPI = async (params) => {
    console.log(`fetching JSON api with ${JSON.stringify(params)}`);
    let response = await fetch(this.#urlJSON,{
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

  getAdTrackingURLS = async () => {
    const _getURLS = async () => {
      return this.#jsonAPI({
        setID: this.#mainZoneId, //set = zone
        type: 'jsonr',
        ID: this.#accountNo,
      })
        .then(response => response.json())
        .then(json => {
          //console.log(JSON.stringify(json,null,1));
          if (json.status != "SUCCESS") throw Error('JSON api failed');
          for (let placement of json.placements) {
            let id = placement.banner_id;
            let impUrl = placement.accupixel_url;
            let clickUrl = placement.redirect_url;
            let convUrl = `https://servedbyadbutler.com/convtrack.spark?MID=${this.#accountNo}&BID=${id}`;
            this.#allTrackingUrls[id] = {
              impUrl,clickUrl,convUrl
            };
          }
        })
    }

    return _getURLS()
      .then(() => {
        //console.log('got tracking URLs');
        return this.#allTrackingUrls;
      })
      .catch(e => {
        console.warn('get tracking failed, trying again');
        _getURLS();
        return this.#allTrackingUrls;
      })

  }

}
