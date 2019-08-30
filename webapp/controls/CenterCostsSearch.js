sap.ui.define([
    "sap/m/SearchField",
    "DecisionsOne/model/formatter"
], function (SearchField, formatter) {
	"use strict";
	return SearchField.extend("DecisionsOne.controls.CenterCostsSearch", {
		metadata : {
            properties : {
				dimension: 	{type : "int", defaultValue :-1}
			}
        },

		init : function () {

        },
        renderer : {}
	});
});
