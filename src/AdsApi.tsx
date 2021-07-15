    //ad items give image, meta, url, etc. but no start/end dates
    let adApiAditems = () => {
        this.adsAPI('ad-items', true)
          .then((response) => response.json())
          .then((json) => {
            // console.log(json.data.length+" ad items fetched");
            for (const k in json.data) {
              const e = new AdItem(json.data[k]);
            }
            console.log(JSON.stringify(json));
          })
          .catch((err) => console.warn(err));
      };
  
  
      //this.adsAPI('campaigns') //all campaigns aka "advertisement" in JSON, gives Advertiser name, id
      // this.adsAPI('schedules', true) //schedules only gives start/end, no link to ads, advertisers
      // this.adsAPI('zones', true) // just gives publisher, metadata
      // this.adsAPI('ad-items', true) // just all creatives and data, no links
  
      //represents ad items mapped to campaigns, has advertiser id, campaign id, all ad info
      // this.adsAPI('campaign-assignments', true)
  
      //a campaign's placement in a zone, this gives all, ungrouped
      //with schedule data!! also advertisement ids (campaign), zone id
      //this.adsAPI('placements', true)
  
  
      var adItemsByCampaign:{campaignId:number, ad:AdItem};
      var activeAdItems:any = [];
  
      //get all ad items, key on campaign id
      this.adsAPI('campaign-assignments', true, { limit: 9999 })
      .then((response) => response.json()).then((json) => {
          // console.log(JSON.stringify(json));
          for (let k in json.data) {
            const ad = new AdItem(json.data[k].advertisement);
            let id:number = json.data[k].campaign.id;
            adItemsByCampaign[id] = ad;
          }
        });
  
      //basically just for getting schedule data
      this.adsAPI('placements', true, { limit: 9999 })
        .then((response) => response.json()).then((json) => {
          console.log(JSON.stringify(json));
          for (let k in json.data) {
            let schedule = json.data[k].schedule;
            // TIMEZONE IS LOS ANGELES
            let startDate = schedule.start_date ? parseJSON(schedule.start_date): null;
            let endDate = schedule.end_date ? parseJSON(schedule.end_date) : null;
            let unlimitedRun = startDate == null || endDate == null;
            let hide:boolean = !unlimitedRun && (isFuture(startDate) || isPast(endDate));
            // non-campaign objects returned include ad items (ad items without campaigns eg default zone ads)
            if (json.data[k].advertisement.object == "standard_campaign" && !hide) {
              // add valid, active ad items to the master list
              let campaignId = json.data[k].advertisement.id;
              if(adItemsByCampaign[campaignId]){
                  activeAdItems.push(adItemsByCampaign[campaignId]);
              }
            }
  
          }
  
        for (let k in this.activeAdItems) {
            console.log(`active: ${this.activeAdItems[k].name}`);
          }
  
          //check empty activeaditems
        });
    }
  
    async adsAPI(endpoint, expandAll = false, data = {}) {
      if (expandAll) {
        data = { ...data, ...{ expand: "all" } };
      }
      const apiKey = 'da81d8cf585242c7818d43bdddcd0769';
      const params = data ? new URLSearchParams(data) : '';
      const url = "https://api.adbutler.com/v2/" + endpoint + "?" + params;
      let response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + apiKey,
        },
      });
      return response;
    }
  