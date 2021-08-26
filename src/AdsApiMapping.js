
export class AdItem {
    name;
    creative_url;
    id;
    creative;
    location;
    is_self_serve;
    object;
    metadata;
    campaignId;
    advertiserId;
    advertiserName;
    weight;

    constructor(data){
      Object.assign(this, data);
    }
  }
  
  export class AdCampaign{
    object;
    id;
    advertiser;
    name;

    constructor(data){
      Object.assign(this, data);
    }
  }