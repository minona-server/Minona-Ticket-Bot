/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');
const archive = require('../modules/archive');

module.exports = {
	name: 'close',
	description: 'Bir ticket kapatın; ya belirtilen (bahsedilen) bir kanal ya da komutun kullanıldığı kanal.',
	usage: '[ticket]',
	aliases: ['none'],
	example: 'close #ticket-17',
	args: false,
	async execute(client, message, _args, log, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle('❌ **Bu bir ticket kanalı değil**')
			.setDescription('Kapatmak istediğiniz bilet kanalında bu komutu kullanın veya kanaldan bahsedin.')
			.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
			.setFooter(guild.name, guild.iconURL());

		let ticket;
		let channel = message.mentions.channels.first();
		// || client.channels.resolve(await Ticket.findOne({ where: { id: args[0] } }).channel) // channels.fetch()

		if (!channel) {
			channel = message.channel;

			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) return message.channel.send(notTicket);
		} else {
			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) {
				notTicket
					.setTitle('❌ **Kanal bir ticket değil**')
					.setDescription(`${channel} bir bilet kanalı değil.`);
				return message.channel.send(notTicket);
			}

		}

		let paths = {
			text: join(__dirname, `../../user/transcripts/text/${ticket.get('channel')}.txt`),
			log: join(__dirname, `../../user/transcripts/raw/${ticket.get('channel')}.log`),
			json: join(__dirname, `../../user/transcripts/raw/entities/${ticket.get('channel')}.json`)
		};

		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **Yetkin Yetersiz**')
					.setDescription(`${channel} size ait olmadığı ve personel olmadığınız için kapatma izniniz yok.`)
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);

		
		if (config.commands.close.confirmation) {
			let success;
			let pre = fs.existsSync(paths.text) || fs.existsSync(paths.log)
				? `Arşivlenmiş bir sürümü daha sonra \`${config.prefix}transcript ${ticket.id}\` ile görüntüleyebileceksiniz.`
				: '';
				
			let confirm = await message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❔ Emin misin?')
					.setDescription(`${pre}\n**Onaylamak için ✅ ile tepki verin.**`)
					.setFooter(guild.name + ' | 15 saniye içinde silinecek', guild.iconURL())
			);

			await confirm.react('✅');

			const collector = confirm.createReactionCollector(
				(r, u) => r.emoji.name === '✅' && u.id === message.author.id, {
					time: 15000
				});

			collector.on('collect', async () => {
				if (channel.id !== message.channel.id) {
					channel.send(
						new MessageEmbed()
							.setColor(config.colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle('**Ticket kapatıldı**')
							.setDescription(`Ticket'ı kapatan ${message.author}`)
							.setFooter(guild.name, guild.iconURL())
					);
				}

				confirm.reactions.removeAll();
				confirm.edit(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`✅ **${ticket.id} bileti kapatıldı**`)
						.setDescription('İçerik arşivlendikten sonra kanal birkaç saniye içinde otomatik olarak silinecektir.')
						.setFooter(guild.name, guild.iconURL())
				);
				

				if (channel.id !== message.channel.id)
					message.delete({
						timeout: 5000
					}).then(() => confirm.delete());
				
				success = true;
				close();
			});


			collector.on('end', () => {
				if (!success) {
					confirm.reactions.removeAll();
					confirm.edit(
						new MessageEmbed()
							.setColor(config.err_colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle('❌ **Süresi doldu**')
							.setDescription('Tepki vermen çok uzun sürdü; onaylama başarısız oldu.')
							.setFooter(guild.name, guild.iconURL()));

					message.delete({
						timeout: 10000
					}).then(() => confirm.delete());
				}
			});
		} else {
			close();
		}

		
		async function close () {
			let users = [];

			if (config.transcripts.text.enabled || config.transcripts.web.enabled) {
				let u = await client.users.fetch(ticket.creator);
				if (u) {
					let dm;
					try {
						dm = u.dmChannel || await u.createDM();
					} catch (e) {
						log.warn(`${u.tag} ile DM kanalı oluşturulamadı`);
					}

					let res = {};
					const embed = new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`Ticket ${ticket.id}`)
						.setFooter(guild.name, guild.iconURL());

					if (fs.existsSync(paths.text)) {
						embed.addField('Konuşma özeti', 'Özeti Gör');
						res.files = [{
							attachment: paths.text,
							name: `ticket-${ticket.id}-${ticket.get('channel')}.txt`
						}];
					}

					if (fs.existsSync(paths.log) && fs.existsSync(paths.json)) {
						let data = JSON.parse(fs.readFileSync(paths.json));
						for (u in data.entities.users) users.push(u);
						embed.addField('Web archive', await archive.export(Ticket, channel)); // this will also delete these files
					}

					if (embed.fields.length < 1) {
						embed.setDescription(`Bilet için metin dökümü veya arşiv verisi yok ${ticket.id}`);
					}

					res.embed = embed;

					try {
						if (config.commands.close.send_transcripts) dm.send(res);
						if (config.transcripts.channel.length > 1) client.channels.cache.get(config.transcripts.channel).send(res);
					} catch (e) {
						message.channel.send('❌ DM veya konuşma özeti gönderilemedi');
					}
				}
			}

			// update database
			ticket.update({
				open: false
			}, {
				where: {
					channel: channel.id
				}
			});

			// delete channel
			channel.delete({
				timeout: 5000
			});

			log.info(`${message.author.tag} ticket'ı kapattı (#ticket-${ticket.id})`);

			if (config.logs.discord.enabled) {
				let embed = new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`Ticket ${ticket.id} kapatıldı`)
					.addField('Açan', `<@${ticket.creator}>`, true)
					.addField('Kapatan', message.author, true)
					.setFooter(guild.name, guild.iconURL())
					.setTimestamp();

				if (users.length > 1)
					embed.addField('Üye', users.map(u => `<@${u}>`).join('\n'));

				client.channels.cache.get(config.logs.discord.channel).send(embed);
			}
		}
	}
};
