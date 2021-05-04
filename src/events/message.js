/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { Collection, MessageEmbed } = require('discord.js');
const archive = require('../modules/archive');

module.exports = {
	event: 'message',
	async execute(client, log, [message], {config, Ticket, Setting}) {

		const guild = client.guilds.cache.get(config.guild);

		if (message.channel.type === 'dm' && !message.author.bot) {
			log.console(`Adlı kişiden bir DM alındı ${message.author.tag}: ${message.cleanContent}`);
			return message.channel.send(`Merhaba, ${message.author.username}!
Ben **${guild}** adlı sunucunun destek botuyum.
Type \`${config.prefix}new\` sunucuda yeni bir bilet oluşturmak için.`);
		} // stop here if is DM

		/**
		 * Ticket transcripts
		 * (bots currently still allowed)
		 */

		let ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
		if (ticket) {
			archive.add(message); // add message to archive
			// Update the ticket updated at so closeall can get most recent
			ticket.changed('updatedAt', true);
			ticket.save();
		}

		if (message.author.bot || message.author.id === client.user.id) return; // goodbye bots


		/**
		 * Command handler
		 * (no bots / self)
		 */

		const regex = new RegExp(`^(<@!?${client.user.id}>|\\${config.prefix.toLowerCase()})\\s*`);
		if (!regex.test(message.content.toLowerCase())) return; // not a command

		const [, prefix] = message.content.toLowerCase().match(regex);
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command || commandName === 'none') return; // not an existing command

		if (message.guild.id !== guild.id) return message.reply(`Bu bot yalnızca "${guild}" sunucusu içinde kullanılabilir`); // not in this server

		if (command.permission && !message.member.hasPermission(command.permission)) {
			log.console(`${message.author.tag}, '${command.name}' komutunu izinsiz kullanmayı denedi`);
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle('❌ Yetki Yetersiz')
					.setDescription(`**Bu komutu kullanmana izin yok. \`${command.name}\` komut** (gereksinim \`${command.permission}\`).`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (command.args && !args.length) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.addField('Usage', `\`${config.prefix}${command.name} ${command.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${command.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());

		const now = Date.now();
		const timestamps = client.cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || config.cooldown) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				log.console(`${message.author.tag}, bekleme süresi bitmeden '${command.name}' komutunu kullanmaya çalıştı`);
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`❌ Lütfen \`${command.name}\` komutunu yeniden kullanmadan önce ${timeLeft.toFixed(1)} saniye bekleyin.`)
						.setFooter(guild.name, guild.iconURL())
				);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(client, message, args, log, {config, Ticket, Setting});
			log.console(`${message.author.tag}, '${command.name}' komutunu kullandı`);
		} catch (error) {
			log.warn(`'${command.name}' komutu yürütülürken bir hata oluştu`);
			log.error(error);
			message.channel.send(`❌ \`${command.name}\` komutu yürütülürken bir hata oluştu.`);
		}
	}
};
