
interface INotification {
  initiator: string,
  usersToNotify: Array<string>,
  eventType: string  
}

class Notifier {
  constructor() {
    console.log("notifier first time initialized")
  }

  createNotification(usersToNotify: Array<string>, initiator: string, eventType: string): INotification {         
    
    return {      
      usersToNotify,
      initiator,
      eventType     
    };
  }
}

const notifier = new Notifier();
export { notifier };
