sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",		        	
        "sap/m/MessageToast",	
        'DecisionsOne/model/RestModel',	
    	'sap/ui/model/Filter'	
	],
	function (BaseController,MessageToast, RestModel, Filter) {
	"use strict";

	return BaseController.extend("DecisionsOne.src.fragments.SelectProduct", {
		
		onInit : function () {
        },        
        handleSearch : function(oEvent){        	
        	let valueToSearch = oEvent.getParameter("value");        	
        	let oBinding = oEvent.getSource().getBinding("items");
        	this.filterData(valueToSearch, oBinding)
        },        
        filterData: function (sKey, oBinding) {
			let aFilter,
				filterItemCode, 
				filterItemName;		
			
			filterItemCode = new Filter("ItemCode", sap.ui.model.FilterOperator.Contains, sKey);
			filterItemName = new Filter("ItemName", sap.ui.model.FilterOperator.Contains, sKey);
			aFilter = new Filter([filterItemCode, filterItemName], false);
			oBinding.filter(aFilter);			
		}
	});
});