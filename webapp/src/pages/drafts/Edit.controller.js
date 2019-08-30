sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",	
		"DecisionsOne/model/RestModel",			
		"DecisionsOne/src/fragments/SelectProduct.controller",		
		"DecisionsOne/src/fragments/DistribuitionChoose.controller",
		"DecisionsOne/src/fragments/DialogSelectHelper.controller"
	],
	function (BaseController, MessageToast, RestModel, SelectProductController, DistribuitionChooseController, DialogSelectHelper) {
	"use strict";

	return BaseController.extend("DecisionsOne.controller.drafts.Edit", {
		onInit : function () {							
            var oRouter;				                                  
            oRouter = this.getRouter();
            this._serviceUrl= this.getBusinessOneService();
            oRouter
			.getRoute('draftsEdit')
            .attachPatternMatched(this._onRouteMatched, this); 

        },         
		_onRouteMatched: function(oEvent){
			let docEntry = oEvent.getParameter("arguments").docEntry;
			this.loadData(docEntry);
		},
		loadData(docEntry){
			let model = new RestModel();
			let url = [this._serviceUrl,"/Drafts(",docEntry,")"].join("");
			model.get(url)
			.then(data=>{				
				data.DocumentLines.forEach(line =>{
					let codes=[];
					let contingCodes = [line.CostingCode,line.CostingCode2,line.CostingCode3,line.CostingCode4,line.CostingCode5].reduce((acumulado,atual)=>{
						if(atual)
						codes.push(atual)
					},"");
					line.CostingCodes=codes.join(";");	
				})
				
				this.getView().getModel().setData(data);
				this.getView().bindElement("/")
				
			}).catch(console.log)
			this.setModel(model);
		},
		onSavePress(){
			let model = this.getModel();			
			let path =this._serviceUrl +"/Drafts("+ model.getProperty("/DocEntry") +")"  
			model.patch(path).then(this.dealUpdateResult().success).catch(this.dealUpdateResult().error);
			//console.log(this.getModel())
		},
		dealUpdateResult: function(){			
			return  {
				success: (data) =>{
					MessageToast.show("Atualizado com sucesso!");
					let iDocEntry = this.getModel().getProperty("/DocEntry");
					this.getRouter().navTo("purchaseRequestDetail",{
						docEntry:iDocEntry
					})
					},
				error: (err) => {this.showExeption(err)}
			}
		},
		onSearchProjectPress(oEvent){
			let dialogCtrl = new DialogSelectHelper();
			let model = new RestModel();
			let button = oEvent.getSource();
			let linePath = button.getParent().getBindingContextPath();
			
			let url = this._serviceUrl + "/Projects"
			model.get(url, button)
			.then(data =>{												
						dialogCtrl.setTemplate("Code", "Name");
						dialogCtrl.getDialog().setTitle(this.getText("Commom.Select"))
						let fnConfirm = (oEvent) => {
							let obj = oEvent.getParameter("selectedContexts").map(x=> x.getObject())[0];
							linePath += "/ProjectCode" 
							this.getModel().setProperty(linePath,obj.Code);
							dialogCtrl.getDialog().detachConfirm(fnConfirm,undefined)
						}
						dialogCtrl.getDialog().attachConfirm(fnConfirm);
						dialogCtrl.open(model);
					}).catch(
					err => {						
						this.showExeption(err)
					}
			)
		},
		
		onFindPriceList(oEvent){		
				
			let dialogCtrl = new DialogSelectHelper();
			let model = new RestModel();
			let button = oEvent.getSource();
			let enditEntryModel = this.getModel();
			let linePath = button.getParent().getBindingContextPath();			
			let priceProperty = linePath + "/Price";
			
			let url = this._serviceUrl + "/Items('I0001')/ItemPrices"
			model.get(url, button)
			.then(data => {	
				if(data == null){
					MessageToast.show(this.getText("Item.NoPrice"));
					return;
				}
				model.setData(data.ItemPrices)
				button.setBusy(false)
				dialogCtrl.setFullTemplate(this.getListPriceTemplate());
				dialogCtrl.setFilterVariables("PriceList", "Info")
				dialogCtrl.getDialog().setTitle(this.getText("Commom.PriceList"));
				dialogCtrl.getDialog().addStyleClass(this.getOwnerComponent().getContentDensityClass());
				let fnPriceListConfirm = oEvent => {
					let price = oEvent.getParameter("selectedContexts").map(x=> x.getObject())[0].Price;
					let priceFmt =this.fmt.currency(price)
					button.setValue(priceFmt);
					enditEntryModel .setProperty(priceProperty, priceFmt)							
					dialogCtrl.getDialog().detachConfirm(fnPriceListConfirm, undefined)
					};
				dialogCtrl.getDialog().attachConfirm(fnPriceListConfirm);
				dialogCtrl.open(model);
			}).catch(
			err => {
				button.setBusy(false)
				this.showExeption(err)
			})
		},	
		
		getListPriceTemplate(){
			let title = "{PriceList}"
			let template = new sap.m.ObjectListItem({
        		title: title,
        		number:"{" +
        				"parts:[{path:'Price'},{path:'Currency'}]," +
        				"type: 'sap.ui.model.type.Currency'," +
        				"formatOptions: {showMeasure: true}" +
        				"}" 
        	});
			return template;
		},
		onDistribuitionPress(oEvent){
			let buttonFire = oEvent.getSource();
			let that = this;
			let model = this.getModel();
	        let linePath = buttonFire.getParent().getBindingContextPath();
		 	let controller = new DistribuitionChooseController();
		 	controller.setUrlBase(this.getBusinessOneService())
            let dialog = sap.ui.xmlfragment("DecisionsOne.src.fragments.DistribuitionChoose", controller);
            let line = model.getProperty(linePath);
		 	controller.fillData(dialog, line);
            this.getView().addDependent(dialog);
            dialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			let afterClose = (oEvent) => {
            	let data = oEvent.getParameters().filter(x => typeof x === 'object');
            	that.fillDistribuitionOnSelectedLine(data, model, linePath, buttonFire);				            	
            	dialog.detachAfterClose(afterClose, undefined)            	          	
			};
			
            dialog.attachAfterClose(afterClose)
            dialog.open();            
	            
		},
		fillDistribuitionOnSelectedLine: function(data, model, linePath, buttonFire){
			let ocrCodesView = [];
			data.forEach(x => {
				let propertyPath = linePath + "/CostingCode";
				if(x.DimensionCode > 1)
					propertyPath+= x.DimensionCode;
				model.setProperty(propertyPath, x.OcrCode);
				ocrCodesView.push(x.OcrCode);
			});

			buttonFire.setValue(ocrCodesView.join(";"))
		},
		onAddItem: function(oEvent){			
            let buttonFire = oEvent.getSource();            
            let controller = new SelectProductController();	
            let dialog = sap.ui.xmlfragment("DecisionsOne.src.fragments.SelectProduct", controller);
            dialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
            let url = this.getBusinessOneService('Items')
            let model = new RestModel(); 
            
            let that = this;
			model.get(url,buttonFire)
			.then(data => {
                	dialog.setModel(model); 
                	dialog.attachConfirm((oEvent) => {
                		 let items = that.onConfirmItemsSelection(oEvent)
                		 let model = that.getModel();
                		 let lines = model.getProperty("/DocumentLines");
                		 let merged = that.mergeList(lines,items,"ItemCode");
                		 model.setProperty("/DocumentLines", merged);
                		 model.refresh(true)                		 
                	});
                	dialog.setMultiSelect(true)                	
                	dialog.open()                	
				})
				.catch(err => {                	
                	this.showExeption(err);                	
                })
                  
		},
		onConfirmItemsSelection : function(oEvent){
			let selectedeObjects =  oEvent
				.getParameter("selectedContexts")
				.map(x=> 
					{
						return {
							ItemCode: x.getObject().ItemCode,
							ItemDescription : x.getObject().ItemName							
						}						
					}
				);

			return selectedeObjects;
		},
	});

});