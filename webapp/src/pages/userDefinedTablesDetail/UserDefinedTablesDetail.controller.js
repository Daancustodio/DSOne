sap.ui.define(
	[
	"DecisionsOne/src/app/BaseController",		
	"DecisionsOne/model/RestModel",
	"sap/m/MessageToast",	
	], 
	function (BaseController, RestModel, MessageToast) {
		"use strict";

		const USER_TABLES = "UserTablesMD";

		return BaseController.extend("DecisionsOne.src.pages.userDefinedTablesDetail.UserDefinedTablesDetail", {
			onInit : function () {							
				var oRouter;				                                  
				oRouter = this.getRouter();            
				oRouter
				.getRoute('userDefinedTablesDetail')
				.attachPatternMatched(this._onRouteMatched, this);            
				this.tableUserFields = this.byId("tableUserFields")
				
			},         
			_onRouteMatched: function(oEvent){					
				let table = oEvent.getParameter("arguments").TableName;
				this.loadData(table);
			},
			loadData(TableName){
				let model = new RestModel();
				let url = this.getBusinessOneService("UserTablesMD");			
				url += `('${TableName}')`;				
				model.get(url, this.getView()).then(data =>{
					this.getView().bindElement("/");
					this.loadFields(TableName)
				}).catch( err =>{					
					this.showExeption(err);
				});
				this.setModel(model);
			},
			loadFields(TableName){
				let model = new RestModel();
				let url = this.getBusinessOneService("UserFieldsMD");			
				url += `?$filter=contains(TableName, '${TableName}')`;				
				this.tableUserFields.setModel(model);
				model.get(url, this.tableUserFields)
				.then()
				.catch( err =>{					
					this.showExeption(err);
				});
			},
			logModel(){
				console.log(this.getModel())
			},
			onEdit(oEvent){
				let dialog = this.getDialog()

				dialog.setModel(new RestModel(this.getModel().getData()));				
				let text = this.getText("Commom.Edit");
				dialog.setModel(new RestModel({Title:text}),"view");
				dialog.getBeginButton().attachPress(oEvent =>{
					this.updateTable(dialog.getModel());
					dialog.close();
				})
				dialog.getEndButton().attachPress(oEvent =>{
					dialog.close()
				})
				dialog.open();
			},
			updateTable(oModel){
				let id = `${USER_TABLES}('${oModel.getProperty('/TableName')}')`
				oModel.patch(this.getBusinessOneService(id))
				.then(data =>{
					MessageToast.show(this.getText("Commom.SuccessAction"))
				})
				.catch(err => this.showExeption(err))
			},
			getDialog(){
				let dialog = sap.ui.xmlfragment("DecisionsOne.src.pages.userDefinedTables.UserDefinedTablesFragment", this);
				this.getView().addDependent(dialog)
				return dialog
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

			onDetail(oEvent){			
				let path = oEvent.getSource().getBindingContext().getPath();
				let fieldIDPath = path + "/FieldID";
				let tableName = '@' + this.getModel().getProperty("/TableName");
				let fieldID = this.tableUserFields.getModel().getProperty(fieldIDPath);
				this.getRouter().navTo("userDefinedFieldsDetail",{
					FieldID:fieldID,
					TableName: tableName
				})
				
			},
				

		});
	}
);
