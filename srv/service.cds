using { com.xom.mu as my } from '../db/schema';

@path: '/service/sesmassuploadappSvcs'
@requires: 'authenticated-user'
service SESMUploadService {
    @odata.draft.enabled
    entity SESMainHeader as
        projection on my.SESMainHeader;

    entity SESMain as
        projection on my.SESMain;

    entity SESMainDetails as
        projection on my.SESMainDetails;

    @readonly entity SESPurchaseOrders as projection on my.SESPurchaseOrders;
        
    @readonly
    entity AssignCategory as
        projection on my.AssignCategory;

    @readonly
    entity LineItems as
        projection on my.LineItems;

    @readonly 
    entity ContractItems as
        projection on my.ContractItems; 
}
