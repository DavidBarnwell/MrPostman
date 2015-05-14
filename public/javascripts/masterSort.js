 // Master sort function for sorting and normalizing posts
exports.masterSort = function (data){
	var dataReady = [];
	// loop to make new Post object for each object in passed data
	for (var i = data.length - 1; i >= 0; i--) {
		
		if (data[i].sortToken){ // if there is a sort token in post ie it is not a noAccount object
			var post = new Post(data[i]); // make new Post object from post
			dataReady[dataReady.length] = post; // put Post into the dataReady Array
		}

	};

	data = timeFormat(dataReady); // rundata through time format procedure, sorts all posts by most recent,
								// and refromats time to state how long ago the post was made
	
	return data; // return data back to feed.js
	

}

//Post class to normalise all retrieved data, so all posts have same properties
function Post(post){
	// Post constructor
	this.id = null;
	if(post.sortToken){
		this.source = post.sortToken;
	};
	this.poster = null;
	this.profile = null;
	this.picture = null;
	this.description = null;
	this.to = null;
	this.message = null;
	this.time = null;
 	this.icon = null;

	var source = this.source;
	
	// switch statement based on source property, which is the same as sortToken
	switch(source){
		
		// constructor for facebook posts( not in use, see documentation)
		case "fb":
			this.id = post.id;
			this.poster = post.from.name;
			this.profile = post.profilepic.url;
			this.picture = post.picture;
			this.description = post.description;
			this.to = post.to.name;
			this.message= post.message|| post.story;
			this.time = post.created_time;

			break;
		// constructor for facebook posts
		case "tw":
			this.id = post.id;
			this.poster = post.user.screen_name	;
			this.profile = post.user.profile_image_url;
			this.picture = post.picture;
			this.description = post.description;
			this.to = post.in_reply_to_screen_name;
			this.message = post.text;
			this.time = post.created_at;
			this.icon = "./images/twitter.png"
			break;
			
		// constructor for instagram posts
		case "ins":
			this.id = post.id;
			this.source = "ins";
			this.poster = post.user.full_name;
			this.profile = post.user.profile_picture;
			this.picture = post.images.low_resolution.url;
			if (post.caption){
					this.message = post.caption.text;
			};
			this.time = post.created_time;
			this.icon = "./images/instagram.png"
			break;
		// constructor for youtube posts
		case "yt":
			this.id = post.snippet.resourceId.videoId;
			this.poster = post.snippet.channelTitle;
			this.profile = post.profile;
			this.picture = post.snippet.thumbnails.default.url;
			this.description = post.snippet.description;
			this.message = post.snippet.title;
			this.time = post.snippet.publishedAt;
			this.icon = "./images/youtube.png"
			break;

	}
}

// time format function
function timeFormat(array){	

  array.forEach(function(post){ // for each post in array ,

  		if (post.source == "ins"){ // if it is an instagram post (uses UNIX timestamp by default)
  				var date = new Date(post.time*1000); // make new javascript date from it
  				post.seconds =  (((new Date()).getTime() - date.getTime())/1000); // get time of post and subtract from current time, resulting 
  																				// in number of seconds since the post was made
  			}
	  	else{
	  	post.seconds = getSeconds(post.time); // if it is not an instagram post, send it to the getSeconds function
	   }
  });
  
  array = timeSort(array); // time sort the array, by its seconds property
 return array
}

function getSeconds(time){
	// new javascript date made from date & time of post
	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
	// get seconds between now and time of post
    diff = (((new Date()).getTime() - date.getTime())/1000);
    return diff; // return the result
}


function timeSort(array){
	// sort array by most recent to oldest, by seconds attribute
  array = array.sort(function(a,b) { return parseFloat(a.seconds) - parseFloat(b.seconds) } );
  // for each post, run timeAgo function, which transforms the seconds atribute to a readable format showing how long ago a post was made
  array.forEach(function(post){ 						
		post.time = timeAgo(post.seconds);
		// timeAgo does not support posts made over a month ago, will return undefined, if this happens time will be set to "over a month ago"
		if(post.time == undefined)	{
			post.time = "Over a month ago"; 
		}
	});

  return array;
}


// fucntion to convert seconds to a readable format
function timeAgo(time){
    
    var diff = time,   // seconds between now and time of post
        day_diff = Math.floor(diff / 86400); // seconds divided by 86400, the seconds in a day, giving day value f it exists


       // depending on value of diff & daydiff return the apporopriate value for time
      if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
        return; 

    return day_diff == 0 && (
            diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
        
}


