
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