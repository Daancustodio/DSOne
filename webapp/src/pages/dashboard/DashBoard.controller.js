sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",
		'DecisionsOne/model/RestModel',

	],
	function (BaseController, MessageToast, RestModel) {
	"use strict";
	const STATUS_APPROVED = "arsApproved"
	const STATUS_PENDING = "arsPending"
	return BaseController.extend("DecisionsOne.src.pages.dashboard.DashBoard", {
		onInit : function () {			
			this.setUserTheme();
			this.getRouter()
				.getRoute("dashBoard")
				.attachPatternMatched(this._onRouteMatched, this);

		},

		onNavRoute:function(oEvent){
            let Router = oEvent.getSource().data("route");            
            this.getRouter().navTo(Router);
		},
		
		_onRouteMatched : function (oEvent) {			
			this.setUserTheme();
			
			this.loadMyPendings();
			this.loadApprovalREquestsStatistics()
		},
		loadApprovalREquestsStatistics(){		
			let model = new RestModel();
			let url = this.getBusinessOneService("ApprovalRequestsService_GetAllApprovalRequestsList");
			model.post(url)
			.then(data=>{
				let approvalRequestsStatistics = {}
				approvalRequestsStatistics.ApprovedCount = data.ApprovalRequestsParams.filter(x => x.Status == STATUS_APPROVED).length
				approvalRequestsStatistics.PendingCount =  data.ApprovalRequestsParams.filter(x => x.Status == STATUS_PENDING).length
				this.setModel(new RestModel(approvalRequestsStatistics), "ApprovalRequestsStatistics");
				
			}).catch(console.log);

		
		},		
		userSettingPress : function(){
			var usercode = this.getUserSession().USER_CODE;
			this.getRouter().navTo("settings", {
				userName: usercode
			});
		},

		_showResquest : function (oItem) {
			var path = oItem.oBindingContexts.Approvals.sPath;
			var index = this.getIndexOfPath(path);
			var oId = oItem.oBindingContexts.Approvals.oModel.oData.RequestsPurchase[index].Id;
			this.getRouter().navTo("requestPurchaseDetail", {
				id: oId
			});
		},

		loadMyPendings(){			
			let controlData = this.byId("tilePendingDocuments");		
			let url = this.getBusinessOneService("ApprovalRequestsService_GetOpenApprovalRequestList")			
			let model = new RestModel();
			
			model.post(url, controlData)
			.then()
			.catch(err => this.showExeption(err));
			controlData.setModel(model);
		},

		tilepress(oEvent){
			console.log(oEvent.getSource().getModel().getData());
		}

	});

});
