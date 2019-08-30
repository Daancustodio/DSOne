sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",		        	
    	'sap/ui/model/Filter',
    	'sap/m/Button',
		'sap/m/Dialog',			
		'sap/m/Text',
		'sap/m/TextArea',		
		'sap/ui/layout/HorizontalLayout',
		'sap/ui/layout/VerticalLayout'
	],
	function (BaseController, Filter,Button, Dialog,Text,TextArea,HorizontalLayout,VerticalLayout) {
	"use strict";

	return BaseController.extend("DecisionsOne.src.fragments.DialogSelectHelper", {
		
		_template: null,
		_title: "title",
		_desc : "description",
		_dialog : new sap.m.SelectDialog("dialogSelectHelper", {title:""}),
		open : function (model) {			
			this._dialog.setModel(model);
			this._dialog.attachSearch((oEvent)=>{this.handleSearch(oEvent)})			
			this._dialog.bindAggregation('items',"/", this.getTemplate());
			this._dialog.open()
        },
        getDialog(){
        	return this._dialog;
        },
        getTemplate(){
        	if(this._template != null) return this._template;
        	
        	this._template = new sap.m.StandardListItem({
        		title: "{title}",
        		description: "{description}",        		
        		active:true
        	})
        },
        setTemplate(title, desc, info){
			this._title = title;
			this._desc = desc
			
        	this._template = new sap.m.StandardListItem({
        		title: "{"+title+"}",
        		description: "{"+desc+"}",
        		info: "{"+info+"}",
        		active:true
        	})
        },
        setFullTemplate(tpl){
			
        	this._template = tpl
        },
        setFilterVariables(title, desc){
        	this._title = title;
			this._desc = desc
        },
        handleSearch : function(oEvent){        	
        	let sKey = oEvent.getParameter("value");        	
        	let oBinding = oEvent.getSource().getBinding("items");
			let aFilter,
				filterItemCode, 
				filterItemName;		
			
			filterItemCode = new Filter(this._title, function(sText) {
				return (sText.toString().toUpperCase() || "").indexOf(sKey.toString().toUpperCase()) > -1;
			});
			filterItemName = new Filter(this._desc, function(sText) {
				return (sText.toString().toUpperCase() || "").indexOf(sKey.toString().toUpperCase()) > -1;
			});
			aFilter = new Filter([filterItemCode, filterItemName], false);
			oBinding.filter(aFilter);			
		},
		getDialogConfirmWithComent(sTitle, sText, sTextAreaPlaceholder, sSubmitTextButton, sCancelTextButton, onClose){
			let dialog = new Dialog({
				title: sTitle,
				type: 'Message',
				content: [
					new HorizontalLayout({
						content: [							
							new VerticalLayout({
								content: [
									new Text({ text: sText })									
								]
							})
						]
					}),
					new TextArea('confirmDialogTextarea',{
						width: '100%',
						placeholder: sTextAreaPlaceholder
					})
				],
				beginButton: new Button({
					text: 'Submit',
					press: function () {
						var sText = sap.ui.getCore().byId('confirmDialogTextarea').getValue();
						if(onClose) 
							onClose(sText);
						
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						if(onClose)
							onClose("");
						
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			
			return dialog;
		}
	});
});