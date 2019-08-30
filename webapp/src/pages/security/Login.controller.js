sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",
		"DecisionsOne/model/RestModel",
	],
	function (BaseController, MessageToast, RestModel) {
	"use strict";
	const LAST_SESSIONS_PATH = 'lastSessions';
	return BaseController.extend("DecisionsOne.src.pages.security.Login", {		
		onInit : function(){

			var that = this;
			this.byId("DecisionsOneLoginPage").attachBrowserEvent("keypress", oEvent =>{
				if(oEvent.keyCode != jQuery.sap.KeyCodes.ENTER) return;
				that.onLogin(that.byId("loginButton"));
			});			
			this.sessions = this.getItem(LAST_SESSIONS_PATH) || [];			
			this.setModel(new RestModel(this.sessions), LAST_SESSIONS_PATH)
			if(this.sessions.length)
				this.setCredentials(this.sessions[0]);
		},	

		findLastSessions :function(oEvent){
			let fragment = sap.ui.xmlfragment("DecisionsOne.src.fragments.Select", this);
			let modelData = this.sessions.map(x => {
				x.title = x.CompanyDB;
				x.description = x.UserName;
				return x;
			});
			fragment.setModel(new RestModel(modelData));			
			fragment.open();
		},

		handleSelectDialog(oEvent){
			let selected = oEvent.getParameter('selectedContexts').map(x => x.getObject())[0];
			this.setCredentials(selected);			
		},		

		
		
		onLogin : function(oEvent){			
			let credentials = this.getCredentials()
			this.addLastSession(credentials);
			this.hanaLogin(credentials)
		},

		addLastSession : function(credentials){
			if(!credentials.UserName || !credentials.CompanyDB) return;

			const removeSessionIfExists = (s) => credentials.UserName != s.UserName || credentials.CompanyDB != s.CompanyDB;
			let filtered = this.sessions.filter(removeSessionIfExists);
			filtered.unshift(credentials);
			this.setItem(LAST_SESSIONS_PATH, filtered)
			this.sessions = filtered;
		},

		hanaLogin(credentials){
			let button = this.byId("loginButton");									
			let url = this.getBusinessOneService("Login");
			let model = new RestModel(credentials);
			button.setBusy(true)
			model.post(url,button)
			.then(value => this.successLogin(value))			
			.catch(err => this.showExeption(err))
		},

		successLogin : function(session){
			this.setUserSession(session);
			this.getRouter().navTo("dashBoard")
		},

		getCredentials: function(){
			let userCredentials = {};
			userCredentials.CompanyDB= this.byId("b1Company").getValue();
			userCredentials.UserName=this.byId("userName").getValue();
			userCredentials.Password=this.byId("userPass").getValue();			
			return userCredentials;
		},

		setCredentials: function(credentials){			
			this.byId("b1Company").setValue(credentials.CompanyDB);
			this.byId("userName").setValue(credentials.UserName);			
			this.byId("userPass").setValue("");			
		},

	});

});
