import { logger } from './utils';

export default function captureSpeakingEvent(riffServer, username, roomName, token) {
  /*
   * returns a function to consume speaking data + offload it to server,
   * closing over the server + userinfo args
   */
  return function(data) {
    logger.debug('captureSpeakingEvent: username', username)
    riffServer.service('utterances').create({
      'participant': username,
      'room': roomName,
      'startTime': data.start.toISOString(),
      'endTime': data.end.toISOString(),
      'token': token
    }).then(function (res) {
      logger.debug('captureSpeakingEvent: speaking event recorded!', res);
      var start = new Date(res['startTime']);
      var end = new Date(res['endTime']);
      var duration = end - start;
      logger.debug('captureSpeakingEvent: duration', duration);
    }).catch(function (err) {
      logger.error('ERROR:', err)
    })
  }
}
