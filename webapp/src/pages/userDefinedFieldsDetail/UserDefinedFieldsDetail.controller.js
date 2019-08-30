sap.ui.define(
	[
	"DecisionsOne/src/app/BaseController",		
	"DecisionsOne/model/RestModel",
	], 
	function (BaseController, RestModel) {
		"use strict";

		return BaseController.extend("DecisionsOne.src.pages.userDefinedFieldsDetail.UserDefinedFieldsDetail", {
			onInit : function () {							
				var oRouter;				                                  
				oRouter = this.getRouter();            
				oRouter
				.getRoute('userDefinedFieldsDetail')
				.attachPatternMatched(this._onRouteMatched, this);            
				
				
			},         
			_onRouteMatched: function(oEvent){
				console.log(oEvent.getParameters())
				let field = oEvent.getParameter("arguments").FieldID;
				let table = oEvent.getParameter("arguments").TableName;
				this.loadData(field,table);
			},
			loadData(fieldId, TableName){
				let model = new RestModel();
				let url = this.getBusinessOneService("UserFieldsMD");						
				url += "(TableName='"+ TableName + "', FieldID=" + fieldId + ")";
				this.getView().setBusy(true);
				this.setModel(model);
				model.get(url).then(data =>{							
					this.getView().getModel().setData(data);
					this.getView().bindElement("/");	
					this.getView().setBusy(false);
					console.log(data)
				}).catch( err =>{
					this.getView().setBusy(false);
					this.showExeption(err);
				});
			},
			logModel(){
				console.log(this.getModel())
			},
			onEditPress(oEvent){
				let iDocEntry = this.getModel().getProperty("/DocEntry");
				this.getRouter().navTo("requestPurchaseEdit",{
					docEntry:iDocEntry
				})
			},
			onClosePress(oEvent){
				let button = oEvent.getSource();
				MessageBox.show(
						this.getText("Commom.Close"),
						sap.m.MessageBox.Icon.QUESTION,
						this.getText("Commom.Close"),
						[sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO], 
						(sResult) => {	                	
							if(sResult == sap.m.MessageBox.Action.YES){ 
								this.close(button);
							}
						}    
					);
			},
			close(button){
				let iDocEntry = this.getModel().getProperty("/DocEntry");			
				let model = this.getModel();			
				let url =  [this._serviceUrl,"/PurchaseRequests(",iDocEntry,")/Close"].join("");
				button.setBusy(true)
				model.post(url).then(
				(data)=>{
					button.setBusy(false)
					MessageToast.show(this.getText("Commom.ActionSuccess"));
					this.loadData(iDocEntry)			
				}).cath((err)=>{
					button.setBusy(false)
					this.showExeption(err)
					}
				);
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
		});
	}
);
