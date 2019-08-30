sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",		        	
        "sap/m/MessageToast",	
        'DecisionsOne/model/RestModel',	
    	'sap/ui/model/Filter'	
	],
	function (BaseController,MessageToast, RestModel, Filter) {
	"use strict";

	return BaseController.extend("DecisionsOne.src.fragments.DistribuitionChoose", {
		onInit : function () {
			
        },        
        handleSearch : function(oEvent){        	
        	let valueToSearch = oEvent.getParameter("value");        	
        	let oBinding = oEvent.getSource().getBinding("items");
        	this.filterData(valueToSearch, oBinding)
        },  
        setUrlBase : function(url){
        	this._urlBase = url;
        },
        fillData: function (fragment, line) { 
        	this.fillDimensions(fragment,line);
		},
		
		fillDimensions(fragment, line){
			let url = this._urlBase + "/Dimensions";
			let model = new RestModel();
			
			
			model.get(url,fragment)
			.then(data =>{
				fragment.setModel(model, "Dimensions");				
				model.setProperty("/0/SelectedDistribuition",line.CostingCode);
				model.setProperty("/1/SelectedDistribuition",line.CostingCode2);
				model.setProperty("/2/SelectedDistribuition",line.CostingCode3);
				model.setProperty("/3/SelectedDistribuition",line.CostingCode4);
				model.setProperty("/4/SelectedDistribuition",line.CostingCode5);				
				console.log(fragment.getContent())
				const TABLE_INDEX = 0;
				let oBinding = fragment.getContent()[TABLE_INDEX].getBinding("items");
				oBinding.filter( new Filter("IsActive", "EQ", "tYES"));
				this.fillDistribuition(fragment);
			}).catch(err=>{				
				this.showExeption(err);
			})
		},
		
		fillDistribuition : function(fragment){
			let query = this._urlBase + "/DistributionRules";
			let model = new RestModel();			
			
			model.get(query,fragment)
			.then(()=>{
				fragment.setBusy(false);
			}).catch( err =>{
				fragment.setBusy(false);
			});	
			fragment.setModel(model, "DistributionRules");
		}
		,
		onDistribuitionPress: function(oEvent){
		
			let dimension = oEvent.getSource().getDimension();
			let query = this._urlBase + "/DistributionRules?$filter=InWhichDimension eq " + dimension
			let model = new RestModel();
			model.get(query, oEvent.getSource())
			.then(console.log)
			.catch(console.log);		
			
			
		},
		onSuggest: function (oEvent) {
			let oSF = oEvent.getSource();
			let dimension = oSF.getDimension();
			var value = oEvent.getParameter("suggestValue");
			var filters = [];
			if (value) {
				let filter =
					new sap.ui.model.Filter([
						new sap.ui.model.Filter("FactorCode", function(sText) {
							return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						}),
						new sap.ui.model.Filter("FactorDescription", function(sDes) {
							return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						})
					], false);				
				
				filters.push(filter)
			}
			
			let filterDim = new sap.ui.model.Filter("InWhichDimension", "EQ", dimension)
			filters.push(filterDim)
			
			let joinFilters = new sap.ui.model.Filter(filters, true)
			
			oSF.getBinding("suggestionItems").filter(joinFilters);
			oSF.suggest();
		},
		onConclude: function(oEvent){
			let dialog = oEvent.getSource().getParent();
			let distri = dialog.getModel("DistributionRules");
			let content =dialog.getContent();
			let dimensions = oEvent.getSource().getParent().getModel("Dimensions").getData().map(x => {
				if(x.SelectedDistribuition != undefined){
					if(x.SelectedDistribuition.indexOf(" - ") > 0){
						x.OcrCode = x.SelectedDistribuition.split(" - ")[0];
						x.OcrName = x.SelectedDistribuition.split(" - ")[1];
					}else{
						x.OcrCode = x.SelectedDistribuition
					}
				}				
				return x;
				
			});
			let dimActives = dimensions.filter(x => x.IsActive == "tYES");
			
			dialog.fireAfterClose(dimActives);
			dialog.close();
		},
		onCancel: function(oEvent){
			oEvent.getSource().getParent().fireAfterClose([]);
			oEvent.getSource().getParent().close();
		}
	});
});