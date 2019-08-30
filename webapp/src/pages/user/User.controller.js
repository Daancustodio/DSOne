sap.ui.define(
	[
		"DecisionsOne/src/app/BaseController",
		"sap/m/MessageToast",
		'DecisionsOne/model/RestModel'	,

	],
	function (BaseController, MessageToast, RestModel) {
	"use strict";

	return BaseController.extend("DecisionsOne.src.pages.user.User", {

		onInit : function () {
			console.log("Inicializado")	;
		},




	});

});
