sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sesmassuploadapp/sesappwithexcel/test/integration/FirstJourney',
		'sesmassuploadapp/sesappwithexcel/test/integration/pages/SESMainHeaderList',
		'sesmassuploadapp/sesappwithexcel/test/integration/pages/SESMainHeaderObjectPage'
    ],
    function(JourneyRunner, opaJourney, SESMainHeaderList, SESMainHeaderObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sesmassuploadapp/sesappwithexcel') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSESMainHeaderList: SESMainHeaderList,
					onTheSESMainHeaderObjectPage: SESMainHeaderObjectPage
                }
            },
            opaJourney.run
        );
    }
);