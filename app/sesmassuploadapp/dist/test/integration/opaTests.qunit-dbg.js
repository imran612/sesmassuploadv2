sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/xom/mu/sesmassuploadapp/test/integration/FirstJourney',
		'com/xom/mu/sesmassuploadapp/test/integration/pages/SESMainHeaderObjectPage'
    ],
    function(JourneyRunner, opaJourney, SESMainHeaderObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/xom/mu/sesmassuploadapp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSESMainHeaderObjectPage: SESMainHeaderObjectPage
                }
            },
            opaJourney.run
        );
    }
);