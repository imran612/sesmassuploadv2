//@ui5-bundle com/xom/mu/sesmassuploadapp/Component-preload.js
sap.ui.require.preload({
	"com/xom/mu/sesmassuploadapp/Component.js":function(){
sap.ui.define(["sap/fe/core/AppComponent"],function(e){"use strict";return e.extend("com.xom.mu.sesmassuploadapp.Component",{metadata:{manifest:"json"},getStartupParameters:function(){return Promise.resolve({preferredMode:["create"]})}})});
},
	"com/xom/mu/sesmassuploadapp/i18n/i18n.properties":'# This is the resource bundle for com.xom.mu.sesmassuploadapp\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Service Entry Sheet Mass Upload\n\n#YDES: Application description\nappDescription=An SAP Fiori application.',
	"com/xom/mu/sesmassuploadapp/manifest.json":'{"_version":"1.59.0","sap.app":{"id":"com.xom.mu.sesmassuploadapp","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"0.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","sourceTemplate":{"id":"@sap/generator-fiori:feop","version":"1.13.5","toolsId":"7934781f-f6e9-49ed-9c94-33c945ab815f"},"dataSources":{"mainService":{"uri":"service/sesmassuploadappSvcs/","type":"OData","settings":{"annotations":[],"odataVersion":"4.0"}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":true,"dependencies":{"minUI5Version":"1.121.1","libs":{"sap.m":{},"sap.ui.core":{},"sap.ushell":{},"sap.fe.templates":{},"sap.f":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"com.xom.mu.sesmassuploadapp.i18n.i18n"}},"":{"dataSource":"mainService","preload":true,"settings":{"operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}},"@i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"}},"resources":{"css":[]},"routing":{"config":{"flexibleColumnLayout":{"defaultTwoColumnLayoutType":"TwoColumnsMidExpanded","defaultThreeColumnLayoutType":"ThreeColumnsMidExpanded"},"routerClass":"sap.f.routing.Router"},"routes":[{"pattern":"SESMainHeader({key}):?query:","name":"SESMainHeaderObjectPage","target":["SESMainHeaderObjectPage"]},{"pattern":"SESMainHeader({key})/main({key2}):?query:","name":"SESMainHeader_mainObjectPage","target":["SESMainHeaderObjectPage","SESMainHeader_mainObjectPage"]}],"targets":{"SESMainHeaderObjectPage":{"type":"Component","id":"SESMainHeaderObjectPage","name":"sap.fe.templates.ObjectPage","options":{"settings":{"editableHeaderContent":false,"contextPath":"/SESMainHeader","content":{"header":{"visible":false,"anchorBarVisible":false}},"navigation":{"main":{"detail":{"route":"SESMainHeader_mainObjectPage"}}},"controlConfiguration":{"main/@com.sap.vocabularies.UI.v1.LineItem#MassCreateofServiceEntrySheet":{"tableSettings":{"enablePaste":true,"creationMode":{"name":"Inline"}}}}}},"controlAggregation":"beginColumnPages","contextPattern":"/SESMainHeader({key})"},"SESMainHeader_mainObjectPage":{"type":"Component","id":"SESMainHeader_mainObjectPage","name":"sap.fe.templates.ObjectPage","options":{"settings":{"contextPath":"/SESMainHeader/main","navigation":{},"editableHeaderContent":false,"content":{"header":{"visible":false}}}},"controlAggregation":"midColumnPages","contextPattern":"/SESMainHeader({key})/main({key2})"}}},"rootView":{"viewName":"sap.fe.templates.RootContainer.view.Fcl","type":"XML","async":true,"id":"appRootView"}},"sap.fiori":{"registrationIds":[],"archeType":"transactional"},"sap.cloud":{"public":true,"service":"lcap.sesmassuploadapp"}}'
});
//# sourceMappingURL=Component-preload.js.map
