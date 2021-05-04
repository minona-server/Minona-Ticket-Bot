/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

module.exports = {
	event: 'rateLimit',
	execute(_client, log, [limit]) {
		log.warn('Oran sınırı aşıldı! (Ayrıntılar için config dosyasında hata ayıklama modunu etkinleştirin)');
		log.debug(limit);
	}
};