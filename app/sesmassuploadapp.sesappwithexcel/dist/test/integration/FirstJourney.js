sap.ui.define(["sap/ui/test/opaQunit"],function(e){"use strict";var i={run:function(){QUnit.module("First journey");e("Start application",function(e,i,n){e.iStartMyApp();n.onTheSESMainHeaderList.iSeeThisPage()});e("Navigate to ObjectPage",function(e,i,n){i.onTheSESMainHeaderList.onFilterBar().iExecuteSearch();n.onTheSESMainHeaderList.onTable().iCheckRows();i.onTheSESMainHeaderList.onTable().iPressRow(0);n.onTheSESMainHeaderObjectPage.iSeeThisPage()});e("Teardown",function(e,i,n){e.iTearDownMyApp()})}};return i});
//# sourceMappingURL=FirstJourney.js.map