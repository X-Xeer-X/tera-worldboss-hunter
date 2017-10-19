const mobzone = [6553610, 6553604, 3932217, 13107238, 6553652], 
	mobtemplate = [99, 5011, 33, 35, 9050]; 
	
module.exports = function markmob(dispatch) {
	let markenabled=true;
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
		if(/^<FONT>!wbmarker on<\/FONT>$/i.test(event.message)) {
			markenabled=true,
			message('World Boss marker enabled');
		};
		
		if(/^<FONT>!wbmarker off<\/FONT>$/i.test(event.message)) {
			markenabled=false,
			moblocation = [],
			message('World boss marker disabled');
		};
		
		if(/^<FONT>!wbmarker clear<\/FONT>$/i.test(event.message)) {
			for (i = 0; i < countarr.length; i++) {
				despawnthis(countarr[i]),
				countarr=[],
				moblocationx = [],
				moblocationy = [],
				moblocationz = [];
			};
			message('World boss marker clear attempted');
		};
		
		if(event.message.includes('!wbmarker'))
			return false;
	});
	
	dispatch.hook('S_SPAWN_NPC', 3, (event) => {
		if(markenabled && (mobzone.includes(event.huntingZoneId) && mobtemplate.includes(event.templateId))) { 
			for (i = 0; i < (moblocationx.length+1); i++) { 
				if (i === moblocationx.length) {
					moblocationx[i] = event.x,
					moblocationy[i] = event.y,
					moblocationz[i] = event.z,
					countarr[i]= (player+1+(i)),
					ind=(i),
					markthis(countarr[i],ind);
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
			moblocationz.splice(ind,1);
		};
	}); 
	
	function markthis(targetid,inx) {
		dispatch.toClient('S_SPAWN_DROPITEM', 1, {
			id: targetid,
			x: moblocationx[inx],
			y: moblocationy[inx],
			z: moblocationz[inx],
			item: 369,
			amount: 1,
			expiry: 999999,
			owners: [{id: player}]
		});	
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
			authorName: 'World boss marker',
			message: '(Proxy)' + msg
		})
	};
};
