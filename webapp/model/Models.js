sap.ui.define([
    "DecisionsOne/model/RestModel",
    "sap/ui/Device"
], function (RestModel, Device) {
    "use strict";

    return {

        createRestModel: function (url) {
            let oModel = new RestModel();                        
            oModel.setBaseUrl(url)                
            return oModel;
        },

        createDeviceModel: function () {
            var oModel = new RestModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        }

    };
});