rest-client-api
===============

Creates a standalone JavaScript API for communicating with a RESTful web service.

**Instructions**

1. Rename config.json.txt to config.json
2. Set the namespace to your own file (this should be unique).
3. Add the resources in config.json
	a. You can add the following methods: ‘all get create update delete’. Any methods you do not include will not be created. If you do not define any methods, all will be included by default.
	
**The results will end up looking similar to:** 

	myapi.users.all()
	.error(function (response) {
		console.log('error', response);
	})
	.success(function (response) {
		console.log('success', response);
	});
