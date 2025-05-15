import NodeCache from '@cacheable/node-cache';

const caches = {
 contactCache: new NodeCache({ stdTTL: 86400, checkperiod: 3600 }), 
 imgCache: new NodeCache({ stdTTL:  86400, checkperiod: 3600  }),
 msgAck: new NodeCache({ stdTTL:  86400, checkperiod: 3600  }),
 msgRead: new NodeCache({ stdTTL:  86400, checkperiod: 3600  }),   
  
};

export default caches;