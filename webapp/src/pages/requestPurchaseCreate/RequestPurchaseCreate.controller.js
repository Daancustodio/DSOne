sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",
		"DecisionsOne/model/RestModel",
		"DecisionsOne/src/fragments/SelectProduct.controller",
		"DecisionsOne/src/fragments/DistribuitionChoose.controller",
		"DecisionsOne/src/fragments/DialogSelectHelper.controller",
	],
	function (BaseController, MessageToast, RestModel, SelectProductController, DistribuitionChooseController, DialogSelectHelper) {

		"use strict";

		const PURCHASEREQUESTSERVICE_GETAPPROVALTEMPLATES_PATH = "PurchaseRequestService_GetApprovalTemplates"
		const COMPANYSERVICE_GETITEMPRICE_PATH = "CompanyService_GetItemPrice"
		const ITEMS_PATH = "Items";
		const PURCHASEREQUEST_PATH = "PurchaseRequests";
		const DRAFTS_PATH = "Drafts";

		return BaseController.extend("DecisionsOne.src.pages.requestPurchaseCreate.RequestPurchaseCreate", {
			onInit: function () {
				var oRouter;
				oRouter = this.getRouter();
				this._serviceUrl = this.getBusinessOneService()
				oRouter
					.getRoute('requestPurchaseCreate')
					.attachPatternMatched(this._onRouteMatched, this);

			},
			_onRouteMatched: function (oEvent) {
				let data = this.getEmptyRequest();
				this.itemsModel = new RestModel();
				this.requestPurchaseModel = new RestModel(data);
				this.requestPurchaseApprovalTemplateServiceModel = new RestModel();
				this.CompanyServiceGetItemPriceModel = new RestModel();
				this.draftsModel = new RestModel();

				this.draftsModel.setBaseUrl(this.getBusinessOneService(DRAFTS_PATH))
				this.requestPurchaseModel.setBaseUrl(this.getBusinessOneService(PURCHASEREQUEST_PATH))
				this.requestPurchaseModel.setBaseUrl(this.getBusinessOneService(PURCHASEREQUESTSERVICE_GETAPPROVALTEMPLATES_PATH))
				this.itemsModel.setBaseUrl(this.getBusinessOneService(ITEMS_PATH))
				this.CompanyServiceGetItemPriceModel.setBaseUrl(this.getBusinessOneService(COMPANYSERVICE_GETITEMPRICE_PATH))

				this.setModel(this.requestPurchaseModel);
				this.getView().bindElement("/");

			},
			getEmptyRequest() {
				let req = {}
				req.DocumentLines = [];
				req.DocDate = new Date().toISOString().split("T")[0]
				//req.DocDueDate = new Date().toISOString().split("T")[0];
				req.TaxDate = new Date().toISOString().split("T")[0];
				return req;
			},

			onAddItem: function (oEvent) {
				let buttonFire = oEvent.getSource();
				let model = this.itemsModel
				let controller = new SelectProductController();
				let dialog = sap.ui.xmlfragment("DecisionsOne.src.fragments.SelectProduct", controller);
				dialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				let that = this;
				model.read(buttonFire)
					.then(
						function (data) {
							dialog.setModel(model);
							dialog.attachConfirm((oEvent) => {
								let items = that.onConfirmItemsSelection(oEvent)
								that.setPriceFromFriceList(items);
								let model = that.getModel();
								let lines = model.getProperty("/DocumentLines");
								items.forEach(x => {
									if (lines.some(a => a.ItemCode == x.ItemCode)) return;

									lines.push(x);
								})
								console.log({
									l: lines,
									i: items
								})

								that.getModel().setProperty("/DocumentLines", lines);
							});
							dialog.setMultiSelect(true)
							dialog.open()
							buttonFire.setBusy(false)
						}).catch(function (err) {
						buttonFire.setBusy(false)
						that.showExeption(err);
					});

			},
			setPriceFromFriceList(items, cardCode) {
				items.forEach(item => {
					let data = {
						CardCode: cardCode,
						ItemCode: item.itemCode
					};
					this.CompanyServiceGetItemPriceModel.setData(data);
					this.CompanyServiceGetItemPriceModel
						.post()
						.then(console.log)
						.catch(console.log)
				});
			},
			onConfirmItemsSelection: function (oEvent) {
				let rows = this.getModel().getProperty("/DocumentLines");
				let lastRow = rows[rows.length - 1];

				let selectedeObjects = oEvent
					.getParameter("selectedContexts")
					.map(x => {
						let item = {
							ItemCode: x.getObject().ItemCode,
							ItemDescription: x.getObject().ItemName,
							RequiredDate: this.getModel().getProperty("/RequriedDate"),
							Quantity: 1,
						};

						if (!lastRow) return item;

						item.CostingCode = lastRow.CostingCode;
						item.CostingCode2 = lastRow.CostingCode2;
						item.CostingCode3 = lastRow.CostingCode3;
						item.CostingCode4 = lastRow.CostingCode4;
						item.CostingCode5 = lastRow.CostingCode5;
						item.CostingCodes = lastRow.CostingCodes;

						return item;
					});

				return selectedeObjects;
			},
			dealSearchResult: function () {
				return {
					success: () => {

					},
					error: this.showExeption
				}
			},
			dealCreateResult: function () {
				return {
					success: () => {
						this.getText("Commom.ActionSuccess");
						this.onNavBack();
					},
					error: this.showExeption
				}
			},

			onCreate: function (oEvent) {
				console.log(this.getModel().getData())
				//this.verifyApprovalTemplate(oEvent);
				//this.createUsingJQuery();
			},
			verifyApprovalTemplate(oEvent) {
				let request = this.getModel().getData()
				let model = this.requestPurchaseApprovalTemplateServiceModel;

				model.setProperty("/Document", request);
				model.post(url, data => {
						if (!data.Document_ApprovalRequests.length) {
							this.createPurchaseRequest();
							return;
						}

						let ctrlDialog = new DialogSelectHelper();
						let dialog = ctrlDialog.getDialogConfirmWithComent(
							this.getText("Document.RequestApproval"),
							this.getText("Document.RequestApprovalBody"),
							this.getText("Document.Obs"),
							this.getText("Commom.Confirm"),
							this.getText("Commom.Cancel"),
							(comment) => {
								data.Document_ApprovalRequests.forEach(line => {
									line.Remarks = comment
								})
								this.getModel().setData(data);
								this.createPurchaseRequest();
							});

						dialog.open()
					},
					err => {
						this.showExeption(err)
					}, oEvent.getSource())
			},
			createPurchaseRequest() {
				let model = this.getModel();
				model.post()
					.then(data => {
						MessageToast.show(this.getText("Commom.ActionSuccess"));
						let iDocEntry = data.DocEntry;
						this.getRouter().navTo("purchaseRequestDetail", {
							docEntry: iDocEntry
						})
					}).catch(err => {
						if (err["responseJSON"]["error"]["code"] != -2028) //No Records 
							this.showExeption(err);

						MessageToast.show(this.getText("Commom.ActionSuccess"));
						model.setData(this.getEmptyRequest());

					});
			},
			createDraft() {
				let model = this.draftsModel;

				model.post()
					.then((data) => {
						MessageToast.show(this.getText("Commom.ActionSuccess"));
						let iDocEntry = data.DocEntry;
						this.getRouter().navTo("purchaseRequestDetail", {
							docEntry: iDocEntry
						})
					}).catch(err => {
						this.showExeption(err);
					});
			},
			onDistribuitionPress(oEvent) {
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
			fillDistribuitionOnSelectedLine: function (data, model, linePath, buttonFire) {
				let ocrCodesView = [];
				data.forEach(x => {
					let propertyPath = linePath + "/CostingCode";
					if (x.DimensionCode > 1)
						propertyPath += x.DimensionCode;
					model.setProperty(propertyPath, x.OcrCode);
					ocrCodesView.push(x.OcrCode);
				});

				buttonFire.setValue(ocrCodesView.join(";"))
			},
			onSearchProjectPress(oEvent) {
				let dialogCtrl = new DialogSelectHelper();
				let model = new RestModel();
				let button = oEvent.getSource();
				let linePath = button.getParent().getBindingContextPath();
				
				let url = this._serviceUrl + "/Projects"
				model.get(url, button)
				.then((data) => {
				
						dialogCtrl.setTemplate("Code", "Name");
						dialogCtrl.getDialog().setTitle(this.getText("Commom.Select"))
						let fnConfirm = (oEvent) => {
							let obj = oEvent.getParameter("selectedContexts").map(x => x.getObject())[0];
							linePath += "/ProjectCode"
							this.getModel().setProperty(linePath, obj.Code);
							dialogCtrl.getDialog().detachConfirm(fnConfirm, undefined)
						}
						dialogCtrl.getDialog().attachConfirm(fnConfirm);
						dialogCtrl.open(model);
					}).catch(
					err => {
						button.setBusy(false)
						this.showExeption(err)
					}
				)
			},

			onFindPriceList(oEvent) {
				
				let model = new RestModel();
				let button = oEvent.getSource();
				let linePath = button.getParent().getBindingContextPath();
				let priceProperty = linePath + "/Price";
				let itemCode = this.getModel().getProperty(linePath + "/ItemCode");
				
				let path = `Items('${itemCode}')/ItemPrices`;
				let url = this.getBusinessOneService(path)
				model
				.get(url, button)
				.then((data)=>{
						let prices = data.ItemPrices.map(x => {
							x.description= x.Price,
							x.title = x.PriceList
							return x;
						});
						this.showSelectDialogWithTemplate(prices, this.getListPriceTemplate())
						.then((selection) =>{
							let price = selection[0].Price;																			
							this.getModel().setProperty(priceProperty, price)
						})
						.catch(this.showExeption)
						
				})
				.catch(this.showExeption)			
			},			
			
			getListPriceTemplate() {
				let title = "{PriceList}"
				let template = new sap.m.ObjectListItem({
					title: title,
					number: "{" +
						"parts:[{path:'Price'},{path:'Currency'}]," +
						"type: 'sap.ui.model.type.Currency'," +
						"formatOptions: {showMeasure: true}" +
						"}"
				});
				return template;
			},
			logModel() {
				console.log(this.getModel().getData())
			},
			onSubmitValue(oEvent) {
				let val = oEvent.getParameter("value");
				let linePath = oEvent.getSource().getParent().getBindingContextPath();
				let propertyPath = linePath + "/Price";
				let priceFmt = this.fmt.currency(val)
				this.getModel().setProperty(propertyPath, priceFmt)
				oEvent.getSource().setValue(priceFmt);
			}
		});
	}
);