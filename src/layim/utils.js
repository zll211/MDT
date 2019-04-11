export default class IMUtils {
  static unsubscribe(subscription) {
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
    }
  }
}
