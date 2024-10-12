namespace com.xom.mu;

using {
    Country ,
    Currency ,
    Language ,
    User ,
    sap.common.CodeList,
    cuid ,
    managed ,
    temporal
} from '@sap/cds/common';
using { Attachments } from '@cap-js/attachments';
entity SESMainHeader : managed, cuid {
    //purchaseOrder : Association to one SESPurchaseOrders;
    main : Composition of many SESMain on main.sesMainHeader = $self; 
}

entity SESMain : managed, cuid {
    sesMainHeader : Association to SESMainHeader;
    purchaseOrder : Association to one SESPurchaseOrders @mandatory;
    purchaseOrderItem : Association to one LineItems;
    postingDate : Date @mandatory; 
    periodStart : Date @title: '{i18n>periodStart}' @mandatory;
    periodEnd : Date @mandatory;
    contractItem : Association to one ContractItems @Common.Text: contractItem.PurchaseContract;
    purchaseContract: String(10);
    purchaseContractItemText : String(40);
    qty : Integer @mandatory;
    assignCategory : Association to one AssignCategory;
    netPrice : Decimal(12, 3) @Core.Computed;
    //orderPriceUnit : String(3) @Core.Computed;
    orderPriceUnit : String(3);
    contractNetPriceAmount:Integer;
    //contractNetPriceAmount: Decimal(12, 3) @Core.Computed;
    //documentCurrency : String(5) @Core.Computed; 
    documentCurrency : String(5);
    plainLongText : LargeString;
    attachments: Composition of many Attachments;
    //sesMainDetails : Composition of many SESMainDetails on sesMainDetails.sESMain = $self;
}

entity SESMainDetails : managed, cuid {
    sESMain : Association to SESMain;
    purchaseOrder:  String(20);
    //plainLongText : LargeString;
    //attachments: Composition of many Attachments;
}
entity SESPurchaseOrders :  managed
{
    key documentNumber : String(100)  @title :'{i18n>Purchaseorderdocumentnumber}';
    virtual poOrderDate : DateTime;
    orderDate : String(100);
    customerName : String(100);
    supplierName : String(100);
    customerANID:  String(100);
    supplierANID: String(100);
    systemId:   String(100);
    created:    DateTime;
    dashboardStatus: String(100);
    vendorId : String(100);
}
entity AssignCategory : CodeList
{
    key code: String(100);
}

@readonly
@cds.autoexpose
entity Status : CodeList {
    key code : String;
    criticality : Integer;
}
entity LineItems
{
    purchaseOrder: String(100);
    key PurchaseOrderItem: String(5);
    PurchaseOrderItemText: String(100);

}

entity ContractItems
{
    key PurchaseContractItem : String(5) @Common.Text: PurchaseContract;
    PurchaseContract: String(10);
    PurchaseContractItemText : String(40);
    ContractNetPriceAmount: Decimal(12, 3);
    PurchaseOrder: String(100);
    PurchaseOrderItem: String(5);
    OrderPriceUnit : String(3);
    DocumentCurrency : String(5);

} 
