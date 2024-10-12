const { getSoapService } = require('./soap-service');
const {  soapHeaders, prepareSoapPayload, soapSamplePayload_Sync } = require('./soap-body');
const cds = require('@sap/cds');
const LOG = cds.log('handlers');
const namespace = 'com.xom.mu.';

let aribapo = null;
let ariba_auth = null;
let s4pos = null;
let s4poc = null;
let attachmentsSrv; 

//let sesSoapService = null;

(async function () {
    // Connect to external services
    aribapo = await cds.connect.to('ARIBA_NETWORK_PURCHASE_ORDERS');
    ariba_auth = await cds.connect.to('ARIBA_NETWORK_AUTH');
    s4pos = await cds.connect.to('ZAPI_PURCHASEORDER_PROCESS_SRV');
    s4poc = await cds.connect.to('ZAPI_PURCHASECONTRACT_PROCESS_SRV');
    attachmentsSrv = await cds.connect.to("attachments");

})();


// ************* HANDLER FUNCTIONS *************************


  

async function readBusinessUser(req) {
 try {
    let soapEndpoint = { url: null };    
    let userReadService = await getSoapService('QUERYBUSINESSUSERIN', './srv/external/QUERYBUSINESSUSERIN.wsdl', soapEndpoint);       
    // Get the SOAP client for the UserRead service
           // const userReadService = await userReadServicePromise;
            userReadService.setEndpoint(soapEndpoint.url);
    
            // Set the parameters for the QueryBusinessUserIn method of the sevice
            const param = {
                BusinessUser: {
                    PersonIDInterval: {
                        IntervalBoundaryTypeCode: 9,
                        LowerBoundaryPersonID: "0000000000"
                    },
                    BusinessPartnerRoleCodeInterval: {
                        IntervalBoundaryTypeCode: 9,
                        LowerBoundaryBusinessPartnerRoleCode: "000000"
                    }
                },
                QueryProcessingConditions: {
                    QueryHitsUnlimitedIndicator: true
                }
            };
    
            // Invoke QueryBusinessUserIn method asynchronously and wait for the response
            const resp = await userReadService.QueryBusinessUserInAsync(param);
    
            // Prepare the actual service response
            const busUsers = [];
            if (resp && resp[0] && resp[0].BusinessUser) {
                resp[0].BusinessUser.forEach(busUser => {
                    busUsers.push({
                        ID: ((busUser.User) ? busUser.User.UserID : busUser.PersonID),
                        FirstName: busUser.PersonalInformation.FirstName,
                        LastName: busUser.PersonalInformation.LastName,
                        PersonFullName: busUser.PersonalInformation.PersonFullName,
                        BusinessPartnerRoleCode: busUser.BusinessPartnerRoleCode,
                        HasUser: ((busUser.User) ? true : false)
                    });
                });
            }
    
            return busUsers;

 } catch (err) {
    req.error(err.code, err.message);
} 
}
async function createServiceEntry(data, req, attachments) {
        await executeCreateServiceEntry(data, req, attachments);
}
// Helper to insert purchase order execution in hanadb
async function getAribaPOs(req) {
        LOG.info("Inside SESAPP getAribaPOs()"); 
        const access_token = await executeAribaAccessToken();
        const purchaseOrder = await executePurchaseOrders(req, access_token);
        purchaseOrder.$count = purchaseOrder.length;
        return purchaseOrder;
       // const servicePOs = await executePOTypes(req, purchaseOrder);
       // await executeInsertPOsinDB(req, purchaseOrder); 

}

async function readAribaPOs(req) {
    const access_token = await executeAribaAccessToken();
    const purchaseOrder = await executePurchaseOrders(req, access_token);
   /* const filter = req._queryOptions.$filter;
    const regex = /poSearchDate/g;
    if (regex.test(filter)) {
            return purchaseOrder;
    } else {
        return await executeReadAllPOs(req);
    } */
}
async function readS4POs(req) {
    return s4pos.run(req.query);
}
async function readPurchaseContracts(req) {
    let contracts;
    try {      
        const poitem = await executeExtractPOandItem(req);
        let query = SELECT.from('A_PurchaseOrderItem').where({PurchaseOrder: { '=': poitem.po}, and: {PurchaseOrderItem: { '=': poitem.item}}});
        //let query = SELECT.from('A_PurchaseOrderItem').where({PurchaseOrder: { '=': '4500020970'}, and: {PurchaseOrderItem: { '=': '20'}}});
        contracts =  await s4pos.run(query);
        if (contracts) {
            for (var i = 0; i < contracts.length; i++) {
                return await executePurchaseContractItem(req, contracts[i].PurContractForOverallLimit);
            }
        }
    } catch (err) {
        req.error(err.code, err.message);
    }
   //return contracts;
}

async function executePOTypes(req, bnPurchaseOrders) {
    let servicePOs = [];
    if(bnPurchaseOrders) {
        for(let i=0; i < bnPurchaseOrders.length; i++) {
            const query = SELECT.from('A_PurchaseOrderItem').where({PurchaseOrder: { '=': bnPurchaseOrders[i].documentNumber}, and: {ProductType: { '=': 2}}});
            const res =  await s4pos.run(query);
            if(res.length > 0) {
                servicePOs.push(bnPurchaseOrders[i]);
            }
        }
    }
    return servicePOs;
}
async function updateSESPOFields(req) {
    try {      
       
        let query = SELECT.from('A_PurchaseOrder').where({PurchaseOrder: { '=': req.data.documentNumber}});
            const poDetails =  await s4pos.run(query);
            if (poDetails) {
                for (var i = 0; i < poDetails.length; i++) {
                    req.data.documentCurrency = contractDetails[i].DocumentCurrency;
                    req.data.contractNetPriceAmount = contractDetails[i].ContractNetPriceAmount;
                    req.data.orderPriceUnit =contractDetails[i].OrderPriceUnit;
                }
            }
            
    } catch (err) {
        req.error(err.code, err.message);
    }
}
async function readContractItemDetail(req) {
    try {      
        if(req.data != undefined && req.data.contractItem_PurchaseContractItem && req.data.purchaseOrder_documentNumber && req.data.purchaseOrderItem_PurchaseOrderItem) {
            const query_po = SELECT.from('A_PurchaseOrderItem').where({PurchaseOrder: { '=': req.data.purchaseOrder_documentNumber}, and: {PurchaseOrderItem: { '=': req.data.purchaseOrderItem_PurchaseOrderItem}}});
            const contracts =  await s4pos.run(query_po);
            if (contracts) { 
                for (var i = 0; i < contracts.length; i++) {
                    const pc = contracts[i].PurchaseContract!=''?contracts[i].PurchaseContract:contracts[i].PurContractForOverallLimit;
                    if(contracts.length == 1) {
                        const query = SELECT.from('A_PurchaseContractItem').where({PurchaseContract: { '=': pc}, and: {PurchaseContractItem: { '=': req.data.contractItem_PurchaseContractItem}}});
                        const contractDetails =  await s4poc.run(query);
                        if (contractDetails) {
                            for (var i = 0; i < contractDetails.length; i++) {
                                req.data.documentCurrency = contractDetails[i].DocumentCurrency;
                                req.data.contractNetPriceAmount = contractDetails[i].ContractNetPriceAmount;
                                req.data.orderPriceUnit =contractDetails[i].OrderPriceUnit;
                            }
                        }
                    } 
               }
            }
            if(req.data != undefined && req.data.qty ) {  
                req.data.netPrice = req.data.qty * req.data.contractNetPriceAmount;
            }
        } else {
            if(req.data != undefined && req.data.purchaseContract && req.data.contractItem_PurchaseContractItem) 
            {
                const query = SELECT.from('A_PurchaseContractItem').where({PurchaseContract: { '=': req.data.purchaseContract}, and: {PurchaseContractItem: { '=': req.data.contractItem_PurchaseContractItem}}});
                const contractDetails =  await s4poc.run(query);
                if (contractDetails) {
                    for (var i = 0; i < contractDetails.length; i++) {
                        req.data.documentCurrency = contractDetails[i].DocumentCurrency;
                        req.data.contractNetPriceAmount = contractDetails[i].ContractNetPriceAmount;
                        req.data.orderPriceUnit =contractDetails[i].OrderPriceUnit; 
                        }
                }
            }
            if(req.data != undefined && req.data.qty ) { 
                const item =  await SELECT.one.from(req.subject).columns('contractNetPriceAmount');
                if(item.contractNetPriceAmount)
                    req.data.netPrice = req.data.qty * item.contractNetPriceAmount;
               } 
               
               if(req.data != undefined && req.data.contractNetPriceAmount) { 
                const item =  await SELECT.one.from(req.subject).columns('qty');
                if(item.qty)
                    req.data.netPrice = req.data.contractNetPriceAmount * item.qty;
               }

        }

    } catch (err) { 
        req.error(err.code, err.message);
    }
}


async function updateNetPrice(req) {
    if(req.qty !== undefined) {
        let [ ID, quantity ] = [ req.ID, req.qty ]
        //const suc = await UPDATE `EntrySheetItems.drafts` .set `netPrice = ${quantity}` .where `ID=${ID}`;
      const query = await UPDATE.entity(namespace + 'EntrySheetItems.drafts').with({ netPrice: 10}).where({ ID: ID, IsActiveEntity: false });
    }
}
// **** HELPER FUNCTIONS ************
async function executeAribaAccessToken() {
    LOG.info("Inside SESAPP executeAribaAccessToken()");
    let ariba_token_res = await ariba_auth.send({
        method: 'POST',
        path: '/v2/oauth/token?grant_type=openapi_2lo',
    });

    return ariba_token_res.access_token;
}
async function executePurchaseOrders(req, token) { 
    LOG.info("Inside SESAPP executePurchaseOrders()");
    LOG.info("SESAPP SAML Attributes "+ JSON.stringify(req.user.attr));
    let purchaseOrderResponse;
    let path;
    try {
        const filterQuery = executeNetworkFilters(req);
        if(filterQuery)
            path = "orders?$top=100&$filter="+filterQuery;
        else
        path = "orders?$top=100";
        //const path = "orders?$top=100&$filter="+filterQuery; //4500020970
        //const path = "orders?realm=ExxonMobil-T&$top=1000";
       // const path = "orders?$filter=startDate eq '2024-05-02T00:00:00' and endDate eq '2024-06-01T23:59:59' and documentNumber eq '4500021692'";
        //const path = "orders?$filter=startDate eq '2024-09-02T00:00:00' and endDate eq '2024-09-30T23:59:59' and documentNumber eq '4500021694'";
        //const path = "orders";
        LOG.info("SESAPP SBN Purchase Order Query Path "+ path);
        const tx = aribapo.transaction(req);
        purchaseOrderResponse = await tx.send({
            method: 'GET',
            path: path,
            headers: {
                Authorization: 'Bearer ' + token,
            }
        })
    } catch (err) {
       // req.error(err.code, err.message);
        req.error (500,  err.reason.response.body.message);
    }
    return purchaseOrderResponse;
}
async function readS4POItems(req) {
    let s4POItems;
    try {      
        const purchaseOrder = await executeExtractPO(req);
        let query = SELECT.from('A_PurchaseOrderItem').where({PurchaseOrder:purchaseOrder});
        s4POItems =  await s4pos.run(query);
    } catch (err) {
        req.error(err.code, err.message); 
    }
    s4POItems.$count = s4POItems.length;
   return s4POItems;
}
async function executeInsertPOsinDB(req, purchaseOrder) {
    try {
        if(purchaseOrder) {
            for (var i = 0; i < purchaseOrder.length; i++) {
                const orderDate = new Date(purchaseOrder[i].orderDate);
                //const formattedDate = orderDate.toISOString().split('T')[0];
                     const po = { 
                        documentNumber: purchaseOrder[i].documentNumber, supplierName: purchaseOrder[i].supplierName, supplierANID: purchaseOrder[i].supplierANID,
                        vendorId: purchaseOrder[i].vendorId, customerName: purchaseOrder[i].customerName, customerANID: purchaseOrder[i].customerANID, systemId: purchaseOrder[i].systemId,
                        created: new Date(purchaseOrder[i].created), dashboardStatus: purchaseOrder[i].dashboardStatus, numberOfInvoices: purchaseOrder[i].numberOfInvoices,
                        isRelease: purchaseOrder[i].isRelease, documentStatus: purchaseOrder[i].documentStatus, orderDate: orderDate, revision: purchaseOrder[i].revision,
                        settlement: purchaseOrder[i].settlement, blanket: purchaseOrder[i].blanket, schedulingAgreement: purchaseOrder[i].schedulingAgreement, poClosed: purchaseOrder[i].poClosed,
                        entrySheetName: "", entrySheetDesc: "", personResponsible: "", final: false
                    }

                    await cds.tx(req).run(UPSERT.into(namespace + 'SESPurchaseOrders').entries(po));
        }
    } 
        } catch (err) {
        req.error(err.code, err.message);
    }
}

async function executeReadAllPOs(req) {
    const response =  await cds.tx(req).run(SELECT.from(namespace + 'SESPurchaseOrders'));
    return response;
}
async function executeExtractPO(req) {
    const filter = req._queryOptions.$filter;
    const regex = /purchaseOrder eq '(\d+)'/;
    const match = filter.match(regex);
    if (match && match[1]) {
        return match[1];
      } else {
            req.error("Purchase Order number not found");
      }
}
async function executeExtractPOandItem(req) {
    const filter = req._queryOptions.$filter;
    const regex = /PurchaseOrder eq '(\d+)' and PurchaseOrderItem eq '(\d+)'/;
    const match = filter.match(regex);
    if (match) {
        return {po: match[1], item: match[2]}
      } else {
            req.error("Purchase Order and Purchase Order Item not found");
      }
}

async function executePurchaseContractItem(req, purContractForOverallLimit) {
    let contracts;
    try {  
        if(purContractForOverallLimit) {
            let query = SELECT.from('A_PurchaseContractItem').where({PurchaseContract:purContractForOverallLimit});
            contracts =  await s4poc.run(query);
            contracts.$count = contracts.length;
        }    

    } catch (err) {
        req.error(err.code, err.message);
    }
    return contracts; 
}

async function executeCreateServiceEntry(data, req, attachments) {
    //const attachContent = await getAttachments(data, req, attachments);
    //const query = SELECT.from('SESAppService.SESPurchaseOrders.attachments.drafts').where({UP__DOCUMENTNUMBER: { '=': data.documentNumber}, and: {ID: { '=': data.attachments[0].ID}}});
   // const query = await SELECT.from(attachments.drafts, {ID: data.attachments[0].ID}).columns("content");
  //  const response = await cds.tx(req).run(query);
    let soapEndpoint = { url: null }; 
    let sesSoapService = await getSoapService('ZMASSSESREQUEST', './srv/external/ZMASSESREQUEST_IN.wsdl', soapEndpoint);
    sesSoapService.setEndpoint(soapEndpoint.url);
    const soapEnvelop = await prepareSoapPayload(data, attachments);
    //const soapEnvelop = soapSamplePayload_Sync(); 
    sesSoapService = await soapHeaders(sesSoapService);
    const res = await sesSoapService.ZMMPUR_MASS_SES_SOAP_SRVCAsync(soapEnvelop);
    if(res && res[0].ET_RETURN) {
        const resultItems = res[0].ET_RETURN.item;
        for (var i =0; i < resultItems.length; i++) {
            if(resultItems[i].MESSAGE.item[0].TYPE == "E") { 
                LOG.error(resultItems[i].MESSAGE.item[0].MESSAGE);
                req.info({
                    message: resultItems[i].MESSAGE.item[0].MESSAGE + " for purchase order "+resultItems[i].PURCHASE_ORDER
                  });
            } else {
                LOG.error("SES CREATED "+ resultItems[i].MESSAGE.item[0].MESSAGE);
                //delete the successfull entries from HDB
                await executeDeleteSESItems(req, data,resultItems[i].PURCHASE_ORDER);
                req.info({
                    message: resultItems[i].MESSAGE.item[0].MESSAGE+" for purchase order "+resultItems[i].PURCHASE_ORDER
                  });
                  /*req.notify({
                    message: resultItems[i].MESSAGE.item[0].MESSAGE+" for purchase order "+resultItems[i].PURCHASE_ORDER
                  });*/
            } 
        }
        //const msg = res[0].ET_BAPIRETTAB.item[0].MESSAGE; 
        //if ses created, delete items from the table
       /* if(checkSesNumber(msg)) {
            //await executeDeleteSESItems(req, data); 
            req.info(msg);
        } else {
            req.info(msg);
        } */
    } else {
        req.error("Error creating service entry sheet");
    } 
}


function checkSesNumber(msg) {
    const regex = /Service entry sheet (\d+)/i; // regular expression to match the Service Entry Sheet number
    const match = msg.match(regex);
    if (match && match.length > 1) {
        return true;
    } 
    return false;
}
 async function executeDeleteSESItems(req, data, deletePO) {
    const values = data.main;
    for (var i =0; i < values.length; i++) {
        if(values[i].purchaseOrder_documentNumber === deletePO) {
            const deleteQuery = DELETE.from(namespace +'SESMainHeader').where({ ID: values[i].ID });
            await cds.tx(req).run(deleteQuery);
        }
    }
}
function getPoSearchDateFIlter(req) {
    const whereStatement = req.query.SELECT.where;
    if (whereStatement){
        for(let i=0; i<whereStatement.length;i++){
            if(whereStatement[i].ref) { 
                if(whereStatement[i].ref[0] === "poSearchDate" && whereStatement[i+1] === ">=") {
                    const startDate=whereStatement[i+2].val;
                    return startDate;
                }
        
            }
        }
    }
}
function executeNetworkFilters(req) { 
    const whereStatement = req.query.SELECT.where;
    let filterQuery;
    if (whereStatement){
        for(let i=0; i<whereStatement.length;i++){
            if(whereStatement[i].ref) { 
                if(whereStatement[i].ref[0] === "poOrderDate" && whereStatement[i+1] === ">=") {
                    let startDate=whereStatement[i+2].val;
                    startDate = startDate.split('T')[0];
                    if (filterQuery) { 
                        filterQuery+= " and startDate eq '"+startDate+"T00:00:00'";
                    } else {
                        filterQuery = "startDate eq '"+startDate+"T00:00:00'";
                    }
                    continue;
                }
                if(whereStatement[i].ref[0] === "poOrderDate" && whereStatement[i+1] === "<=") {
                    let endDate=whereStatement[i+2].val;
                    endDate = endDate.split('T')[0];
                    if (filterQuery !== "") filterQuery += " and ";
                    filterQuery += "endDate eq '"+endDate+"T23:59:59'";
                    continue;
                }

                if(whereStatement[i].ref[0] === "documentNumber") {
                    const poNumber=whereStatement[i+2].val;
                    if (filterQuery) {
                        filterQuery += " and documentNumber eq '"+poNumber+"'";
                    } else {
                        filterQuery = "documentNumber eq '"+poNumber+"'";
                    }
                    continue;
                }

                if(whereStatement[i].ref[0] === "dashboardStatus") {
                    const orderStatus=whereStatement[i+2].val;
                    if (filterQuery) {
                        filterQuery += " and orderStatus eq '"+orderStatus.substring(3)+"'";
                    } else {
                        filterQuery = "orderStatus eq '"+orderStatus.substring(3)+"'";
                    }
                } 
            } 
        }
    }
   // LOG.error("SESAPP SAML attributes"+ JSON.stringify(req.user.attr));
    if (req.user.attr.ANID && req.user.attr.ANID.length > 0) {
        const supplierANID = req.user.attr.ANID;
        if(filterQuery) {
            filterQuery += " and supplierANID eq '"+supplierANID[0]+"'";
        } else {
            filterQuery = "supplierANID eq '"+supplierANID[0]+"'";
        }
       // path = "orders?$top=100&$filter=supplierANID eq '"+supplierANID[0]+"'";
    } else {
        LOG.error("SESAPP SupplierANID Not Found in SAML attributes"+ JSON.stringify(req.user.attr));
        //if ANID not found in the SAML trace then return the []
      /*  if(filterQuery) {
            filterQuery += " and supplierANID eq 'AN01504352497-T'";
        } else {
            filterQuery = "supplierANID eq 'AN01504352497-T'";
        } */
    }
       // path = "orders?$top=100&$filter=supplierANID eq 'AN01504352497-T'";
        //return;
        
    
  /*  if(filterQuery) {
        path = path+"&$filter="+filterQuery;
    } else {
        const defaultDR = getStartEndDate();
        filterQuery = "startDate eq '"+defaultDR.startDate+"T00:00:00'";
        filterQuery += "endDate eq '"+defaultDR.endDate+"T23:59:59'";
    } */
    return filterQuery; 
}
// Utility method to get start and end dates
function getStartEndDate() {
    // Get today's date
    const today = new Date();

    // Calculate the date one month ago
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Format dates as strings (adding leading zeros if necessary)
    const startDate = formatDate(today);
    const endDate = formatDate(oneMonthAgo);

    return { startDate, endDate };
}  

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
module.exports = {
    getAribaPOs,
    readAribaPOs,
    readS4POs,
    readS4POItems,
    readPurchaseContracts,
    updateNetPrice,
    createServiceEntry,
    readContractItemDetail
}