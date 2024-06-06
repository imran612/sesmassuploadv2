using SESMUploadService as service from '../../srv/service';

annotate service.SESMainHeader with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : entrySheetName,
            Label : '{i18n>entrySheetName}',
        },
    ]
);
annotate service.SESMainHeader with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Mass Creation of Service Entry Sheets',
            ID : 'MassCreationofServiceEntrySheets',
            Target : 'main/@UI.LineItem#MassCreationofServiceEntrySheets',
        },
    ]
);
annotate service.SESMain with @(
    UI.LineItem #MassCreationofServiceEntrySheets : [
           {
            $Type : 'UI.DataField',
            Value : purchaseOrder_documentNumber,
            Label : '{i18n>Purchaseorderdocumentnumber}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseOrderItem_PurchaseOrderItem,
            Label : '{i18n>Purchaseorderitempurchaseorderitem}',
        },
        {
            $Type : 'UI.DataField',
            Value : postingDate,
            Label : '{i18n>Postingdate}',
        },
        {
            $Type : 'UI.DataField',
            Value : periodStart,
            Label : '{i18n>Periodstart}',
        },
        {
            $Type : 'UI.DataField',
            Value : periodEnd,
            Label : '{i18n>periodEnd}',
        },
        {
            $Type : 'UI.DataField',
            Value : contractItem_PurchaseContractItem,
            Label : '{i18n>contractItem}',
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseContractItemText,
            Label : '{i18n>Purchasecontractitemtext}',
        },
        {
            $Type : 'UI.DataField',
            Value : qty,
            Label : '{i18n>qty}',
        },{
            $Type : 'UI.DataField',
            Value : orderPriceUnit,
            Label : '{i18n>orderPriceUnit}',
        },
        {
            $Type : 'UI.DataField',
            Value : contractNetPriceAmount,
            Label : '{i18n>contractNetPriceAmount}',
        },
        {
            $Type : 'UI.DataField',
            Value : documentCurrency,
            Label : '{i18n>Documentcurrency}',
        },
        {
            $Type : 'UI.DataField',
            Value : netPrice,
            Label : '{i18n>netPrice}',
        },
        {
            $Type : 'UI.DataField',
            Value : plainLongText,
            Label : '{i18n>Plainlongtext}',
        },]
);
annotate service.SESMain with {
    purchaseOrder @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'SESPurchaseOrders',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : purchaseOrder_documentNumber, //item_PurchaseOrder
                ValueListProperty : 'documentNumber',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'supplierName',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'dashboardStatus',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'customerName',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'orderDate',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'vendorId'
            },
        ],
    }
};
annotate service.SESMain with {
    purchaseOrderItem @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'LineItems',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : purchaseOrderItem_PurchaseOrderItem, //item_PurchaseOrder
                ValueListProperty : 'PurchaseOrderItem',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'PurchaseOrderItemText',
            },
            {
                $Type : 'Common.ValueListParameterIn',
                LocalDataProperty : purchaseOrder_documentNumber,
                ValueListProperty : 'purchaseOrder',
            }
        ],
    }
};
annotate service.SESMain with {
    contractItem @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'ContractItems',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : contractItem_PurchaseContractItem,
                    ValueListProperty : 'PurchaseContractItem',
                },
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : purchaseContract,
                    ValueListProperty : 'PurchaseContract',
                },
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : purchaseContractItemText,
                    ValueListProperty : 'PurchaseContractItemText',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'OrderPriceUnit',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'ContractNetPriceAmount',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'DocumentCurrency',
                },

                {
                    $Type : 'Common.ValueListParameterIn',
                    LocalDataProperty : purchaseOrder_documentNumber,
                    ValueListProperty : 'PurchaseOrder',
                },
                {
                    $Type : 'Common.ValueListParameterIn',
                    LocalDataProperty : purchaseOrderItem_PurchaseOrderItem,
                    ValueListProperty : 'PurchaseOrderItem',
                }, //item_PurchaseOrder

            ],
           // PresentationVariantQualifier : 'vh_EntrySheetItems_contractItem',
        },
        Common.ValueListWithFixedValues : false
)};
annotate service.SESMain @(Common.SideEffects #populateItems: {
    SourceProperties  : [contractItem_PurchaseContractItem],
    TargetProperties: ['purchaseContractItemText', 'orderPriceUnit', 'contractNetPriceAmount', 'documentCurrency']
});
annotate service.SESMain @(Common.SideEffects #totalNetPrice: {
    SourceProperties  : [qty],
    TargetProperties: ['netPrice']
});

annotate service.SESMainHeader with @(
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : entrySheetName,
        },
        TypeName : '',
        TypeNamePlural : '',
    }
);
annotate service.SESMain with {
    plainLongText @UI.MultiLineText : true
};
