sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",	
		"DecisionsOne/model/RestModel",					
		"sap/m/MessageBox"
	],
	function (BaseController, MessageToast, RestModel, MessageBox) {
	"use strict";

	return BaseController.extend("DecisionsOne.src.pages.drafts.Detail", {
		onInit : function () {							
            var oRouter;				                                  
            oRouter = this.getRouter();            
            oRouter
			.getRoute('draftsDetail')
            .attachPatternMatched(this._onRouteMatched, this);            
            this.page = this.byId("pageDraftDetail")
            
		},   
		      
		_onRouteMatched: function(oEvent){
			let docEntry = oEvent.getParameter("arguments").docEntry;
			this.loadData(docEntry);
			let code = oEvent.getParameter("arguments").code;
			this.showFooter(code);
		},

		loadData(docEntry){
			let model = new RestModel();
			let url = this.getBusinessOneService("Drafts(" + docEntry + ")")
			this.getView().setBusy(true);
			model.get(url)
			.then(data=>{
				this.getView().setBusy(false);				
				this.getView().getModel().setData(data);
				this.getView().bindElement("/")		
			}).catch( err =>{
				this.getView().setBusy(false);
				this.showExeption(err)
			});
			
			this.setModel(model);
		},

		logModel(){
			console.log(this.getModel())
		},

		onEditPress(oEvent){
			let iDocEntry = this.getModel().getProperty("/DocEntry");
			this.getRouter().navTo("draftsEdit",{
				docEntry:iDocEntry
			});
		},	

		onCancelPress(oEvent){
			let button = oEvent.getSource();
			MessageBox.show(
	                this.getText("Commom.Cancel"),
	                sap.m.MessageBox.Icon.QUESTION,
	                this.getText("Commom.Cancel"),
	                [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO], 
	                (sResult) => {
	                    if(sResult == sap.m.MessageBox.Action.YES){ 
	                        this.cancel(button);
	                    }
	                }    
	            );
			
			
			
		},

		cancel(button){
			let iDocEntry = this.getModel().getProperty("/DocEntry");			
			let model = this.getModel();				 
			let url = this.getBusinessOneService(["Drafts(",iDocEntry,")/Cancel"].join("")); 
			
			model.post(url, button)
			.then(data=>{
				button.setBusy(false)
				MessageToast.show(this.getText("Commom.ActionSuccess"));
				this.loadData(iDocEntry)
			}).catch(err=>{
				button.setBusy(false)
				this.showExeption(err)
			});
		},

		showFooter(code){
			if(!code) return;
			
			let url = this.getBusinessOneService("ApprovalRequestsService_GetOpenApprovalRequestList")			
			let model = new RestModel();
			model.post(url)
			.then(data =>{
				if(!data || !data.ApprovalRequestsParams.length) {
					this.page.setShowFooter(false);
					return;				 
				}
				let canShow = data.ApprovalRequestsParams.some(x => x.Code == code)	
				this.page.setShowFooter(canShow);

			})
			.catch((err) => {
				this.page.setShowFooter(false)
			});
		}
	});

});