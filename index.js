let	enabled=true, //default enabling of module  (default true)
	markenabled=true,  //default enabling of markers	(default true)
	alerted=false;	//default enabling of system notice (default false)
//Mob ids	
const mobzone = [6553610, 6553604, 3932217, 13107238, 6553651, 6553652], //zone id of mob
	mobtemplate = [99, 5011, 33, 35, 7011, 9050] 
	custommsg= 'World Boss Alert' //change custom message here

module.exports = function markmob(dispatch) {
	let player,
		ind;

	let countarr = [],
		moblocationx = [],
		moblocationy = [],
		moblocationz = [];
		
	dispatch.hook('S_LOGIN', 1, event => {
		player = event.playerId;
	});
	
	dispatch.hook('C_CHAT', 1, event => {
		if(event.message.includes('!wb')) {
			if(/^<FONT>!warn on<\/FONT>$/i.test(event.message)) {
			enabled=true,
			message('worldboss enabled');
			};
		
			if(/^<FONT>!warn off<\/FONT>$/i.test(event.message)) {
			enabled=false,
			message('worldboss disabled');
			};
		
			if(/^<FONT>!warn alert<\/FONT>$/i.test(event.message)) {
				if(!alerted) {
					alerted=true,
					message('worldboss alerts enabled'),
					notice('worldboss alerts enabled');
				}
				else
					alerted=false,
					message('worldboss alerts disabled');
			};
			
			if(/^<FONT>!warn marker<\/FONT>$/i.test(event.message)) {
				if(!markenabled) {
					markenabled=true,
					message('worldboss marker enabled');
				}
				else
					markenabled=false,
					message('worldboss disabled');
			};
		
			if(/^<FONT>!warn clear<\/FONT>$/i.test(event.message)) {
				for (i = 0; i < countarr.length; i++) {
					despawnthis(countarr[i]);
				};
				countarr=[],
				moblocationx = [],
				moblocationy = [],
				moblocationz = [],
				message('worldboss clear attempted');
			};
			return false;
		};
	});
	
	dispatch.hook('S_SPAWN_NPC', 3, (event) => {
		if(enabled && (mobzone.includes(event.huntingZoneId) && mobtemplate.includes(event.templateId))) { 
			for (i = 0; i < (moblocationx.length+1); i++) { 
				if (i === moblocationx.length) {
					moblocationx[i] = event.x,
					moblocationy[i] = event.y,
					moblocationz[i] = event.z,
					countarr[i]= (player+1+(i)),
					markthis(countarr[i],(i)),
					messenger();
					break;
				};
			};
		};
	}); 

	dispatch.hook('S_DESPAWN_NPC', 1, event => {
		if(moblocationx.includes(event.x) && moblocationy.includes(event.y) && moblocationz.includes(event.z)) {
			ind = moblocationx.indexOf(event.x),
			despawnthis(countarr[ind]),
			moblocationx.splice(ind,1),
			moblocationy.splice(ind,1),
			moblocationz.splice(ind,1),
			countarr.splice(ind,1);
		};
	}); 
	
	function messenger() {
		if(alerted) {
				notice('Found'+' '+custommsg),
				message('Found'+' '+custommsg);
			}
			else
				message('Found'+' '+custommsg);
	};
	
	function markthis(targetid,inx) {
		if(markenabled) {
			dispatch.toClient('S_SPAWN_DROPITEM', 2, {
				id: targetid,
				x: moblocationx[inx],
				y: moblocationy[inx],
				z: moblocationz[inx],
				item: 369,  //item id
				amount: 1,
				expiry: 300000, //expiry time,milseconds (300000=5 mins?)
				owners: [{id: player}]
			});	
		};
	};
		
	function despawnthis(despawnid) {
		dispatch.toClient('S_DESPAWN_DROPITEM', 1, {
				id: despawnid
		});	
		
	};

	function message(msg) {
		dispatch.toClient('S_CHAT', 1, {
			channel: 24,
			authorID: 0,
			unk1: 0,
			gm: 0,
			unk2: 0,
			authorName: '',
			message: '(Proxy)' + msg
		})
	};
	
	function notice(msg) {
		dispatch.toClient('S_DUNGEON_EVENT_MESSAGE', 1, {
            unk1: 2,
            unk2: 0,
            unk3: 0,
            message: '(Proxy)' + msg
        });
    };
};
