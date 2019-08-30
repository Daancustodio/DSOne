sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",	
		"DecisionsOne/model/RestModel",	
		"DecisionsOne/model/formatter",
		'sap/ui/model/Filter'
	],
	function (BaseController, MessageToast, RestModel, formatter, Filter, JSONModel) {
	"use strict";

	return BaseController.extend("DecisionsOne.src.pages.purchaseRequest.List", {
		onInit : function () {							
            var oRouter;				                                  
            oRouter = this.getRouter();        
            oRouter
			.getRoute('purchaseRequest')
			.attachPatternMatched(this._onRouteMatched, this);
			this.oModel = new RestModel()
			this.loadData();

		},
		
        fmt:formatter, 
		_onRouteMatched(oEvent){
			//this.loadData();
		},
		loadData(){
			let controlData = this.byId("purchaseRequests");	
			let controlFilter = this.byId("idIconTabBar");				
			controlFilter.setModel(this.oModel);
			let url = this. getBusinessOneService("PurchaseRequests?$orderby=UpdateDate desc");
			this.oModel.get(url, controlData)
			.then(
				data=>{
					this.filterData(controlFilter.getSelectedKey());	
					console.log(data)				
			}).catch(err=>this.showExeption(err));
			this.loadPages(); 
			
				
		},
		loadPages(){
			let model = new RestModel();
			let url = this.getBusinessOneService("PurchaseRequests?$apply=aggregate($count as count)");
			model.get(url)
			.then(data=>{
				let paginator = {}
				paginator.pageCount = Math.round(data.value[0].count / 20);
				paginator.registryCount = data.value[0].count 
				model.setData(paginator);
				this.setModel(model, "Pagination");
			}).catch(console.log);

		},

		handleIconTabBarSelect: function (oEvent) {			
			let	sKey = oEvent.getParameter("key");
			this.filterData(sKey)
		},

		onPageChanged(oEvent){
			let controlData = oEvent.getParameters();
			
			console.log(controlData)
		},
		
		filterData: function (sKey) {
			let oBinding = this.byId("purchaseRequests").getBinding("items"),				
				aFilters = [],
				filterStatus;	
				
			if(sKey == "noFilter"){
				oBinding.filter(aFilters);
				return;
			}
			
			if(sKey == "canceled"){
				aFilters.push(new Filter("DocumentStatus", "EQ", 'bost_Close'));
				aFilters.push(new Filter("Cancelled", "EQ", 'tYES'));
				aFilters = new Filter(aFilters, true);
			}else if(sKey == "bost_Close"){
				aFilters.push(new Filter("DocumentStatus", "EQ", 'bost_Close'));
				aFilters.push(new Filter("Cancelled", "EQ", 'tNO'));
				aFilters = new Filter(aFilters, true);
			}else if(sKey =="dasPending"){
				aFilters.push(new Filter("AuthorizationStatus", "EQ", sKey))
			}
			else{
				filterStatus = new Filter("DocumentStatus", "EQ", sKey);
				aFilters.push(new Filter("AuthorizationStatus", "NE", "dasPending"))
				aFilters.push(filterStatus);
			}
			oBinding.filter(aFilters);			
		},
		onCreate(oEvent){
			this.getRouter().navTo("purchaseRequestCreate");
		},
		onDetail(oEvent){			
			let path = oEvent.getSource().getBindingContext().getPath();
			let docEntryPath = path + "/DocEntry";
			let iDocEntry = this.byId("purchaseRequests").getModel().getProperty(docEntryPath);
			this.getRouter().navTo("requestPurchaseDetail",{
				docEntry:iDocEntry
			})
			
		}		
	});

});