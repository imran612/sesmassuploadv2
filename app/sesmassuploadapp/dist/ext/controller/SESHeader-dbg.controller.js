sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
	'use strict';

	return ControllerExtension.extend('com.xom.mu.sesmassuploadapp.ext.controller.SESHeader', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf com.xom.mu.sesmassuploadapp.ext.controller.SESHeader
             */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
			},
			editFlow: {
				onAfterSave: function (mParameters) {
					/*mParameters.context.refresh();
					//asynchronous access to complete data the context points to
					mParameters.context.requestObject().then((contextData) => {
						return sap.m.MessageToast.show(
							"Save successful. Number of data entries in context: " + Object.entries(contextData).length
						);
					}); */
					this.base.intentBasedNavigation.navigateOutbound('SESMassOutbound-display', {});
				}
			}
		}
	});
});
