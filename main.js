'use strict';

/*
 * Created with @iobroker/create-adapter v1.31.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const tvprogramrequire = require(`${__dirname}/lib/tvprogramserver.js`);
let tvprogramserver;

class Tvprogram extends utils.Adapter {
    /**
     * @param [options] {object} options
     */
    constructor(options) {
        super({
            ...options,
            name: 'tvprogram',
        });
        this.on('ready', this.onReady.bind(this));
        // @ts-expect-error statechange doesnt exist
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.on('message', this.onMessage.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // Reset the connection indicator during startup
        this.setState('info.connection', true, true);

        // Initialize your adapter here
        if (!tvprogramserver) {
            this.log.debug('main onReady open tvprogramm');
            tvprogramserver = new tvprogramrequire(this);
        }

        this.subscribeStates('*');
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback {function} called with the error object
     */
    onUnload(callback) {
        try {
            this.log.debug('main onUnload try');

            tvprogramserver.closeConnections();
            this.log.info('cleaned everything up...');
            // Reset the connection indicator during startup
            this.setState('info.connection', false, true);
            callback();
        } catch {
            this.log.debug('main onUnload error');
            callback();
        }
    }
    /**
     * Is called if a subscribed state changes
     *
     * @param id {string} The subscribed ID
     * @param state {string|number|boolean} The new state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            // @ts-expect-error val dont exist
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            if (tvprogramserver) {
                tvprogramserver.doStateChange(id, state);
            }
        } else {
            // The state was deleted
            this.log.debug(`state ${id} deleted`);
        }
    }
    onMessage(obj) {
        if (typeof obj === 'object' && obj.message) {
            tvprogramserver.processMessages(obj);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param [options] {object}
     */
    module.exports = options => new Tvprogram(options);
} else {
    // otherwise start the instance directly
    new Tvprogram();
}
