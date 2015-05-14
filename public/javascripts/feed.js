/////////////////////////////////////////////////////////
// Javascript for feed retrieval throgh the APIs
/////////////////////////////////////////////////////////

//Required Node Modules
	var fb = require('fb'),//////////////////////////////////
	tw = require('twitter'),                               // node libraries for API requests
	yt = require('youtube-api'),                           //
	ig = require('instagram-node-lib'),//////////////////////
	
	sort = require('./masterSort.js'),     //sorting system                
	config = require('../../config/auth.js'), // oAuth config file, featuring app IDs , app Secrets etc. for authenticating requests

	nomo = require('node-monkey').start(),// node tool to log to browser console at 127.0.0.1:505000 instead of command line

	async = require('async')// module to handle asynchronous queries
	;

////////////////////////////////////////////////////////////////////////////////////////////
// Master fetch function, is passed the app state and user object from the request 
///////////////////////////////////////////////////////////////////////////////////////////

exports.fetch = function(app,user){
	var allPosts = []; // container array for posts returne from API, will contain an array for each social site 
	var noAccount = [{}];// placeholder array for accounts that are not linked, will be removed during sorting

		// Each API is called asynchronously in parallel, so a longer response time
		// from one request will not block program flow
		async.parallel([
		 	/////////////////////////////////////////////////////////////////////////////
		 	// Parallel Request 1: Facebook Calls(Unreliable/Broken, see documentation)
		 	////////////////////////////////////////////////////////////////////////////////
	 		function(callback){
	 			/*fb.api('/me/home',{access_token: user.local.facebook.token}, // request me/home from facebook, returning last 25 posts on the users news feed
																				// passing access token from user object
				function(response) {                               // function to execute on the API response
					var sortToken = "fb";						   // declare sort token for identifying post source, for sorting later
					response.data.forEach(function(post){          // loop thorugh response assigning sort token to each post
							post.sortToken = sortToken;
					})
					callback(null, response.data);				// async callback to declare that this parallel request is done, response.data is passed to results array in final callback
				});*/
	 			callback(null, noAccount); 		//  callback containing the noAccount object, permanent for this request as facebook's API is broken
	 		},
	 		/////////////////////////////////////////////
		 	//Parallel Request 2: Twitter Calls
		 	/////////////////////////////////////////////	
	 		function(callback){
	 			console.log(user.local);
	 			if (user.local.twitter.token){                                  // if the user object has a twitter token ie there is a linked twitter account

		 			var twcon = {consumer_key:config.twitterAuth.consumerKey,  ////////////// configuration for twitter client , containing app key,
		 						consumer_secret:config.twitterAuth.consumerSecret,         // app Secret from config
		 						access_token_key:user.local.twitter.token,                 // user access token from user object,
		 						access_token_secret:user.local.twitter.tokenSecret}; //////// user token secret from user object

		 			var client = new tw(twcon); 						// declaring client using the config

		 			client.get('statuses/home_timeline',        // calling API thorugh declared client, for the user twitter feed

		 				function(err,tweets,response){        // function for dealing with response, err contains any errors, tweets is the returned data, reaponse is any response messages
		 				if(!err){							// if there is no err in response

		 					var sortToken = "tw";          // apply sort token as above for sorting
		 					tweets.forEach(function(post){
							post.sortToken = sortToken;
							})
		 					callback(null,tweets) // callback declaring this parallel request is finished , passes tweets to final results callback
		 				}
		 				else
		 					console.log(err); // if there is an error , log it to console
		 			})
		 		}
		 		else{
		 			callback(null ,noAccount); // if there is no account linked, immediatley callback with noAccount object
		 		}
	 		},
	 		/////////////////////////////////////////////
		 	// Parallel Request 3: Youtube Calls
		 	///////////////////////////////////////////// 
			function(callback){

				if (user.local.google.token){        //if the user object has a google token ie there is a linked youtube account

					yt.authenticate({                // authenticate token for request
					    type: "oauth"
					  , token: user.local.google.token
					});

					///////////////////////////////////////////////////////////////////////////////
					//Async Waterfall function, each request in this function is called in series
					//having been passed the result from the previous request in the waterfall
					///////////////////////////////////////////////////////////////////////////////
					async.waterfall([
						// First waterfall function, getting a list of the users subscribed channels
						function (callback){
							var subs      = [];
							yt.subscriptions.list({
			            	"mine":"true", 				// declare the subscription request as the users subscribed channels
			            	"part":"snippet",				 // declaring the snippet object to be returned, contains channel details
			            	token: user.local.google.token // declaring token for request
			            },  

			            function(err,subscriptions){   		// function dealing with response
			            		if (err){
			            			callback(err, noAccount);
			            		}
			            		else{
					            	subs = subscriptions.items; // put response items in the subs array
					            	callback(null, subs);      // callback to end 1st waterfall function, passing subs to next waterfall function
				            	}
			            	}
			            )
							
							
						},
						// Second waterfall function, getting full channel object for each subscribed channel
						function(subs, callback){
							var channels  = []; // array to contain channels

							async.each(subs, // async forEach function, makes a channel request for each subscribed channel in subs

				            	function(sub,cb){ // function for each sub
				            		var subId = sub.snippet.resourceId.channelId; // id of channel for request from sub object
				            		yt.channels.list({                           // channel request for sub object
				            			"id":subId,
				            			"part":"contentDetails,snippet"
					            	}, 
					            	 function (err, channel){                    // callback on response from API
					            			channels[channels.length] = channel.items[0]; // adding retrieved channel to channels array
					      					cb();  // execute callback for current forEach function, declaring it finished
					            	}
					            		
					            	)
									
				            	},
			            	function (err)	{  // callback called when all forEach are complete
			            		if (err){
			            			ca
			            		}
			            		callback(null,channels); // execute callback to end second waterfall function, passing channels array to next waterfall function
			            	
			            	});
			            },
			            // Third waterfall function, getting uploads playlist for eaach channel object
						function(channels, callback){
							var playlists = []; // array to contain playlists

							async.each(channels,  // async forEach function, makes a playlist request for each channel object

								function(chan, cb){ // function for each channel
								var playlistId = chan.contentDetails.relatedPlaylists.uploads; // id of playlist to request , taken from channel object

								yt.playlistItems.list({  // request for playlist object
									"playlistId": playlistId,
			            			"part":"snippet",
			            			"maxResults":"3" // max reslts parmater, returns latest 3 videos for each playlist/channel
								},
									function(err, playlist){  // callback on API response
										var pic = chan.snippet.thumbnails.default.url; // prfile pciture from channel object
										var list = playlist.items; // array of playlist items

										list.forEach(function(listItem){ // for each to assign channel picture and sort token to each video
											listItem.profile = pic;
											listItem.sortToken = "yt";
											playlists[playlists.length] = listItem;
										});
										
										cb(); // callback to end current async forEach function 
									}

								)
							},
							function (err)	{ // callback to end third waterfall function
								
								console.log(playlists);
			            		callback(null,playlists); // execute callback for the entire waterfall, indicating it is finished, passing playlists as final result
			            	});
													
						}
					],function(err,results){ // callback once last waterfall is complete, result param is playlists array passed above
						console.log(results);		
						callback(null,results); // execute callback for this parallel request, passing waterfall result(playlists)
					});
					}
					else{
						callback(null, noAccount); //  // if there is no youtube account linked, immediatley callback with noAccount object
					}	
				},
					/////////////////////////////////////////////
		 			// Parallel Request 3: Instagram Calls
		 			///////////////////////////////////////////// 
			 		function(callback){
			 			if(user.local.instagram.token){ // if user object has an instagram token

							ig.set('client_id', config.instagramAuth.clientID);//////////////////
							ig.set('client_secret', config.instagramAuth.clientSecret);        // config for instagram client
							ig.set('access_token', user.local.instagram.token);//////////////////

							
							ig.users.self({complete:function(data){ // requests users instagram feed

								var sortToken = "ins";      // applying sort token to each returned post
			 					data.forEach(function(post){
								post.sortToken = sortToken;
								})
								callback(null, data); // callback to end this parrallel function, passing the instagram posts
							}});
						}
						else{
							callback(null, noAccount); // // if there is no instagram account linked, immediatley callback with noAccount object
						}	
			 			
			 		},

		 	], 

			 	function(err, results){           // final callback for async parrallel, executes when all parallel function are complete

		   			allPosts = results[0].concat(results[1],results[2],results[3]); // concatonating multi dimension results array(array with an inner array for each social source)   		
		   			allPosts = sort.masterSort(allPosts);	
		   			console.log(allPosts);						// sends data to masterSort, to be sorted for display
		    	  	app.render('index.ejs',{posts:allPosts}); 				 // renders index.ejs, the feed page, passing the sorted posts array
				});
	
		
}


	