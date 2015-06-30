// http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
function hashCode(str) { // java String#hashCode
	str = toId(str);
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 
function intToARGB(i){
    return ((i>>24)&0xFF).toString(16) + 
           ((i>>16)&0xFF).toString(16) + 
           ((i>>8)&0xFF).toString(16) + 
           (i&0xFF).toString(16);
}
function hashColor(str) {
	return "#" + intToARGB(hashCode(str));
}

function newurl(url) {
	window.history.pushState({}, "", url);
}
function cookie(c_name, value, exdays) {
	if (value !== undefined) {
		if (value === "") return eatcookie(c_name);
		if (!exdays) exdays = 7;
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
		return;
	}
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g,"");
		if (x == c_name) {
			return unescape(y);
		}
	}
}
function eatcookie(name) {
	document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}
function timestamp() {
	var d = new Date();
	var hours = d.getHours() + "",
		minutes = d.getMinutes() + "",
		seconds = d.getSeconds() + "";
	if (hours.length == 1) hours = "0" + hours;
	if (minutes.length == 1) minutes = "0" + minutes;
	if (seconds.length == 1) seconds = "0" + seconds;
	var timestamp = "(" + hours + ":" + minutes + ":" + seconds + ")";
	return timestamp;
}
function urlify(str) {
	return str.replace(/(https?\:\/\/[a-z0-9-.]+(\/([^\s]*[^\s?.,])?)?|[a-z0-9]([a-z0-9-\.]*[a-z0-9])?\.(com|org|net|edu|tk)((\/([^\s]*[^\s?.,])?)?|\b))/ig, '<a href="$1" target="_blank">$1</a>').replace(/<a href="([a-z]*[^a-z:])/g, '<a href="http://$1').replace(/(\bgoogle ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&q=$2" target="_blank">$1</a>').replace(/(\bgl ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$2" target="_blank">$1</a>').replace(/(\bwiki ?\[([^\]<]+)\])/ig, '<a href="http://en.wikipedia.org/w/index.php?title=Special:Search&search=$2" target="_blank">$1</a>').replace(/\[\[([^< ]([^<`]*?[^< ])?)\]\]/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$1" target="_blank">$1</a>');
}
function string(str) {
	if (typeof str === 'string' || typeof str === 'number') return '' + str;
	return '';
}
function toId(text) {
	if (text && text.id) text = text.id;
	else if (text && text.userid) text = text.userid;
	return string(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}
function escapeHTML(txt) {
	return $('<div/>').text(txt).html();
}
function allToNum(obj) {
	if (typeof obj === "string") return Number(obj);
	for (var i in obj) {
		if (obj[i] === "") {
			obj.splice(i, 1); //delete blank entries
			continue;
		}
		obj[i] = Number(obj[i]);
	}
	return obj;
}
var helpers = {
    isAndroid: function() {
        return navigator.userAgent.match(/Android/i);
    },
    isBlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    isIOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    isOpera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    isWindows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    isMobile: function() {
        return (this.isAndroid() || this.isBlackBerry() || this.isIOS() || this.isOpera() || this.isWindows());
    }
};

var app = {};
var ate = {
	init: function() {
		app = this;
		app.parseURL = function() {
			var path = window.location.pathname;
			if (path.split('replay-').length - 1 > 0) {
				var replayId = path.substr(("/replay-").length);
				this.replaying = replayId;
				this.socket.emit('replay', {id: replayId});
			}
			if (path.split('duel-').length - 1 > 0) {
				var duelId = path.substr(("/duel-").length);
				this.socket.emit('watch', {id: duelId});
				newurl("/");
			}
		};
		app.init = function() {
			this.decks = [];
			this.deck = [];
			this.events = {
				"duels": function(data) {
					data.splice(0, 1);
					var duels = new Array(),
						insides = '';
					for (var i in data) {
						if (data == "") continue;
						var d = data[i].split(',');
						duels.push(d);
						insides += '<a href="/duel-' + d[0] + '" class="gameDiv">';
							insides += '[' + d[1] + ']';
							insides += '<h3>' + escapeHTML(d[2]) + ' VS. ' + escapeHTML(d[3]) + '</h3>';
						insides += '</a>';
					}
					insides = '<br /><hr /><h2>' + duels.length + ' duels.</h2><input class="btn" type="button" value="Refresh Duels" onclick="app.socket.emit(\'duels\');" />' + insides;
					$("#duels").html(insides);
				},
				"decks": function(data) {
					data.splice(0, 1);
					var decks = data;//the break between deck names should be "|" so it should already be an array
					app.decks = decks;
				},
				"deckString": function(data) {
					var id = data[1];
					data.splice(0, 2);
					var deckString = data.join('|');
					if (isNaN(id)) {
						alert("Bad ID", "The id '" + id + "' is invalid. Maybe create a function that gets the id based on this deck name.", "error");
					}
					app.deck[id] = deckString;
				},
				"err": function(data) {
					app.prompt({
						type: "error",
						err: data[1]
					});
				},
				"search": function(data) {
					if (Number(data[1])) {
						//finding
						$("#findDuel").html("Cancel Find Duel");
					} else {
						//canceling
						$("#findDuel").html("Find Duel");
					}
				},
				"g": function(data) {
					//all events that have to do with the game
					data.splice(0, 1);
					switch (data[0]) {
						default:
						//all the animations are pushed to queue
						app.game.queue.push([data[0], data]);
						app.game.processQueue();
						break;

						case 'start':
							var game = app.game = new Game(data);
							game.parseStartData(game.unparsedData);
							delete game.unparsedData;
							break;
					}
				},
				"replay": function(data) {
					data.splice(0, 1);
					var events = data.join('|').split('\n');
					for (var i in events) {
						var event = "g|" + events[i];
						event = event.split('|');
						this.g(event);
					}
				},
				"newreplay": function(data) {
					var id = data[1];
					var opponent = data[2];
					ate.focusedRoom.addLog('<a href="/replay-' + id + '" target="_BLANK">Click here to see a replay of your duel against <b>' + opponent + '</b></a>');
				},
				"chall": function(data) {
					data.splice(0, 1);
					for (var i in data) {
						var chall = data[i].split(',');
						app.addChallenge(chall[0], chall[1], chall[2]);
					}
				},
				"reject": function(data) {
					app.removeChallenge(data[1]);
				},
				"ladder": function(data) {
					$("#leaderboard .ladder").html(data[1]);
				}
			};
			$("#builder").attr('src', './builder.html');
		};
		app.challengePrompt = function(opponent) {
			this.addChallenge(this.userid, toId(opponent.substr(1)));
		};
		app.addChallenge = function(sender, receiver, tier) {
			var sendOrAcceptChallenge = function(self, type) {
				var form = $(self).parent();
				var opponent = form.find('#opponent').text();
				var deck = form.find('#deck').val();
				var tier = form.find('#tier').val();
				console.log(form)
				if (!deck && toId(tier) !== "random") return alert('Oops!', 'No deck.', 'error');
				var obj = {
					opponent: opponent,
					tier: tier,
					deck: deck
				};
				if (app.deck[deck]) obj.deckString = app.deck[deck];
				app.socket.emit(((type === 'send') ? 'challenge' : 'accept'), obj);
			};
			var otherUser = sender;
			var fromTo = 'from';
			if (sender === ate.userid) otherUser = receiver;
			if (sender === ate.userid) fromTo = 'to';
			$('#chall' + otherUser).remove();
			var challenge = $('<div id="chall' + otherUser + '" class="challenge"></div>');
			challenge.append('<h4>Challenge ' + fromTo + ' <span id="opponent">' + otherUser + '</span></h4>');
			challenge.append('<hr />');
			var tierChoices = '';
			var ray = ["Random", "Advanced", "Traditional", "Unlimited"];
			for (var i in ray) {
				tierChoices += '<option>' + ray[i] + '</option>';
			}
			var tiers = $('<div><label>Type:</label> <select id="tier">' + tierChoices + '</select></div>');
			if (tier) {
				tiers.find('select').val(tier).prop("disabled", true);
			}
			challenge.append(tiers);
			if (!tier || fromTo === 'from') {
				//only add deck selection if this is a new challenge prompt OR it's a challenge you received
				var decks = $('<div><label>Deck:</label> <select id="deck"></select></div>');
				var deckCount = app.decks.length;
				var buff = '';
				for (var i = 0; i < deckCount; i++) {
					buff += '<option>' + app.decks[i] + '</option>';
				}
				decks.find('select').html(buff);
				challenge.append(decks);
			}
			if (!tier) {
				//if (!tier) this is a new challenge prompt
				var send = $('<button class="btn">Send</button>');
				var $delete = $('<button class="btn">Delete</button>');
				send.on('click', function() {
					sendOrAcceptChallenge(this, 'send');
				});
				$delete.on('click', function() {
					var form = $(this).parent();
					var opponent = form.find('#opponent').text();
					app.removeChallenge(opponent);
				});
				challenge.append(send).append(' ').append($delete);
			} else if (fromTo === 'to') {
				var cancel = $('<button class="btn">Cancel Challenge</button>');
				cancel.on('click', function() {
					var form = $(this).parent();
					var opponent = form.find('#opponent').text();
					app.socket.emit('cancelchallenge', {
						opponent: opponent
					});
				});
				challenge.append(cancel);
			} else if (fromTo === 'from') {
				var accept = $('<button class="btn">Accept</button>');
				var reject = $('<button class="btn">Reject</button>');
				accept.on('click', function() {
					sendOrAcceptChallenge(this, 'accept');
				});
				reject.on('click', function() {
					var form = $(this).parent();
					var opponent = form.find('#opponent').text();
					app.removeChallenge(opponent);
					app.socket.emit('reject', {
						opponent: opponent
					});
				});
				challenge.append(accept).append(' ').append(reject);
			}
			challenge.appendTo('#challenges');
		};
		app.removeChallenge = function(otherUser) {
			$('#chall' + otherUser).animate({
				height: '0px'
			}, 500, function() {
				$("#chall" + otherUser).remove();
			});
		};
		app.mode = function(type) {
			$('.newMode').remove();
			var t;
			function newModeButton(id, mode) {
				$(id).append('<div class="newMode" onclick="$(this).remove();app.mode(\'' + mode + '\');"></div>');
			}
			if (type === "game") {
				$("body").addClass("bodyAnimating");
				$("#game").show();
				$("#homeScreen").css({
					position: 'absolute',
					'z-index': 1
				}).animate({
					left: '93%'
				}, t, function() {
					app.resize();
				});
				$("#game").animate({
					left: "0%"
				}, t);
				newModeButton("#homeScreen", "home");
				if (!helpers.isMobile()) $('.gameInput').focus();
			} else if (type === "home") {
				$("#homeScreen").css({
					position: 'absolute',
					'z-index': 10000
				}).animate({
					left: '7%'
				}, t);
				$("#game").animate({
					left: "-93%"
				}, t, function() {
					app.resize();
				});
				newModeButton("#game", "game");
				if (!helpers.isMobile()) $('.message').focus();
			} else if (type === "initial") {
				$(".newMode").remove();
				$("#homeScreen").css({
					position: 'absolute',
					'z-index': 10000
				}).animate({
					left: '7%'
				}, t, function() {
					$("#homeScreen").css({
						position: 'initial',
						left: '0%'
					});
					$("#game").hide();
					app.resize();
					$("body").removeClass("bodyAnimating");
				});
				$("#game").animate({
					left: "-100%"
				}, t);
				if (!helpers.isMobile()) $('.message').focus();
			}
		};
		
		inputFocus = undefined;
		this.resize();
		this.updateHeader();
		this.domEvents();
		var globalRoom = this.createRoom("Global");
		globalRoom.focusRoom();
		if (!helpers.isMobile()) $('.message').focus();
		
		ate.initial = {
			width: $("body").width(),
			height: $("body").height()
		};
		
		var t = new Date() / 1;
		var refreshLatency = 2.5 * 1000;
		var difference = t - Number(cookie("lastVisit"));
		if (difference < refreshLatency) {
			/* https://github.com/Automattic/engine.io/issues/257 */
			//hack to prevent refresh while on polling transport
			//usually if you refresh too fast the sockets won't disconnect and'll bug everything out .-.
			var self = this;
			setTimeout(function() {
				self.socket = new Socket();
			}, refreshLatency - difference);
		} else this.socket = new Socket();
		cookie("lastVisit", t);
		
		app.init();
	},
	pms: {},
	focusedPM: undefined,
	focusPM: function(pm) {
		if (!helpers.isMobile() && !inputFocus) $('.pmmessage').focus();
		if (this.focusedPM === pm) {
			return;
		}
		this.focusedPM = pm;
		$('.focusedPM').removeClass('focusedPM');
		pm.$pmer.removeClass('newPM').addClass('focusedPM');
		$('.pmlogs').empty();
		for (var i in pm.logs) {
			$('.pmlogs').append('<div>' + pm.logs[i] + '</div>');
		}
		$('.pmlogs').scrollTop($('.pmlogs').prop("scrollHeight"));
	},
	closePM: function(pm) {
		pm.$pmer.hide().removeClass('pmer');
		if (!$('.pmer').length) {
			//no other pm to focus on
			return $('.pms').hide();
		}
		if (this.focusedPM !== pm) return;
		//focus on different pm
		$('.pmer').click();
	},
	addPM: function(person, sender, msg) {
		msg = this.rooms.global.chatParse(sender, msg, true);
		this.pms[toId(person)].logs.push(msg);
		if (!this.focusedPM || this.focusedPM !== this.pms[toId(person)]) return;
		if ($('.pmlogs').scrollTop() + 60 >= $('.pmlogs').prop("scrollHeight") - $('.pmlogs').height()) {
			autoscroll = true;
		}
		$('.pmlogs').append('<div>' + msg + '</div>');
		if (autoscroll) {
			$('.pmlogs').scrollTop($('.pmlogs').prop("scrollHeight"));
		}
	},
	newPM: function(sender, receiver, msg) {
		if (this.userid === toId(sender)) {
			var you = sender;
			var person = receiver;
		} else {
			var you = receiver;
			var person = sender;
		}
		var personId = toId(person);
		var hasPM = this.pms[personId];
		if (!hasPM) {
			//first pm to person
			var pmer = $('<div onclick="ate.focusPM(ate.pms[\'' + personId + '\']);" class="pmer newPM">PM to ' + person + '<span onmousedown="ate.closePM(ate.pms[\'' + personId + '\']);">x</span></div>');
			pmer.prependTo('.pmers');
			hasPM = this.pms[personId] = {
				logs: [],
				$pmer: pmer,
				userid: personId
			};
		} else {
			var pmer = hasPM.$pmer;
			if (this.focusedPM !== hasPM) pmer.addClass('newPM');
		}
		if (!pmer.hasClass('pmer')) pmer.addClass('pmer');
		pmer.show();
		//add log
		if (msg) this.addPM(person, sender, msg);
		if ($('.pmer').length === 1) {
			//first pm from anyone
			//open pm and focus on it
			this.focusPM(hasPM);
		}
		$('.pms').show();
	},
	rooms: new Object(),
	focusedRoom: undefined,
	createRoom: function(title) {
		function Room(title) {
			this.title = title;
			this.id = toId(title);
			this.logs = [];
			this.sent = [];
			this.scrollSent = 0;
			this.message = '';
			this.users = {};
		}
		Room.prototype.deinit = function() {
			if (ate.focusedRoom === this) {
				//focus another room
				var roomCount = Object.keys(ate.rooms).length - 1; //-1 bcos of global room doesnt count
				if (roomCount === 1) {
					//this is the only room left so focus global room
					ate.rooms.global.focusRoom();
				} else {
					//click on closest room button
					var nextButton = this.$button.next();
					if (nextButton.text() !== "+") { //dont be the add room button
						nextButton.click();
					} else this.$button.prev().click();
				}
			}
			if (this.$button) this.$button.remove();
			delete ate.rooms[this];
		};
		Room.prototype.focusRoom = function() {
			ate.focusedRoom = this;
			this.updateUsers();
			$(".logs").empty();
			for (var i = 0; i < this.logs.length; i++) {
				var msg = this.logs[i];
				if (msg.substr(0, 4) === "jls|") {
					this.parseJoinLeaves(msg);
					continue;
				}
				this.addLogDom(msg);
			}
			$(".logs").scrollTop($(".logs").prop("scrollHeight"));
			$(".message").val(this.message);
			
			if (this.$button) {
				$(".selectedRoom").removeClass("selectedRoom");
				$(this.$button).addClass("selectedRoom");
			}
		};
		Room.prototype.receive = function(log) {
			if (typeof log === 'string') log = log.split('\n');
			var autoscroll = false;
			if ($('.logs').scrollTop() + 60 >= $('.logs').prop("scrollHeight") - $('.chat').height()) {
				autoscroll = true;
			}
			var userlist = '';
			for (var i = 0; i < log.length; i++) {
				if (log[i].substr(0,6) === 'users|') {
					userlist = log[i];
				} else {
					this.addRow(log[i]);
				}
			}
			if (userlist) this.addRow(userlist);
			if (autoscroll) {
				$('.logs').scrollTop($('.logs').prop("scrollHeight"));
			}
			var $children = $('.logs').children();
			if ($children.length > 900) {
				$children.slice(0,100).remove();
			}
		};
		Room.prototype.addRow = function(line) {
			var name, name2, room, action, silent, oldid;
			if (line && typeof line === 'string') {
				var row = line.split('|');
				switch (row[0]) {
				case 'c':
					if (/[a-zA-Z0-9]/.test(row[1].charAt(0))) row[1] = ' '+row[1];
					this.addChat(row[1], row.slice(2).join('|'));
					break;
				case 'j':
					var username = row[1];
					this.users[toId(username.substr(1))] = username;
					this.updateUsers();
					this.addJoin(username);
					break;
				case 'l':
					var userid = row[1];
					var username = this.users[userid];
					delete this.users[userid];
					this.updateUsers();
					this.addLeave(username);
					break;
				case 'n':
					var identity = row[1];
					var olduserid = row[2];
					delete this.users[olduserid];
					this.users[toId(identity.substr(1))] = identity;
					this.updateUsers();
					break;
				case 'users':
					if (row[1] === "") return;
					var users = row[1].split(',');
					for (var i = 0; i < users.length; i++) {
						var username = users[i];
						var userid = toId(username.substr(1));
						this.users[userid] = username;
					}
					this.updateUsers();
					break;
				case 'raw':
					this.addLog(row.slice(1).join('|'));
					break;
				case '':
					this.addLog(escapeHTML(row.slice(1).join('|')));
					break;
				default:
					this.addLog('<code>' + escapeHTML(row.join('')) + '</code>');
					break;
				}
			}
		};
		Room.prototype.addChat = function(name, message, pm, deltatime) {
			this.addLog(this.chatParse(name, message, pm, deltatime));
		};
		Room.prototype.chatParse = function(name, message, pm, deltatime) {
			var addTime = '';
			if (!helpers.isMobile()) addTime = timestamp();
			return addTime + '<b><font color="' + hashColor(name.substr(1)) + '" class="username">' + escapeHTML(name) + ':</b></font> ' + urlify(escapeHTML(message));
		},
		Room.prototype.joinLeaveTemplate = function() {
			var buff = $('<div><span class="jcont"><span class="jlog"></span> joined</span><span class="lcont"><span class="and"> AND </span><span class="llog"></span> left</span></div>');
			buff.find('.jcont').hide();
			buff.find('.lcont').hide();
			buff.find('.and').hide();
			return buff;
		};
		Room.prototype.addLeave = function(name) {this.addJoin(name, true);};
		Room.prototype.addJoin = function(name, leaving) {
			var e = 'j';
			if (leaving === true) e = 'l';
			var lastLogKey = this.logs.length - 1;
			var lastLog = this.logs[lastLogKey];
			var splint = (lastLog || '').split('|');
			var lastE = splint[0];
			var lastNames = splint[1];
			if (lastLog && lastE === 'jls') {
				lastNames = lastNames.split(',');
				for (var i = 0; i < lastNames.length; i++) {
					if (lastNames[i] === e + name) return; //already added a join/leave for user
				}
				this.logs[lastLogKey] += ',' + e + name;
				var lastLogDiv = $('.logs div').last();
				lastLogDiv.find('.' + e + 'cont').show();
				if (lastLogDiv.find('.jcont').css('display') !== 'none' && lastLogDiv.find('.lcont').css('display') !== 'none') {
					lastLogDiv.find('.and').show();
				}
				var log = lastLogDiv.find('.' + e + 'log');
				var comma = '';
				if (log.text()) comma = ', '; //if empty add comma
				log.append(comma + name);
			} else {
				this.logs.push('jls|' + e + name);
				var buff = this.joinLeaveTemplate();
				buff.find('.' + e + 'cont').show(); //only show the one just appended to
				buff.find('.' + e + 'log').append(name);
				this.addLogDom(buff);
			}
		};
		Room.prototype.parseJoinLeaves = function(str) {
			var namesStr = str.substr(4);
			var names = namesStr.split(',');
			var buff = this.joinLeaveTemplate();
			for (var i = 0; i < names.length; i++) {
				var e = names[i].substr(0, 1);
				var name = names[i].substr(1);
				buff.find('.' + e + 'cont').show();
				var log = buff.find('.' + e + 'log');
				var comma = '';
				if (log.text()) comma = ', '; //if empty add comma
				log.append(comma + name);
			}
			if (buff.find('.jcont').css('display') !== 'none' && buff.find('.lcont').css('display') !== 'none') {
				buff.find('.and').show();
			}
			this.addLogDom(buff);
		};
		Room.prototype.addLog = function(msg) {
			this.logs.push(msg);
			if (ate.focusedRoom !== this) return;
			this.addLogDom(msg);
		};
		Room.prototype.addLogDom = function(msg) {
			$('.logs').append($('<div></div>').append(msg));
		};
		Room.prototype.sortUsers = function() {
			function compare(a,b) {
				if (a < b) return -1;
				if (a > b) return 1;
				return 0;
			}
			var groupKeyOrder = {
				'-': 0,
				'#': 1,
				'*': 2,
				'+': 3,
				' ': 4
			};
			var groupCount = Object.keys(groupKeyOrder).length;
			var groups = [];
			for (var i = 0; i < groupCount; i++) groups.push([]);
			//put users in respective groups
			for (var i in this.users) {
				var identity = this.users[i];
				var groupKey = groupKeyOrder[identity.charAt(0)];
				groups[groupKey].push(identity);
			}
			//sort each group
			for (var i = 0; i < groupCount; i++) {
				var sortedGroup = groups[i].sort(compare);
				groups[i] = sortedGroup;
			}
			//turn all the groups into one big list
			var list = [];
			for (var i = 0; i < groupCount; i++) list = list.concat(groups[i]);
			
			this.alphabetizedUsers = list;
		};
		Room.prototype.updateUsers = function() {
			this.sortUsers();
			if (ate.focusedRoom !== this) return;
			var list = this.alphabetizedUsers;
			var userCount = list.length;
			var buff = '<center style="margin-top: -19px;">' + userCount + ' users</center>';
			for (var i = 0; i < userCount; i++) {
				var identity = list[i];
				buff += '<div class="username"><font color="' + hashColor(identity.substr(1)) + '">' + escapeHTML(identity) + '</font></div>';
			}
			$('.users').html(buff);
		};
		Room.prototype.addButton = function() {
			var roomCount = $(".rooms .rel").length - 1; //-1 bcos the add room button counts
			this.$button = buff = $('<div class="rel"><h4>' + title + '</h4><span>x</span></div>');
			if (roomCount === 0) {
				$('.rooms').prepend(buff);
			} else $('.rooms .rel').last().before(buff);
		};
		Room.prototype.send = function(msg) {
			this.sent.push(msg);
			this.scrollSent = this.sent.length;
			this.message = '';
			ate.socket.emit('c', {
				msg: msg,
				room: this.id
			});
		};
		Room.prototype.sendScrollDown = function() {this.sendScrollUp(true);};
		Room.prototype.sendScrollUp = function(down) {
			if (down) {
				this.scrollSent++;
				if (this.scrollSent > this.sent.length) this.scrollSent = this.sent.length;
			} else {
				this.scrollSent--;
				if (this.scrollSent < 0) this.scrollSent = 0;
			}
			var log = this.sent[this.scrollSent];
			if (log) {
				$('.message').val(log);
			} else $('.message').val(this.message);
		};
		
		var room = new Room(title);
		this.rooms[room.id] = room;
		if (title !== "Global") room.addButton();
		return room;
	},
	socketInitialized: function() {
		for (var i in this.events) this.socket.events[i] = this.events[i];
		if (cookie("token")) {
			this.socket.emit('tokenrename', {token: cookie("token")});
		} else if (cookie("username")) {
			this.socket.emit('nametaken', {username: cookie("username")});
		}
		this.parseURL();
		if (this.replaying) return;
		this.socket.emit('c', {msg: '/join lobby'});
		this.socket.emit('duels');
	},
	resize: function() {
		/* keyboard detection... since keyboards make the screen height REDICULOUSLY small... maybe i'll need it later idk
		if (ate.initial && helpers.isMobile()) {
			var percentChange = {
				width: Math.abs(100 - ($("body").width() / ate.initial.width * 100)),
				height: Math.abs(100 - ($("body").height() / ate.initial.height * 100))
			};
			if (percentChange.width < 1 && percentChange.height > 35) {
				//on keyboard popup DONT resize since there's only like 80 pixels to split in height afterwards
				return;
			}
		}
		*/
		$("#content").height($("body").height() - $("#content").offset().top);
		var smallRightSide = 300,
			bigRightSide = 600;
		if (helpers.isMobile()) smallRightSide = 175;
		var rightSideWidth = smallRightSide;
		var leftSideWidth = $("body").width() - rightSideWidth;
		var leftSideWidthWITHbigRight = $("body").width() - bigRightSide;
		if (leftSideWidth >= 700 && leftSideWidthWITHbigRight >= 500) {
			rightSideWidth = bigRightSide;
			leftSideWidth = leftSideWidthWITHbigRight;
		}
		$("#rightSide").width(rightSideWidth);
		$("#leftSide").width(leftSideWidth);
		
		var headerHeight = $(".header").height(),
			roomsHeight = $(".rooms").height(),
			inputHeight = $(".input").height(),
			usersWidth = $(".users").width();
		var chatHeight = $("body").height() - (headerHeight + roomsHeight);
		var logsWidth = leftSideWidth - usersWidth;
		var logsHeight = chatHeight - inputHeight;
		$(".chat").height(chatHeight);
		$(".logs").height(logsHeight).width(logsWidth);
		$(".input").width(logsWidth);
		
		$("#duels").height($("body").height() - $("#duels").offset().top);
		if (app.game) app.game.resize();
	},
	updateHeader: function() {
		var buff = '';
		buff += '<span>' + this.username + '</span>';
		if (!this.username || this.username.substr(0, 5) === "Guest") {
			buff = '<button onclick="ate.prompt(\'nametaken\');">Choose Name</button>';
		}
		$(".userbar").empty().html(buff);
	},
	promptCount: 0,
	prompt: function(type, opaqueness) {
		var data = {};
		if (type.type) {
			var data = type;
			var type = data.type;
		}
		var id = ++this.promptCount;
		var buff = '';
		var start = '';
		var end = '';
		if (opaqueness !== false) {
			start = '<div id="p' + id + '" class="opaqueness">';
			end = '</div>';
		}
		buff += '<div class="popup"><div class="form"><input type="hidden" name="formType" value="' + type + '" />';
		if (type === "nametaken") {
			if (data.err) buff += '<p class="err">' + data.err + '</p>';
			buff += '<p>';
			buff += '<label>Username: <input name="username" type="text" onkeypress="ate.onEnterSubmit(event, this);" /></label>';
			buff += '</p>';
			buff += '<div class="buttons"><button class="submit">Choose Name</button> <button onclick="$(\'#p' + id + '\').mouseup();">Cancel</button></div>';
		} else if (type === "nameregged") {
			if (data.err) buff += '<p class="err">' + data.err + '</p>';
			buff += '<p>';
			buff += '<label>Username: <input type="hidden" name="username" value="' + data.username + '" /><label>' + data.username + '</label></label>';
			buff += '</p>';
			buff += '<p>';
			buff += '<label>Password: <input name="password" type="password" onkeypress="ate.onEnterSubmit(event, this);" /></label>';
			buff += '</p>';
			buff += '<div class="buttons"><button class="submit">Choose Name</button> <button onclick="$(\'#p' + id + '\').mouseup();">Cancel</button></div>';
		} else if (type === "registername") {
			if (data.err) buff += '<p class="err">' + data.err + '</p>';
			buff += '<p>';
			buff += '<label>Username: <input type="hidden" name="username" value="' + data.username + '" /><label>' + data.username + '</label></label>';
			buff += '</p>';
			buff += '<p>';
			buff += '<label>Password: <input name="password" type="password" onkeypress="ate.onEnterSubmit(event, this);" /></label>';
			buff += '</p>';
			buff += '<div class="buttons"><button class="submit">REGISTER</button> <button onclick="$(\'#p' + id + '\').mouseup();">Cancel</button></div>';
		} else if (type === "error") {
			buff += '<font color="red"><b>' + data.err + '</b></font>';
		}
		buff += '</div></div>';
		var el = $(start + buff + end).appendTo("body").find('input').last();
		if (!helpers.isMobile()) el.focus();
	},
	closePrompt: function(id) {
		$("#p" + id).remove();
	},
	domEvents: function() {
		$(window).on('resize', this.resize);
		$("body").on("click", function() {
			$("#userdetails").remove();
		}).on("click", "a", function(e) {
			var duelId = this.href.split('duel-');
			if (duelId.length - 1  > 0) {
				duelId = duelId[1];
				app.socket.emit('watch', {id: duelId});
				e.preventDefault();
			}
		}).on("mouseup touchend", ".opaqueness", function(e) {
			if (e.target.id !== this.id || e.which === 3) return;
			ate.closePrompt(this.id.replace('p', ''));
		}).on("click", ".popup .submit", function() {
			var popup = $(this).closest('.popup');
			var data = {};
			var inputs = popup.find('input');
			//construct data with form elements
			for (var i in inputs) {
				if (isNaN(i)) continue;
				var el = inputs[i];
				data[el.name] = el.value;
			}
			popup.closest('.opaqueness').mouseup();//remove popup
			var event = data.formType;
			delete data.formType;
			ate.socket.emit(event, data);
		}).on("keydown", ".message", function(e) {
			if (e.keyCode === 13) {
				//enter
				if (!this.value.trim().length) return false;
				var msg = this.value;
				ate.focusedRoom.send(msg);
				this.value = "";
				e.preventDefault();
			} else if (e.keyCode === 38) {
				//up
				ate.focusedRoom.sendScrollUp();
				e.preventDefault();
			} else if (e.keyCode === 40) {
				//down
				ate.focusedRoom.sendScrollDown();
				e.preventDefault();
			}
		}).on("keyup", ".message", function() {
			if (ate.focusedRoom.scrollSent !== ate.focusedRoom.sent.length) {
				//if your editing an old log don't set it as the current 'message'
				return;
			}
			ate.focusedRoom.message = this.value;
		}).on("click", ".rooms .rel", function() {
			if (this.innerHTML === "+") {
				//see other rooms tab thing
				return;
			}
			if ($(this).hasClass("selectedRoom")) return;
			ate.rooms[toId($(this).find('h4').text())].focusRoom();
		}).on("click", "#content", function(e) {
			//only focus on input if
				//shift key isn't being pressed
				//no selection is being made
			if (e.shiftKey || (window.getSelection && !window.getSelection().isCollapsed)) {
				return;
			}
			if (!helpers.isMobile()) $(".message").focus();
		}).on("keydown", function(e) {
			if (e.keyCode === 8 && !inputFocus) {
				//prevent backspace if not in input
				//this prevents accidental page disconnections with backspace
				e.preventDefault();
				e.stopPropagation();
			}
		}).on("click", ".rooms .rel span", function() {
			ate.rooms[toId($(this).parent().find('h4').text())].send('/leave');
		}).on("focus", "input, textarea", function() {
			inputFocus = this;
		}).on("blur", "input, textarea", function() {
			inputFocus = undefined;
		}).on("keypress", ".pmmessage", function(e) {
			if (e.keyCode === 13) {
				//enter
				if (!this.value.trim().length) return false;
				var msg = this.value;
				this.value = "";
				ate.socket.emit('c', {
					msg: '/pm ' + ate.focusedPM.userid + ',' + msg,
					room: ate.focusedRoom.id
				});
			}
		}).on("click", ".pmlogs", function(e) {
			if (e.shiftKey || (window.getSelection && !window.getSelection().isCollapsed)) {
				return;
			}
			ate.focusPM(ate.focusedPM);
		}).on("mousedown touchstart", ".pmer", function(touch) {
			//drag start
			if (touch.originalEvent.touches) touch = touch.originalEvent.touches[0];
			var drag = {};
			var sourceOffset = $(".pms").offset();
			drag.offset = {
				left: touch.pageX - sourceOffset.left,
				top: touch.pageY - sourceOffset.top
			};
			drag.dragging = $(".pms");
			ate.dragPM = drag;
		}).on("click", ".username", function(e) {
			if ($(this).hasClass('nopopup')) return;
			var popup = $('<div id="userdetails" class="popup"></div>');
			var targetName = $(this).text();
			e.preventDefault();
			e.stopPropagation();
			$("#userdetails").remove();
			var name = $(this).clone().addClass("nopopup");
			name.html(name.html().replace(':', ''));
			$("<h2></h2>").append(name).appendTo(popup);
			var challengeButton = $('<button class="btn">Challenge</button>');
			var pmButton = $('<button class="btn">PM</button>');
			if (toId(targetName) === ate.userid) {
				challengeButton.prop('disabled', true);
				pmButton.prop('disabled', true);
			} else {
				challengeButton.on('click', function() {
					app.challengePrompt(targetName);
					$("#userdetails").remove();
				});
				pmButton.on('click', function() {
					ate.newPM(ate.userid, targetName);
					ate.focusPM(ate.pms[toId(targetName)]);
					$("#userdetails").remove();
				});
			}
			popup.append(challengeButton).append(' ').append(pmButton);
			popup.appendTo('body');
			var css;
			if ($(this).parent().hasClass('users')) {
				//users list username
				css = {
					left: ($(this).offset().left + $(this).width()) + 'px',
					top: ($(this).offset().top) + 'px'
				};
			} else {
				//chat username
				css = {
					left: ($(this).offset().left) + 'px',
					top: ($(this).offset().top - $(this).height() - popup.height()) + 'px'
				};
			}
			popup.css(css);
		});
		$(document).on("mousemove touchmove", function(touch) {
			//dragging
			if (ate.dragPM) touch.preventDefault();
			if (touch.originalEvent.touches) touch = touch.originalEvent.touches[0];
			if (!ate.dragPM) return;
			ate.dragPM.dragging.css({
				left: (touch.pageX - ate.dragPM.offset.left) + 'px',
				top: (touch.pageY - ate.dragPM.offset.top) + 'px'
			});
			ate.dragPM.lastTouch = touch;
		});
		$(document).on("mouseup touchend", function() {
			//drag end
			if (ate.dragPM) {
				var el = ate.dragPM.dragging;
				if (ate.dragPM.type === "counter") {
					ate.dragPM.dropCounter();
				} else {
					if (el.attr('id') === 'leaderboard') {
						var offsets = el.offset();
					} else {
						var offsets = $($('.pmer')[0]).offset();
					}
					if (offsets.top < 0) {
						el.css('top', el.position().top - offsets.top + "px");
					}
					if (offsets.left < 0) {
						el.css('left', el.position().left - offsets.left + "px");
					}
				}
				delete ate.dragPM;
			}
		});
	},
	onEnterSubmit: function(e, el) {
		if (e.keyCode === 13) {
			var closestSubmit = $(el).closest('.popup').find('.submit');
			closestSubmit.click();
		}
	},
};
$(function() {
	ate.init();
});
ate.resize();

function Socket() {
	var socket = io();

	socket.on('connect', function() {
		console.log('I AM CONNECTED!');
		ate.socketInitialized();
	});

	/**
	 * Retreiving an event.
	 *
	 * @param {Object or String} data
	 *
	 * The data should be one large string
	 * Example - event|data1|data2|data3\nevent|data1|data2
	 */

	socket.on('e', function(data) {
		console.log(data);
		var events = this.REFERENCE.events;
		if (typeof data === "string") {
			var roomid = '';
			if (data.substr(0,1) === '>') {
				var nlIndex = data.indexOf('\n');
				if (nlIndex < 0) return;
				roomid = toId(data.substr(1,nlIndex-1));
				data = data.substr(nlIndex+1);
			}
			if (roomid) {
				if (ate.rooms[roomid]) {
					ate.rooms[roomid].receive(data);
				}
				return;
			}
			var rows = data.split('|');
			var event = rows[0];
			if (typeof events[event] === "string") event = events[event];
			if (events[event]) {
				events[event](rows);
			} else {
				//message meant for lobby
				var room = ate.rooms['lobby'];
				if (!room) room = ate.rooms['global'];
				room.receive(data);
			}
		} else {
			//just in case data has to come in as an object
			var event = data.event;
			if (events[data.event] === "string") event = events[data.event];
			if (events[event]) events[event](data);
		}
	});

	/**
	 * Emit an event.
	 *
	 * @param {String} event
	 * @param {Object} data
	 */

	this.emit = function(event, data) {
		var obj = {};
		if (typeof data === 'object') {
			obj = data;
		} else {
			obj.data = data;
		}
		obj.event = event;
		console.log(JSON.stringify(obj));
		socket.emit('e', obj);
	};
	this.socket = socket;
	this.socket.REFERENCE = this;
	return this;
}
Socket.prototype.events = {
	/* ate */
	banned: function() {
		$("body").append("<div style='position: absolute;top: 50%;left: 50%;z-index: 9999;width: 150px;height: 77px;margin-top: -38.5px;margin-left: -75px;background: black;text-align: center;'><h1><font color='red'>You're banned.</font></h1></div>");
	},
	init: function(data) {
		data.splice(0, 1);
		var splint = data.join('|').split('\n');
		var title = splint[0];
		splint.splice(0, 1);
		var data = splint.join('\n');
		var room = ate.createRoom(title);
		room.focusRoom();
		room.receive(data);
	},
	deinit: function(data) {
		var room = ate.rooms[data[1]];
		room.deinit();
	},
	user: function(data) {
		ate.getIdentity = function() {return data[1];};
		ate.username = data[1].substr(1);
		ate.userid = toId(ate.username);
		ate.updateHeader();
		ate.token = data[2];
		if (ate.username.substr(0, 5) !== "Guest") {
			cookie("username", ate.username);
		} else cookie("username", "");
		if (ate.token) cookie("token", ate.token);
	},
	tokenerror: 'nametaken',
	registername: 'nametaken',
	nameregged: 'nametaken',
	nametaken: function(data) {
		if (data.event === "tokenerror") {
			data[0] = "nametaken";
			if (cookie("username")) data[1] = cookie("username");
			cookie("token", ""); //remove token from cookies bcos it doesnt work
		}
		ate.prompt({
			type: data[0],
			username: data[1],
			err: data[2]
		});
	},
	pm: function(data) {
		var sender = data[1];
		var receiver = data[2];
		data.splice(0, 3);
		var msg = data.join('|');
		ate.newPM(sender, receiver, msg);
	}
};

$("#findDuel").click(function() {
	if (this.innerHTML === "Find Duel") {
		var insides = "",
			id = new Date() / 1;
		insides += '<div id="daddy' + id + '" onclick="$(\'#baby' + id + '\').remove();$(this).remove();" style="width: 100%;height: 100%;background: rgba(255, 255, 255, 0.25);cursor: pointer;position: absolute;top: 0;left:0 ;"></div>';
		insides += '<div id="baby' + id + '" style="position: absolute;top: 50%;left: 50%;width: 300px;height: 150px;margin-left: -150px;margin-top: -75px;background: rgb(101, 101, 101); text-align: center;color: white;">';
		insides += '<h2 style="margin: 0.83em;">Select A Deck:</h2>';
		insides += '<select style="color: black;" id="selectDeck' + id + '">';
		for (var i in app.decks) insides += '<option value="' + i + '">' + app.decks[i] + '</option>';
		insides += '</select>';
		insides += ' <button class="btn" onclick="var el = $(\'#selectDeck' + id + '\');$(\'#daddy' + id + '\').click();if (el.val() !== null) {app.socket.emit(\'search\', {deck: app.deck[el.val()], name: app.decks[el.val()]});}">Find Duel</button>';
		insides += '</div>';
		$("body").append(insides);
	} else app.socket.emit('search');
});
$("body").on("click", ".promptOpaqueness", function() {
	var id = this.id.replace('promptOpaqueness', '');
	app.game.promptRemove(id);
}).on("click", ".prompt img", function() {
	var id = $(this).parent().attr('id').replace('prompt', '');
	app.game.promptRespond(id, this);
}).on("click", ".selectablePhase", function() {
	var id = this.id;
	app.game.send('phase', {
		phase: id
	});
}).on("mouseover touchstart", "#youSide .o, #youhand img", function(e) {
	app.game.contextHover(this);
}).on("click", ".contextMenu div", function() {
	app.game.contextClickOption(this.innerHTML);
}).on("click", "#youdeck, #youextra, #youbanished, #oppbanished, #yougrave, #oppgrave", function(e) {
	if ($(this).find('.deckCount').text() === "0") return;
	if (this.id === "youdeck") {
		//draw a card
		app.game.context = {el: $(this)};
		app.game.contextClickOption("Draw");
	} else {
		//just view the deck list
		var list = this.id.replace('you', '').replace('opp', '');
		var who = "you";
		if (this.id.split('opp').length - 1 > 0) who = "opp";
		app.game.you.viewList(app.game[who], list, app.game[who][list]);
		app.game.context = {el: $(this), who: who};
		app.game.contextClickOption("View");
	}
}).on("click", ".closeList", function() {
	$(".viewList").remove();
	var cardList = app.game.cardList;
	if (cardList.list === "deck" || cardList.list === "extra") {
		//obscure the lists (only obscure extra if it belongs to your opponent)
		if (cardList.targetPlayer.who() === "you" && cardList.list === "extra") {} else {
			for (var i in cardList.targetPlayer[cardList.list]) {
				cardList.targetPlayer[cardList.list][i] = -1;
			}
		}
	}
	app.game.context = {el: $("#youdeck")}; //just a hack, send all context stuff without a list to the "deck" list
	app.game.contextClickOption("Close List");
	delete app.game.cardList;
}).on("keypress", ".gameInput", function(e) {
	if (e.keyCode !== 13 || this.value.replace(/ /g, "") === "") return;
	app.game.chatSend(this.value);
	this.value = '';
}).on("click", "#game", function(e) {
	//only focus on input if
		//shift key isn't being pressed
		//no selection is being made
	app.game.cancelFindingAttackTarget();
	if ((app.game && app.game.focusedInput)) return;
	if (e.shiftKey || (window.getSelection && !window.getSelection().isCollapsed)) {
		return;
	}
	if (!helpers.isMobile()) $(".gameInput").focus();
}).on("click", ".resultButtons button", function() {
	if (this.innerHTML === "Leave") {
		$("#rps, #whoGo").remove();
		app.mode("initial");
		newurl("/");
	}
	app.game.send('resultButton', {
		type: this.innerHTML
	});
}).on("mouseover", ".deckCount", function() {
	$(this).parent().find('img').mouseover();
}).on("mouseover", ".cardName", function() {
	var cardId = this.id;
	$(".cardDescription").html(app.game.cardInfo(cardId));
}).on("click", "#opphand img", function() {
	var ray = $("#opphand img");
	for (var key in ray) {
		if (isNaN(key)) continue;
		var el = ray[key];
		if (el === this) {
			slot = key;
			break;
		}
	}
	app.game.send('targetCard', {
		list: "hand",
		slot: slot
	});
}).on("click", "#oppSide .monsterSpellZones .fieldZone", function() {
	var info = app.game.findingAttackTarget;
	if (!info || !$(this).hasClass("attackableZone")) return;
	app.game.foundAttackTarget(Number(this.id.replace('opp', '')));
}).on("mousedown touchstart", "#counter, #youSide .counter", function(touch) {
	if (touch.originalEvent.touches) touch = touch.originalEvent.touches[0];
	var type = "+";
	if ($(this).hasClass("counter")) type = "-";
	var w = 50, h = 50;
	var el = $("<div class=\"counter\"></div>").width(w).height(h).css({
		top: (touch.pageY - (h / 2)) + "px",
		left: (touch.pageX - (w / 2)) + "px",
		bottom: "auto"
	}).appendTo("body");
	var drag = {};
	drag.offset = {
		left: w / 2,
		top: h / 2
	};
	drag.dragging = el;
	drag.type = "counter";
	drag.dropType = type;
	if (type === "-") drag.originSlot = Number($(this).parent().attr('id').replace('you', ''));
	drag.dropCounter = function() {
		var touch = this.lastTouch;
		var zone = false;
		$(this.dragging).remove();
		
		for (var i = 0; i < 10; i++) {
			var el = $("#you" + i);
			var pos = el.offset();
			if (touch.pageX > pos.left && touch.pageX < pos.left + el.width()) {
				if (touch.pageY > pos.top && touch.pageY < pos.top + el.height()) {
					zone = i;
					break;
				}
			}
		}
		if (this.dropType === "-" && zone !== this.originSlot) {
			app.game.send('counter', {
				type: "-",
				zone: this.originSlot
			});
		} else if (this.dropType === "+") {
			if (zone === false) return;
			var firstSlot = app.game.you.field[zone][0];
			if (firstSlot && (firstSlot.pos === 0 || firstSlot.pos === 1)) {
				//the main monster in the zone is face up
				app.game.send('counter', {
					type: "+",
					zone: zone
				});
			}
		}
	};
	ate.dragPM = drag;
});
$(".changePoints").mousedown(function(e) {
	app.game.focusedInput = this;
	this.value = "";
}).blur(function() {
	var val = "-";
	if ($(this).hasClass("plusPoints")) val = "+";
	val += " Double click to inverse.";
	this.value = val;
	app.game.focusedInput = false;
}).dblclick(function() {
	var type = "plus";
	if ($(this).hasClass("plusPoints")) type = "minus";
	$(this).removeClass("plusPoints").removeClass("minusPoints").addClass(type + "Points");
}).keydown(function(e) {
	if (this.value.split('Sent to server').length - 1 > 0) this.value = '';
}).keypress(function(e) {
	if (e.keyCode === 13) {
		var amount = Number(this.value);
		if (isNaN(amount)) return;
		if ($(this).hasClass("minusPoints")) amount = amount * -1;
		if (amount === 0) return;
		app.game.send("changePoints", {
			amount: amount
		});
		this.value = "Sent to server " + ((amount > 0) ? '+' : '') + amount + " points";
	}
});
$("#rollDice, #coinFlip, #token").click(function() {
	app.game.send(this.id);
});
$("#game").on("mousedown", function() {
	app.game.removeContext();
});
$("#deckbuilder").click(function() {
	$('#builder').show();
});
$("#ladder").click(function() {
	if ($("#leaderboard").length) return $("#leaderboard").show();
	var container = $('<div id="leaderboard"><div class="rel"></div></div>');
	var leaderboard = container.find('.rel');
	(function() {
		var exit = $('<span class="exit">x</span>');
		exit.mousedown(function() {
			container.hide();
		});
		leaderboard.append(exit);	
	})();
	(function() {
		var header = $('<h1>Leaderboard</h1>');
		header.on("mousedown touchstart", function(touch) {
			//drag start
			if (touch.originalEvent.touches) touch = touch.originalEvent.touches[0];
			var drag = {};
			var sourceOffset = container.offset();
			drag.offset = {
				left: touch.pageX - sourceOffset.left,
				top: touch.pageY - sourceOffset.top
			};
			drag.dragging = container;
			ate.dragPM = drag;
		});
		leaderboard.append(header);	
	})();
	(function() {
		var select = $('<select><option value="">Select a format</option></select>');
		var formats = ["Advanced"];
		for (var i = 0; i < formats.length; i++) {
			select.append('<option>' + formats[i] + '</option>');
		}
		select.on("change", function() {
			if (!this.value) return;
			app.socket.emit('ladder', {tier: this.value});
		});
		select.val(formats[0]);
		leaderboard.append(select);
	})();
	(function() {
		var ladder = $('<div class="ladder">Loading...</div>');
		leaderboard.append(ladder);
	})();
	container.appendTo("body").css({
		left: (($("body").width() / 2) - (leaderboard.width() / 2)) + "px",
		top: (($("body").height() / 2) - (leaderboard.height() / 2)) + "px"
	});
	leaderboard.find('select').trigger('change');
});
(function gameDragDropEvents() {
	var draggables = [
		"#youhand img",
		"#youSide .fieldZone img",
		"#you10 img",
		"#you11 img",
		"#you12 img",
		"#Viewyou img",
		"#Viewoppgrave img",
		".sidingContainer img"
	];
	var droppables = [
		"#youSide .o",
		"#oppSide .fieldZone",
		"#youbanished",
		"#youhand"
	];
	$("body").on("mousedown touchstart", draggables.join(','), function(touch) {
		if (touch.originalEvent.touches) touch = touch.originalEvent.touches[0];
		if ($(this).parent().hasClass("o")) app.game.contextHover($(this).parent());
		var drag = {};
		var sourceOffset = $(this).offset();
		drag.source = this;
		drag.ghost = $(drag.source).clone().css({
			position: 'absolute',
			left: (sourceOffset.left) + 'px',
			top: (sourceOffset.top) + 'px',
			"z-index": 9999
		}).width($(drag.source).width()).height($(drag.source).height()).appendTo('body');
		drag.offset = {
			left: touch.pageX - sourceOffset.left,
			top: touch.pageY - sourceOffset.top
		};
		$(drag.source).hide();
		if ($(drag.source).parent().hasClass("cardList")) $(".viewList").hide(); //hide the cardList viewer as well so we can actually see where we're dragging
		app.dragging = drag;
		touch.preventDefault();
		return false;
	});
	$(document).on("mousemove touchmove", function(touch) {
		if (touch.originalEvent.touches) touch = touch.originalEvent.touches[0];
		if (!app.dragging) return;
		//unset drop target
		delete app.dragging.target;
		$(".dropTarget").removeClass("dropTarget");

		//see if we have our mouse over any droppables
		var tars = droppables;
		if ($(app.dragging.source).parent().parent().hasClass("deckContainer")) {
			//side decking
			tars = [".deckContainer", ".deckContainer div"];
		}
		var viableDroppables = 0;
		var skippedHand = false;
		var len = tars.length;
		for (var i = 0; i < len; i++) {
			var els = $(tars[i]);
			var elCount = els.length;
			for (var x = 0; x < elCount; x++) {
				if (!isNaN(x)) {
					var el = $(els[x]);
					var offset = el.offset();
					var borders = {
						min: {
							x: offset.left,
							y: offset.top
						},
						max: {
							x: offset.left + el.width(),
							y: offset.top + el.height()
						}
					};
					if ((borders.min.x <= touch.pageX && borders.max.x >= touch.pageX) && (borders.min.y <= touch.pageY && borders.max.y >= touch.pageY)) {
						//mousing over this element
						//set drop target
						viableDroppables++;
						if (el.attr('id') === "youhand") {
							skippedHand = true;
							continue;
						}
						app.dragging.target = el;
						$(el).addClass("dropTarget");
					}
				}
			}
		}

		if (viableDroppables === 1 && skippedHand) {
			var el = $("#youhand").addClass("dropTarget");
			app.dragging.target = el[0];
		}
		
		app.dragging.ghost.css({
			left: (touch.pageX - app.dragging.offset.left) + 'px',
			top: (touch.pageY - app.dragging.offset.top) + 'px'
		});
	});
	$(document).on("mouseup touchend", function() {
		//drop
		function drop(drag) {
			if (drag) {
				$(".viewList").show();
				$(drag.source).show();
				drag.ghost.remove();
			}
			if (!drag || !drag.target) return;
			$(drag.target).removeClass("dropTarget");
			app.game.drop(drag);
		}
		drop(app.dragging);
		delete app.dragging;
	});
})();

function cardImg(card, dontAnimate) {
	var imgs = {
		"-1": "./img/back.png",
		"-2": "./img/deck.png",
		"-3": "./img/sword.png"
	};
	var img = new Image();
	var src = 'http://ygosim.com/img/cards/' + card + '.jpg';
	if (card < 0) src = './img/back.png'; //this means a card was banished face down, so even though we know the id, just use the facedown image
	if (imgs[card]) src = imgs[card];
	img.src = src;
	img.cardId = card;
	if (app.game) {
		function faceDownCardIdResolve(el) {
			if (cardInfo(el.cardId)) return;
			var parent = $(el).parent();
			var parentId = parent.attr('id') || '';
			if (parentId.split('opp').length - 1 > 0) return; //can't get opponents facedown info
			var zone = parentId.replace('you', '');
			if (isNaN(zone)) return;
			var imgs = parent.find('img');
			for (var slot in imgs) {
				if (isNaN(slot)) continue;
				if (imgs[slot] === el) break;
			}
			var card = app.game.you.field[zone][slot];
			if (card) el.cardId = card.id;
		}
		function lookup() {
			faceDownCardIdResolve(this);
			mousingon = this.cardId;
			var cardId = this.cardId;
			function check() {
				if (mousingon !== undefined) {
					if (cardInfo(cardId)) $(".cardDescription").html(app.game.cardInfo(cardId));
					lookupOff();
				}
			}
			if (typeof mousingonTimeout === "undefined") mousingonTimeout = setTimeout(check, 250);
		}
		function lookupOff() {
			if (typeof mousingonTimeout !== "undefined") {
				clearTimeout(mousingonTimeout);
				mousingonTimeout = undefined;
				mousingon = undefined;
			}
		}
		function directLookup() {
			faceDownCardIdResolve(this);
			var cardId = this.cardId;
			if (cardInfo(cardId)) $(".cardDescription").html(app.game.cardInfo(cardId));
		}
		img.ontouchstart = directLookup;
		img.onmousedown = directLookup;
		img.onmouseover = lookup;
		img.onmouseout = lookupOff;
	}
	if (dontAnimate) {} else {
		img.style.position = 'absolute';
		img.style.top = '0px';
		img.style.left = '0px';
		img.style.display = 'none';
		img.copy = function(el, justHeight) {
			el = jQuery(el);
			jQuery(this).css({
				left: el.offset().left + 'px',
				top: el.offset().top + 'px'
			});
			if (justHeight !== false) {
				jQuery(this).height(el.height());
				if (!justHeight) jQuery(this).width(el.width());
			}
			return this;
		};
		img.toBody = function() {
			jQuery(this).appendTo('body');
			return this;
		};
		img.moveTo = function(e, time, funk) {
			var div = jQuery(this);
			var start = {
				left: Number(div[0].style.left.replace('px', '')),
				top: Number(div[0].style.top.replace('px', ''))
			};
			var end = {
				left: 0,
				top: 0
			};
			//if s or e are html elements instead of coordinates, center the div's position inside the start and end
			if (e.left) end = e;
			else {
				end = $(e).offset();
				end.left += ($(e).width() - $(div).width()) / 2;
				end.top += ($(e).height() - $(div).height()) / 2;
			}

			//animate it
			div.css({
				position: "absolute",
				display: "block",
				left: start.left + "px",
				top: start.top + "px",
				"z-index": 99999,
			}).animate({
				left: end.left + "px",
				top: end.top + "px"
			}, time, function() {
				funk();
			});
		};
	}
	return img;
}

function Game(data) {
	var game = this;
	var duelInfo = data[1].split(',');
	var duelId = Number(duelInfo[0]);
	var you = duelInfo[1];
	if (you.charAt(0) === "-") {
		//spectating
		you = you.substr(1);
		game.spectating = true;
	}

	function Side(game, player) {
		this.player = player;
		this.game = game;
		this.hand = [];
		return this;
	}
	Side.prototype.you = function() {
		return this;
	};
	Side.prototype.opp = function() {
		var opp = "p1";
		if (this.player === "p1") opp = "p2";
		return this.game[opp];
	};
	Side.prototype.who = function() {
		if (this === this.game.you) return "you";
		return "opp";
	};
	Side.prototype.draw = function(card, callback) {
		//move card element from deck to hand and add it to hand element
		var self = this;
		var img = cardImg(card);
		var moveTo = $("#" + self.who() + "hand img").last(); //move to last img in hand
		if (moveTo.length === 0) moveTo = $("#" + self.who() + "hand"); //no cards in hand so move to center of hand
		self.deck.splice(0, 1);
		self.game.updateListCounts();
		img.copy($("#" + self.who() + "deck"), true).toBody().moveTo(moveTo, 250, function() {
			self.hand.push(card);
			self.game.update({list: "hand", who: self.who()});
			$(img).remove();
			callback();
		});
	};
	Side.prototype.mill = function(card, callback, list) {
		//move card element from deck to list
		if (!list) list = "grave";
		var self = this;
		var img = cardImg(card);
		var moveTo = $("#" + self.who() + list);
		self.deck.splice(0, 1);
		self.game.updateListCounts();
		img.copy($("#" + self.who() + "deck"), true).toBody().moveTo(moveTo, 250, function() {
			self[list].push(card);
			self.game.updateListCounts();
			$(img).remove();
			callback();
		});
	};
	Side.prototype.banishTop = function(card, callback) {
		this.mill(card, callback, "banished");
	};
	Side.prototype.cardImg = function(info) {
		var card = this[info.list][info.slot];
		var revealedId = card;
		var defense = false;
		if (info.list === "field") {
			card = this.field[info.zone][info.slot];
			revealedId = card.id;
			if (card.pos === 2 || card.pos === 3) revealedId = -1;
			if (card.pos === 1 || card.pos === 3) defense = true;
		}
		var cardEl = $(cardImg(revealedId, !info.anim));
		if (this.who() === "opp") cardEl.addClass("v");
		if (defense) cardEl.addClass("defense");
		return cardEl[0];
	};
	Side.prototype.viewList = function(targetPlayer, list, cards) {
		var whoseDeck = "opposing";
		if (this.who() === targetPlayer.who()) whoseDeck = "their";
		var status = "Viewing " + whoseDeck + " " + list;
		if (cards) {
			//just pop up a list of cards
			//list viewer title = status
			$("#" + this.who() + "status").empty();
			$(".viewList").remove();
			var cardList = '<div id="View' + targetPlayer.who() + ((list === "grave" && targetPlayer.who() === "opp") ? list : '') + '" class="viewList">' +
								'<div class="rel">' +
									'<div class="viewListTitle">' + status.replace('their', 'your') + '</div>' +
									'<div class="closeList">x</div>' +
									'<div class="cardList">' +
									'</div>' +
								'</div>' +
							'</div>';
			$(".mainTable").prepend(cardList);
			var cardCount = cards.length;
			for (var i = 0; i < cardCount; i++) $(".cardList").append(cardImg(cards[i], true));
		} else {
			//put the viewing status on the field
			$("#" + this.who() + "status").html(status);
		}
		if (cards) {
			if (list === "deck") targetPlayer[list] = cards;
			this.game.cardList = {
				targetPlayer: targetPlayer,
				list: list
			};
		}
	};
	Side.prototype.changePoints = function(amount, callback) {
		var self = this;
		var goal = self.points + amount;
		var $parent = $('#' + self.who() + 'points');
		var $baby = $parent.find('span');
		if (amount > 0) $parent.addClass('gaining'); else $parent.addClass('losing');
		$({points: self.points}).animate({points: goal}, {
			duration: 1000,
			easing: 'swing',
			step: function() {
				$baby.html(Math.round(this.points));
			},
			complete: function() {
				$parent.removeClass('gaining').removeClass('losing');
				self.points = goal;
				self.game.updatePlayersInfo();
				callback();
			}
		});
		this.game.addLog(this.name + ' has ' + ((amount > 0) ? 'gained' : 'lost') + ' ' + Math.abs(amount) + ' life points.');
	};
	app.mode("game");
	game.id = duelId;
	game.p1 = new Side(game, "p1");
	game.p2 = new Side(game, "p2");
	game.you = game[you];
	game.opp = game.you.opp();
	game.queue = [];
	game.isQueueProcessing = false;
	game.unparsedData = data;
	if (!app.replaying) newurl("/duel-" + game.id);
	return game;
}
Game.prototype.resize = function() {
	var gameChatHeight = $("body").height() - $(".gameChat").offset().top;
	var minGameChatHeight = 105;
	if (gameChatHeight < minGameChatHeight) gameChatHeight = minGameChatHeight;
	$(".gameLogs").height(gameChatHeight - 34 - 10);
	$(".gameChat").height(gameChatHeight);
};
Game.prototype.parseStartData = function(data, reset) {
	var you = data[1];
	//parse the single variables
	this.turnPlayer = this[data[11]];
	this.phase = data[12];
	this.turn = Number(data[13]);
	this.round = Number(data[14]);
	this.isSideDecking = data[15];
	
	//parse the lists
	data = {
		name: data[2].split(','),
		points: data[3].split(','),
		mainCount: data[4].split(','),
		extraCount: data[5].split(','),
		hand: data[6].split('*'),
		field: data[7].split('*'),
		extra: data[8].split(','),
		grave: data[9].split('*'),
		banished: data[10].split('*')
	};
	var playerCount = data.name.length;
	for (var key in data) {
		var val = data[key];
		for (var p = 0; p < playerCount; p++) {
			var obj;
			if (key === "name") {
				obj = val[p];
			} else if (key === "points" || key === "mainCount" || key === "extraCount") {
				obj = Number(val[p]);
			} else if (key === "hand") {
				obj = val[p].split(',');
				obj = allToNum(obj);
			}
			if (key === "field") {
				obj = val[p].split(','); //gives you the zones, but the zones may have multiple cards
				for (var z in obj) {
					var zoneTxt = obj[z].split('@');
					var zone = [];
					for (var c in zoneTxt) {
						if (zoneTxt[c] === "") {
							zoneTxt.splice(c, 1); //delete blank entries
							continue;
						}
						var pos = zoneTxt[c].slice(-1);
						var cardId = zoneTxt[c].slice(0, -1);
						var counter = 0;
						var splint = cardId.split('#');
						if (splint.length - 1 > 0) {
							cardId = splint[0];
							counter = splint[1];
						}
						var card = {
							id: Number(cardId),
							pos: Number(pos)
						};
						if (counter) card.counter = Number(counter);
						zone.push(card);
					}
					obj[z] = zone;
				}
			} else if (key === "extra" || key === "side") {
				obj = val;
				obj = allToNum(obj);
			} else if (key === "grave" || key === "banished") {
				obj = (val[p] || '');
				if (obj) {
					obj = obj.split(',');
				} else obj = [];
				obj = allToNum(obj);
			}
			this["p" + (p + 1)][key] = obj;
		}
	}
		
	function blankRay(num) {
		var ray = [];
		for (var i = 0; i < num; i++) ray.push(-1);
		return ray;
	}
	this.p1.deck = blankRay(this.p1.mainCount);
	this.p2.deck = blankRay(this.p2.mainCount);
	this.opp.extra = blankRay(this.opp.extraCount); //don't blankRay extra for "you" because everyone knows their own extra deck
	if (this.spectating === true) this.you.extra = blankRay(this.you.extraCount); //blankRay it only if it's a spectator
	this.updateGame(reset);
	
	if (this.isSideDecking) this.startSiding();
};
Game.prototype.parseResetData = function(data) {
	this.parseStartData(data, true);
};
Game.prototype.updateGame = function(reset) {
	//turn all the $().remove, $().empty into update()'s so that we also maintain the current game state
	$(".viewList").remove();
	$(".status").empty();
	if (!reset) $(".gameLogs").empty();
	$("#draw").html("Offer Draw");
	$("#draw, #admit").prop("disabled", false);
	this.updatePlayersInfo();
	this.updateListCounts();
	this.updatePhases();
	this.update({list: "hand", who: "you"});
	this.update({list: "hand", who: "opp"});
	this.updateFields();
};
Game.prototype.updateFields = function() {
	for (var i = 1; i < 3; i++) {
		var player = this["p" + i];
		for (var z = 0; z < 13; z++) {
			this.update({list: "field", zone: z, who: player.who()});
		}
	}
};
Game.prototype.updatePlayersInfo = function() {
	for (var p = 1; p < 3; p++) {
		var player = this["p" + p];
		$("#" + player.who() + "points").html($("<div/>").text(player.name).html() + "<span>" + player.points + "</span>");
	}
};
Game.prototype.updatePhases = function() {
	$(".selectablePhase").removeClass("selectablePhase");
	$(".selectedPhase").removeClass("selectedPhase");
	if (this.turnPlayer === this.you && this.turn !== 0) {
		//enable the nextTurn phase
		$(".phase").addClass("selectablePhase");
	}
	if (this.phase) $("#" + this.phase).addClass("selectedPhase").removeClass("selectablePhase");
};
Game.prototype.updateListCounts = function() {
	var lists = ["deck", "extra", "grave", "banished"];
	var listsLen = lists.length;
	for (var p = 1; p < 3; p++) {
		var player = this["p" + p];
		for (var i = 0; i < listsLen; i++) {
			var list = lists[i];
			var el = $("#" + player.who() + list);
			el.empty();
			var listCount = player[list].length;
			if (listCount !== 0) {
				//add image
				var cardId = -2;
				if (list === "grave" || list === "banished") cardId = player[list][listCount - 1];
				var card = $(cardImg(cardId, true));
				if (player.who() === "opp") card.addClass("v");
				card.appendTo(el);
			}
			el.append('<span class="deckCount"><span>' + listCount + '</span></span>');
		}
	}
	this.updateListViewer();
};
Game.prototype.updateListViewer = function() {
	if (!this.cardList) return;
	var targetPlayer = this.cardList.targetPlayer;
	var list = this.cardList.list;
	targetPlayer.viewList(targetPlayer, list, targetPlayer[list]);
};
Game.prototype.update = function(info) {
	var player = this[info.who];
	var el;
	var len;
	if (info.list === "field") {
		el = $("#" + player.who() + info.zone);
		//cache first card width before we empty the zone
		var firstCardWidth = el.find('img').width();
		
		//empty zone
		el.empty();
		
		//determine the spacing of the cards attached if any are
		var cardsAttached;
		len = player.field[info.zone].length;
		if (len > 1) {
			cardsAttached = true;
			var cardSpacing = (el.width() - firstCardWidth) / (len - 1);
		}
		
		//render cards
		for (var i = 0; i < len; i++) {
			info.slot = i;
			var cardEl = $(player.cardImg(info));
			if (cardsAttached) {
				var lefty = (cardSpacing * i);
				cardEl.css({
					position: "absolute",
					left: ((i === 0) ? 0 : lefty) + "px",
					"z-index": len - i
				});
			}
			el.append(cardEl);
		}
		
		//add the counter
		var firstSlot = player.field[info.zone][0];
		if (firstSlot && firstSlot.counter) {
			el.prepend('<div class="counter">' + firstSlot.counter + '</div>');
		}
		
		//re-render the zone if needed
		if (firstCardWidth === null && len > 0) return this.update(info);
		
		//attack / defense
		if (len) {
			var card = player.field[info.zone][0];
			var stats = cardInfo(card.id);
			if ((card.pos === 0 || card.pos === 1) && stats.atk && el.hasClass("fieldZone")) el.append('<span>' + stats.atk + ' / ' + stats.def + '</span>');
		}
	} else if (info.list === "hand") {
		var revealedCards = false;
		el = $("#" + player.who() + "hand").empty();
		len = player.hand.length;
		for (var i = 0; i < len; i++) {
			var card = player.hand[i];
			var cardEl = $(cardImg(card, true));
			if (card !== -1) revealedCards = true;
			cardEl.appendTo(el);
		}
		//if cards in hand !== -1 they are being revealed temporarily, in 1000ms revert the ids
		var self = this;
		if (!revealedCards || info.who === "you") return;
		for (var i = 0; i < len; i++) player.hand[i] = -1;
		setTimeout(function() {
			self.update(info);
		}, 1000);
	} else {
		this.updateListCounts();
	}
};
Game.prototype.rpsReceive = function(rps) {
	if (!isNaN(rps) && rps !== "") rps = Number(rps);
	if (rps === "l" || rps === "w") {
		$(".sidingContainer").remove();
		if (rps == "w") {
			function addWhoGo() {
				var insides = '';
				insides += '<div id="whoGo" class="abs">';
				insides += '<button onclick="app.game.whoGo(1);">First</button>';
				insides += '<button onclick="app.game.whoGo(2);">Second</button>';
				insides += '</div>';
				$("body").append(insides);
			}
			if ($("#rps").length) {
				var fadey;
				if (app.game.rps === 0) {
					fadey = 2;
					$("#rps1").remove();
				}
				if (app.game.rps === 1) {
					fadey = 0;
					$("#rps2").remove();
				}
				if (app.game.rps === 2) {
					fadey = 1;
					$("#rps0").remove();
				}
				fadey = $("#rps" + fadey).css('color', 'blue').hide();
				$('#rps').append('<br /><b><font color="green">You win...</font></b>');
				fadey.fadeIn(1000, function() {
					$("#rps").fadeOut(250, function() {
						$("#rps").remove();
						addWhoGo();
					});
				});
			} else {
				addWhoGo();
			}
		}
		if (rps === "l") {
			var fadey;
			if (app.game.rps === 0) {
				fadey = 1;
				$("#rps2").remove();
			}
			if (app.game.rps === 1) {
				fadey = 2;
				$("#rps0").remove();
			}
			if (app.game.rps === 2) {
				fadey = 0;
				$("#rps1").remove();
			}
			fadey = $("#rps" + fadey).css('color', 'blue').hide();
			$('#rps').append('<br /><b><font color="red">You lose...</font></b>');
			fadey.fadeIn(1000, function() {
				$("#rps").fadeOut(250, function() {
					$("#rps").remove();
				});
			});
		}
	} else if (rps === "t") {
		var deletions = {0: 1, 1: 1, 2: 2};
		delete deletions[app.game.rps];
		for (var i in deletions) $("#rps" + i).remove();
		$("#rps" + app.game.rps).clone().css('color', 'blue').hide().attr("id", "fadey").appendTo('#rps').append('<br /><b><font color="grey">Tie...</font></b>');
		$("#fadey").fadeIn(1000, function() {
			app.game.rpsReceive("s");
		});
	} else if (rps === "s" || typeof rps === "number") {
		$("#rps").remove();
		var insides = '';
		insides += '<div id="rps" class="abs rps unselectable">';
		insides += '<span class="rpstitle">Roshambo</span>';
		insides += '<img src="./img/rock.png" id="rps0" onclick="app.game.rpsChoose(0);" />';
		insides += '<img src="./img/paper.png" id="rps1" onclick="app.game.rpsChoose(1);" />';
		insides += '<img src="./img/scissors.png" id="rps2" onclick="app.game.rpsChoose(2);" />';
		insides += '</div>';
		$("body").append(insides);
		$("#rps" + rps).css({
			opacity: 1
		});
		app.game.rps = undefined;
		if (rps != "s") app.game.rps = rps;
	}	
};
Game.prototype.rpsChoose = function(item) {
	var item = item + '';
	if (app.game.rps !== undefined) return;
	$("#rps" + item).css({
		opacity: 1
	});
	app.game.rps = Number(item);
	this.send('rps', {
		rps: app.game.rps
	});
};
Game.prototype.whoGo = function(whoGo) {
	$("#whoGo").remove();
	this.send('rps', {
		rps: whoGo,
		chooseTurnOrder: true
	});
};
Game.prototype.startSiding = function() {
	this.turn = 0;
	this.phase = "dp";
	var readyness = this.isSideDecking.substr(0, 2);
	this.isSideDecking = this.isSideDecking.substr(2);
	for (var key in readyness) {
		var playerId = Number(key) + 1;
		var player = this["p" + playerId];
		var status;
		if (readyness[key] === "0") {
			status = "Side Decking";
			player.ready = false;
		} else {
			status = "Ready!";
			player.ready = true;
		}
		$("#" + player.who() + "status").html(status);
	}
	if (this.spectating || this.you.ready) {
		return;
	}
	var virginDecks = this.isSideDecking;
	(function() {
		//parse virginDecks
		virginDecks = virginDecks.split('*');
		for (var i in virginDecks) {
			virginDecks[i] = virginDecks[i].split(',');
			var ray = virginDecks[i];
			for (var x in ray) {
				ray[x] = Number(ray[x]);
				if (!ray[x]) ray.splice(x, 1); //remove the blank
			}
		}
		virginDecks = {deck: virginDecks[0], extra: virginDecks[1], side: virginDecks[2]};
	})();
	this.virginDecks = virginDecks;
	var container = $('<div class="sidingContainer"></div>').appendTo('#game');
	var decks = ["deck", "extra", "side"];
	for (var i in decks) {
		var deckId = decks[i];
		var deck = virginDecks[deckId];
		container.append("<h2>" + deckId + "(" + deck.length + ")</h2>");
		var deckContainer = $('<div id="' + deckId + '" class="deckContainer"></div>').appendTo(container);
		for (var x in deck) {
			var id = deck[x];
			var img = $('<div></div>');
			$(cardImg(id, true)).attr("id", deckId + x).appendTo(img);
			deckContainer.append(img);
		}
	}
	var doneSiding = $('<button id="doneSiding" class="btn">Done Siding</button>').appendTo("#game");
	doneSiding.on("click", function() {
		var cards = $(".sidingContainer").find('img');
		var deck = {deck: [], extra: [], side: []};
		for (var i in cards) {
			if (isNaN(i)) continue;
			var el = $(cards[i]);
			var identifier = el.attr('id');
			var newList = el.closest('.deckContainer').attr('id');
			deck[newList].push(identifier);
		}
		app.game.send('doneSiding', {newDeck: deck});
		$("#youstatus").html("Ready!");
		$(".deckContainer").remove();
		$(this).remove();
	});
};
Game.prototype.addLog = function(msg) {
	$(".gameLogs").append('<div>' + msg + '</div>').scrollTop($(".gameLogs").prop("scrollHeight"));
};
Game.prototype.chat = function(username, msg) {
	var msg = ate.rooms.global.chatParse(username, msg, true);
	this.addLog(msg);
};
Game.prototype.raw = function(msg) {
	this.addLog(msg);
};
Game.prototype.processQueue = function() {
	if (this.isQueueProcessing) return;
	this.isQueueProcessing = true;
	this.nextQueue();
};
Game.prototype.nextQueue = function() {
	var self = this;
	if (app.replaying) {
		//if replaying, replay slower than actual game play animations
		var t = new Date() / 1;
		if (self.lastQueue) {
			if (t - this.lastQueue < 500) {
				return setTimeout("app.game.nextQueue()", 500 - (t - this.lastQueue));
			}
		}
		self.lastQueue = t;
	}
	if (!self.queue.length) {
		self.isQueueProcessing = false;
		return;
	}
	var currentQueue = self.queue[0];
	self.queue.splice(0, 1);
	var event = currentQueue[0];
	var data = currentQueue[1];
	switch (event) {
		default: alert("Oops!", "No case for event: '" + event + "'", "error");
		break;
		
		case 'reset':
			self.parseResetData(data);
			self.nextQueue();
			break;
		
		case 'counter':
			var player = self[data[1]];
			var type = data[2].charAt(0);
			var zone = Number(data[2].substr(1));
			var firstSlot = player.field[zone][0];
			if (!firstSlot.counter) firstSlot.counter = 0;
			if (type === "+") {
				firstSlot.counter++;
			} else {
				firstSlot.counter--;
				if (firstSlot.counter === 0) delete firstSlot.counter;
			}
			this.update({list: "field", zone: zone, who: player.who()});
			self.nextQueue();
			break;
		
		case 'token':
			var player = self[data[1]];
			var zone = Number(data[2]);
			var cardId = Number(data[3]);
			player.field[zone].push({
				id: cardId,
				pos: 1
			});
			self.update({list: "field", who: player.who(), zone: zone});
			self.nextQueue();
			break;
		
		case 'attack':
			var player = self[data[1]];
			var sourceZone = Number(data[2]);
			var targetZone = Number(data[3]);
			if (!data[3]) targetZone = 7; //it's the farthest zone in the middle (attack directly)
			var sword = cardImg(-3);
			if (player.who() === "opp") $(sword).addClass("v");
			var callback = function() {self.nextQueue();};
			sword.copy($("#" + player.who() + sourceZone).find('img')).toBody().moveTo($("#" + player.opp().who() + targetZone), 1000, function() {
				if (data[3]) {
					$(".targetedCard").removeClass("targetedCard");
					$("#" + player.opp().who() + data[3]).find('img').addClass('targetedCard');
				}
				$(sword).fadeOut(250, function() {
					$(sword).remove();
				});
				callback();
			});
			break;
		
		case 'targetCard':
			var targetedPlayer = self[data[1]];
			var list = data[2];
			var slot = data[3];
			var el = $($("#" + targetedPlayer.who() + list + " img")[slot]);
			$(".targetedCard").removeClass("targetedCard");
			el.addClass('targetedCard');
			self.nextQueue();
			break;
		
		case 'reveal':
			var player = self[data[1]];
			var slot = Number(data[2]);
			var cardId = Number(data[3]);
			if (player.who() === "opp") {
				player.hand[slot] = cardId;
				self.update({list: "hand", who: player.who()});
			}
			$(".cardDescription").html(self.cardInfo(cardId));
			self.addLog(player.name + ' revealed a <b id="' + cardId + '" class="cardName">' + cardInfo(cardId).name + '</b> in their hand.');
			self.nextQueue();
			break;
		
		case 'shuffle':
		case 'rollDice':
		case 'coinFlip':
			//add a log and show an animation (none of these animations are done lol)
			var player = self[data[1]];
			var msg = "";
			if (event === "shuffle") msg = player.name + ' shuffled their deck.';
			if (event === "rollDice") msg = player.name + " rolled a " + data[2] + ".";
			if (event === "coinFlip") msg = player.name + "'s coin flip landed on " + ((data[2] === "0") ? 'heads' : 'tails') + '.';
			self.addLog(msg);
			self.nextQueue();
			break;
		
		case 'revokeDraw':
			var player = self[data[1]];
			$("#draw").html("Offer Draw");
			self.addLog(player.name + " has revoked their draw offer.");
			self.nextQueue();
			break;
		
		case 'offerDraw':
			var player = self[data[1]];
			if (player.who() === "you") {
				$("#draw").html("Revoke Draw");
			} else {
				$("#draw").html("Accept Draw");
			}
			self.addLog(player.name + " has made a draw offer.");
			self.nextQueue();
			break;
		
		case 'win':
			var winner = data[1];
			var loser = data[2];
			var score = data[3];
			if (winner === 'tie') {
				self.addLog('Both players agreed to a draw offer.');
			} else {
				self.addLog('<b>' + self[loser].name + ' admitted defeat.</b>');
				self.addLog(self[winner].name + ' ' + score.split('-')[0] + ' wins.');
				self.addLog(self[loser].name + ' ' + score.split('-')[1] + ' wins.');
			}
			$("#draw").html("Offer Draw");
			$("#draw, #admit").prop("disabled", true);
			self.nextQueue();
			break;
		
		case 'nextRound':
			self.round++;
			self.addLog("<h4>Time for round " + self.round + "!<br />Side decking started.</h4>");
			this.isSideDecking = data[1];
			self.startSiding();
			self.nextQueue();
			break;
		
		case 'changePoints':
			var player = this[data[1]];
			player.changePoints(Number(data[2]), function() {
				self.nextQueue();
			});
			break;
		
		case 'j':
		case 'l':
			if (event === "l") {
				self.addLog(data[1] + " left.");
			}
			if (event === "j") {
				self.addLog(data[1] + " joined.");
			}
			self.nextQueue();
			break;
		
		case 'raw':
		case 'chat':
			var name = data[1];
			data.splice(0, 2);
			var msg = data.join('|');
			self[event](name, msg);
			self.nextQueue();
			break;
		
		case 'status':
			var player = this[data[1]];
			var status = data[2];
			$("#" + player.who() + 'status').html(status);
			self.nextQueue();
			break;
		
		case 'view':
			var viewer = this[data[1]];
			var viewee = this[data[2]];
			var list = data[3];
			var cards = data[4];
			if (cards) cards = allToNum(cards.split(','));
			viewer.viewList(viewee, list, cards);
			self.nextQueue();
			break;
		
		case 'mill':
			var player = this[data[1]];
			var list = data[2];
			var cardId = Number(data[3]);
			player.mill(cardId, function() {
				self.nextQueue();
			}, list);
			break;
		
		case 'flip':
			var player = this[data[1]];
			var zone = Number(data[2]);
			var transform = {
				0: 2,
				2: 0,
				1: 3,
				3: 1
			};
			var card = player.field[zone][0];
			card.pos = transform[card.pos];
			if (data[3]) card.id = Number(data[3]);
			if ((card.pos === 2 || card.pos === 3) && player.who() === "opp") card.id = -1;
			this.update({list: "field", zone: zone, who: player.who()});
			this.nextQueue();
			break;
		
		case 'rotate':
			var player = this[data[1]];
			var zone = Number(data[2]);
			var transform = {
				0: 1,
				1: 0,
				2: 3,
				3: 2
			};
			var card = player.field[zone][0];
			card.pos = transform[card.pos];
			this.update({list: "field", zone: zone, who: player.who()});
			this.nextQueue();
			break;
		
		case 'phase':
			this.phase = data[1];
			this.updatePhases();
			this.nextQueue();
			break;
		
		case 'nextTurn':
			this.phase = "dp";
			this.turn++;
			this.addLog('<h2>Turn ' + this.turn + '</h2>');
			if (this.turn === 1 || data[1]) {
				//initial turn player
				this.turnPlayer = this[data[1]];
				this.addLog(this.turnPlayer.name + ' is going first.');
			} else this.turnPlayer = this.turnPlayer.opp();
			this.updatePhases();
			this.nextQueue();
			break;
		
		case 'rps':
			this.rpsReceive(data[1]);
			this.nextQueue();
			break;
		
		case 'move':
			var perspective = data[1];
			var src = data[2].split(',');
			var tar = data[3].split(',');
			var cardId = Number(data[4]);
			var source = {
				perspective: perspective,
				who: src[0],
				list: src[1],
				slot: Number(src[2]),
				zone: Number(src[3]),
				pos: Number(src[4])
			};
			var target = {
				who: tar[0],
				list: tar[1],
				slot: Number(tar[2]),
				zone: Number(tar[3]),
				pos: Number(tar[4])
			};
			var sourcePlayer = this[perspective][source.who]();
			if (cardId) {
				var list = sourcePlayer[source.list];
				if (source.list === "field") {
					list[source.zone][source.slot].id = cardId;
				} else list[source.slot] = cardId;
			}
			this.move(cardId, source, target, function() {
				self.nextQueue();
			});
			break;

		case 'draw':
			var player = data[1];
			var cardId = Number(data[2]);
			var side = self[player];
			side.draw(Number(cardId), function() {
				self.nextQueue();
			});
			break;
	}
};
Game.prototype.send = function(event, data) {
	if (typeof data !== "object") data = {data: data};
	data.event2 = event;
	app.socket.emit('game', data);
};
Game.prototype.chatSend = function(msg) {
	this.send('chat', {
		msg: msg
	});
};
Game.prototype.drop = function(drag) {
	var self = this;
	function info(el, noparent) {
		var sideDecking;
		var info = {};
		var parent = el.parent();
		var img = el[0];
		if (noparent) parent = el;
		var id = parent.attr('id');
		if (el.parent().hasClass('deckContainer') || el.parent().parent().hasClass('deckContainer')) {
			//side decking
			sideDecking = true;
			parent = el.parent();
			if (!parent.hasClass('deckContainer')) {
				parent = parent.parent();
			} else img = el.find('img')[0];
			id = parent.attr('id');
			info.sideDecking = true;
		}
		//determine who
		info.who = "you";
		if (id && id.split('opp').length - 1 > 0) info.who = "opp";
		if (id) id = id.replace('you', '').replace('opp', '');
		//determine array type & zone
		if (isNaN(id)) {
			info.list = id;
		} else {
			info.list = 'field';
			info.zone = Number(id);
		}
		if (parent.hasClass("cardList")) {
			info.who = self.cardList.targetPlayer.who();
			info.list = self.cardList.list;
		}
		//determine slot
		if (noparent && !sideDecking) return info;
		var imgs = parent.find('img');
		for (var slot in imgs) {
			if (isNaN(slot)) continue;
			if (imgs[slot] === img) {
				info.slot = Number(slot);
				break;
			}
		}
		return info;
	}
	var source = info($(drag.source));
	var target = info($(drag.target), true);
	
	if (source.sideDecking) {
		var clone = $(drag.source).parent().clone();
		var selector = ".sidingContainer #" + target.list;
		if (target.slot) {
			$($(selector + " img")[target.slot]).parent().before(clone);
		} else {
			$(selector).append(clone);
		}
		$(drag.source).parent().remove();
		return;
	}
	
	var moveZone = false;
	if (source.list === target.list) {
		if (source.list === "field") {
			if (source.zone === target.zone && target.who === "you") return;
			if (target.who === "opp") {
				//giving control of cards in zone
				if (this.opp.field[target.zone].length) return; //there's already a card on this zone
			}
			//moving zones
			moveZone = true;
		} else return;
	}
	if (moveZone) {
		//moving zones
		this.send('move', {
			source: source,
			target: target
		});
	} else {
		//moving lists
		if (target.who === "opp" && target.list === "field") {
			if (this.opp.field[target.zone].length) return; //there's already a card on this zone
		}
		if (source.who !== "opp" && target.who === "you" && target.list === "field") {
			if (this.you.field[target.zone].length) {
				//you're trying to overlay a card
				target.pos = 0;
			} else return this.prompt(source, target);
		}
		if (target.list === "deck") return this.prompt(source, target);
		//moving lists
		this.send('move', {
			source: source,
			target: target
		});
	}
};
Game.prototype.prompts = {};
Game.prototype.prompt = function(source, target) {
	var id = new Date() / 1;
	$('<div id="promptOpaqueness' + id + '" class="promptOpaqueness"></div').appendTo("body");
	var prompt = $('<div id="prompt' + id + '" class="prompt abs"></div>').appendTo("body");
	if (target.list === "deck") {
		//top or bottom of deck
		prompt.append('<h2>Top or Bottom...</h2>');
		prompt.append($(cardImg(-2, true)).attr('id', 0).height(100));
		prompt.append($(cardImg(-2, true)).attr('id', 1).height(100));
	}
	if (target.list === "field") {
		var zoneEl = $("#" + this[target.who].who() + target.zone);
		prompt.css({
			"margin-left": "auto",
			"margin-top": "auto",
			top: (zoneEl.offset().top + (zoneEl.height() / 2) - prompt.height()) + "px",
			left: (zoneEl.offset().left + (zoneEl.width() / 2) - (prompt.width() / 2)) + "px"
		});
		
		var cardId = this[source.who][source.list];
		if (source.list === "field") {
			cardId = cardId[source.zone][source.slot].id;
		} else cardId = cardId[source.slot];
		var spellTrap = false;
		var positions = [3, 0, 1];
		if (target.zone > 4) spellTrap = true;
		if (spellTrap) positions = [0, 2];
		var positionCount = positions.length;
		for (var i = 0; i < positionCount; i++) {
			var position = positions[i];
			if (position === 0) prompt.append($(cardImg(cardId, true)).attr("id", position)); //faceup
			if (position === 1) prompt.append($(cardImg(cardId, true)).attr("id", position).addClass("defense")); //faceupdefense
			if (position === 2) prompt.append($(cardImg(-1, true)).attr("id", position)); //facedown
			if (position === 3) prompt.append($(cardImg(-1, true)).attr("id", position).addClass("defense")); //facedowndefense
		}
	}
	this.prompts[id] = [source, target];
};
Game.prototype.promptRemove = function(id) {
	delete this.prompts[id];
	$("#prompt" + id).remove();
	$("#promptOpaqueness" + id).remove();
};
Game.prototype.promptRespond = function(id, el) {
	var prompt = this.prompts[id];
	var source = prompt[0];
	var target = prompt[1];
	this.promptRemove(id);
	target.pos = Number(el.id);
	this.send('move', {
		source: source,
		target: target
	});
};
Game.prototype.contextHover = function(el) {
	var el = $(el);
	var oldList = "";
	var isHand = (el.parent().attr('id') === "youhand");
	if (this.context) {
		oldList = this.context.options.join('');
		if (isHand || (el.attr('id') !== this.context.el.attr('id'))) {
			this.removeContext();
		}
	}
	var id = el.attr('id');
	if (id) id = id.replace('you', '');
	var options = [];
	if (id === "deck") {
		if (el.text() === "0") return;
		options.push("Shuffle", "View", "Mill", "RFG", "RFG Set", "Show");
	} else if (id === "extra") {
		if (el.text() === "0") return;
		options.push("Show");
	} else if (!id) {
		//hand
		$("#youhand").addClass("highestCardZindex");
		options.push("Reveal", "Show Hand");
	} else {
		if (isNaN(id) || !el.html()) return;
		var zone = Number(id);
		if (app.game.phase === "bp" && zone >= 0 && zone <= 4) options.push("Attack");
		options.push("Rotate", "Flip");
	}
	if (!isHand && oldList && oldList === options.join('')) return;
	var contextMenu = $('<div class="contextMenu"></div>');
	var optionsLen = options.length;
	for (var i = optionsLen - 1; i > -1; i--) contextMenu.append('<div>' + options[i] + '</div>');
	contextMenu.css({
		left: el.offset().left + 'px',
		bottom: ($("body").height() - el.offset().top) + "px",
		width: el.width() + "px"
	}).appendTo('body');
	var changes = {height: contextMenu.height() + "px"};
	var callback = undefined;
	if (!id) {
		//animate the context menu to move up with the card animation
		changes.bottom = ($("body").height() - $("#youhand").offset().top) + "px";
		callback = function() {
			if (!id) el.addClass("risenCard");
		};
	}
	contextMenu.css("height", "0px").animate(changes, 250, callback);
	this.context = {
		el: el,
		options: options
	};
};
Game.prototype.removeContext = function() {
	if (!this.context) return;
	delete this.context;
	$(".contextMenu").finish().remove();
	$(".risenCard").removeClass("risenCard");
	$(".highestCardZindex").removeClass("highestCardZindex");
};
Game.prototype.contextClickOption = function(option) {
	var el = this.context.el;
	var info = {};
	var id = el.attr('id');
	id = id || '';
	id = id.replace('you', '').replace('opp', '');
	
	if (el.parent().attr('id') === "youhand") {
		info.list = "hand";
		var imgs = el.parent().find('img');
		for (var slot in imgs) {
			if (isNaN(slot)) continue;
			if (imgs[slot] === el[0]) {
				info.slot = Number(slot);
				break;
			}
		}
	} else if (isNaN(id)) {
		info.list = id;
	} else {
		info.list = "field";
		info.zone = Number(id);
	}
	info.option = option;
	if (this.context.who) info.who = this.context.who;
	this.removeContext();
	if (info.option === "Attack") {
		//check if there are any targets
		var zones = this.opp.field;
		var targets = 0;
		var firstTargetZone = 'direct';
		for (var i = 0; i < 13; i++) {
			if (i >= 0 && i <= 4 && zones[i].length) {
				targets++;
				if (targets === 1) firstTargetZone = i;
				$("#opp" + i).addClass("attackableZone");
			}
		}
		if (targets > 1) {
			this.findingAttackTarget = info;
			return;
		} else {
			info.target = firstTargetZone;
			$(".attackableZone").removeClass("attackableZone");
		}
	}
	this.send('contextMenu', info);
};
Game.prototype.foundAttackTarget = function(zone) {
	var info = this.findingAttackTarget;
	info.target = zone;
	this.send('contextMenu', info);
	this.cancelFindingAttackTarget();
};
Game.prototype.cancelFindingAttackTarget = function() {
	delete this.findingAttackTarget;
	$(".attackableZone").removeClass("attackableZone");
};
Game.prototype.cardInfo = function(id) {
	var card = cardInfo(id);
	var info = '<center style="margin-top: 10px;"><h3 style="text-decoration: underline;">' + card.name + '</h3>' + '<img style="float: left;margin: 5px;" width="33%" src="' + cardImg(id, true).src + '" />' + '</center>';
	if (card.race) {
		info += "<strong>Type:</strong> " + card.race + " / " + card.kind + "<br />";
	} else info += "<strong>Type:</strong> " + card.kind + "<br />";
	if (card.attribute) info += "<strong>Attribute:</strong> " + card.attribute + "<br />";
	if (card.atk) info += "<br /><strong>Atk/Def:</strong> " + card.atk + " / " + card.def + "<br />";
	if (card.level) info += "<strong>Level:</strong> " + card.level + "<br />";
	info += "<br />" + card.description;
	return info;
};
Game.prototype.move = function(cardId, source, target, callback) {
	//get sourceImg before we possibly delete the cardId from the array
	source.anim = true;
	var sourceImg = this[source.perspective][source.who]().cardImg(source);
	delete source.anim;	
	
	var self = this;
	var perspective = source.perspective;
	var sourcePlayer = this[perspective][source.who]();
	var targetPlayer = this[perspective][target.who]();
	source.who = sourcePlayer.who();
	target.who = targetPlayer.who();

	//edit the arrays
	var moveZone = false;
	if (source.list === target.list) {
		if (source.list === "field") {
			if (source.zone === target.zone && target.who === source.who) return;
			moveZone = true;
		} else return;
	}
	var revealId = false;
	if (moveZone) {
		if (target.who === source.who) {
			//card moving zones
			var cardCache = sourcePlayer.field[source.zone][source.slot];
			sourcePlayer.field[source.zone].splice(source.slot, 1);
			targetPlayer.field[target.zone].push(cardCache);
		} else {
			//changing card control - in this case we move the entire zone instead of just a single card in case we're changing control of cards with attached cards
			var zoneCache = sourcePlayer.field[source.zone];
			if (targetPlayer.field[target.zone].length) return; //there's already something in the zone
			sourcePlayer.field[source.zone] = [];
			var cardCount = zoneCache.length;
			for (var i = 0; i < cardCount; i++) targetPlayer.field[target.zone].push(zoneCache[i]);
			revealId = true;
		}
	} else {
		//moving lists
		if (target.who !== source.who) {
			//changing card control
			if (target.list === "field") {
				var cardCache = sourcePlayer[source.list][source.slot];
				if (targetPlayer.field[target.zone].length) return; //there's already something in the zone
				sourcePlayer[source.list].splice(source.slot, 1);
				targetPlayer.field[target.zone].push({
					id: cardCache,
					pos: 0
				});
				revealId = true;
			} else {
				var cardCache = sourcePlayer[source.list][source.slot];
				var pushFunk = "push";
				if (target.list === "deck" && (!target.pos || target.pos === 0)) pushFunk = "unshift";
				sourcePlayer[source.list].splice(source.slot, 1);
				targetPlayer[target.list][pushFunk](cardCache);
				revealId = true;
			}
		} else {
			//these are cases where the source === target players
			var cardCache = sourcePlayer[source.list][source.slot];
			if (source.list === "field") {
				cardCache = sourcePlayer[source.list][source.zone][source.slot].id;
				sourcePlayer[source.list][source.zone].splice(source.slot, 1);
			} else sourcePlayer[source.list].splice(source.slot, 1);
			if (target.list === "deck" && (!target.pos || target.pos === 0)) {
				targetPlayer[target.list].unshift(cardCache); //at the top of the deck
			} else {
				var pushObj = cardCache;
				if (target.list === "field") {
					pushObj = {
						id: cardCache,
						pos: target.pos
					};
					targetPlayer[target.list][target.zone].push(pushObj);
				} else targetPlayer[target.list].push(pushObj);
			}
			revealId = true;
			if (target.pos === 2 || target.pos === 3) revealId = false;
		}
	}

	//animation
	if (source.list === "grave" || source.list === "banished" || source.list === "extra" || source.list === "deck") this.updateListCounts();
	var start = $($("#" + sourcePlayer.who() + source.list + " img")[source.slot]);
	if (source.list === "field") {
		var newStart = $($("#" + sourcePlayer.who() + source.zone + " img")[source.slot]);
		if (newStart.length) start = newStart;
	}
	if (!start.length) start = $("#" + sourcePlayer.who() + source.list);
	var moveTo = $("#" + targetPlayer.who() + target.list);
	if (target.list === "field") moveTo = $("#" + targetPlayer.who() + target.zone);
	if (target.list === "hand" && self[target.who].hand.length > 1) moveTo = $("#" + targetPlayer.who() + "hand img").last(); //move to last img in hand

	if (cardId) {
		var img = cardImg(cardId);
	} else var img = sourceImg;
	img.copy(start, true).toBody();
	if (start.is("img")) start.hide();
	if (sourcePlayer.who() === "opp") $(img).addClass("v");
	img.moveTo(moveTo, 500, function() {
		$(img).remove();
		if (start.is("img")) start.remove();
		self.update(target);
		self.update(source);
		if (callback) callback();
	});
};


var dbConversion = {
	/*
		- setcodes are archetype numbers hex codes
			- there's a lot so i wont paste em here but they're on http://www.ygopro.co/Forum/tabid/95/g/posts/t/120/Adding-cards-to-YGOPro--Tutorial----Scripting-video-Added#post381
		- if monster then atk, def, level, race, attribute should all be set to 0
		- id's are the id of the card located in the bottom left corner (images are img.jpg)
		- kind or type is just the type
		
		Spell speeds C&P from some that same thread... seemed important
		---------------------
		Spell Speed 1, which is the slowest and has to be activated by your decision. These card effects cannot be activated in response to any other effects. Speed Spell 1 are the cards that usually start a Chain link 1, which a chain is cards activating in response to each other.
		All of these types of cards fall under Spell Speed 1:
		Normal/Field/Continuous/Equip & Ritual Spell Cards
		Flip/Ignition and Trigger Effects
		Ignition-like & Trigger-like Effects

		Spell Speed 2, which is the second slowest and second fastest. You can chain to Spell Speed 2 cards with these but you cannot chain to Spell Speed 3 cards at the same time. These are cards that can start a Chain Link 1 or add up to an already started chain up to Chain Link 2,3,4 or higher if possible.
		All of these types of cards fall under Spell Speed 2:
		Quick-Play Spell Cards
		Normal & Continuous Trap Cards
		Quick Effects
		Quick-like Effect

		Spell Speed 3, these are the fastest effects out of the 3. You can't start a Chain Link 1 with these cards but you can always start a Chain link 2 or higher with these, if a Chain Link involving a Spell Speed 3 effect happens then the only way to keep responding to the effect is with Spell Speed 3 effects and nothing else. Spell Speed 3 effects can activate even before a monster is summoned to the field or a card effect is activated.
		All of these types of cards fall under Spell Speed 3:
		Counter Trap Cards.
	*/
	ot: ["there is no 0", "OCG", "TCG", "OCG & TCG", "Anime"],
	kinds: {
		2: "Normal Spell Card",
		4: "Normal Trap Card",
		17: "Normal Monster",
		33: "Effect Monster",
		65: "Fusion Monster",
		97: "Fusion / Effect Monster",
		129: "Ritual Monster",
		130: "Ritual Spell",
		161: "Ritual / Effect Monster",
		545: "Spirit Monster",
		1057: "Union Monster",
		2081: "Gemini Monster",
		4113: "Tuner / Normal Monster",
		4129: "Tuner / Effect Monster",
		8193: "Synchro Monster",
		8225: "Synchro / Effect Monster",
		12321: "Synchro / Tuner / Effect Monster",
		16401: "Token",
		65538: "Quick-Play Spell Card",
		131074: "Continuous Spell Card",
		131076: "Continuous Trap Card",
		262146: "Equip Spell Card",
		524290: "Field Spell Card",
		1048580: "Counter Trap Card",
		2097185: "Flip Effect Monster",
		4194337: "Toon Monster",
		8388609: "XYZ Monster",
		8388641: "XYZ / Effect Monster",
		16777216: "Pendulum",
		16777233: "Pendulum Normal Monster",
		16777249: "Pendulum Effect Monster"
	},
	races: {
		1: "Warrior",
		2: "Spellcaster",
		4: "Fairy",
		8: "Fiend",
		16: "Zombie",
		32: "Machine",
		64: "Aqua",
		128: "Pyro",
		256: "Rock",
		512: "Winged-beast",
		1024: "Plant",
		2048: "Insect",
		4096: "Thunder",
		8192: "Dragon",
		16384: "Beast",
		32768: "Beast-Warrior",
		65536: "Dinosaur",
		131072: "Fish",
		262144: "Sea Serpent",
		524288: "Reptile",
		1048576: "Psychic",
		2097152: "Divine-beast",
		4194304: "Creator God",
		8388608: "Wyrm"
	},
	attributes: {
		1: "Earth",
		2: "Water",
		4: "Fire",
		8: "Wind",
		16: "Light",
		32: "Dark",
		64: "Divine"
	},
	archetypes: {
		1: "Ally of Justice 0x1",
		2: "Genex	0x2",
		4: "Amazoness	0x4",
		5: "Arcana	0x5",
		6: "Dark World	0x6",
		7: "Ancient Gear 0x7",
		8: "HERO 0x8",
		9: "Neos	0x9",
		10: "Evilswarm	0xA",
		11: "Infernity	0xB",
		12: "Alien	0xC",
		13: "Saber	0xD",
		14: "Watt	0xE",
		15: "Ojama	0xF",
		16: "Gusto	0x10",
		17: "Karakuri	0x11",
		18: "Frog	0x12",
		19: "Meklord	0x13",
		21: "B.E.S.	0x15",
		22: "roid	0x16",
		23: "Synchron	0x17",
		24: "Cloudian	0x18",
		25: "Gladiator Beast	0x19",
		26: "Dark Scorpion	0x1A",
		27: "Phantom Beast	0x1B",
		29: "Koa'ki	0x1D",
		30: "Chrysalis	0x1E",
		31: "Neo-Spacian	0x1F",
		32: "Shien	0x20",
		33: "Earthbound Immortal 0x21",
		34: "Jurrac	0x22",
		35: "Malefic	0x23",
		36: "Scrap	0x24",
		37: "Iron Chain	0x25",
		38: "Morphtronic	0x26",
		39: "T.G.	0x27",
		40: "Batteryman	0x28",
		41: "Dragunity	0x29",
		42: "Naturia	0x2A",
		43: "Ninja	0x2B",
		44: "Flamvell	0x2C",
		46: "Gravekeeper	0x2E",
		47: "Ice Barrier	0x2F",
		48: "Vylon	0x30",
		49: "Fortune Lady	0x31",
		50: "Volcanic	0x32",
		51: "Blackwing	0x33",
		52: "Crystal Beast	0x34",
		53: "Fabled	0x35",
		54: "Machina	0x36",
		55: "Mist Valley	0x37",
		56: "Lightsworn	0x38",
		57: "Laval	0x39",
		58: "Ghiski	0x3A",
		59: "Red-Eyes	0x3B",
		60: "Reptilliane	0x3C",
		61: "Six Samurai	0x3D",
		62: "Worm	0x3E",
		63: "Majestic	0x3F",
		64: "Forbidden	0x40",
		65: "LV	0x41",
		66: "Nordic	0x42",
		67: "Junk	0x43",
		68: "Agent	0x44",
		69: "Archfiend	0x45",
		70: "Fusion	0x46",
		71: "Gem-	0x47",
		72: "Number	0x48",
		73: "Skyblaster	0x49",
		74: "Timelord	0x4A",
		75: "Aesir	0x4B",
		76: "Trap Hole	0x4C",
		78: "Evol	0x4E",
		79: "Assault	0x4F",
		80: "Venom	0x50",
		81: "Gadget	0x51",
		82: "Guardian	0x52",
		83: "Constellar	0x53",
		84: "Gagaga	0x54",
		85: "Photon	0x55",
		86: "Inzektor	0x56",
		87: "Resonator	0x57",
		88: "Wind-up	0x58",
		89: "Gogogo	0x59",
		90: "Penguins	0x5A",
		91: "Inmato	0x5B",
		92: "Sphinx	0x5C",
		96: "Bamboo Sword	0x60",
		97: "Ninjitsu Art	0x61",
		98: "Toon	0x62",
		99: "Reactor	0x63",
		100: "Harpie	0x64",
		101: "Infestation	0x65",
		102: "Symphonic	0x66",
		103: "Iron	0x67",
		104: "Tin	0x68",
		105: "Hieratic	0x69",
		106: "Butterspy	0x6A",
		107: "Bounzer	0x6B",
		108: "Lightray	0x6C",
		109: "Majin	0x6D",
		110: "Prophecy	0x6E",
		111: "Heroic	0x6F",
		112: "Chronomaly	0x70",
		113: "Madolche	0x71",
		114: "Geargia	0x72",
		115: "Xyz	0x73",
		117: "Abyss	0x75",
		118: "Heraldic	0x76",
		119: "Atlantean	0x77",
		120: "Nimble	0x78",
		122: "Noble Knight	0x7A",
		123: "Galaxy	0x7B",
		132: "Chronomaly Technology	0x84 (Currently Unknown why it has its own set code)",
		144: "Meklord Pieces	0x90",
		145: "Dark Tuner/Synchro	0x91",
		146: "Fortune Fairy	0x92",
		147: "Puppet	0x93",
		148: "Fossil Warrior	0x94",
		149: "Cat	0x95",
		150: "Clear	0x96",
		151: "VWXYZ	0x97",
		256: "Synchron Synchros	0x100 (Synchros that require a Synchron Tuner)",
		257: "Synchro Fusions	0x101 (Fusions that require a Synchro Monster)",
		258: "Something Evil Hero Fusion Related	0x102 (Unknown what this is)",
		259: "Cyber	0x103",
		512: "Speed Spell	0x200",
		513: "Chaos Xyz	0x201",
		4098: "R-Genex	0x1002",
		4106: "Steelswarm	0x100A",
		4109: "X-Saber	0x100D",
		4118: "Vehichroid	0x1016",
		4139: "Armor Ninja	0x102B",
		4149: "The Fabled	0x1035",
		4167: "Gem-Knight	0x1047",
		4175: "/Assault	0x104F",
		4206: "Spellbook	0x106E",
		8194: "Genex Ally	0x2002",
		12296: "E HERO	0x3008",
		12301: "XX-Saber	0x300D",
		12354: "Nordic Ascendant	0x3042",
		12366: "Evoltile	0x304E",
		12397: "Dragoon	0x306D",
		12435: "Gimmick Puppet	0x3093",
		20488: "Vision Hero	0x5008",
		20546: "Nordic Relic	0x5042",
		24584: "Evil HERO	0x6008",
		24642: "Nordic Beasts	0x6042",
		24654: "Evolsuar	0x606E",
		24685: "Djinn of Rituals	0x606C",
		40968: "Masked HERO	0xA008",
		41026: "Nordic Alfar	0xA042",
		49160: "D HERO	0xC008",
		602120: "Neos AND E Hero	0x93008",
		1828513: "Six Samuari AND Shien	0x1BE6A1",
		2818065: "Karakuri AND Ninja	0x2B0011",
		3866659: "Malefic AND Red-Eyes	0x3B0023",
		4063268: "Scrap AND Worm	0x3E0024",
		4390935: "Junk AND Synchron	0x430017",
		4391168: "Junk AND Synchron Synchro	0x430100",
		4521995: "Infernity AND Archfiend	0x45000B",
		4522009: "Gladiator Beast AND Archfiend	0x450019",
		4522020: "Scrap AND Archfiend	0x450024",
		4522082: "Toon AND Archfiend	0x450062",
		4526159: "Archfiend AND /Assault	0x45104F",
		4591687: "Gem-knight AND Fusion	0x461047",
		4718592: "Heraldic AND Number	0x480000",
		4718704: "Chronomaly AND Number	0x480070",
		4722731: "Number AND Armor Ninja	0x48102B",
		5373963: "Infernity AND Guardian	0x52000B",
		5373981: "Koa'ki AND Guardian	0x52001D",
		5373994: "Naturia AND Guardian	0x52002A",
		5374044: "Guardian AND Sphinx	0x52005C",
		5374064: "Guardian AND Chronomaly	0x520070",
		7012437: "Photon AND Bounzer	0x6A0055",
		7143937: "Chaos Xyz AND Djinn	0x6C0201",
		7209083: "Galaxy AND Prohecy	0x75003A",
		7667770: "Ghishki AND Abyss	0x75003A",
		7667828: "Mermail AND Abyss	0x750074",
		8061000: "Number AND Galaxy	0x7B0048",
		8061013: "Galaxy AND Photon	0x7B0055",
		9449491: "Meklord AND Emperor	0x903013",
		9461779: "Meklord AND Army	0x906013",
		9764916: "Crystal Beast AND Cat	0x950034",
		16777283: "Junk AND Synchron Synchro	0x1000043 (if you look back at 4391168 you'll see that it is the same, proving that the codes can go in either order)",
		16842794: "Naturia AND Synchro Fusion	0x101002A",
		16932872: "Evil HERO AND 258?	0x1026008",
		33554445: "Speed Spell AND Saber	0x200000D",
		33554468: "Speed Spell AND Scrap	0x2000024",
		33554502: "Speed Spell AND Fusion	0x2000046",
		81940232: "Number AND Gimmick Puppet	0x4E24F08 (No Clue why this one defies the pattern)"
	}
};
var dbConvertCache = {};
function cardInfo(id) {
	id = Math.abs(id);
	var conversion = dbConversion;
	if (dbConvertCache[id]) return dbConvertCache[id]; else var ray = db[id];
	if (!ray) return;
	dbConvertCache[id] = {
		id: id,
		name: ray[0],
		description: ray[1],
		ot: conversion.ot[ray[2]],
		alias: ray[3],
		archetype: conversion.archetypes[ray[4]],
		kind: conversion.kinds[ray[5]],
		atk: ray[6],
		def: ray[7],
		level: ray[8],
		race: conversion.races[ray[9]],
		attribute: conversion.attributes[ray[10]],
		//category: ray[11], //from what i've read all it is is something to make searching for cards easier :s
	};
	return dbConvertCache[id];
};