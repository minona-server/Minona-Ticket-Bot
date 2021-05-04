/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const Logger = require('leekslazylogger');
const log = new Logger();
const config = require('../../user/' + require('../').config);

module.exports = {
	event: 'ready',
	execute(client, log) {
		log.success(`${client.user.tag}, ismi ile giriş yapıldı`);

		const updatePresence = () => {
			const presence = config.presences[Math.floor(Math.random() * config.presences.length)];
			let activity = presence.activity + config.append_presence;
			activity = activity.replace(/%s/g, config.prefix);
			client.user.setPresence({
				activity: {
					name: activity,
					type: presence.type.toUpperCase(),
					status: 'idle'
				}
			}).catch(log.error);
			log.debug(`Bot durumu değiştirildi: ${activity} ${presence.type}`);
		};

		updatePresence();
		setInterval(() => {
			updatePresence();
		}, 60000);


		if (client.guilds.cache.get(config.guild).member(client.user).hasPermission('ADMINISTRATOR', false)) {
			log.success('\'ADMINISTRATOR\' yetkisi bota verildi');
		} else log.warn('Bot \'ADMINISTRATOR\' yetkisine sahip değil');
	}
};
