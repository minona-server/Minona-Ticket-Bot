/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'Yardım menüsünü göster',
	usage: '[command]',
	aliases: ['command', 'commands'],
	example: 'help new',
	args: false,
	execute(client, message, args, log, { config }) {
		const guild = client.guilds.cache.get(config.guild);

		const commands = Array.from(client.commands.values());

		if (!args.length) {
			let cmds = [];

			for (let command of commands) {
				if (command.hide || command.disabled) continue;
				if (command.permission && !message.member.hasPermission(command.permission)) continue;

				let desc = command.description;

				if (desc.length > 50) desc = desc.substring(0, 50) + '...';
				cmds.push(`**${config.prefix}${command.name}** **·** ${desc}`);
			}

			message.channel.send(
				new MessageEmbed()
					.setTitle('Komutlar')
					.setColor(config.colour)
					.setDescription(
						`\nErişiminiz olan komutlar aşağıda listelenmiştir. Belirli bir komut hakkında daha fazla bilgi için \`${config.prefix}help [command]\` yazın.
						\n${cmds.join('\n\n')}
						\nYardıma ihtiyacınız varsa lütfen bir personel ile iletişime geçin.`
					)
					.setFooter(guild.name, guild.iconURL())
			).catch((error) => {
				log.warn('Yardım menüsü gönderilemedi');
				log.error(error);
			});

		} else {
			const name = args[0].toLowerCase();
			const command = client.commands.get(name) || client.commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command)
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`❌ **Geçersiz komut adı ** (\`${config.prefix}help\`)`)
				);


			const cmd = new MessageEmbed()
				.setColor(config.colour)
				.setTitle(command.name);


			if (command.long) cmd.setDescription(command.long);
			else cmd.setDescription(command.description);

			if (command.aliases) cmd.addField('Aliases', `\`${command.aliases.join(', ')}\``, true);

			if (command.usage) cmd.addField('Usage', `\`${config.prefix}${command.name} ${command.usage}\``, false);

			if (command.usage) cmd.addField('Example', `\`${config.prefix}${command.example}\``, false);


			if (command.permission && !message.member.hasPermission(command.permission)) {
				cmd.addField('Gerekli İzin', `\`${command.permission}\` :exclamation: Bu komutu kullanma izniniz yok`, true);
			} else cmd.addField('Gerekli İzin', `\`${command.permission || 'none'}\``, true);

			message.channel.send(cmd);
		}

		// command ends here
	},
};