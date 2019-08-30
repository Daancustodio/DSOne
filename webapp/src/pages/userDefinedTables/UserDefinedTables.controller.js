sap.ui.define(
	[
	"DecisionsOne/src/app/BaseController",		
	"DecisionsOne/model/RestModel",
	"sap/m/MessageToast",	
	], 
	function (BaseController, RestModel, MessageToast) {
		"use strict";
		const USER_TABLES = "UserTablesMD";
		return BaseController.extend("DecisionsOne.src.pages.userDefinedTables.UserDefinedTables", {
			onInit : function () {							
				var oRouter;				                                  
				oRouter = this.getRouter();        
				this.controlData = this.byId("idList");
				oRouter
				.getRoute('userDefinedTables')
				.attachPatternMatched(this._onRouteMatched, this);	
							
			},
			
			_onRouteMatched(oEvent){
				this.loadData();        	
			},
			onLoadData(oEvent){
				this.loadData();        	

			},
			loadData(sFilter){
				let model = new RestModel();
				let path = USER_TABLES + (sFilter || "");
				console.log(path);
				let url = this.getBusinessOneService(path);
				
				model.get(url, this.controlData)
				.then(
					data =>  {						
						this.controlData.setModel(model);
						console.log(data)
					}).catch(err => {						
						this.showExeption(err);
						
					});
				
			},	
			
			filterData(oEvent){
				let param = oEvent.getParameters();
				let query = param.query.toUpperCase() || "";
				if(query == "")
					this.loadData();
				
				let filter = "?$filter=contains(TableName,'"+ query +"')";
				this.loadData(filter);
			},
			
			
			onDetail(oEvent){			
				let path = oEvent.getSource().getBindingContext().getPath();
				let tablModel = this.controlData.getModel().getProperty(path);
				
				this.getRouter().navTo('userDefinedTablesDetail',{
					TableName: tablModel.TableName
				})
			},
			onCreate(oEvent){
				let dialog = this.getDialog()
				dialog.setModel(new RestModel({}));				
				let text = this.getText("Commom.Create");
				dialog.setModel(new RestModel({Title:text}),"view");
				dialog.getBeginButton().attachPress(oEvent =>{
					this.createTable(dialog.getModel());
					dialog.close();
				})
				dialog.getEndButton().attachPress(oEvent =>{
					dialog.close()
				})
				dialog.open();
			},
			createTable(oModel){
				oModel.post(this.getBusinessOneService(USER_TABLES))
				.then(data =>{
					MessageToast.show(this.getText("Commom.SuccessAction"))
				})
				.catch(err => this.showExeption(err))
			},
			
			
			getGroupHeader: function (oGroup){
				return new sap.m.GroupHeaderListItem({
					title: oGroup.key,
					upperCase: false
				});
			},
	
			onToggleContextMenu: function(oEvent) {
				if (oEvent.getParameter("pressed")) {
					this.controlData.setContextMenu(new sap.m.Menu({
						items: [
							new sap.m.MenuItem({text: "{TableName}"}),
							new sap.m.MenuItem({text: "{Name}"}),
							new sap.m.MenuItem({text: "{Description}"})
						]
					}));
				} else {
					this.controlData.destroyContextMenu();
				}
			},
			

		});
	}
);
