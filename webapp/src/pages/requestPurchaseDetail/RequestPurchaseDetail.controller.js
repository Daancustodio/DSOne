sap.ui.define(
	[
	"DecisionsOne/src/app/BaseController",		
	"DecisionsOne/model/RestModel",
	], 
	function (BaseController, RestModel) {
		"use strict";

		return BaseController.extend("DecisionsOne.src.pages.requestPurchaseDetail.RequestPurchaseDetail", {
			onInit : function () {							
				var oRouter;				                                  
				oRouter = this.getRouter();
				this._serviceUrl= this.getBusinessOneService();
				oRouter
				.getRoute('requestPurchaseDetail')
				.attachPatternMatched(this._onRouteMatched, this);            
				
				
			},         
			_onRouteMatched: function(oEvent){
				let docEntry = oEvent.getParameter("arguments").docEntry;
				this.loadData(docEntry);
			},
			loadData(docEntry){
				let model = new RestModel();
				let url = [this._serviceUrl,"/PurchaseRequests(",docEntry,")"].join("");
				
				model.get(url,this.getView())
				.then(data=>{
					this.getView().setBusy(false);
					data.DocumentLines.forEach(line =>{
						let codes=[];
						console.log(line)
						let contingCodes = [line.CostingCode,line.CostingCode2,line.CostingCode3,line.CostingCode4,line.CostingCode5].reduce((acumulado,atual)=>{
							if(atual)
							codes.push(atual)
						},"");
						line.CostingCodes=codes.join(";");	
						line.qrCodeData = {ItemCode:line.ItemCode, ItemName: line.ItemDescription, Quantity : line.Quantity, Docentry: line.DocEntry, LineNum:line.LineNum}
					});
					console.log(data)
					
					this.getView().getModel().setData(data);
					this.getView().bindElement("/")
					
				}).catch(err => {
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
				this.getRouter().navTo("requestPurchaseEdit",{
					docEntry:iDocEntry
				})
			},
			onClosePress(oEvent){
				let button = oEvent.getSource();
				sap.m.MessageBox.show(
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
				
				model.post(url,button)
				.then
				(data=>{					
					sap.m.MessageToast.show(this.getText("Commom.ActionSuccess"));
					this.loadData(iDocEntry)			
				}).catch(err=>{
					
					this.showExeption(err)
					}
				);
			},
			onCancelPress(oEvent){
				let button = oEvent.getSource();
				sap.m.MessageBox.show(
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
				let url =  [this._serviceUrl,"/PurchaseRequests(",iDocEntry,")/Cancel"].join("");
				
				model.post(url,button)
				.then(data=>{
					MessageToast.show(this.getText("Commom.ActionSuccess"));
					this.loadData(iDocEntry)
				}).catch(err=>{
					this.showExeption(err)
					}
				);
			}
		});
	}
);
