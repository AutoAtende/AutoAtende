import { jaroWinkler } from "@skyra/jaro-winkler";

export const searchQueues = (selectedOption, queues) => {
    if (selectedOption) return null;
    let choosenQueue = null;
    const keyword = selectedOption.toLowerCase();
    for (let queue of queues) {
      let similarity = jaroWinkler(queue.name.toLowerCase(), keyword);
  
      if (similarity >= 0.8) {
        choosenQueue = queue;
        break;
      }
  
      if (queue.keywords && queue.keywords.length > 0) {
        let splitKeywords = queue.keywords.split(", ");
  
        for (let key of splitKeywords) {
          similarity = jaroWinkler(queue.name.toLowerCase(), keyword);
  
          if (similarity >= 0.8) {
            choosenQueue = queue;
            break;
          }
        }
      }
    }
    return choosenQueue;
  };