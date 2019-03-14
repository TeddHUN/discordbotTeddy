const config = require('./config.json');

const TwitchApi = require('twitch-api');

class TwitchMonitor {
    static start() {
        this.client = new TwitchApi({
            clientId: config.twitch_client_id,
            clientSecret: config.twitch_client_secret
        });

        let checkIntervalMs = parseInt(config.twitch_check_interval_ms);

        if (isNaN(checkIntervalMs) || checkIntervalMs < TwitchMonitor.MIN_POLL_INTERVAL_MS) {
            checkIntervalMs = TwitchMonitor.MIN_POLL_INTERVAL_MS;
        }

        setInterval(() => {
            this.refresh();
        }, checkIntervalMs);

        console.log('[TwitchMonitor]', `Twitch csatornák figyelése ${checkIntervalMs}ms időközönként. (${config.twitch_channels})`);

        setTimeout(() => {
            this.refresh();
        }, 10000);
    }

    static refresh() {
        if (!config.twitch_channels) {
            console.warn('[TwitchMonitor]', 'Nincs csatorna beállítva!');
            return;
        }

        if (this.eventBufferStartTime) {
            let now = Date.now();
            let timeSinceMs = now - this.eventBufferStartTime;

            if (timeSinceMs >= TwitchMonitor.EVENT_BUFFER_MS) {
                this.eventBufferStartTime = null;
            } else {
                return;
            }
        }

        let params = {
            "channel": config.twitch_channels
        };

        this.client.getStreams(params, (idk, data) => {
            if (data && data.streams) {
                this.handleStreamList(data);
            } else {
                console.warn('[TwitchMonitor]', 'Nem kaptam információt az API-től.')
            }
        });
    }

    static handleStreamList(data) {
        let nextOnlineList = [];

        for (let i = 0; i < data.streams.length; i++) {
            let _stream = data.streams[i];
            let channelName = _stream.channel.name;

            this.channelData[channelName] = _stream.channel;
            this.streamData[channelName] = _stream;

            nextOnlineList.push(_stream.channel.name);
        }

        let notifyFailed = false;
        let anyChanges = false;

        for (let i = 0; i < nextOnlineList.length; i++) {
            let _chanName = nextOnlineList[i];

            if (this.activeStreams.indexOf(_chanName) === -1) {
                console.log('[TwitchMonitor]', 'Egy csatorna élőben közvetít:', _chanName);
                anyChanges = true;
            }

            if (!this.handleChannelLiveUpdate(this.channelData[_chanName], this.streamData[_chanName], true)) {
                notifyFailed = true;
            }
        }

        for (let i = 0; i < this.activeStreams.length; i++) {
            let _chanName = this.activeStreams[i];

            if (nextOnlineList.indexOf(_chanName) === -1) {
                console.log('[TwitchMonitor]', 'Egy csatorna már nem közvetít:', _chanName);
                this.handleChannelOffline(this.channelData[_chanName], this.streamData[_chanName]);
                anyChanges = true;
            }
        }

        if (!notifyFailed) {
            this.activeStreams = nextOnlineList;

            if (anyChanges) {
                this.eventBufferStartTime = Date.now();
            }
        } else {
            console.log('[TwitchMonitor]', 'Nem sikerült az értesítés, későbbi újra próbálás.');
        }
    }

    static handleChannelLiveUpdate(channelObj, streamObj, isOnline) {
        for (let i = 0; i < this.channelLiveCallbacks.length; i++) {
            let _callback = this.channelLiveCallbacks[i];

            if (_callback) {
                if (_callback(channelObj, streamObj, isOnline) === false) {
                    return false;
                }
            }
        }

        return true;
    }

    static handleChannelOffline(channelObj, streamObj) {
        this.handleChannelLiveUpdate(channelObj, streamObj, false);

        for (let i = 0; i < this.channelOfflineCallbacks.length; i++) {
            let _callback = this.channelOfflineCallbacks[i];

            if (_callback) {
                if (_callback(channelObj) === false) {
                    return false;
                }
            }
        }

        return true;
    }

    static onChannelLiveUpdate(callback) {
        this.channelLiveCallbacks.push(callback);
    }

    static onChannelOffline(callback) {
        this.channelOfflineCallbacks.push(callback);
    }
}

TwitchMonitor.eventBufferStartTime = 0;
TwitchMonitor.activeStreams = [];
TwitchMonitor.channelData = { };
TwitchMonitor.streamData = { };

TwitchMonitor.channelLiveCallbacks = [];
TwitchMonitor.channelOfflineCallbacks = [];

TwitchMonitor.EVENT_BUFFER_MS = 2 * 60 * 1000;
TwitchMonitor.MIN_POLL_INTERVAL_MS = 1 * 60 * 1000;

module.exports = TwitchMonitor;
