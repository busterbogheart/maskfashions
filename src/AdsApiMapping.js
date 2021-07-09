
export class AdItem {
    name;
    creative_url;
    id;
    creative;
    location;
    is_self_serve;
    metadata;
    
    constructor(data){
      Object.assign(this, data);
    }
  }
  
  export class CampaignAssignment{

  }