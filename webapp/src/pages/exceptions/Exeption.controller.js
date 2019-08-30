sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Controller, JSONModel) {
	"use strict";


	return Controller.extend("DecisionsOne.src.pages.exceptions.Exeption", {

		show: function (exeption) {
			let that = this;
			var oMessageTemplate = new sap.m.MessageItem({
				type: '{exceptionType}',
				title: '{message}',
				description: '{description}',
				subtitle: '{subtitle}',
				counter: '{counter}',
				markupDescription: "{markupDescription}",

			});
           
			let messages = this.getMessageArray(exeption);
			var oModel = new JSONModel();
			oModel.setData(messages);

			var oMessageView = new sap.m.MessageView({
					showDetailsPageHeader: false,
					itemSelect: function () {
						oBackButton.setVisible(true);
					},
					items: {
						path: "/",
						template: oMessageTemplate
					}
				}),
				oBackButton = new sap.m.Button({
					icon: sap.ui.core.IconPool.getIconURI("nav-back"),
					visible: false,
					press: function () {
						oMessageView.navigateBack();
						this.setVisible(false);
					}
				});

            oMessageView.setModel(oModel);


			var oCloseButton =  new sap.m.Button({
                icon: sap.ui.core.IconPool.getIconURI("decline"),
                press: function () {
						that._oPopover.close();
					}
				}),

				oPopoverBar = new sap.m.Bar({
					contentLeft: [oBackButton],
					contentMiddle: [
						new sap.ui.core.Icon({
							color: "#bb0000",
							src: "sap-icon://message-error"}),
						new sap.m.Text({
							text: "Messages"
						})
					]
				});

			this._oPopover = new sap.m.Dialog({
				customHeader: oPopoverBar,
				contentWidth: "440px",
				contentHeight: "440px",
				verticalScrolling: false,
				content: [oMessageView],
				beginButton: oCloseButton
            });

			this._oPopover.open();
		},

		getMessageArray(exeption){
			if(Array.isArray(exeption)) return exeption;
			let message = exeption.error.message.value;
			return [{
				type: 'Error',
				message,
				description : ''
			}];
		}

	});

});
