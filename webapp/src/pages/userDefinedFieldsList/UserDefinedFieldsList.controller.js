sap.ui.define(
	[
	'DecisionsOne/src/app/BaseController',		
	'DecisionsOne/model/RestModel',
	'sap/ui/model/Filter'
	], 	
	function (BaseController, RestModel,Filter) {
		"use strict";

		return BaseController.extend("DecisionsOne.src.pages.userDefinedFieldsList.UserDefinedFieldsList", {
			onInit : function () {							
				var oRouter;				                                  
				oRouter = this.getRouter();        
				this.controlData = this.byId("idList");
				oRouter
				.getRoute('userDefinedFieldsList')
				.attachPatternMatched(this._onRouteMatched, this);	
				this.loadData();       	
							
			},
			
			_onRouteMatched(oEvent){
			},
			loadData(sFilter){
				let model = new RestModel();
				let path = "UserFieldsMD" + (sFilter || "");
				console.log(path);
				let url = this.getBusinessOneService(path);
				model.setHeader("Prefer","odata.maxpagesize=50")
				model.get(url, this.controlData)
				.then(
					data =>  {
						//controlData.setBusy(false)
						this.controlData.setModel(model);
						console.log(data)
					}).catch(err => {
						//controlData.setBusy(false)
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
				let fieldIDPath = path + "/FieldID";
				let tableNamePath = path + "/TableName";
				let fieldID = this.controlData.getModel().getProperty(fieldIDPath);
				let tableName = this.controlData.getModel().getProperty(tableNamePath);
				this.getRouter().navTo("userDefinedFieldsDetail",{
					FieldID:fieldID,
					TableName: tableName
				})
				
			},
			onStartUpdate(oEvent){
				console.log(oEvent);
			},
			onFishUpdate(oEvent){
				console.log(oEvent)
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
			}		

		});
	}
);
