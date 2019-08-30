sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",	
		"DecisionsOne/model/RestModel",	
		"DecisionsOne/model/formatter",		
		"DecisionsOne/services/ConfirmDialogService",
	],
	function (BaseController, MessageToast, RestModel, formatter, ConfirmDialogService) {
	"use strict";
	const DECISION_APROVED = "ardApproved";
	const DECISION_REPROVED = "ardRepproved";
	const APPROVAL_REQUEST_DECISION_PATH = "/ApprovalRequestDecisions/0/";
	return BaseController.extend("DecisionsOne.src.pages.drafts.List", {
		onInit : function () {							           
			this.tableMyPendingDocuments =  this.byId("myPendingDocuments");
			this.tableAllPendingDocuments =  this.byId("pendingDocuments");
			this.page = this.byId("pendingDocumentsListPage");
			this.loadData();
        },
        fmt:formatter, 
		_onRouteMatched(oEvent){
        	      	        	
		},
		loadData(){
			this.loadPendingDocuments()
			this.loadMyPendings()
		},
		onMyPendingDetail(oEvent){
			let sPath = oEvent.getSource().getBindingContext().getPath();
			let propertyPath = sPath + "/Code"
			let model = this.tableMyPendingDocuments.getModel();
			let code = model.getProperty(propertyPath);
			let modelGet = new RestModel();
			let servicePath = "ApprovalRequests(" + code + ")";
			modelGet.get(this.getBusinessOneService(servicePath))
			.then(data =>{				
				this.getRouter().navTo("draftsDetail",{
					docEntry:data.ObjectEntry,
					code
				});
			}
			)
			
		},
		loadPendingDocuments(){
			let controlData = this.tableAllPendingDocuments;				
			let url = this.getBusinessOneService("Drafts?$filter=AuthorizationStatus eq 'dasPending'&$orderby=UpdateDate desc")
			let model = new RestModel();			
			controlData.setModel(model)
			model.get(url, controlData)
			.then(data =>  {
				
					controlData.getModel().refresh(true)										
					console.log(controlData.getModel().getData())
				}).catch(err => {				
					this.showExeption(err);					
				});
		},		
		loadMyPendings(){			
			let controlData = this.tableMyPendingDocuments;	
			let page = this.page;	
			let url = this.getBusinessOneService("ApprovalRequestsService_GetOpenApprovalRequestList")			
			let model = new RestModel();
			
			controlData.setModel(model);
			model.post(url, controlData)
			.then(data =>  {				
					controlData.setBusy(false)	
					model.setData(data);
					controlData.getModel().refresh(true)
				}).catch( err => {					
					this.showExeption(err);					
				});
			
			controlData.attachSelectionChange(oEvent=>{
				let enable = controlData.getSelectedItems().length > 0;
				page.setShowFooter(enable);
				
			});
		},		
		handleIconTabBarSelect: function (oEvent) {			
			let	sKey = oEvent.getParameter("key");
			//this.filterData(sKey)
		},
		onLog(){
			console.log(this.getModel())
			console.log(this.getModel().getData())
		},
		filterData: function (sKey) {
		/* 	let oBinding = this.byId("pendingDocuments").getBinding("items"),				
				aFilters = [],
				filterStatus;		
			
			filterStatus = new Filter("DocObjectCode", "EQ", sKey);			
			aFilters.push(filterStatus);			
			oBinding.filter(aFilters); */			
		},		
		onDetail(oEvent){			
			let path= oEvent.getSource().getBindingContext().getPath();
			let docEntryPath = path + "/DocEntry";
			let iDocEntry = this.tableAllPendingDocuments.getModel().getProperty(docEntryPath);
			this.getRouter().navTo("draftsDetail",{
				docEntry:iDocEntry,
				code:0
			})
			
		},
		onApprove(oEvent){
			let table = this.tableMyPendingDocuments
			let objs = table.getSelectedContexts().map(x => x.getObject());
			let model = new RestModel()
			let that = this;
			objs.forEach(element => {
				let url = that.getBusinessOneService(`ApprovalRequests(${element.Code})`);
				model.get(url)
				.then(data =>{
					model.setData(data);
					console.log(data)
					that.showConfirmCommentedDialog(
						["Remarks", "CurrentStage"], 
						[element.Remarks, data.CurrentStage],
						that.getText('Commom.Accept'))
					.then((comment)=>{
						model.setProperty(APPROVAL_REQUEST_DECISION_PATH,
							{	Remarks: comment,
								Status: DECISION_APROVED})
						console.log(comment, model.getProperty(APPROVAL_REQUEST_DECISION_PATH));
					})
				})
			});			
		},

		
	});

});