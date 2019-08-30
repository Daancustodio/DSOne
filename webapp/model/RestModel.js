jQuery.sap.require("sap.ui.model.json.JSONModel");

sap.ui.model.json.JSONModel.extend(
	"DecisionsOne.model.RestModel",
	{
		baseUrl: "",
		fillData : true,	
		requestSettings: {
			crossDomain: true,
			dataType: "json",
			headers: {
				"Accept-Language": "pt-BR",
				"Content-Language": "pt-BR"
			},
			xhrFields: {
				withCredentials: false
			},
			credentials: 'include'			
		},

		setWithCredentials(boolValue){
			this.xhrFields.withCredentials = boolValue;
		},
		setBaseUrl(url){
			this.baseUrl = url;
		},

		request(url, busyControl)  {
					
			let that = this;
			if (busyControl) busyControl.setBusy(true);

			const finaly = function () {
				if (busyControl) busyControl.setBusy(false);
			};
			let promisseResolution = (resolve, reject) =>
			{
				fetch(url, this.requestSettings)
				.then((response) => {
					that.response = response;
					if (!response.ok && response.status == 400){
						response.json().then(jsonError => {
							reject(jsonError);
						})
					}else if (!response.ok && response.status == 404){
						resolve(null);					
					}else if (!response.ok && response.status == 401){
						response.json().then(jsonError =>{
							reject(jsonError);
						})					
					}else if (response.ok && response.status == 204){
						resolve(null)
					}
					else{
						if(that.fillData){
							response.json().then(dataJSON =>{
								if(dataJSON.value != undefined)
									that.setData(dataJSON.value);
								else
									that.setData(dataJSON);

								resolve(dataJSON);
							});
						}else{
							resolve(response);
						}
					}
				})
				.catch(err =>{
					that.response = response;
					err.json().then(jsonError =>{
						reject(jsonError);
					})
				})
				.finally(finaly);
			}

			return new Promise(promisseResolution);

		},
		
		getResponse: function () {
			return this.oResponse;
		},

		post: function (url, controlToBusy) {
			let data = JSON.stringify(this.getData());
			this.requestSettings.body = data;
			this.requestSettings.method = "POST";
			url = url || this.baseUrl;
			return this.request(url, controlToBusy);
		},

		put: function (url, controlToBusy) {
			url = url || this.baseUrl;
			let data = JSON.stringify(this.getData());
			this.requestSettings.body = data;
			this.requestSettings.method = "PUT";
			return this.request(url, controlToBusy);
		},

		patch: function (url, controlToBusy) {
			url = url || this.baseUrl;
			let data = JSON.stringify(this.getData());
			this.requestSettings.body = data;
			this.requestSettings.method = "PATCH";
			return this.request(url, controlToBusy);
		},

		get(url, controlToBusy) {
			url = url || this.baseUrl;
			this.requestSettings.method = "GET";
			delete this.requestSettings.body;
			return this.request(url, controlToBusy);
		},

		delete: function (url, controlToBusy) {
			this.requestSettings.method = "DELETE";
			return this.request(url, controlToBusy);
		},

		setHeader(name, value) {
			this.requestSettings.headers[name] = value;
		},

		read(controlToBusy){
			if(this.baseUrl == "") {
				console.log("Para utilizar esse método é necessário informar a URL base");
				return;
			}			
			let url = this.baseUrl;
			return this.get(url, controlToBusy);
		},
		update(controlToBusy){
			if(this.baseUrl == "") {
				console.log("Para utilizar esse método é necessário informar a URL base");
				return;
			}			
			let url = this.baseUrl;
			return this.patch(url, controlToBusy);
		},
		create(controlToBusy){
			if(this.baseUrl == "") {
				console.log("Para utilizar esse método é necessário informar a URL base");
				return;
			}			
			let url = this.baseUrl;
			return this.post(url, controlToBusy);
		},
		remove(controlToBusy){
			if(this.baseUrl == "") {
				console.log("Para utilizar esse método é necessário informar a URL base");
				return;
			}			
			let url = this.baseUrl;
			return this.delete(url, controlToBusy);
		},

	});
