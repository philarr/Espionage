/*
 * Espionage - Game Library
 * Copyrighted (c) 2009 by Philip Chung
 */
var GAME = {

    debug: true,
    
    
    start: function(){
        GAME.log('Game starting...');
        //temporary onload
        
       var ajax = GAME.server.request({api: 'map.load'}, function() {
           if (ajax.readyState != 4) return;
		   
           GAME.server.process(ajax.responseText);
           GAME.actor.create('char3.png', 0, 0);
           GAME.actor.create('char3.png', 3, 2);
           GAME.ui.init();
           //GAME.ui.scrollToPlayer(GAME.player.data['name'], true);
           GAME.server.stream();
           GAME.log('Game started.');
		});
              
    },
    
    
    /*
     * Map module (map generation, tileset, etc.)
     */
    map: {
    
        //Config
        container: "gmap",
        tileW: 72,
        tileH: 36,
        offsetW: 0,
        offsetH: 0,
        
        data: {},
		tileset: [],
        
        newCollision: function(){
            var mapData = [];
            for (var i = 0; i < GAME.map.data.width; i++) {
                mapData[i] = [];
                for (var r = 0; r < GAME.map.data.height; r++) {
                    mapData[i][r] = 0;
                }
            }
            return mapData;      
        },
        
        destroy: function(){
            GAME.getObj(GAME.map.container).innerHTML = '';
            GAME.map.data = null;
        },
        
        build: function(cmapData){
			
			if (typeof(cmapData) != 'object') return false;

            GAME.map.destroy();
			
			GAME.map.data = cmapData;
			
			if(!GAME.map.loadTileset(GAME.map.data['tileset'])) {
				GAME.log('\''+GAME.map.data + '\' not found in tileset store!');
			}
			
            var totalWidth = 0;
            var totalHeight = 0;
            var buildData = '';
			
            //test collision map
            GAME.map.data.attribute = GAME.map.newCollision();
            GAME.map.offsetW = ((GAME.map.tileW * GAME.map.data.width) / 2) + 800;
            GAME.map.offsetH = ((GAME.map.tileH * GAME.map.data.height) / 2) + 500;
            
            for (var i = 0; i < GAME.map.data.width; i++) {
                for (var r = 0; r < GAME.map.data.height; r++) {
                    totalWidth = (GAME.map.tileW / 2) * (r - i) + GAME.map.offsetW;
                    totalHeight = (GAME.map.tileH / 2) * (r + i) + GAME.map.offsetH;
                    buildData += '<span id="[' + i + '][' + r + ']" class="tile" style="z-index:1;top:' + totalHeight + 'px;left:' + totalWidth + 'px;"><span id=City' + GAME.map.data.tile[i][r] + '></span></span>';
                }
            }
            GAME.getObj(GAME.map.container).innerHTML = buildData;
            GAME.log('Map created.');
			return true;
        },
		
		storeTileset: function(tilesetData) {
			
			for (var i=0; i<tilesetData.length; i++) {
				
				var name = tilesetData[i]['tileset_name'];
				var path = tilesetData[i]['tileset_path'];
				var data = tilesetData[i]['tileset_data'].split(',');
				
				if (typeof(GAME.map.tileset[name]) != 'undefined') continue;
				
				GAME.map.tileset[name] = [name, path, data];
				
			}
			
			return true;
			
		},
        
        loadTileset: function(name){
	
            var styleNode = document.createElement('style');
            var headNode = document.getElementsByTagName('head')[0];
            styleNode.type = 'text/css';
            
            var cssContent = '';
            
            /* 
            for (var prop in tilesetData) {
                var path = tilesetData[prop]['path'];
                for (var i = 0; i < tilesetData[prop]['data'].length; i++) {
                    cssContent += '#' + prop + '' + i + ' { border:0px; display:block; width:74px; height:47px; background-image:url(\'tile' + path + '/' + tilesetData[prop]['data'][i] + '\'); } \n';
                }
            }
            */
				var tname = GAME.map.tileset[name][0];
				var path = GAME.map.tileset[name][1];
				var data = GAME.map.tileset[name][2];
				
				if (typeof(name) == 'undefined') return false;
				
				GAME.log('Loading tileset ' + tname + '...');
				
				for (var r=0; r<data.length; r++) {
					 cssContent += '#' + tname + '' + r + ' { border:0px; display:block; width:74px; height:47px; background-image:url(\'tile/' + tname + '/' + data[r] + '\'); } \n';
				}	
	
             
            styleNode.innerHTML = cssContent;
            headNode.appendChild(styleNode);
            GAME.log('Tileset loaded.')
			return true;
        },
        
		/*
        load: function(mapid){
        
            var ajax = GAME.server.request({
                f: 'getMapData',
                id: mapid
            }, function(){
            
                if (ajax.readyState != 4) 
                    return false;
                var tilesetData = jsonParse(ajax.responseText);
                
            });
            
        }
        */
        
    },
    
    /*
     * Player module
     */
    player: {
    
        data: {
			name: 'ACTOR0',
            level: 123
        } //player data storage
    },
    
    /*
     * Interface module (events, etc.) **** TESTING ****
     */
    ui: {
    
        //Config
        offsetW: 0,
        offsetH: 0,
        
        lock: false,
        
        data: {}, //ui data storage
        updateCoord: function(e){
        
            if (GAME.ui.lock == false) {
                var mapObj = GAME.getObj('mapHolder');
                
                var iso = GAME.ui.toIso(e.pageX, e.pageY);
                
                var winx = e.pageX - GAME.ui.offsetW + mapObj.scrollLeft;
                var winy = e.pageY - GAME.ui.offsetH + mapObj.scrollTop;
                
                GAME.getObj('wincoord').innerHTML = winx + ',' + winy;
                GAME.getObj('isocoord').innerHTML = iso[0] + ',' + iso[1];
                
                var toiso = GAME.ui.toIso(winx, winy);
                var toscreen = GAME.ui.toScreen(toiso[0], toiso[1]);
                
                GAME.getObj('toiso').innerHTML = toiso[0] + ',' + toiso[1];
                GAME.getObj('toscreen').innerHTML = toscreen[0] + ',' + toscreen[1];
                
                
            }
            else {
                return false;
            }
            
        },
        
        click: function(e){
        
            var markerXY = GAME.ui.moveMarker(e.pageX, e.pageY);
            var screenXY = GAME.ui.toScreen(markerXY[0], markerXY[1]);
            
            if (GAME.ui.lock == false) {
                //GAME.getObj('ACTOR0').innerHTML = '<center><img src=img/char3.gif style="position:relative;top:4px;"></center>';
                
				var player = GAME.player.data['name'];
				var movedata = GAME.actor.data[player]['X']+","+GAME.actor.data[player]['Y']+","+markerXY[0]+","+markerXY[1];
   
                 var ajax = GAME.server.request({'api': 'player.move','player': player,'data': movedata }, function() {
                 if (ajax.readyState != 4) return;
                 GAME.ui.lock = true;
                 });
                 


            }
           
        },
        
        moveMarker: function(x, y){
        
            var markerXY = GAME.ui.toIso(x, y);
            var screenXY = GAME.ui.toScreen(markerXY[0], markerXY[1]);
            
            var marker = document.getElementById('mark').style;
            marker.top = screenXY[1] + 'px';
            marker.left = screenXY[0] + 'px';
            
            return ([markerXY[0], markerXY[1]]);
            
        },
        
        toIso: function(x, y){
            var mapObj = GAME.getObj('mapHolder');
            var tileW = GAME.map.tileW, tileH = GAME.map.tileH;
            var isox = Math.round(((tileW * (y - GAME.ui.offsetH - GAME.map.offsetH + mapObj.scrollTop)) - (tileH * (x - GAME.ui.offsetW - GAME.map.offsetW + mapObj.scrollLeft))) / (tileW * tileH));
            var isoy = Math.round(((tileW * (y - GAME.ui.offsetH - GAME.map.offsetH + mapObj.scrollTop)) + (tileH * (x - GAME.ui.offsetW - GAME.map.offsetW + mapObj.scrollLeft))) / (tileW * tileH)) - 1;
            
            return ([parseInt(isox), parseInt(isoy)]);
            
        },
        
        toScreen: function(x, y) {
        
            var screenx = (GAME.map.tileW / 2) * (y - x) + GAME.map.offsetW;
            var screeny = (GAME.map.tileH / 2) * (y + x) + GAME.map.offsetH;
            
            return ([screenx, screeny]);
            
        },
        
        scrollToPlayer: function(id, instant) {
            if (GAME.actor.data[id] == undefined) 
                return false;
         
		    var x = (GAME.actor.data[id]['imgX'] + 22 - 400);
            var y = (GAME.actor.data[id]['imgY'] - 32 - 200);
            
            if (instant) {
                var mapObj = document.getElementById('mapHolder');
                mapObj.scrollLeft = x;
                mapObj.scrollTop = y;
            }
            else {
                GAME.fx.add('mapHolder', 'scrollWindow', null, [x, y]);
            }
            
            return true;
            
        },
		
		addEvent: function( obj, type, fn ) {
			if (obj.addEventListener)
				obj.addEventListener( type, fn, false );
			else if (obj.attachEvent)
			{
				obj["e"+type+fn] = fn;
				obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
				obj.attachEvent( "on"+type, obj[type+fn] );
			}
		},
        
        init: function() {
            GAME.log('Binding event listeners.')
			var mapObj = document.getElementById('mapHolder');
            GAME.ui.addEvent(mapObj, 'click', GAME.ui.click);
            //mapObj.addEventListener('mousemove', GAME.ui.updateCoord, false);'

            //scroll padding
            var totalWidth = (GAME.map.tileW / 2) * (GAME.map.data.width) + GAME.map.offsetW;
            var totalHeight = (GAME.map.tileH / 2) * (GAME.map.data.height) + GAME.map.offsetH;
            GAME.ui.moveMarker(totalWidth, totalHeight);
            
        }
        
    },
 
    
    /*
     * Server Module (Ajax, authentication, etc.)
     */
    server: {
    
        mode: 'POST',
		
		error: function(code) {
			if (code == 0) {
				alert('o snap.');			}
		},
		
		ping: function (time) {
			//
			//
			//
		},
        
        request: function(f, complete){
            var request = null;
			
			f['sessionId'] = GAME.player.data['authId'];
			
            var p = GAME.toQuery(f);
            if (window.XMLHttpRequest) {
                request = new XMLHttpRequest();
            }
			
            request.open('POST', '_server', true);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.setRequestHeader("Content-length", p.length);
            request.setRequestHeader("Connection", "close");
            request.send(p);
			
			if (typeof(complete) != 'function') {
				request.onreadystatechange = function(){
					if (request.readyState != 4) return;	
					GAME.server.process(request.responseText);
				};
			}
			else {
				request.onreadystatechange = complete; 
			}
            GAME.log('AJAX requested.');
            return request;
        },
		
		process: function(data, type) {

		//if (type) {

		//	data = GAME.URLDecode(data);
		//	GAME.log(data);
		//}
			var data = jsonParse(data);
			for(var func in data) {
				var str = func.split('.');				
				try {
					GAME[str[0]][str[1]](data[func]);
				}
				catch(e) {
					GAME.log(e);
					continue;
				}	
			}			
		},
        
        login: function(u, p){
        
            var ajax = GAME.server.request({
                f: 'login'
            }, function(){
                if (ajax.readyState != 4) 
                    return false;
                
                alert(ajax.responseText + ' logged in');
                
            });
            
            
        },
        
        logout: function(){
        
            var ajax = GAME.server.request({
                f: 'logout'
            }, function(){
                if (ajax.readyState != 4) 
                    return false;
                
                alert(ajax.responseText + ' logged out');
                
            });
        },
        
		
        meteorlol: function(str){
            var read = str.split(' ');
            if (read[0] == "walk") {
                var actorid = read[1];
                var sXY = [parseInt(read[2]), parseInt(read[3])];
                var eXY = [parseInt(read[4]), parseInt(read[5])];
                
                GAME.actor.move(actorid, [sXY[0], sXY[1]], [eXY[0], eXY[1]]);
            }
            
        },
        
        
        stream: function(){
        
            var id = ((new Date()).getTime()).toString();
            // Set this to something unique to this client
            Meteor.hostid = "Philarr";
            // Our Meteor server is on the data. subdomain
            Meteor.host = "data.espion.local";
            // Call the addMsg() function when data arrives
            Meteor.registerEventCallback("process", GAME.server.process);
            // Join the chat channel and get last 10 events, then stream
           //Meteor.joinChannel("_", 0);
            Meteor.mode = 'stream';
            // Start streaming!
            Meteor.connect();
            
        }
        
    },
    
    /*
     * Actor module (players, npc, etc.)
     */
    actor: {
    
        container: "actors",
        num: 0,
        data: {}, //actor storage 
        //Single create
        create: function(data, x, y){
        
            var XY = GAME.ui.toScreen(x, y);
            
            GAME.actor.data['ACTOR' + GAME.actor.num] = {
                'Name': data,
                'X': x,
                'Y': y,
                'imgX': XY[0],
                'imgY': XY[1]
            };
            GAME.log('Actor created -> ACTOR' + GAME.actor.num);
            
            var actorData = '<span id="ACTOR' + GAME.actor.num + '" style="z-index:1000;top:' + XY[1] + 'px;left:' + XY[0] + 'px;" class="player"><img src="img/' + data + '" style="position:relative;top:-32px;left:22px;"></span>';
            GAME.actor.num++;
            
            GAME.getObj(GAME.actor.container).innerHTML += actorData;
            
        },
        
        
        remove: function(actorid){
            var actorObj = GAME.getObj(actorid);
            
            if (actorObj) {
                actorObj.parentNode.removeChild(actorObj);
                GAME.actor.num--;
                GAME.log('Actor removed -> ' + actorid);
                return true;
            }
            else {
                GAME.log('Actor not found -> ' + actorid);
                return false;
            }
        },
        
        move: function(param){
        
			var actorid = param[0];
			var fromXY = [param[1], param[2]];
			var destXY = [param[3], param[4]];
			
            //check collision
            destXY = GAME.actor.checkCollision(fromXY, destXY);
            
            if (fromXY[0] == destXY[0] && fromXY[1] == destXY[1] || destXY == false) 
                return false;
            
            var checkImgXY = GAME.ui.toScreen(fromXY[0], fromXY[1]);
            if (checkImgXY[0] != GAME.actor.data[actorid]['imgX'] || checkImgXY[1] != GAME.actor.data[actorid]['imgY']) {
                GAME.actor.update(actorid, fromXY, checkImgXY);
            }


            GAME.fx.add({
                1: ['walkObject_X', {
                    "id": actorid,
                    "start": [fromXY[0], fromXY[1]],
                    "end": [destXY[0], destXY[1]]
                }],
                2: ['walkObject_Y', {
                    "id": actorid,
                    "start": [fromXY[0], fromXY[1]],
                    "end": [destXY[0], destXY[1]]
                }],
                3: ['scrollWindow', {
                    "id": actorid
                }]	
            });
            
            return true;
            
        },
        //Collision path 
        checkCollision: function(fromXY, destXY){
        
            if (fromXY[0] == destXY[0] && fromXY[1] == destXY[1]) 
                return false;
            
            var collision = GAME.map.data.tile;
            var checkX = destXY[0] - fromXY[0];
            var newXY = destXY;
            
            if (checkX >= 0) {
                for (i = 0; i < checkX; i++) {
                    var x = fromXY[0] + i + 1;
                    
                    if (collision[x] == undefined) 
                        return false;
                    
                    if (collision[x][fromXY[1]] == 3) {
                        newXY[0] = x - 1;
                        newXY[1] = fromXY[1];
                        break;
                    }
                }
                if (newXY[0] == destXY[0]) {
                    var checkY = destXY[1] - fromXY[1];
                    if (checkY > 0) {
                        for (i = 0; i < checkY; i++) {
                            var y = fromXY[1] + i + 1;
                            if (collision[newXY[0]][y] == undefined) 
                                return false;
                            if (collision[newXY[0]][y] == 3) {
                                newXY[1] = y - 1;
                                break;
                            }
                        }
                        
                    }
                    else 
                        if (checkY < 0) {
                            for (i = 0; i > checkY; i--) {
                                var y = fromXY[1] + i - 1;
                                if (collision[newXY[0]][y] == undefined) 
                                    return false;
                                if (collision[newXY[0]][y] == 3) {
                                    newXY[1] = y + 1;
                                    break;
                                }
                            }
                        }
                }
            }
            else 
                if (checkX < 0) {
                    for (i = 0; i > checkX; i--) {
                    
                        var x = fromXY[0] + i - 1;
                        if (collision[x] == undefined) 
                            return false;
                        
                        if (collision[x][fromXY[1]] == 3) {
                            newXY[0] = x + 1;
                            newXY[1] = fromXY[1];
                            break;
                        }
                    }
                    if (newXY[0] == destXY[0]) {
                        var checkY = destXY[1] - fromXY[1];
                        if (checkY > 0) {
                            for (i = 0; i < checkY; i++) {
                                var y = fromXY[1] + i + 1;
                                if (collision[newXY[0]][y] == undefined) 
                                    return false;
                                if (collision[newXY[0]][y] == 3) {
                                    newXY[1] = y - 1;
                                    break;
                                }
                            }
                            
                        }
                        else 
                            if (checkY < 0) {
                                for (i = 0; i > checkY; i--) {
                                    var y = fromXY[1] + i - 1;
                                    if (collision[newXY[0]][y] == undefined) 
                                        return false;
                                    if (collision[newXY[0]][y] == 3) {
                                        newXY[1] = y + 1;
                                        break;
                                    }
                                }
                            }
                    }
                    
                }
            
            return (newXY);
        },
        
        update: function(actorid, fromXY, checkImgXY){
        
            //update
            GAME.actor.data[actorid]['imgX'] = checkImgXY[0];
            GAME.actor.data[actorid]['imgY'] = checkImgXY[1];
            GAME.actor.data[actorid]['X'] = fromXY[0];
            GAME.actor.data[actorid]['Y'] = fromXY[1];
            var actorObj = document.getElementById(actorid).style;
            actorObj.left = checkImgXY[0] + 'px';
            actorObj.top = checkImgXY[1] + 'px';
            GAME.log('Repositioning ' + actorid + ' due to mismatch.')
            
            return true;
            
        }
        
        
    },
    
    
    /*
     * Animation Module (experimental)
     */
    fx: {
    
        fps: 41,
        movementRate: 3,
        buffer: null,
        queue: [],
        
        core: {
        
            scrollWindow: function(param){
            
                var id = param['id'];
                
                if (id == GAME.player.data.name) {
                    GAME.ui.scrollToPlayer(id, true);
                    GAME.ui.lock = false;
                }
                return true;
                
                var mapObj = document.getElementById(id);
                
                var x = mapObj.scrollLeft;
                var y = mapObj.scrollTop;
                
                if (x >= end[0] && y >= end[1]) {
                    return true;
                }
                
                if (x > end[0]) {
                    mapObj.scrollLeft -= 20;
                }
                else {
                    mapObj.scrollLeft += 20;
                }
                
                if (y > end[1]) {
                    mapObj.scrollTop -= 20;
                }
                else {
                    mapObj.scrollTop += 20;
                }
                
            },
            
            
            /*walkObject: function(id, start, end){*/
            walkObject_X: function(param){
            
                var id = param['id'];
                var start = param['start'];
                var end = param['end'];
                
                var x = GAME.actor.data[id]['imgX']
                var y = GAME.actor.data[id]['imgY'];
                var r = GAME.fx.movementRate;
                
                var a = (GAME.map.tileW / 2) * (GAME.actor.data[id]['Y'] - GAME.actor.data[id]['X']) + GAME.map.offsetW;
                var b = (GAME.map.tileH / 2) * (GAME.actor.data[id]['Y'] + GAME.actor.data[id]['X']) + GAME.map.offsetH;
                
                        var moveAmountX = a - ((end[0] - start[0]) * (GAME.map.tileW / 2));
                        var moveAmountY = b + ((end[0] - start[0]) * (GAME.map.tileH / 2));
						
                        if (x == moveAmountX && y == moveAmountY) {
                            GAME.actor.data[id]['X'] = end[0];
                            return true;
                        }
                        
                        if (x > moveAmountX) {
                            x = x - (2 * r);
                            y = y + (1 * r);
                        }
                        
                        if (x < moveAmountX) {
                            x = x + (2 * r);
                            y = y - (1 * r);
                        }
                        
                GAME.actor.data[id]['imgX'] = x;
                GAME.actor.data[id]['imgY'] = y;
                
                var actor = document.getElementById(id).style;
                actor.left = x + 'px';
                actor.top = y + 'px';
                
            },
			
			walkObject_Y: function(param) {
				
				var id = param['id'];
                var start = param['start'];
                var end = param['end'];
                
                var x = GAME.actor.data[id]['imgX']
                var y = GAME.actor.data[id]['imgY'];
                var r = GAME.fx.movementRate;
                
                var a = (GAME.map.tileW / 2) * (GAME.actor.data[id]['Y'] - GAME.actor.data[id]['X']) + GAME.map.offsetW;
                var b = (GAME.map.tileH / 2) * (GAME.actor.data[id]['Y'] + GAME.actor.data[id]['X']) + GAME.map.offsetH;
				
				  	var moveAmountX = a + ((end[1] - start[1]) * (GAME.map.tileW / 2));
				  	var moveAmountY = b + ((end[1] - start[1]) * (GAME.map.tileH / 2));
				  	if (x == moveAmountX && y == moveAmountY) {
				  		GAME.actor.data[id]['Y'] = end[1];
				  		return true;
				  	}
				  	
				  	if (y < moveAmountY) {
				  		x = x + (2 * r);
				  		y = y + (1 * r);
				  	}
				  	
				  	if (y > moveAmountY) {
				  		x = x - (2 * r);
				  		y = y - (1 * r);
				  	}
				  	
                GAME.actor.data[id]['imgX'] = x;
                GAME.actor.data[id]['imgY'] = y;
                
                var actor = document.getElementById(id).style;
                actor.left = x + 'px';
                actor.top = y + 'px';
			}
        },
        
        fxBuffer: function(){
        
            if (GAME.fx.queue.length == 0) {
                GAME.fx.sleep();
                return false;
            }
            var length = GAME.fx.queue.length;
			//while(length--) {
            for (i = 0; i < length; i++) {
            
                var queue = GAME.fx.queue[i];
                /*
				if (queue == undefined) 
                    continue;
                */
                var complete = GAME.fx.core[queue[0][0]](queue[0][1]);
                
                if (complete) {
                    GAME.fx.remove(i);
                }
            }
            
        },
        
        start: function(){
            GAME.fx.buffer = setInterval(GAME.fx.fxBuffer, GAME.fx.fps);
        },
        
        add: function(object){
        
            if (object == undefined) {
                GAME.log('Fx: Queue animation failed.');
                return false;
            }
            
            var sequence = [];
            
            var i = 1;
            for (prop in object) {
                if (object[i] != undefined) {
                    if (typeof(GAME.fx.core[object[i][0]]) != 'function') {
                        GAME.log('Fx: \'' + object[i][0] + '\' is not registered as Fx animator.');
                        return false;
                    }
                    sequence.push(object[i]);
                    i++;
                }
            }
            
            GAME.fx.queue.push(sequence);
            
            if (GAME.fx.buffer == null) {
                GAME.log('Animation buffer running...');
                GAME.fx.start();
            }
            
        },
        
        remove: function(objectnum){
            var object = GAME.fx.queue[objectnum][0];
            //GAME.log('Queue animation removed -> '+object.toSource());	
            
            GAME.fx.queue[objectnum].shift();
            
            if (GAME.fx.queue[objectnum].length == 0) {
                GAME.log('animation chain finished. destroying sequence.');
                GAME.fx.queue.splice(objectnum, 1);
            }
            
            return true;
        },
        
        
        sleep: function() {
            if (GAME.fx.buffer != null) {
                GAME.fx.buffer = clearInterval(GAME.fx.buffer);
                GAME.fx.buffer = null;
                GAME.log('Animation buffer sleeping...');
                return true;
            }
            else {
                return false;
            }
        }
        
    },
	
   
    //non specific functions
    getObj: function(id){
        return (document.getElementById(id));
    },
    
    log: function(str){
        if (GAME.debug && window.console) {
            window.console.log(str);
        }
        return true;
    },
    
    toQuery: function(obj){
        if (typeof obj != 'object') 
            return false;
        var rv = '';
        for (var prop in obj) 
            if (obj.hasOwnProperty(prop)) {
                var qname = prop;
                if (obj[prop] instanceof Date) 
                    rv += '&' + encodeURIComponent(qname) + '=' + obj[prop].getTime();
                else 
                    rv += '&' + encodeURIComponent(qname) + '=' + encodeURIComponent(obj[prop]);
            }
        return rv.replace(/^&/, '');
        
    },
	 URLDecode: function(url) {
                // Replace + with ' '
                // Replace %xx with equivalent character
                // Put [ERROR] in output if %xx is invalid.
                var HEXCHARS = "0123456789ABCDEFabcdef";
                var encoded = url;
                var plaintext = "";
                var i = 0;
                while (i < encoded.length) {
                    var ch = encoded.charAt(i);
                    if (ch == "+") {
                        plaintext += " ";
                        i++;
                    }
                    else 
                        if (ch == "%") {
                            if (i < (encoded.length - 2) &&
                            HEXCHARS.indexOf(encoded.charAt(i + 1)) != -1 &&
                            HEXCHARS.indexOf(encoded.charAt(i + 2)) != -1) {
                                plaintext += unescape(encoded.substr(i, 3));
                                i += 3;
                            }
                            else {
                                alert('Bad escape combination near ...' + encoded.substr(i));
                                plaintext += "%[ERROR]";
                                i++;
                            }
                        }
                        else {
                            plaintext += ch;
                            i++;
                        }
                } // while
                return plaintext;
            }
    
}



