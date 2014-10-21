rest-client-api
===============

Creates a standalone JavaScript API for communicating with a RESTful web service.

##Instructions
---

####1) Rename config.json.txt to config.json

####2) Set the global namespace of your API in config.json

	{
		"name": "myapp"
        "version": "1.0.0",
        "baseUrl": "http://localhost:3000/v1"
	}

####3) Add resources to list

Resources are what makes up the API. A resource consists of one or more of the following methods: "all", "get", "create", "update", "delete". The default is to include all of the methods.

To add a resource, create an object with a "name" property and optional "methods" property...

    {
        "name": "myapi",
        "version": "1.0.0",
        "resources": [
            { "name": "users" },
            { "name": "favs", "methods": "all create update" }
        ]
    }

This config will result in the following API being created... 

	myapi.version; // "1.0.0"	
	myapi.users.all();
	myapi.users.create( userData );
	myapi.users.get();
	myapi.users.update( userId, userData );
	myapi.users.delete( userId );
	myapi.favs.all();
	myapi.favs.create( favsData );
	myapi.favs.update( favsId, favsData );
	
	
	myapi.getAllUsers();
	myapi.getUser(id);
	myapi.createUser(data);
	myapi.updateUser(id, data);
	myapi.deleteUser(id);
	
	myapi.getAllFavs();
	myapi.createFav();
	myapi.updateFav();
	
	myapi.login();
	myapi.logout();
	myapi.me();
	
	name: "favs",
	methodName: "getFav"
	type: "GET",
	syntax: "caml",
	pattern: "/users/:userId/favs/:favsId"	
	=> myapi.getFav() // caches for 60 seconds
	

	
###Method definitions

####All

**Method:** GET 

**Desc:** Expects to return an array of related resources

	all( params: Object, options : Object) : Promise

####Get

**Method:** GET 

**Desc:** Expects to return a resource 

	get( id : * , params : Object, options : Object ) : Promise 
	
####Create

**Method:** POST 

**Desc:** Expects to create a resource

	create( data : Object, params : Object, options : Object ) : Promise
	
####Update

**Method:** PUT 

**Desc:** Expects to update a resource

	update( id : *, data : Object, params : Object, options : Object ) : Promise

####Delete

**Method:** DELETE 

**Desc:** Expects to delete a resource

	delete( id: *, params : Object ) : Promise



		
**The results will end up looking similar to:** 

	myapi.users.all()
	.error(function (response) {
		console.log('error', response);
	})
	.success(function (response) {
		console.log('success', response);
	});	
