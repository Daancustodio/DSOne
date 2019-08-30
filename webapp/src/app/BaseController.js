sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"DecisionsOne/src/pages/exceptions/Exeption.controller",
		"DecisionsOne/model/formatter",
		"sap/m/MessageBox",
		"DecisionsOne/model/RestModel",
	], function (Controller, Exeption, formatter, MessageBox, RestModel) {
	"use strict";

	return Controller.extend("DecisionsOne.src.app.BaseController", {
		fmt: formatter,
		USER_SESSION_PATH: "currentUser",
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);

		},

		setUserTheme : function(){
			var user = this.getUserSession();
			if(!user)
				return;

			if(user.UserSettings == undefined)
				return;

			if(!user.UserSettings.Theme)
				return;

			var theme = sap.ui.getCore().getConfiguration().getTheme();

			if(theme != user.UserSettings.Theme)
				sap.ui.getCore().applyTheme(user.UserSettings.Theme);
		},

		getBusinessOneService(){			
			let base = [];
			let serve = this.getOwnerComponent().getMetadata().getConfig().b1s;
			base.push(serve);

			for (let index = 0; index < arguments.length; index++) {
				const element = arguments[index];
				base.push(element);
			}

			return base.join('/');
		},

		getService(){
			let base = [];
			let serve = this.getOwnerComponent().getMetadata().getConfig().serviceUrl;
			base.push(serve);

			for (let index = 0; index < arguments.length; index++) {
				const element = arguments[index];
				base.push(element);
			}

			return base.join('/');
		},

		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getText: function(sKey){
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey);
		},

		onNavBack : function(sRoute, mData) {
				window.history.go(-1);
		},

		getIndexOfPath : function(sPath){
			var pathArray = sPath.split("/");
			var sIndex = pathArray[pathArray.length - 1];
			var index = Number.parseInt(sIndex);
			return index;
		},

		showExeption(exeption){
			let ctrl =new Exeption();
			ctrl.show(exeption);
		},

		getUserSession : function(){
			return this.getItem(this.USER_SESSION_PATH);
		},

		setUserSession : function(userData){
			delete userData.Password ;
			this.setItem(this.USER_SESSION_PATH, userData)
		},

		destroyUserSession : function(){
			this.removeItem(this.USER_SESSION_PATH);
		},

		setItem(path, data){
			localStorage.setItem(path,JSON.stringify(data));
			
		},
		getItem(path){
			let strData = localStorage.getItem(path)
			if(!strData || strData == '') return null;

			return JSON.parse(strData);
		},

		removeItem(path){
			localStorage.removeItem(path);
		},

		dealCreateResult: function(){			
			return  {
				success: () =>{					 
					MessageToast.show("Criado com sucesso!")					 
					this.onNavBack();
					},
				error: this.showExeption				
			}
		},
		mergeListBy(fn, main,secondary){
    		 let itemsNotOnMain = secondary.filter(x => !main.some(fn));
    		 let merged = main.concat(itemsNotOnMain);
    		 return merged;
    		 
		},
		mergeList(main, secondary, propertyNameToCompare){
   		 let itemsNotOnMain = secondary.filter(x => !main.some(a => a[propertyNameToCompare] == x[propertyNameToCompare]));
   		 let merged = main.concat(itemsNotOnMain);
   		 return merged;
   		 
		},
		onRemoveSelections : function(oEvent){
			let oTable = oEvent.getSource().getParent().getParent();
			if(oTable.getSelectedItems().length == 0)
			{
				MessageToast.show(this.getText("Commom.NoSelection"));
				return;
			}
            MessageBox.show(
                this.getText("Commom.RemoveSelected"),
                sap.m.MessageBox.Icon.QUESTION,
                this.getText("Commom.Remove"),
                [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO], 
                (sResult) => {						
                    if(sResult == sap.m.MessageBox.Action.YES){ 
                        this._RemoveSelections(oTable);
                    }
                }    
            );
		},
		
		_RemoveSelections(oTable){           
			let model = this.getModel();
			oTable.getSelectedItems().forEach(item => {	
				let prop = this.getPropertyName(item.getBindingContext().getPath());
				let index = this.getIndexOfPath(item.getBindingContext().getPath());
				model.getData()[prop].splice(index, 1);
			});
			oTable.removeSelections(true);
			model.refresh(true);
		 },
		 getPropertyName : function(sPath){
				var pathArray = sPath.split("/");
				return pathArray[pathArray.length - 2];
		 },
		 getIndexOfPath : function(sPath){
				var pathArray = sPath.split("/");
				var sIndex = pathArray[pathArray.length - 1];
				var index = Number.parseInt(sIndex);
				return index;
		},
		showConfirmCommentedDialog : function (labels, texts, confirmButtonText) {
            const resource = this.getView().getModel("i18n").getResourceBundle();
            const contentLabel = labels.map(x => new sap.m.Label({ text:x }));
            const contentText = texts.map(x => new sap.m.Text({ text:x }));
            const title = resource.getText('Commom.Confirm');
            const confirmText = confirmButtonText == undefined ? resource.getText('Commom.Confirm') : confirmButtonText;
            const remakes =  resource.getText('Document.Obs');
            const cancel = resource.getText('Commom.Cancel');

            const promisse = (resolve, reject) => {
                let dialog = new sap.m.Dialog({
                    title: title,
                    type: 'Message',
                    content: [
                        new sap.ui.layout.HorizontalLayout({
                            content: [
                                new sap.ui.layout.VerticalLayout({
                                    width: '120px',
                                    content: contentLabel
                                }),
                                new sap.ui.layout.VerticalLayout({
                                    content: contentText
                                })
                            ]
                        }),
                        new sap.m.TextArea('confirmDialogTextarea', {
                            width: '100%',
                            placeholder: remakes
                        })
                    ],
                    beginButton: new sap.m.Button({
						text: confirmText,
						type:"Accept",
						icon:"sap-icon://accept",
                        press: function () {
                            var sText = sap.ui.getCore().byId('confirmDialogTextarea').getValue();
                            resolve(sText);
                            dialog.close();
                        }
                    }),
                    endButton: new sap.m.Button({					
						text: cancel,						
						icon:"sap-icon://decline",
                        press: function () {
                            dialog.close();
                            reject()
                        }
                    }),
                    afterClose: function() {
                        dialog.destroy();
                    }
                });

                dialog.open();

            }

            return new Promise(promisse);

		},

		extractObjects: (oEvent) => {
			let objects = oEvent.getParameter("selectedContexts").map(x => x.getObject())
			return objects;
		},

		showSelectDialog(data){
			let dialog = sap.ui.xmlfragment("DecisionsOne.src.fragments.Select", this);
			dialog.setModel(new RestModel(data));
			let promisse = (resolve, reject) =>{
				let fnPriceListConfirm = oEvent => {
					let selection = this.extractObjects(oEvent);
					dialog.detachConfirm(fnPriceListConfirm)
					resolve(selection);
				};
				dialog.attachConfirm(fnPriceListConfirm);
				dialog.attachCancel(() =>{
					dialog.detachConfirm(fnPriceListConfirm)
					reject()
				});
				dialog.open();
			}

			return new Promise(promisse);

		},
		showSelectDialogWithTemplate(data, temlate){
			let dialog = sap.ui.xmlfragment("DecisionsOne.src.fragments.Select", this);
			dialog.setModel(new RestModel(data));							
			dialog.bindAggregation('items',"/", temlate);			
			let promisse = (resolve, reject) =>{
				let fnPriceListConfirm = oEvent => {
					let selection = this.extractObjects(oEvent);
					dialog.detachConfirm(fnPriceListConfirm)
					resolve(selection);
				};
				dialog.attachConfirm(fnPriceListConfirm);
				dialog.attachCancel(() =>{
					dialog.detachConfirm(fnPriceListConfirm)
					reject()
				});
				dialog.open();
			}

			return new Promise(promisse);

		}
		
	});
});
