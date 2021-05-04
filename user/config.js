/**
 * ###############################################################################################
 *  ____                                        _     _____              _             _
 * |  _ \  (_)  ___    ___    ___    _ __    __| |   |_   _| (_)   ___  | | __   ___  | |_   ___
 * | | | | | | / __|  / __|  / _ \  | '__|  / _` |     | |   | |  / __| | |/ /  / _ \ | __| / __|
 * | |_| | | | \__ \ | (__  | (_) | | |    | (_| |     | |   | | | (__  |   <  |  __/ | |_  \__ \
 * |____/  |_| |___/  \___|  \___/  |_|     \__,_|     |_|   |_|  \___| |_|\_\  \___|  \__| |___/
 *
 * ---------------------
 *      Quick Start
 * ---------------------
 *
 * 	> For detailed instructions, visit the GitHub repository and read the documentation:
 * 	https://github.com/eartharoid/DiscordTickets/wiki
 *
 * 	> IMPORTANT: Also edit the TOKEN in 'user/.env'
 *
 * ---------------------
 *       Support
 * ---------------------
 *
 * 	> Information: https://github.com/eartharoid/DiscordTickets/#readme
 * 	> Discord Support Server: https://go.eartharoid.me/discord
 * 	> Wiki: https://github.com/eartharoid/DiscordTickets/wiki
 *
 * ###############################################################################################
 */

module.exports = {
	prefix: '-',
	name: 'Minona Roleplay',
	presences: [
		{
			activity: 'Minona Roleplay',
			type: 'LISTENING'
		},
		{
			activity: 'Minona Roleplay',
			type: 'PLAYING'
		},
		{
			activity: 'Minona Ticket',
			type: 'WATCHING'
		}
	],
	append_presence: ' | %shelp',
	colour: 'GREEN',
	err_colour: 'RED',
	cooldown: 3,
	guild: '799016118328623104', // ID of your guild (REQUIRED)
	staff_role: '835255782562857011', // ID of your Support Team role (REQUIRED)

	tickets: {
		category: '838953514675732541', // ID of your tickets category (REQUIRED)
		send_img: false,
		ping: 'here',
		text: `Merhaba, {{ tag }}!
		Bir personel kısa süre içinde size yardımcı olacaktır.
		Bu arada, lütfen sorununuzu olabildiğince ayrıntılı olarak açıklayın! :)`,
		pin: true,
		max: 1,
		default_topic: {
			command: 'Konu verilmedi',
			panel: 'Panel aracılığıyla oluşturuldu'
		}
	},

	commands: {
		close: {
			confirmation: true,
			send_transcripts: false
		},
		delete: {
			confirmation: true
		},
		new: {
			enabled: false
		},
		closeall: {
			enabled: true,
		},
	},

	transcripts: {
		text: {
			enabled: true,
			keep_for: 90,
		},
		web: {
			enabled: false,
			server: 'https://filmizlesene.epizy.com/',
		},
		channel: '838953728064618526' // ID of your archives channel
	},

	panel: {
		title: 'Destek Biletleri',
		description: 'Yardıma mı ihtiyacınız var? Sorun değil! Destek Ekibimizin size yardımcı olabilmesi için yeni bir destek bileti oluşturmak için bu panele tepki verin.',
		reaction: '🧾'
	},

	storage: {
		type: 'sqlite'
	},

	logs: {
		files: {
			enabled: true,
			keep_for: 7
		},
		discord: {
			enabled: true,
			channel: '838953586716704798' // ID of your log channel
		}
	},

	debug: false,
	updater: true
};
